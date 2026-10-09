/**
 * v1.0 Grand Opening: surprise visitors with another chapter.
 * Works only with the catalog already available in the browser: no network,
 * private repo lookups, permissions or hidden project discovery.
 */
import { wingForCategory, safeUrl } from './catalog.js';

export const compassFilters = Object.freeze([
  { id: 'all', title: 'All rooms' },
  { id: 'research', title: 'Research' },
  { id: 'creative', title: 'Creative' },
  { id: 'engineering', title: 'Engineering' },
  { id: 'games', title: 'Games' },
  { id: 'annex', title: 'Curious Annex' },
]);

export function availableSurprises(catalog = [], wing = 'all', excludeId = null) {
  if (!Array.isArray(catalog) || !compassFilters.some(f => f.id === wing)) return [];
  const seen = new Set();
  return catalog.filter(page => {
    if (!page || !page.id || !safeUrl(page.url) || page.id === excludeId) return false;
    if (wing !== 'all' && wingForCategory(page.category) !== wing) return false;
    if (seen.has(page.id)) return false;
    seen.add(page.id);
    return true;
  });
}

export function pickSurpriseChapter(catalog, options = {}) {
  const {
    wing = 'all',
    visitedIds = [],
    currentId = null,
    random = Math.random,
  } = options;
  const optionsWithoutCurrent = availableSurprises(catalog, wing, currentId);
  // A singleton room should still have a meaningful, safe result.
  const choices = optionsWithoutCurrent.length ? optionsWithoutCurrent : availableSurprises(catalog, wing);
  if (!choices.length) return null;
  const visited = new Set(Array.isArray(visitedIds) ? visitedIds : []);
  const fresh = choices.filter(p => !visited.has(p.id));
  const pool = fresh.length ? fresh : choices;
  const sample = Number(random());
  const n = Number.isFinite(sample) ? Math.min(Math.max(sample, 0), 0.9999999999) : 0;
  return pool[Math.floor(n * pool.length)];
}

export function remainingSurpriseCount(catalog, wing, visitedIds = []) {
  const visited = new Set(Array.isArray(visitedIds) ? visitedIds : []);
  return availableSurprises(catalog, wing).filter(p => !visited.has(p.id)).length;
}
