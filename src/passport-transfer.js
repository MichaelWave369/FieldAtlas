import { MAX_PASSPORT_CHAPTERS, normalizePassportIds } from './passport-storage.js';

export const PASSPORT_TRANSFER_KIND = 'field-atlas-visitor-passport';
export const PASSPORT_TRANSFER_VERSION = 1;
export const PASSPORT_TRANSFER_MAX_BYTES = 65536;
const ID_RE = /^[A-Za-z0-9._:-]{1,160}$/;

function uniqueValidIds(ids) {
  const result = [];
  const seen = new Set();
  for (const id of normalizePassportIds(ids)) {
    if (!ID_RE.test(id) || seen.has(id)) continue;
    seen.add(id);
    result.push(id);
  }
  return result.slice(0, MAX_PASSPORT_CHAPTERS);
}

export function makePassportBackup(visitedIds, exportedAt = new Date().toISOString()) {
  return {
    kind: PASSPORT_TRANSFER_KIND,
    version: PASSPORT_TRANSFER_VERSION,
    exportedAt,
    visitedIds: uniqueValidIds(visitedIds),
  };
}

/**
 * Fail closed: this is a *passport*, not an instruction, code or general
 * application-data import. Only bounded string IDs are accepted.
 */
export function readPassportBackup(content) {
  if (typeof content !== 'string' || new TextEncoder().encode(content).length > PASSPORT_TRANSFER_MAX_BYTES) {
    throw new Error('Passport file is too large or unreadable. The limit is 64 KiB.');
  }
  let payload;
  try { payload = JSON.parse(content); }
  catch { throw new Error('This is not a valid JSON passport backup.'); }
  if (!payload || Array.isArray(payload) || payload.kind !== PASSPORT_TRANSFER_KIND ||
      payload.version !== PASSPORT_TRANSFER_VERSION || !Array.isArray(payload.visitedIds) ||
      payload.visitedIds.length > MAX_PASSPORT_CHAPTERS ||
      payload.visitedIds.some(id => typeof id !== 'string' || !ID_RE.test(id))) {
    throw new Error('Unsupported or invalid Field Atlas visitor passport.');
  }
  return uniqueValidIds(payload.visitedIds);
}

/**
 * Merge only visit IDs whose chapters are actually accessible here.
 * Preserve existing visit order, never overwrite local chapters or favorites.
 */
export function mergePassportBackup(existingIds, importedIds, catalog) {
  const known = new Set(Array.isArray(catalog) ? catalog.map(p => p?.id) : []);
  const merged = uniqueValidIds(existingIds);
  const seen = new Set(merged);
  let added = 0, skipped = 0;
  for (const id of uniqueValidIds(importedIds)) {
    if (!known.has(id) || !ID_RE.test(id)) { skipped++; continue; }
    if (seen.has(id)) continue;
    seen.add(id); merged.push(id); added++;
  }
  // If a passport is already full, the oldest visits rotate out.
  return { visitedIds: merged.slice(-MAX_PASSPORT_CHAPTERS), added, skipped };
}
