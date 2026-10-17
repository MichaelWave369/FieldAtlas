# FieldAtlas catalog census · 2026-10-17

## Source and limits

The owner's browser exported **105 accessible chapters** in `fieldatlas-catalog-category-audit.json`. The export represents that browser's visible catalog, including locally curated chapters and overrides. It is not a list of every possible Zenodo publication, nor independent verification of the linked apps. For privacy and preservation, the raw browser export is **not committed** to this repository.

The source reported:
- **Creative 18; Games 5; Intelligence 2; Other 39; Research 18; Systems 9; Tools 14.**
- **No direct `zenodo.org` or `doi.org/10.5281/zenodo...` chapter URLs.** The research index `enter-the-field-research` is a public GitHub Pages gateway to Zenodo papers.
- Zero auto-flagged Zenodo category errors. That value was produced by *URL-only* detection; it was never a comprehensive category-quality score.
- No duplicate repository names or URLs in the exported 105 items.

## Editorial proposal

There are **50 explicit proposed category changes**, stored in `src/census-categories.js`. Of those, **34** move existing `Other` entries into more informative shelves. This is a proposal based on exported project descriptions, not an assertion that every destination has been individually inspected.

Four new categories join the existing ones: **Music**, **Galleries**, **Learning**, and **People & Practice**. The **Publications** shelf added in PR #12 remains in Research. The existing six map rooms, guided journeys, chapter IDs, URLs, and visitor passport logic are deliberately unchanged.

The proposed category distribution across the same 105 exported records:

| Shelf | Proposed chapters | Existing room |
|---|---:|---|
| Research | 21 | Research |
| Publications | 1 | Research |
| Learning | 7 | Research |
| Intelligence | 5 | Engineering |
| Systems | 14 | Engineering |
| Tools | 20 | Engineering |
| Creative | 12 | Creative |
| Music | 5 | Creative |
| Galleries | 2 | Creative |
| Games | 7 | Games |
| People & Practice | 6 | Curious Annex |
| Other | 5 | Curious Annex |
| **Total** | **105** | |

The **Publications** chapter currently proposed is `enter-the-field-research`, an index to scholarly releases. It is **not** a direct Zenodo record. Individual Zenodo paper chapters require a separate verified list of public records and a decision about chapter titles/DOI/version link policy. Nothing is synthesized or published from an unverified DOI.

## Explicit leave-for-review cases

No automatic category changes for `BounceDeck`, `goldenjoy369`, `governance-drift-rsdc`, `parallax-gran-prix`, `Phiform`, `ProofArcade`, or `MuseVault`, because the audit descriptions are missing or too generic. The first and the two arcade-named projects remain in their current bins, not moved on name alone.

The existing self-referential FieldAtlas chapter stays in **Other** intentionally.

## Safeguards

- Each new shared classification is an explicit per-repository override. New and unknown repositories still use the pre-existing conservative fallback.
- Browser-local edits are applied **last**, so personal choices remain authoritative.
- No existing chapter IDs, URLs, stored pages, favorites, or visited stamps are migrated or deleted.
- The library still has six physical map rooms. These are **shelves**, not an untested seventh room.
- Existing ZIPs, print files, media, and external Zenodo records are not copied into the repo.
- Merge only after passing tests, public inventory checks, build, and a browser spot check of filters, category covers, search, and Library Map.
