# R4A · The Field Constellation

## Goal

Make the Field Atlas feel like an interconnected *library*, while accurately
distinguishing **editorial recommendations** from verified project dependencies.

## What ships

- A lightweight **Field Constellation** disclosure below the reader controls.
  It can expand into an accessible, connected-nodes view anchored on the
  currently open chapter. The existing reader, diagonal tabs, map, directory
  and saved visitor state stay unchanged.
- A deterministic, pure relationship-selector that uses the *current accessible
  catalog* and supports up to five nearby chapters, with a hard cap of eight.
- Reasons are grounded in existing categories, chapter titles, library wing,
  and shared descriptive themes. Generic words such as “atlas”, “field”, “tool”,
  “app” and “project” are ignored; no LLM, server or new network request.
- Only safe existing chapter URLs are admitted. The current chapter, duplicated
  URLs, unsafe addresses and missing pages are excluded.
- Selecting a neighbor uses the original deferred chapter-opening flow,
  clearing incompatible reader filters. Only the actual selected page, after
  navigation, receives the existing local visitor passport stamp.
- The constellation does **not** claim these projects are wired together,
  certified, live, endorsed or dependency-linked. The legend states that
  connections are editorial discovery paths.

## Acceptance

Automated tests check same-category, cross-wing shared subjects, unsupported
relationships, duplicate/unsafe exclusion, ranking, cap and reader wiring.

Manually inspect desktop/mobile, keyboard disclosure control, tab-order,
focus, reduced motion, long chapter names, filter clearing and a previously
saved passport. The panel should not obscure or recreate the book and should
not fetch remote apps or add background work.

## Next

R4B may introduce an *explicitly sourced* relationship registry: documented
`uses`, `exports-to`, `researches`, and `inspired-by` edges, each with
an evidence URL, a provenance class and a last-verified date. Those must be
curated and verified before rendering as facts.

The eventual `enterthefield.org` domain switch remains gated until R5.
