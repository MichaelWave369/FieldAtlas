import { uniqueMerge, wingForCategory, isVerifiedPublishedPage } from './catalog.js';
import { curateProject, applyLocalEdits } from './curation.js';
import { publicationChapters } from './publications.js';

/**
 * A browser-local snapshot can contain a retired or case-mismatched Pages URL.
 * Reconcile only against the deployment-verified public manifest, by exact
 * repository identity (case-insensitive), without replacing IDs, personalized
 * labels, visited stamps or user-owned custom chapter URLs.
 */
export function reconcileVerifiedChapterUrls(pages = [], publishedPages = []) {
  const trustedUrls = new Map();
  for (const chapter of publishedPages) {
    if (!isVerifiedPublishedPage(chapter)) continue;
    const key = chapter.repo.toLowerCase();
    if (!trustedUrls.has(key)) trustedUrls.set(key, chapter.url);
  }
  return pages.map(page => {
    if (!page || String(page.id || '').startsWith('custom-') || !page.repo) return page;
    const verified = trustedUrls.get(String(page.repo).toLowerCase());
    return verified && verified !== page.url ? { ...page, url: verified } : page;
  });
}

/** One canonical catalog shared by the reader, map, and directory. */
export function composeAtlasCatalog({ pages = [], publishedPages = [], hiddenIds = [], localEdits = {} } = {}) {
  const hidden = new Set(hiddenIds);
  return uniqueMerge(
    uniqueMerge(reconcileVerifiedChapterUrls(pages, publishedPages), publishedPages.filter(page => !hidden.has(page.id))),
    publicationChapters.filter(page => !hidden.has(page.id))
  ).map(page => applyLocalEdits(curateProject(page), localEdits));
}

function containsQuery(page, query = '') {
  const needle = query.trim().toLowerCase();
  return !needle || [page.title, page.repo, page.desc, page.category].join(' ').toLowerCase().includes(needle);
}

/** Stable source-order reader chapters. No mutation of personal curation. */
export function filterAtlasCatalog(catalog, { wing = 'all', category = 'All', search = '', favoriteIds = [] } = {}) {
  const favorites = new Set(favoriteIds);
  return catalog.filter(page => {
    const inWing = wing === 'all' || wingForCategory(page.category) === wing;
    const inCategory = category === 'All' ||
      (category === 'Favorites' ? favorites.has(page.id) : page.category === category);
    return inWing && inCategory && containsQuery(page, search);
  });
}

/** Directory sorts a copy; it never changes the reader's chapter order. */
export function searchAtlasDirectory(catalog, { wing = 'all', search = '' } = {}) {
  return catalog.filter(page => (wing === 'all' || wingForCategory(page.category) === wing) &&
    containsQuery(page, search)).sort((a, b) => a.title.localeCompare(b.title));
}
