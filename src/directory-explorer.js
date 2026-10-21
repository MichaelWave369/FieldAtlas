import { wingForCategory } from './catalog.js';

/** Collections share the existing public/personal catalog, never a second copy. */
export const directoryCollections = Object.freeze([
  { id: 'all', label: 'All chapters' },
  { id: 'visited', label: 'Recently explored' },
  { id: 'favorites', label: 'Bookmarked' },
  { id: 'unexplored', label: 'Unexplored' },
]);

export function directoryCollectionCounts(catalog, { wing = 'all', visitedIds = [], favoriteIds = [] } = {}) {
  const visited = new Set(visitedIds);
  const favorites = new Set(favoriteIds);
  const scope = catalog.filter(page => wing === 'all' || wingForCategory(page.category) === wing);
  return {
    all: scope.length,
    visited: scope.filter(page => visited.has(page.id)).length,
    favorites: scope.filter(page => favorites.has(page.id)).length,
    unexplored: scope.filter(page => !visited.has(page.id)).length,
  };
}

/**
 * `matchingPages` is the already-searchable, alphabetically sorted directory.
 * Visited entries use the passport's visit order, newest stamp first.
 * All other collections keep the existing alphabetic directory order.
 */
export function selectDirectoryCollection(matchingPages, {
  collection = 'all', visitedIds = [], favoriteIds = [],
} = {}) {
  const visited = new Set(visitedIds);
  const favorites = new Set(favoriteIds);
  if (collection === 'visited') {
    const order = new Map(visitedIds.map((id, index) => [id, index]));
    return matchingPages.filter(page => visited.has(page.id))
      .sort((a, b) => order.get(b.id) - order.get(a.id));
  }
  if (collection === 'favorites') return matchingPages.filter(page => favorites.has(page.id));
  if (collection === 'unexplored') return matchingPages.filter(page => !visited.has(page.id));
  return matchingPages;
}

export function isAtlasFindShortcut(event) {
  return Boolean(event && !event.isComposing && !event.repeat && !event.altKey &&
    !event.shiftKey && (event.ctrlKey || event.metaKey) &&
    String(event.key).toLowerCase() === 'k');
}
