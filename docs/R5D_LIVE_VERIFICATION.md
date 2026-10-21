# R5D · Production Verification and Evidence Receipts

R5D tests what the public actually receives from GitHub Pages **after**
the Pages deployment completes. It does not approve a release, switch DNS,
alter canonical URLs or change visitor data.

## Two distinct production checks

1. `npm run live:verify` makes read-only HTTP requests against
   `https://michaelwave369.github.io/FieldAtlas/`. It checks the live
   homepage response and metadata, published JS/CSS bundles, social image,
   robots and sitemap, plus `release-info.json`, which **must match the exact
   Git commit SHA of the workflow**. It rejects stale/cached deployments and
   unexpected redirects outside the currently approved GitHub Pages origin;
   the result is a timestamped JSON receipt.
2. `npm run test:live` runs **six Chromium journeys** in desktop and
   mobile emulation against that same public URL, verifying that the
   original book loads, directory chapter navigation works, and an existing
   chapter deep-link works without 404. It does not launch external apps.

The deploy workflow now has a **post-deploy** `verify-live` job, depending
on successful Pages deployment. It runs the HTTP verifier and Chromium
journeys, and uploads receipts, screenshots and traces when available.
A failing post-deploy verification means the Pages deploy may have
succeeded while the visitor acceptance failed. The source changes are
already deployed at that point; operators must investigate or roll back,
not assume GitHub has undone the deployment.

## Trust boundaries

- The exact current GitHub Pages address is pinned in the checks.
- One remote request per directly referenced asset; no spider, no scanning
  all third-party sites, no GitHub token, no user cookies/accounts.
- The verifier never writes the canonical or CNAME, never modifies DNS or
  registers an approval in `release/acceptance.json`.
- Success means **HTTP/DOM visibility**, not end-to-end success of hosted
  games, authentic screen-reader usability, cross-origin iframe ability,
  performance under load or domain control.
- If real site hosting is temporarily unavailable, the post-deploy job is
  expected to signal failure rather than silently accept stale build results.

Manual browser/physical-device tests and all twelve release-ledger
signatures remain required before the controlled
`enterthefield.org` migration.

## Exact-build identity and rollback clarity

`npm run build` writes `dist/release-info.json` with the GitHub Actions
source SHA and build date. It explicitly labels itself
`NOT_MANUALLY_APPROVED`. The post-deploy workflow refuses to certify an
older cached deployment because its identity differs from `GITHUB_SHA`.

To rerun the audit from a local checkout:
```sh
FIELD_ATLAS_EXPECTED_SHA=<40-character-exact-main-commit> npm run live:verify
```

A passing deployment job does not change the twelve human-led approval gates.
