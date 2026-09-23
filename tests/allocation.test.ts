import { describe, expect, it } from 'vitest';
import { finalizeAllocations } from '../src/domain/allocation';
import { alex, currentUser, money, sampleDinner } from '../src/domain/models';

describe('finalizeAllocations', () => {
  it('preserves every cent while splitting shared items and proportional extras', () => {
    const divi = sampleDinner();
    divi.items[2].claimantIds = [currentUser.id, alex.id];
    const allocations = finalizeAllocations(divi);

    expect(allocations.reduce((sum, allocation) => sum + allocation.total.minorUnits, 0)).toBe(
      8692,
    );
    expect(allocations.every((allocation) => allocation.total.minorUnits > 0)).toBe(true);
    expect(allocations.map((allocation) => allocation.participantId)).toEqual([
      'alex',
      'charlie',
      'sam',
    ]);
  });

  it('blocks finalization while an item is unclaimed', () => {
    expect(() => finalizeAllocations(sampleDinner())).toThrow('UNCLAIMED_ITEMS');
  });

  it('blocks a receipt whose entered total does not reconcile', () => {
    const divi = sampleDinner();
    divi.items[2].claimantIds = [currentUser.id];
    divi.enteredTotal = money(9999);
    expect(() => finalizeAllocations(divi)).toThrow('UNRECONCILED_TOTAL');
  });
});
