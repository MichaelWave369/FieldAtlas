import { useMemo } from 'react';
import { composeAtlasCatalog, filterAtlasCatalog, searchAtlasDirectory } from '../atlas-catalog.js';

/** Memoize chapter composition and both navigation surfaces in one place. */
export default function useAtlasCatalog({
  pages, publishedPages, discovery, localEdits, category, search, favoriteIds,
  wing, directorySearch, directoryWing,
}) {
  const catalog = useMemo(() => composeAtlasCatalog({
    pages, publishedPages, hiddenIds: discovery.hiddenIds, localEdits,
  }), [pages, publishedPages, discovery.hiddenIds, localEdits]);

  const filtered = useMemo(() => filterAtlasCatalog(catalog, {
    category, search, favoriteIds, wing,
  }), [catalog, category, search, favoriteIds, wing]);

  const directoryResults = useMemo(() => searchAtlasDirectory(catalog, {
    wing: directoryWing, search: directorySearch,
  }), [catalog, directoryWing, directorySearch]);

  return { catalog, filtered, directoryResults };
}
