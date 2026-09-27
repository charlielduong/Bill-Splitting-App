import { currentUser, Divi, money, ReceiptAdjustment, ReceiptItem } from '../domain/models';

export type ParsedReceipt = {
  title: string;
  items: Array<{ name: string; quantity: number; amountMinorUnits: number }>;
  taxMinorUnits: number;
  tipMinorUnits: number;
  fees: Array<{ name: string; amountMinorUnits: number }>;
  discounts: Array<{ name: string; amountMinorUnits: number }>;
  totalMinorUnits?: number;
};

type MoneyMatch = {
  amountMinorUnits: number;
  prefix: string;
};

export type ReceiptOcrBlock = {
  text: string;
  boundingBox: { x: number; y: number; width: number; height: number };
};

const moneyAtEnd = /(?:^|\s)([-−]?\s*\$?\s*\(?\d{1,6}(?:,\d{3})*(?:\.\d{2})\)?-?)\s*$/;
const metadataPattern =
  /\b(?:receipt|invoice|order|check|table|server|guest|customer|phone|tel|www\.|https?:|thank|welcome|address|store\s*#|transaction|terminal|approval|auth|date|time)\b/i;
const paymentPattern =
  /\b(?:cash|visa|mastercard|amex|discover|credit|debit|tender|change|payment|paid|card|gift card)\b/i;
const webOrIdentifierPattern =
  /(?:\b[a-z0-9-]+\.(?:com|net|org|io|co)\b|\b\+?\d[\d().\s-]{7,}\d\b|\b\d{5}(?:-\d{4})?\b|\b(?:order\s*#?|invoice\s*(?:number|#)?|receipt\s*#?)\b)/i;

function normalizeLine(value: string) {
  return value
    .replace(/[|]/g, ' ')
    .replace(/[‐‑‒–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseMoneyAtEnd(line: string): MoneyMatch | null {
  const match = line.match(moneyAtEnd);
  if (!match || match.index === undefined) return null;

  const token = match[1];
  const negative = /^\s*[-−]/.test(token) || /\(.*\)/.test(token) || /-\s*$/.test(token);
  const numeric = Number.parseFloat(token.replace(/[^\d.]/g, ''));
  if (!Number.isFinite(numeric)) return null;

  return {
    amountMinorUnits: Math.round(numeric * 100) * (negative ? -1 : 1),
    prefix: line.slice(0, match.index).trim(),
  };
}

function cleanLabel(value: string, fallback: string) {
  const label = value
    .replace(/^[-*:]+|[-*:]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return label || fallback;
}

function displayName(value: string) {
  const cleaned = cleanLabel(value, 'Scanned receipt');
  if (cleaned !== cleaned.toUpperCase() || cleaned.length < 4) return cleaned;
  return cleaned.toLowerCase().replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());
}

function extractItem(prefix: string, amountMinorUnits: number) {
  let quantity = 1;
  let name = cleanLabel(prefix, 'Receipt item');

  const multiplied = name.match(/^(\d+)\s*[xX@]\s*(?:\$?\d+(?:\.\d{2})\s+)?(.+)$/);
  if (multiplied) {
    quantity = Math.max(1, Number.parseInt(multiplied[1], 10));
    name = multiplied[2];
  } else {
    const leadingQuantity = name.match(/^(\d+)\s+(.+)$/);
    if (leadingQuantity && Number.parseInt(leadingQuantity[1], 10) <= 99) {
      quantity = Math.max(1, Number.parseInt(leadingQuantity[1], 10));
      name = leadingQuantity[2];
    }
  }

  // Some receipts print quantity, name, unit price, then line total.
  if (quantity > 1) name = name.replace(/\s+\$?\d+(?:\.\d{2})$/, '').trim();

  return {
    name: displayName(name),
    quantity,
    amountMinorUnits: Math.abs(amountMinorUnits),
  };
}

function isPlausibleItemName(line: string) {
  return (
    /[A-Za-z]/.test(line) &&
    line.length >= 2 &&
    line.length <= 80 &&
    !metadataPattern.test(line) &&
    !paymentPattern.test(line) &&
    !webOrIdentifierPattern.test(line) &&
    !/^\d+[\s-]*$/.test(line)
  );
}

function merchantCandidate(line: string) {
  const candidate = normalizeLine(line);
  return (
    isPlausibleItemName(candidate) &&
    !parseMoneyAtEnd(candidate) &&
    !/\b(?:subtotal|total|tax|tip|fee)\b/i.test(candidate)
  );
}

function firstMerchantLine(lines: string[], blocks: ReceiptOcrBlock[] = []) {
  const candidates = lines.filter(merchantCandidate);
  if (!blocks.length) return candidates[0] ? displayName(candidates[0]) : 'Scanned receipt';

  const positionedBlocks = blocks.flatMap((block) => {
    const blockLines = block.text.split(/\r?\n/).map(normalizeLine).filter(Boolean);
    const lineHeight = block.boundingBox.height / Math.max(1, blockLines.length);
    return blockLines.map((text, index) => ({
      text,
      boundingBox: {
        ...block.boundingBox,
        y: block.boundingBox.y + lineHeight * index,
        height: lineHeight,
      },
    }));
  });

  // OCR block coordinates are image pixels with a top-left origin. Prefer a
  // prominent centered heading before the first priced row. Short text at the
  // extreme top is often phone or image-viewer chrome.
  const maxX = Math.max(
    ...positionedBlocks.map(({ boundingBox }) => boundingBox.x + boundingBox.width),
  );
  const maxY = Math.max(
    ...positionedBlocks.map(({ boundingBox }) => boundingBox.y + boundingBox.height),
  );
  const heights = positionedBlocks
    .map(({ boundingBox }) => boundingBox.height)
    .sort((a, b) => a - b);
  const typicalHeight = heights[Math.floor(heights.length / 2)] || 1;
  const firstPriceY = Math.min(
    ...positionedBlocks
      .filter(({ text }) => parseMoneyAtEnd(normalizeLine(text)))
      .map(({ boundingBox }) => boundingBox.y),
    maxY,
  );

  const ranked = positionedBlocks
    .map(({ text, boundingBox }) => {
      const line = normalizeLine(text);
      if (!merchantCandidate(line)) return null;

      const centerX = boundingBox.x + boundingBox.width / 2;
      const centered = 1 - Math.min(1, Math.abs(centerX - maxX / 2) / (maxX / 2 || 1));
      const letterCount = line.match(/[A-Za-z]/g)?.length || 1;
      const uppercaseRatio = (line.match(/[A-Z]/g)?.length ?? 0) / letterCount;
      const heightRatio = boundingBox.height / typicalHeight;
      const relativeY = boundingBox.y / (maxY || 1);
      const beforeItems = boundingBox.y < firstPriceY;
      const atVeryTop = relativeY < 0.055;
      const score =
        Math.min(line.length, 32) / 32 +
        centered * 1.5 +
        uppercaseRatio * 1.5 +
        Math.min(heightRatio, 2.5) * 0.7 +
        (beforeItems ? 1 : -1) -
        relativeY * 1.2 -
        (atVeryTop && line.length < 16 ? 3 : 0);
      return { line, score };
    })
    .filter((candidate): candidate is { line: string; score: number } => candidate !== null)
    .sort((a, b) => b.score - a.score);

  const chosen = ranked[0]?.line ?? candidates[0];
  return chosen ? displayName(chosen) : 'Scanned receipt';
}

function coalesceReceiptLines(rawText: string) {
  const sourceLines = rawText.split(/\r?\n/).map(normalizeLine).filter(Boolean);
  const lines: string[] = [];

  for (let index = 0; index < sourceLines.length; index += 1) {
    const line = sourceLines[index];
    const nextLine = sourceLines[index + 1];
    const currentMoney = parseMoneyAtEnd(line);
    const nextMoney = nextLine ? parseMoneyAtEnd(nextLine) : null;
    const nextIsPriceOnly = Boolean(nextMoney && !nextMoney.prefix);

    // Vision commonly emits receipt columns as separate observations. Rejoin
    // a label or item with the amount on the same visual row.
    if (!currentMoney && nextIsPriceOnly) {
      lines.push(`${line} ${nextLine}`);
      index += 1;
      continue;
    }

    // A quantity row may be emitted as "2 x Latte 4.50" followed by its 9.00
    // line total. Keep both amounts so item extraction can retain quantity 2.
    const quantityMatch = currentMoney?.prefix.match(/^(\d+)\s*[xX@]\s+/);
    if (currentMoney && nextMoney && nextIsPriceOnly && quantityMatch) {
      const quantity = Number.parseInt(quantityMatch[1], 10);
      if (
        quantity > 1 &&
        Math.abs(
          Math.abs(currentMoney.amountMinorUnits) * quantity - Math.abs(nextMoney.amountMinorUnits),
        ) <= 1
      ) {
        lines.push(`${line} ${nextLine}`);
        index += 1;
        continue;
      }
    }

    lines.push(line);
  }

  return lines;
}

export function parseReceiptText(rawText: string, blocks: ReceiptOcrBlock[] = []): ParsedReceipt {
  const lines = coalesceReceiptLines(rawText);
  const parsed: ParsedReceipt = {
    title: firstMerchantLine(lines, blocks),
    items: [],
    taxMinorUnits: 0,
    tipMinorUnits: 0,
    fees: [],
    discounts: [],
  };
  let pendingItemName: string | null = null;

  lines.forEach((line) => {
    const moneyMatch = parseMoneyAtEnd(line);

    if (!moneyMatch) {
      if (isPlausibleItemName(line) && line !== lines[0]) pendingItemName = line;
      return;
    }

    const amount = moneyMatch.amountMinorUnits;
    const prefix = moneyMatch.prefix;
    const classification = prefix.toLowerCase();

    if (/\bsub\s*total\b/.test(classification)) {
      pendingItemName = null;
      return;
    }
    if (/\b(?:grand\s+total|amount\s+due|balance\s+due|total)\b/.test(classification)) {
      parsed.totalMinorUnits = Math.abs(amount);
      pendingItemName = null;
      return;
    }
    if (/\b(?:sales\s+)?tax\b/.test(classification)) {
      parsed.taxMinorUnits = Math.abs(amount);
      pendingItemName = null;
      return;
    }
    if (/\b(?:tip|gratuity)\b/.test(classification)) {
      parsed.tipMinorUnits = Math.abs(amount);
      pendingItemName = null;
      return;
    }
    if (/\b(?:discount|coupon|promo|savings|markdown)\b/.test(classification)) {
      parsed.discounts.push({
        name: displayName(cleanLabel(prefix, 'Discount')),
        amountMinorUnits: Math.abs(amount),
      });
      pendingItemName = null;
      return;
    }
    if (/\b(?:fee|service\s+charge|delivery\s+charge|surcharge)\b/.test(classification)) {
      parsed.fees.push({
        name: displayName(cleanLabel(prefix, 'Fee')),
        amountMinorUnits: Math.abs(amount),
      });
      pendingItemName = null;
      return;
    }
    if (paymentPattern.test(classification) || metadataPattern.test(classification)) {
      pendingItemName = null;
      return;
    }

    const itemPrefix = prefix || pendingItemName;
    if (itemPrefix && isPlausibleItemName(itemPrefix) && amount > 0) {
      parsed.items.push(extractItem(itemPrefix, amount));
    }
    pendingItemName = null;
  });

  return parsed;
}

function adjustments(
  kind: 'fee' | 'discount',
  values: Array<{ name: string; amountMinorUnits: number }>,
): ReceiptAdjustment[] {
  return values.map((value, index) => ({
    id: `${kind}-${index}-${Date.now()}`,
    name: value.name,
    amount: money(value.amountMinorUnits),
  }));
}

export function receiptDraftFromParsed(parsed: ParsedReceipt, receiptImageUri?: string): Divi {
  const items: ReceiptItem[] = parsed.items.map((item, index) => ({
    id: `item-${index}-${Date.now()}`,
    name: item.name,
    quantity: item.quantity,
    amount: money(item.amountMinorUnits),
    claimantIds: [],
  }));
  const fees = adjustments('fee', parsed.fees);
  const discounts = adjustments('discount', parsed.discounts);
  const calculatedMinorUnits =
    items.reduce((sum, item) => sum + item.amount.minorUnits, 0) +
    parsed.taxMinorUnits +
    parsed.tipMinorUnits +
    fees.reduce((sum, fee) => sum + fee.amount.minorUnits, 0) -
    discounts.reduce((sum, discount) => sum + discount.amount.minorUnits, 0);

  return {
    id: `divi-${Date.now()}`,
    title: parsed.title,
    date: new Date().toISOString(),
    state: 'draft',
    creatorId: currentUser.id,
    payerId: currentUser.id,
    participants: [currentUser],
    items,
    tax: money(parsed.taxMinorUnits),
    tip: money(parsed.tipMinorUnits),
    fees,
    discounts,
    enteredTotal: money(parsed.totalMinorUnits ?? calculatedMinorUnits),
    allocations: [],
    receiptImageUri,
  };
}

export function emptyReceiptDraft(receiptImageUri?: string) {
  return receiptDraftFromParsed(
    {
      title: 'New receipt',
      items: [],
      taxMinorUnits: 0,
      tipMinorUnits: 0,
      fees: [],
      discounts: [],
      totalMinorUnits: 0,
    },
    receiptImageUri,
  );
}
