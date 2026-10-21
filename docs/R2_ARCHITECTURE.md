# R2 Architecture · Field Atlas

This is an incremental extraction, **not** a new visual design or a completed
R2 acceptance claim. The existing book, tabs, map and reader remain the sole UI.

## First extraction (R2A)

- `atlas-catalog.js`: pure canonical catalog composition, reader filtering,
  and independent directory sort, sharing the existing curation/wing rules.
- `hooks/useAtlasCatalog.js`: memoized results for reader and directory.
- `passport-storage.js` + `hooks/useAtlasPassport.js`: local-only history
  using the **unchanged v6 key**, keeping the 1000-chapter limit.
- `atlas-manifest.js` + `hooks/useAtlasManifest.js`: the existing read-only
  deployed manifest policy, moved out of the giant App component. The async
  callback now consults the latest committed personal chapters so it does not
  diff against first-render pages after a delayed fetch.
- R2 regression tests validate isolation, hiding, favorite filtering, sorting,
  history and manifest failures.

## Still required before claiming R2 is complete

- Extract curation workflows and daily opt-in discovery scanning with a
  comprehensive state contract (including first-load saved-browser behavior).
- Extract modal and portal presentation after accessibility and iframe
  compatibility checks. No state keys should silently change.
- Validate the browser-local passport, manually edited chapters, stored
  favorites, hidden chapters, shared links and multi-tab behavior against the
  original deployment. Run keyboard/mobile acceptance rather than assuming it.
- Keep iframe compatibility and domain cutover gated separately; domain DNS
  and GitHub Pages settings remain untouched.
