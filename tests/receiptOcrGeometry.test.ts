import { describe, expect, it } from 'vitest';
import {
  normalizeOcrBlocksForDisplay,
  ocrBoxesAreQuarterTurned,
} from '../src/services/receiptOcrGeometry';

describe('receipt OCR geometry', () => {
  it('leaves ordinary horizontal OCR boxes unchanged', () => {
    const blocks = [
      { text: 'Ramen', boundingBox: { x: 40, y: 100, width: 180, height: 24 } },
      { text: '$16.00', boundingBox: { x: 260, y: 100, width: 70, height: 24 } },
    ];

    expect(ocrBoxesAreQuarterTurned(blocks)).toBe(false);
    expect(normalizeOcrBlocksForDisplay(blocks, { width: 400, height: 1000 })).toEqual(blocks);
  });

  it('rotates quarter-turned OCR boxes into visual receipt coordinates', () => {
    const blocks = [
      { text: 'Ramen', boundingBox: { x: 700, y: 40, width: 24, height: 180 } },
      { text: '$16.00', boundingBox: { x: 700, y: 260, width: 24, height: 70 } },
    ];

    expect(ocrBoxesAreQuarterTurned(blocks)).toBe(true);
    expect(normalizeOcrBlocksForDisplay(blocks, { width: 400, height: 1000 })).toEqual([
      { text: 'Ramen', boundingBox: { x: 40, y: 276, width: 180, height: 24 } },
      { text: '$16.00', boundingBox: { x: 260, y: 276, width: 70, height: 24 } },
    ]);
  });
});
