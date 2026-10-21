import { safeUrl, wingForCategory } from './catalog.js';

/**
 * A local-only discovery graph built from the visible canonical catalog.
 *
 * Edges are editorial suggestions based on category, room and shared words.
 * They are NEVER proof of an integration, dependency, ownership or endorsement.
 */
const STOP_WORDS = new Set([
  'about','after','agent','agents','another','atlas','based','beautiful','browser','build','building',
  'chapter','chapters','creative','creation','creations','different','digital','each','every',
  'experiment','experiments','field','from','github','help','into','local','more','next','open',
  'page','pages','people','platform','project','projects','public','site','space','studio',
  'system','systems','their','there','these','this','through','tool','tools','using','where',
  'which','with','world','worlds','work','your','that','them','they','uses','research',
  'experience','interactive','design','shared','places','ideas','explore','visual','online',
]);

function words(value) {
  const matches = String(value || '').toLowerCase().match(/[a-z][a-z0-9]+/g) || [];
  return new Set(matches.filter(word => word.length >= 4 && !STOP_WORDS.has(word) && !/^\d+$/.test(word)).slice(0, 70));
}

function shared(source, target) {
  return [...source].filter(word => target.has(word));
}

function eligible(page) {
  return Boolean(page && typeof page.id === 'string' && page.id && safeUrl(page.url));
}

function normalizedAddress(url) {
  try { return new URL(safeUrl(url)).href.replace(/\/$/, '').toLowerCase(); }
  catch { return null; }
}

/**
 * Return no more than `limit` explainable neighboring chapters.
 * Full catalog is used, not filtered current-room results, so threads can
 * cross between creative work, engineering, research and play.
 */
export function findFieldThreads(active, catalog = [], limit = 5) {
  if (!eligible(active) || !Array.isArray(catalog) || !Number.isFinite(limit) || limit <= 0) return [];
  const activeUrl = normalizedAddress(active.url);
  const titleWords = words(active.title);
  const descriptionWords = words(active.desc);
  const wing = wingForCategory(active.category);
  const candidates = [];
  const seenAddresses = new Set();

  for (const candidate of catalog) {
    if (!eligible(candidate) || candidate.id === active.id) continue;
    const address = normalizedAddress(candidate.url);
    if (!address || address === activeUrl || seenAddresses.has(address)) continue;
    const exactCategory = active.category && active.category !== 'Other' && candidate.category === active.category;
    const sameWing = wing && wing !== 'all' && wing !== 'annex' && wingForCategory(candidate.category) === wing;
    const titleOverlap = shared(titleWords, words(candidate.title));
    const descriptionOverlap = shared(descriptionWords, words(candidate.desc));
    const hasSharedThemes = titleOverlap.length > 0 || descriptionOverlap.length >= 2;
    if (!exactCategory && !sameWing && !hasSharedThemes) continue;

    // Explain only what the catalog actually provides. The score is a ranking aid.
    const score = (exactCategory ? 12 : 0) + (sameWing ? 4 : 0) +
      titleOverlap.length * 6 + Math.min(descriptionOverlap.length, 4) * 2;
    let reason;
    let reasonKind;
    if (titleOverlap.length) {
      reason = 'Shared title theme: ' + titleOverlap[0];
      reasonKind = 'theme';
    } else if (exactCategory) {
      reason = 'Same category: ' + candidate.category;
      reasonKind = 'category';
    } else if (descriptionOverlap.length >= 2) {
      reason = 'Shared description themes';
      reasonKind = 'theme';
    } else {
      reason = 'Same library room';
      reasonKind = 'wing';
    }
    candidates.push({ page: candidate, score, reason, reasonKind, address });
    seenAddresses.add(address);
  }

  return candidates.sort((a, b) =>
    b.score - a.score || a.page.title.localeCompare(b.page.title) || a.page.id.localeCompare(b.page.id)
  ).slice(0, Math.min(Math.floor(limit), 8)).map(({ page, reason, reasonKind }) => ({
    page, reason, reasonKind,
  }));
}
