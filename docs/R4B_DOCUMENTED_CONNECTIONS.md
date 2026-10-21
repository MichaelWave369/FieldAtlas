# R4B · Documented Connections and Evidence Ledger

## Documentary claims, not untested runtime guarantees

The R4A constellation makes **suggestions** based on words and categories.
R4B introduces a separate, explicitly reviewed registry of **DOCUMENTED**
links in public source repositories. A README claim is evidence that a
maintainer documented a connection, **not** independent proof that the
integration currently works or that a linked deployment is healthy.

Only entries with commit-pinned GitHub README source references are allowed;
each carries a short bounded claim, relationship kind, explicit direction,
scope caveat, documentary status and common review date.

## Reviewed source snapshot (2026-10-21)

| Source | Target | Claim | Evidence |
|---|---|---|---|
| FieldAtlas | FutureArchive | Public navigational bridge and gallery doorway | FieldAtlas README, lines 3-7 |
| FutureArchive | FieldAtlas | Chapter links and general Atlas entrance | FutureArchive README, lines 3-5 |
| Domistika | Auralith369 | Protected-layer creative handoff described by receiver | Auralith README, lines 62-87 |
| SiliconLouvre | Domistika | Short-lived receiver for SVG from Louvre studio | Domistika README, lines 1-10 |
| parallax-pixelforge | SparkTheSubstrate | Source-pinned local runtime adapter/qualification contract | PixelForge README, lines 191-212 |

The registry stores full commit-pinned evidence URLs. See
`src/documented-connections.js`. No background GitHub fetch or extra user
permissions are needed. The UI does not display an edge until both endpoint
chapters exist in the user's accessible canonical Atlas.

## Trust and behavior

- `DOCUMENTED_NOT_RUNTIME_VERIFIED` is displayed prominently.
- No source text is interpreted as live deployment verification.
- Direction matters: receiver records appear inbound.
- A documented bridge is visually separate from the heuristic R4A neighbors.
- Selecting a chapter navigates using the original reader and passport logic.
- Evidence links open GitHub outside the Atlas; URLs cannot be non-GitHub or
  mutable `main` citations.
- Local edited labels cannot create new reviewed evidence.
- No new network, storage key, tracking, iframe, or domain change.

## Manual acceptance

Verify the four project pairs above in the published book when both chapters
are present. Check missing endpoint behavior, current browser-local
hidden chapters, keyboard/mobile actions, pinned evidence URLs, screen reader
semantics, and the label **Documented, not live-tested**. Changes to
runtime verification need a new receipt tied to a test revision and date.

`enterthefield.org` remains untouched until R5 acceptance.
