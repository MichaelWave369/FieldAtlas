// Browser-local visitor history, compatible with the existing v6 key.
export const PASSPORT_KEY = 'field-atlas-visitor-passport-v6';
export const MAX_PASSPORT_CHAPTERS = 1000;

export function normalizePassportIds(ids) {
  return Array.isArray(ids) ? ids.filter(id => typeof id === 'string').slice(0, MAX_PASSPORT_CHAPTERS) : [];
}

export function markChapterVisited(ids, activeId) {
  const existing = normalizePassportIds(ids);
  if (!activeId || existing.includes(activeId)) return existing;
  return [...existing, activeId].slice(-MAX_PASSPORT_CHAPTERS);
}
