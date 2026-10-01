import React, { useMemo, useState } from 'react';
import {
  Image,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Divi } from '../domain/models';
import { ReceiptOcrBlock } from '../services/receiptParser';
import { normalizeOcrBlocksForDisplay } from '../services/receiptOcrGeometry';
import { colors, radii, spacing, typography } from '../theme/theme';

export type ReceiptImageSize = { width: number; height: number };

type FieldCategory = 'restaurant' | 'item' | 'tax' | 'tip' | 'fee' | 'discount';
type NormalizedRect = { x: number; y: number; width: number; height: number };
type FrameLayout = { width: number; height: number };

type DetectedField = {
  id: string;
  category: FieldCategory;
  name: string;
  amountMinorUnits?: number;
  rect: NormalizedRect;
};

const categories: Record<
  FieldCategory,
  { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  restaurant: { label: 'Restaurant', icon: 'business-outline', color: '#147EF5' },
  item: { label: 'Item', icon: 'restaurant-outline', color: '#0DB7A5' },
  tax: { label: 'Tax', icon: 'document-text-outline', color: '#7A2CF3' },
  tip: { label: 'Tip', icon: 'hand-left-outline', color: '#F39A08' },
  fee: { label: 'Fee', icon: 'receipt-outline', color: '#F0222D' },
  discount: { label: 'Discount', icon: 'pricetag-outline', color: '#18AF42' },
};

export function ReceiptDetectionScreen({
  draft,
  imageUri,
  imageSize,
  blocks,
  onBack,
  onConfirm,
}: {
  draft: Divi;
  imageUri: string;
  imageSize: ReceiptImageSize;
  blocks: ReceiptOcrBlock[];
  onBack: () => void;
  onConfirm: () => void;
}) {
  const fields = useMemo(
    () => buildDetectedFields(draft, blocks, imageSize),
    [blocks, draft, imageSize],
  );
  const [showFields, setShowFields] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [frameLayout, setFrameLayout] = useState<FrameLayout>({ width: 1, height: 1 });
  const imageTransform = getImageTransform(frameLayout, imageSize);

  const toggleFields = () => {
    setShowFields((visible) => {
      if (visible) setSelectedId(null);
      return !visible;
    });
  };

  const onImageLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setFrameLayout({ width, height });
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable
          accessibilityLabel="Back"
          accessibilityRole="button"
          hitSlop={12}
          onPress={onBack}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={30} color={colors.brandDeep} />
        </Pressable>
        <Text style={styles.title}>Confirm receipt</Text>
        <Text style={styles.subtitle}>Review what we found</Text>

        <View onLayout={onImageLayout} style={styles.receiptFrame}>
          <Image
            accessibilityLabel="Scanned receipt"
            resizeMode="cover"
            source={{ uri: imageUri }}
            style={StyleSheet.absoluteFill}
          />
          {showFields &&
            fields.map((field) => {
              const category = categories[field.category];
              const pixelRect = rectToPixels(field.rect, imageTransform);
              const selected = selectedId === field.id;
              return (
                <Pressable
                  key={field.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${category.label}: ${field.name}`}
                  accessibilityHint="Selects this detected receipt field"
                  onPress={() => setSelectedId(selected ? null : field.id)}
                  style={[
                    styles.detectionBox,
                    {
                      left: pixelRect.x,
                      top: pixelRect.y,
                      width: pixelRect.width,
                      height: pixelRect.height,
                      borderColor: category.color,
                      backgroundColor: `${category.color}${selected ? '28' : '16'}`,
                    },
                    selected && styles.detectionBoxSelected,
                  ]}
                >
                  <View style={[styles.detectionLabel, { backgroundColor: category.color }]}>
                    <Ionicons name={category.icon} size={14} color="#FFFFFF" />
                    <Text style={styles.detectionLabelText}>{category.label}</Text>
                  </View>
                </Pressable>
              );
            })}
        </View>

        {/* <Pressable
          accessibilityRole="button"
          accessibilityLabel={showFields ? 'Hide detected fields' : 'Show detected fields'}
          accessibilityState={{ expanded: showFields }}
          onPress={toggleFields}
          style={[styles.detectedFieldsButton, showFields && styles.detectedFieldsButtonActive]}
        >
          <Ionicons
            name={showFields ? 'eye-off-outline' : 'eye-outline'}
            size={25}
            color={showFields ? colors.brandDeep : '#526780'}
          />
          <Text
            style={[styles.detectedFieldsLabel, showFields && styles.detectedFieldsLabelActive]}
          >
            {showFields ? 'Hide detected fields' : 'Show detected fields'}
          </Text>
        </Pressable> */}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Looks good"
          onPress={onConfirm}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonLabel}>Looks good</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function buildDetectedFields(
  draft: Divi,
  blocks: ReceiptOcrBlock[],
  imageSize: ReceiptImageSize,
): DetectedField[] {
  const semanticFields: Array<Omit<DetectedField, 'rect'>> = [
    ...(!/^(?:new|scanned) receipt$/i.test(draft.title)
      ? [{ id: 'detected-restaurant', category: 'restaurant' as const, name: draft.title }]
      : []),
    ...draft.items.map((item) => ({
      id: `detected-${item.id}`,
      category: 'item' as const,
      name: item.name,
      amountMinorUnits: item.amount.minorUnits,
    })),
    ...(draft.tax.minorUnits > 0
      ? [
          {
            id: 'detected-tax',
            category: 'tax' as const,
            name: 'Tax',
            amountMinorUnits: draft.tax.minorUnits,
          },
        ]
      : []),
    ...(draft.tip.minorUnits > 0
      ? [
          {
            id: 'detected-tip',
            category: 'tip' as const,
            name: 'Tip',
            amountMinorUnits: draft.tip.minorUnits,
          },
        ]
      : []),
    ...draft.fees.map((fee) => ({
      id: `detected-${fee.id}`,
      category: 'fee' as const,
      name: fee.name,
      amountMinorUnits: fee.amount.minorUnits,
    })),
    ...draft.discounts.map((discount) => ({
      id: `detected-${discount.id}`,
      category: 'discount' as const,
      name: discount.name,
      amountMinorUnits: discount.amount.minorUnits,
    })),
  ];
  const lines = splitBlocksIntoLines(normalizeOcrBlocksForDisplay(blocks, imageSize));

  return semanticFields.flatMap((field, index) => {
    if (field.category === 'tax') {
      const taxLines = lines.filter((line) => {
        const normalized = normalizeText(line.text);
        return /\btax\b/i.test(line.text) && normalized !== 'taxes';
      });
      if (taxLines.length > 1) {
        return taxLines.map((line, taxIndex) => ({
          ...field,
          id: `${field.id}-${taxIndex}`,
          name: line.text,
          rect: normalizeBox(line.boundingBox, imageSize),
        }));
      }
    }

    return {
      ...field,
      rect:
        findFieldRect(field, lines, imageSize) ??
        fallbackRect(field.category, index, semanticFields.length),
    };
  });
}

function splitBlocksIntoLines(blocks: ReceiptOcrBlock[]) {
  return blocks.flatMap((block) => {
    const textLines = block.text
      .split(/\r?\n/)
      .map((text) => text.trim())
      .filter(Boolean);
    const lineHeight = block.boundingBox.height / Math.max(1, textLines.length);
    return textLines.map((text, index) => ({
      text,
      boundingBox: {
        x: block.boundingBox.x,
        y: block.boundingBox.y + lineHeight * index,
        width: block.boundingBox.width,
        height: lineHeight,
      },
    }));
  });
}

function findFieldRect(
  field: Omit<DetectedField, 'rect'>,
  lines: Array<{ text: string; boundingBox: ReceiptOcrBlock['boundingBox'] }>,
  imageSize: ReceiptImageSize,
): NormalizedRect | null {
  const targetName = normalizeText(field.name);
  const categoryPattern = {
    restaurant: null,
    item: null,
    tax: /\btax(?:es)?\b/i,
    tip: /\b(?:tip|gratuity)\b/i,
    fee: /\b(?:fee|service charge|surcharge)\b/i,
    discount: /\b(?:discount|promo|coupon|savings)\b/i,
  }[field.category];
  const nameLine = lines.find((line) => {
    const normalized = normalizeText(line.text);
    const likelyTruncatedMatch =
      normalized.length >= targetName.length * 0.75 && targetName.includes(normalized);
    return (
      (targetName.length > 1 && (normalized.includes(targetName) || likelyTruncatedMatch)) ||
      Boolean(categoryPattern?.test(line.text))
    );
  });
  if (!nameLine) return null;

  let box = nameLine.boundingBox;
  if (field.amountMinorUnits !== undefined) {
    const price = Math.abs(field.amountMinorUnits / 100).toFixed(2);
    const amountLine = lines
      .filter((line) => line.text.replace(/,/g, '').includes(price))
      .sort(
        (a, b) =>
          Math.abs(a.boundingBox.y - nameLine.boundingBox.y) -
          Math.abs(b.boundingBox.y - nameLine.boundingBox.y),
      )[0];
    if (
      amountLine &&
      Math.abs(amountLine.boundingBox.y - nameLine.boundingBox.y) <
        Math.max(nameLine.boundingBox.height, amountLine.boundingBox.height) * 1.8
    ) {
      box = unionBoxes(nameLine.boundingBox, amountLine.boundingBox);
    }
  }

  return normalizeBox(box, imageSize);
}

function normalizeBox(
  box: ReceiptOcrBlock['boundingBox'],
  imageSize: ReceiptImageSize,
): NormalizedRect {
  return clampRect({
    x: (box.x - 6) / imageSize.width,
    y: (box.y - 4) / imageSize.height,
    width: (box.width + 12) / imageSize.width,
    height: Math.max(box.height + 8, imageSize.height * 0.035) / imageSize.height,
  });
}

function unionBoxes(first: ReceiptOcrBlock['boundingBox'], second: ReceiptOcrBlock['boundingBox']) {
  const x = Math.min(first.x, second.x);
  const y = Math.min(first.y, second.y);
  return {
    x,
    y,
    width: Math.max(first.x + first.width, second.x + second.width) - x,
    height: Math.max(first.y + first.height, second.y + second.height) - y,
  };
}

function fallbackRect(category: FieldCategory, index: number, count: number): NormalizedRect {
  if (category === 'restaurant') return { x: 0.2, y: 0.08, width: 0.6, height: 0.13 };
  const verticalStart = 0.3;
  const verticalSpace = 0.55;
  const row = Math.max(0, index - 1);
  return clampRect({
    x: 0.13,
    y: verticalStart + (verticalSpace * row) / Math.max(1, count - 1),
    width: 0.74,
    height: 0.052,
  });
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function clampRect(rect: NormalizedRect): NormalizedRect {
  const width = Math.min(1, Math.max(0.04, rect.width));
  const height = Math.min(1, Math.max(0.025, rect.height));
  return {
    x: Math.min(1 - width, Math.max(0, rect.x)),
    y: Math.min(1 - height, Math.max(0, rect.y)),
    width,
    height,
  };
}

function getImageTransform(frame: FrameLayout, source: ReceiptImageSize) {
  const scale = Math.max(frame.width / source.width, frame.height / source.height);
  const renderedWidth = source.width * scale;
  const renderedHeight = source.height * scale;
  return {
    renderedWidth,
    renderedHeight,
    offsetX: (frame.width - renderedWidth) / 2,
    offsetY: (frame.height - renderedHeight) / 2,
  };
}

function rectToPixels(rect: NormalizedRect, transform: ReturnType<typeof getImageTransform>) {
  return {
    x: transform.offsetX + rect.x * transform.renderedWidth,
    y: transform.offsetY + rect.y * transform.renderedHeight,
    width: rect.width * transform.renderedWidth,
    height: rect.height * transform.renderedHeight,
  };
}

const styles = StyleSheet.create({
  screen: { flex: 1, width: '100%', backgroundColor: colors.surface },
  content: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 26 },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    color: '#07101E',
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  subtitle: {
    color: '#526780',
    fontSize: 20,
    lineHeight: 26,
    marginTop: 3,
    marginBottom: 18,
  },
  receiptFrame: {
    width: '100%',
    aspectRatio: 0.64,
    maxHeight: 590,
    overflow: 'hidden',
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
  },
  detectedFieldsButton: {
    minHeight: 56,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#D7E1EC',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
  },
  detectedFieldsButtonActive: {
    borderColor: '#B7D9AA',
    backgroundColor: colors.brandSoft,
  },
  detectedFieldsLabel: { color: '#526780', ...typography.headline },
  detectedFieldsLabelActive: { color: colors.brandDeep },
  primaryButton: {
    minHeight: 58,
    marginTop: 20,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.brand,
  },
  primaryButtonLabel: { color: colors.surface, ...typography.title },
  detectionBox: {
    position: 'absolute',
    borderWidth: 1.5,
    borderRadius: 5,
    zIndex: 2,
  },
  detectionBoxSelected: {
    borderWidth: 2.5,
    borderStyle: 'dashed',
    zIndex: 4,
  },
  detectionLabel: {
    position: 'absolute',
    top: -24,
    left: -1.5,
    minHeight: 24,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  detectionLabelText: { color: '#FFFFFF', fontSize: 12, lineHeight: 16, fontWeight: '700' },
});
