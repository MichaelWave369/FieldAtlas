import { isDossierName } from './encyclopedia-data.js';

/** Route to a same-origin standalone lab, never to a user-provided destination. */
export function experimentLabUrl(atlasHref, repo) {
  if (!isDossierName(repo) || typeof atlasHref !== 'string') return null;
  let atlas;
  try { atlas = new URL(atlasHref); } catch { return null; }
  if (!['http:', 'https:'].includes(atlas.protocol)) return null;
  const pathname = atlas.pathname.endsWith('/') ?
    atlas.pathname : atlas.pathname.slice(0,atlas.pathname.lastIndexOf('/')+1);
  const destination = new URL(pathname+'experiment-lab/',atlas.origin);
  destination.searchParams.set('repo',repo);
  return destination.href;
}
