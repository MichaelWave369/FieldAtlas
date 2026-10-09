/**
 * The Infinite Atlas: explicit same-site Easter egg, not recursive iframes.
 * The mirror renders a bounded number of lightweight React illustrations.
 */
export const MAX_MIRROR_DEPTH = 5;
export const MIN_MIRROR_DEPTH = 1;

export function isInfiniteAtlas(page) {
  if (!page || String(page.repo || '').toLowerCase() !== 'fieldatlas') return false;
  try {
    const url = new URL(page.url);
    return url.protocol === 'https:'
      && url.hostname.toLowerCase() === 'michaelwave369.github.io'
      && /^\/FieldAtlas\/?$/i.test(url.pathname);
  } catch {
    return false;
  }
}

export function clampMirrorDepth(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return MIN_MIRROR_DEPTH;
  return Math.max(MIN_MIRROR_DEPTH, Math.min(MAX_MIRROR_DEPTH, Math.trunc(numeric)));
}

export function nextMirrorDepth(current, delta) {
  return clampMirrorDepth(clampMirrorDepth(current) + delta);
}

export function mirrorLayers(depth) {
  return Array.from({ length: clampMirrorDepth(depth) }, (_, index) => index + 1);
}
