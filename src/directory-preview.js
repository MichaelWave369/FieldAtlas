import { safeUrl } from './catalog.js';
import { isPublicationChapter } from './publications.js';
import { isInfiniteAtlas } from './fieldception.js';

/**
 * Directory previews are opt-in for external apps. Curated Zenodo research
 * and the bounded Atlas mirror intentionally never load live iframes.
 */
export function directoryPreviewKind(page) {
  if (!page) return 'unavailable';
  if (isPublicationChapter(page)) return 'research';
  if (isInfiniteAtlas(page)) return 'mirror';
  return safeUrl(page.url) ? 'website' : 'unavailable';
}

/** Website host is descriptive metadata, not proof of availability or trust. */
export function directoryPreviewHost(page) {
  try { return safeUrl(page?.url) ? new URL(page.url).host : 'Unknown host'; }
  catch { return 'Unknown host'; }
}
