/**
 * Repeating chapter navigation for the living book.
 * This helper is pure so page turns behave identically for all books,
 * filtered wings, search results, and keyboard / pointer controls.
 */
export function wrapChapterIndex(current, delta, count) {
  if (!Number.isInteger(count) || count < 1) return null;
  if (!Number.isInteger(current) || !Number.isInteger(delta)) return null;
  if (count === 1) return 0;
  return ((current + delta) % count + count) % count;
}

export function canTurnChapters(count) {
  return Number.isInteger(count) && count > 1;
}

export function wrapDestinationLabel(direction, index, count) {
  if (!canTurnChapters(count)) return direction === 'prev' ? 'Previous chapter' : 'Next chapter';
  if (direction === 'prev' && index === 0) return 'Previous chapter: wrap to the last chapter';
  if (direction === 'next' && index === count - 1) return 'Next chapter: wrap to the first chapter';
  return direction === 'prev' ? 'Previous chapter' : 'Next chapter';
}
