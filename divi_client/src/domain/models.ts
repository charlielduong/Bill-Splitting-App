export type DiviState = 'draft' | 'claiming' | 'finalized' | 'settled';
export type PaymentStatus = 'outstanding' | 'partiallyPaid' | 'paid';

export type Money = { minorUnits: number; currencyCode: string };
export type Participant = {
  id: string;
  name: string;
  venmoUsername?: string;
  isCurrentUser?: boolean;
};
export type ReceiptItem = {
  id: string;
  name: string;
  quantity: number;
  amount: Money;
  claimantIds: string[];
};
export type ReceiptAdjustment = {
  id: string;
  name: string;
  amount: Money;
};
export type Allocation = {
  participantId: string;
  items: Money;
  tax: Money;
  tip: Money;
  fees: Money;
  discounts: Money;
  total: Money;
  paid: Money;
  requestInitiated: boolean;
};
export type Divi = {
  id: string;
  title: string;
  date: string;
  state: DiviState;
  creatorId: string;
  payerId: string;
  participants: Participant[];
  items: ReceiptItem[];
  tax: Money;
  tip: Money;
  fees: ReceiptAdjustment[];
  discounts: ReceiptAdjustment[];
  enteredTotal: Money;
  allocations: Allocation[];
};

export const money = (minorUnits: number, currencyCode = 'USD'): Money => ({
  minorUnits,
  currencyCode,
});
export const formatMoney = ({ minorUnits, currencyCode }: Money) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(
    minorUnits / 100,
  );

export const itemSubtotal = (divi: Divi) =>
  divi.items.reduce((sum, item) => sum + item.amount.minorUnits, 0);
export const adjustmentTotal = (adjustments: ReceiptAdjustment[]) =>
  adjustments.reduce((sum, adjustment) => sum + adjustment.amount.minorUnits, 0);
export const calculatedTotal = (divi: Divi) =>
  itemSubtotal(divi) +
  divi.tax.minorUnits +
  divi.tip.minorUnits +
  adjustmentTotal(divi.fees) -
  adjustmentTotal(divi.discounts);
export const unclaimedCount = (divi: Divi) =>
  divi.items.filter((item) => item.claimantIds.length === 0).length;
export const unclaimedAmount = (divi: Divi) =>
  money(
    divi.items
      .filter((item) => item.claimantIds.length === 0)
      .reduce((sum, item) => sum + item.amount.minorUnits, 0),
    divi.enteredTotal.currencyCode,
  );
export const paymentStatus = (allocation: Allocation): PaymentStatus =>
  allocation.paid.minorUnits <= 0
    ? 'outstanding'
    : allocation.paid.minorUnits < allocation.total.minorUnits
      ? 'partiallyPaid'
      : 'paid';
