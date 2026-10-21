# Field Atlas R2B · The Curator's Engine

This pass splits chapter creation, label editing and public GitHub discovery
out of the main reader without changing its book UI or public catalog semantics.

- Existing browser storage keys **remain** `field-atlas-pages-v1`,
  `field-atlas-curation-edits-v4` and `field-atlas-discovery-v2`.
- `useAtlasCuration` owns browser-local chapters, editor state and validation.
- `useAtlasDiscovery` owns new-arrival inbox, dismissals, opt-out, and scanning.
- The read-only scan uses a current catalog reference after an async response,
  avoiding the stale first-render catalog. A per-instance in-flight guard
  prevents overlapping daily/manual scans.
- `curation-actions` and `discovery-state` are independently unit-tested.
- Verified public manifest logic remains in the R2A `useAtlasManifest` hook.
- No iframe permission, CSS/book appearance, production domain, or DNS changes.

## Manual acceptance before merging

On a browser that already has a personalized Field Atlas, check adding,
editing, removing and resetting labels/chapters, hidden verified books, local
favorites, and the passport. Confirm opt-out survives reload, daily scan does
not repeat on every render, and approvals/dismissals remain browser-local.
Repeat with an empty browser profile and limited/failed network connectivity.
Check keyboard and mobile navigation and inspect the changed bundle size.

This is a focused R2B implementation, not proof that end-to-end visual or
mobile acceptance has happened. `enterthefield.org` stays unchanged until
the final launch gates are satisfied.
