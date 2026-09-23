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
  amount: Money;
  claimantIds: string[];
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
  fees: Money;
  discounts: Money;
  enteredTotal: Money;
  allocations: Allocation[];
};

export const money = (minorUnits: number, currencyCode = 'USD'): Money => ({ minorUnits, currencyCode });
export const formatMoney = ({ minorUnits, currencyCode }: Money) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(minorUnits / 100);

export const currentUser: Participant = { id: 'charlie', name: 'Charlie', venmoUsername: 'charlie', isCurrentUser: true };
export const alex: Participant = { id: 'alex', name: 'Alex', venmoUsername: 'alex' };
export const sam: Participant = { id: 'sam', name: 'Sam' };

export const sampleDinner = (state: DiviState = 'claiming'): Divi => ({
  id: `divi-${Date.now()}`,
  title: 'Dinner at Barcelona',
  date: new Date().toISOString(),
  state,
  creatorId: currentUser.id,
  payerId: currentUser.id,
  participants: [currentUser, alex, sam],
  items: [
    { id: 'patatas', name: 'Patatas bravas', amount: money(1400), claimantIds: [currentUser.id, alex.id] },
    { id: 'paella', name: 'Paella', amount: money(4800), claimantIds: [alex.id, sam.id] },
    { id: 'water', name: 'Sparkling water', amount: money(700), claimantIds: [] },
  ],
  tax: money(592),
  tip: money(1200),
  fees: money(0),
  discounts: money(0),
  enteredTotal: money(8692),
  allocations: [],
});

export const itemSubtotal = (divi: Divi) => divi.items.reduce((sum, item) => sum + item.amount.minorUnits, 0);
export const calculatedTotal = (divi: Divi) => itemSubtotal(divi) + divi.tax.minorUnits + divi.tip.minorUnits + divi.fees.minorUnits - divi.discounts.minorUnits;
export const unclaimedCount = (divi: Divi) => divi.items.filter((item) => item.claimantIds.length === 0).length;
export const paymentStatus = (allocation: Allocation): PaymentStatus =>
  allocation.paid.minorUnits <= 0 ? 'outstanding' : allocation.paid.minorUnits < allocation.total.minorUnits ? 'partiallyPaid' : 'paid';
