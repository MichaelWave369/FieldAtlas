import { seedPages, safeUrl } from '../src/catalog.js';
import { publicationChapters } from '../src/publications.js';
import { directoryPreviewKind } from '../src/directory-preview.js';

/**
 * A small, deliberately chosen cross-section of the published book.
 * These are *inspection assignments*, not claims that external apps
 * successfully run in the Atlas's restricted iframe sandbox.
 */
export const PORTAL_REVIEW_CASES = Object.freeze([
  Object.freeze({
    repo: 'SuperPhiVessel', realm: 'Intelligence',
    manualCheck: 'Open the full app in its own tab; check menus and login/local-model permissions separately from the sandboxed preview.',
  }),
  Object.freeze({
    repo: 'Domistika', realm: 'Creative',
    manualCheck: 'Draw a shape and change brushes in a full tab; compare with the Atlas preview without relying on cross-origin storage.',
  }),
  Object.freeze({
    repo: 'parallax-pixelforge', realm: 'Creative tools',
    manualCheck: 'Open the creative workspace, inspect interactions and exports. Do not assume embedded local storage or WebGL permissions.',
  }),
  Object.freeze({
    repo: 'GiltHouse', realm: 'Games',
    manualCheck: 'Check keyboard controls and touch controls in a full tab; confirm the Atlas direct-link fallback stays discoverable.',
  }),
  Object.freeze({
    repo: 'zenodo-22838612', realm: 'Research',
    manualCheck: 'Confirm the original Zenodo citation and files open outside the Atlas. A research record should never be embedded as a live game.',
  }),
]);

export function resolveRepresentativePortals(catalog = [...seedPages, ...publicationChapters]) {
  if (!Array.isArray(catalog)) return [];
  const byRepo = new Map(catalog.filter(p => p && typeof p.repo === 'string')
    .map(p => [p.repo.toLowerCase(), p]));
  return PORTAL_REVIEW_CASES.flatMap(({ repo, realm, manualCheck }) => {
    const page = byRepo.get(repo.toLowerCase());
    if (!page || !safeUrl(page.url)) return [];
    return [{
      id: page.id, repo: page.repo, title: page.title, realm, url: page.url,
      kind: directoryPreviewKind(page), manualCheck,
    }];
  });
}
