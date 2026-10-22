# Atlas ↔ Constellation canonical public-ID bridge

**Scope:** This change affects only `FieldAtlas`, through a small helper module, tests and reader navigation. Constellation Edition 07 is unchanged.

## Existing entrypoints

- Atlas reader: `https://michaelwave369.github.io/FieldAtlas/?chapter=Domistika`
- Atlas tour: `?tour=first-light&chapter=SuperPhiVessel`
- Constellation selection: `https://michaelwave369.github.io/FieldConstellation/?repo=github:<numeric-repo-id>`

## Added reciprocal behavior

If the selected Atlas chapter matches exactly one `verified: true` public manifest row by **repository name and normalized HTTPS URL**, the reader displays a **View in Constellation** anchor. That anchor uses the stable GitHub numeric repository ID from `gh-<id>`; it does not infer an ID from a name or make a fresh API request.

Atlas also accepts `?project=github:<id>` as a return alias. It only selects a chapter if:
1. The alias is a single valid numeric-ID token with no duplicate `project` parameters.
2. Exactly one valid verified manifest row matches that identity.
3. Exactly one current, accessible Atlas chapter has the same repository name **and** normalized public HTTPS URL.

Existing `chapter` and `tour` query entrypoints have precedence; the new alias cannot silently override them. Unknown/withdrawn/unreviewed IDs, duplicate or malicious parameters, local-only pages and ambiguous matches never trigger a private lookup or redirect. A human-readable notice keeps the original reader/directory available.

## Provenance and privacy

The published manifest was generated from publicly observed Pages-enabled repositories. It is a dated snapshot, not a guaranteed live availability check. The bridge reuses the existing manifest that the Atlas has already fetched; no credentials or cross-origin API calls are introduced.

No shared cookies, iframe embedding, localStorage synchronization, passport export, or transfer of visited chapters. Field Atlas's suggested neighbors remain editorial. Field Constellation's sourced code relationships have a separate, stronger evidence status. The bridge conveys navigation, not technical dependency.

## Verification and manual acceptance

Automated tests cover source manifest gating, numeric link construction, seed chapters, custom/spoofed URLs, invalid and duplicate parameters, removed/unknown identities, and preserved reader aliases.

Manual browser checks after the PR passes:
- Open an existing verified Atlas chapter, confirm the new button opens the correct star.
- Open a numeric Atlas project alias, confirm the original reader focuses that chapter.
- Confirm existing shared chapter links and visitor tours still work unchanged.
- Confirm custom local chapters, publication chapters and unverified pages show no false link.
- Check keyboard focus, narrow mobile width and the existing passport behavior.
- Test when the public manifest cannot load; ordinary book navigation should remain intact.

Production is unchanged until a human merges the PR.
