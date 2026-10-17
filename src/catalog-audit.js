import { wingForCategory } from './catalog.js';

/**
 * Read-only classification helper. An archive host is a useful review signal,
 * not permission to overwrite a reader's manually chosen category.
 */
export function isZenodoEntry(rawUrl = '') {
  try {
    const url = new URL(String(rawUrl));
    if (url.protocol !== 'https:') return false;
    const host = url.hostname.toLowerCase();
    if (host === 'zenodo.org' || host === 'www.zenodo.org') return true;
    return (host === 'doi.org' || host === 'dx.doi.org') &&
      /^\/10\.5281\/zenodo\.\d+\/?$/i.test(url.pathname);
  } catch {
    return false;
  }
}

export function suggestedChapterCategory(page) {
  return isZenodoEntry(page?.url) ? 'Publications' : null;
}

/**
 * Export only chapters currently visible in the reader's accessible catalog.
 * No passport, bookmarks, browser preferences, private discovery candidates,
 * or hidden chapters are included. Export never changes a chapter.
 */
export function createCatalogAudit(catalog = [], generatedAt = new Date().toISOString()) {
  const chapters = (Array.isArray(catalog) ? catalog : [])
    .filter(p => p && typeof p.id === 'string' && typeof p.url === 'string')
    .map(p => {
      const category = String(p.category || 'Other');
      const suggestedCategory = suggestedChapterCategory(p);
      return {
        id: p.id,
        repo: String(p.repo || ''),
        title: String(p.title || ''),
        url: p.url,
        description: String(p.desc || ''),
        category,
        wing: wingForCategory(category),
        suggested_category: suggestedCategory,
        needs_category_review: Boolean(suggestedCategory && suggestedCategory !== category),
      };
    }).sort((a, b) => a.title.localeCompare(b.title) || a.id.localeCompare(b.id));
  const counts = {};
  for (const chapter of chapters) counts[chapter.category] = (counts[chapter.category] || 0) + 1;
  return {
    schema_version: 1,
    kind: 'fieldatlas-catalog-category-audit',
    generated_at: generatedAt,
    scope: 'Accessible catalog in this browser at export time, including personal chapters and category edits',
    warning: 'This file may include personally added links. Review before sharing. No changes were made to the library.',
    chapter_count: chapters.length,
    review_count: chapters.filter(ch => ch.needs_category_review).length,
    category_counts: Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b))),
    chapters,
  };
}
