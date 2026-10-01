export type OcrImageSize = { width: number; height: number };

export type PositionedOcrBlock = {
  text: string;
  boundingBox: { x: number; y: number; width: number; height: number };
};

/**
 * Native OCR occasionally reports boxes in the image's pre-EXIF coordinate
 * space. In that case horizontal receipt lines arrive as tall boxes: visual
 * rows run from right to left along raw x, while visual columns run along raw y.
 */
export function normalizeOcrBlocksForDisplay<T extends PositionedOcrBlock>(
  blocks: T[],
  imageSize: OcrImageSize,
): T[] {
  if (!ocrBoxesAreQuarterTurned(blocks)) return blocks;

  return blocks.map((block) => ({
    ...block,
    boundingBox: {
      x: block.boundingBox.y,
      y: imageSize.height - block.boundingBox.x - block.boundingBox.width,
      width: block.boundingBox.height,
      height: block.boundingBox.width,
    },
  }));
}

export function ocrBoxesAreQuarterTurned(blocks: PositionedOcrBlock[]) {
  const usable = blocks.filter(
    ({ boundingBox }) => boundingBox.width > 0 && boundingBox.height > 0,
  );
  if (usable.length < 2) return false;

  const typicalWidth = median(usable.map(({ boundingBox }) => boundingBox.width));
  const typicalHeight = median(usable.map(({ boundingBox }) => boundingBox.height));
  return typicalHeight > typicalWidth * 2;
}

function median(values: number[]) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}
