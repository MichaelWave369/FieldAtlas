# The Field Atlas → enterthefield.org

## Destination, not a premature switch

**Goal:** Once Field Atlas passes its release gates, make it the public front door
of `enterthefield.org`. The book remains the centerpiece: portals lead to existing
independently hosted projects instead of migrating or duplicating those projects.

**Current status:** Proposed. This document changes no DNS, domain ownership,
GitHub Pages settings, existing production deployment, or public URLs.

## Release gates

1. **R1 · Foundation:** validate sandboxed previews against real games, galleries,
   storage-heavy apps and research leaves. Direct links must remain usable. Check
   keyboard focus, reduced motion, deep links, and all modal exits.
2. **R2 · Architecture:** split reader state, discovery, curation, passport, and
   dialogs without changing legacy browser-local storage keys or favorites.
3. **R3 · Discovery and previews:** searchable card catalog, recently visited,
   fast visual placeholders, opt-in live previews, and responsive tab navigation.
4. **R4 · Connected worlds:** related chapters, richer metadata, map relations,
   local passport export/import, and trustworthy availability/status labels.
5. **R5 · Acceptance:** desktop, narrow/mobile, touch, keyboard, screen-reader,
   reduced-motion, and performance review. Check the current live catalog,
   links, embed restrictions, consent and copy. Record evidence before release.

## Domain cutover checklist (only after R5 is accepted)

- Confirm control of the domain at the registrar/DNS provider and verify the
  intended authoritative DNS configuration; do not infer ownership from a URL.
- Choose one canonical origin (apex `enterthefield.org` or `www`) and redirect
  the other. Confirm GitHub Pages custom-domain support for the chosen setup.
- Configure and verify DNS ownership, custom-domain assignment, HTTPS
  certificate issuance/enforcement, and apex/WWW behavior.
- Check GitHub Actions / Vite `base` and client routing, absolute share links,
  asset loading, Open Graph metadata, deep links and service-worker scope.
- Preserve `michaelwave369.github.io/FieldAtlas/` with a tested redirect or
  compatibility path. Do not strand links that already circulate.
- Save prior DNS values, launch during a controllable window, test in multiple
  browsers/networks, and document a reversible rollback.
- Announce the canonical address only when HTTPS, sharing, navigation and
  representative project previews are verified.

**No live domain changes belong in an R1 security/accessibility PR.**
