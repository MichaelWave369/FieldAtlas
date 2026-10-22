import { isVerifiedPublishedPage, safeUrl } from './catalog.js';

export const CONSTELLATION_URL = 'https://michaelwave369.github.io/FieldConstellation/';
const PROJECT_RE = /^github:[1-9]\d{0,19}$/;

function normalizeUrl(input) {
  const safe = safeUrl(input);
  if (!safe || !safe.startsWith('https://')) return null;
  const url = new URL(safe);
  url.hash = '';
  url.search = '';
  return url.href.replace(/\/$/, '').toLowerCase();
}
function validManifestRow(row) {
  return isVerifiedPublishedPage(row) && /^gh-[1-9]\d{0,19}$/.test(row.id) &&
    !!normalizeUrl(row.url);
}
function matchesChapter(page, row) {
  return typeof page?.repo === 'string' && page.repo.toLowerCase() === row.repo.toLowerCase() &&
    normalizeUrl(page.url) === normalizeUrl(row.url);
}
function unique(rows) {
  return rows.length === 1 ? rows[0] : null;
}

/**
 * Find the one verified, publicly published repo matching the actual accessible
 * Atlas chapter. Matching *both* URL and repo avoids assigning a numeric GitHub
 * identity to a visitor-created/local chapter with only a copied display name.
 * Manifest rows are only those already validated from deployed public data.
 */
export function constellationProjectId(chapter, publishedPages = []) {
  if (!Array.isArray(publishedPages) || !chapter) return null;
  const row = unique(publishedPages.filter(r => validManifestRow(r) && matchesChapter(chapter, r)));
  return row ? 'github:' + row.id.slice(3) : null;
}

export function constellationChapterUrl(chapter, publishedPages = []) {
  const id = constellationProjectId(chapter, publishedPages);
  if (!id) return null;
  const url = new URL(CONSTELLATION_URL);
  url.searchParams.set('repo', id);
  return url.href;
}

/** Optional Atlas alias: ?project=github:<numeric-id>, never arbitrary URLs. */
export function readConstellationProject(search = '') {
  try {
    const params = new URLSearchParams(String(search).replace(/^\?/, ''));
    const values = params.getAll('project');
    return values.length === 1 && PROJECT_RE.test(values[0]) ? values[0] : null;
  } catch { return null; }
}

/**
 * Resolve only public, verified manifest rows, then a chapter already available
 * in this visitor's catalog. Never fetch an unknown identity from GitHub.
 */
export function locateConstellationChapter(catalog = [], publishedPages = [], identity = '') {
  if (!PROJECT_RE.test(identity) || !Array.isArray(catalog) || !Array.isArray(publishedPages)) return null;
  const row = unique(publishedPages.filter(r =>
    validManifestRow(r) && 'github:' + r.id.slice(3) === identity
  ));
  if (!row) return null;
  return unique(catalog.filter(page => matchesChapter(page, row)));
}
