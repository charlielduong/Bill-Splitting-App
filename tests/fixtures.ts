import { Divi, money } from '../divi_client/src/domain/models';

export const currentUser = {
  id: 'charlie',
  name: 'Charlie',
  venmoUsername: 'charlie',
  isCurrentUser: true,
};
export const alex = { id: 'alex', name: 'Alex', venmoUsername: 'alex' };
export const sam = { id: 'sam', name: 'Sam' };

export const sampleDinner = (state: Divi['state'] = 'claiming'): Divi => ({
  id: 'test-divi',
  title: 'Test dinner',
  date: '2026-01-01T00:00:00.000Z',
  state,
  creatorId: currentUser.id,
  payerId: currentUser.id,
  participants: [currentUser, alex, sam],
  items: [
    {
      id: 'item-1',
      name: 'Shared starter',
      quantity: 1,
      amount: money(1400),
      claimantIds: [currentUser.id, alex.id],
    },
    {
      id: 'item-2',
      name: 'Main dish',
      quantity: 1,
      amount: money(4800),
      claimantIds: [alex.id, sam.id],
    },
    { id: 'item-3', name: 'Water', quantity: 1, amount: money(700), claimantIds: [] },
  ],
  tax: money(592),
  tip: money(1200),
  fees: [],
  discounts: [],
  enteredTotal: money(8692),
  allocations: [],
});
