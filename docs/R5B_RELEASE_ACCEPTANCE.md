# Field Atlas · R5B Browser Acceptance & Release Gate

R5B is the **candidate QA stage**, not a launch or DNS change. PR #26
already introduced a static output preflight. R5B adds repeatable
*real browser* acceptance tests and a human-signoff ledger.

## Repeatable Chromium smoke tests

Run locally or in GitHub Actions:

```sh
npm install
npx playwright install chromium
npm test
npm run build
npm run launch:preflight
npm run test:e2e
npm run release:status
```

Desktop 1440×900 and mobile Pixel 7 emulation cover:
- Book entrypoint, directory search and opening a selected chapter
- Chapter art vs **opt-in** live iframe and stop/unload controls
- Quick find shortcut and collection filter buttons
- Passport export/download and local import with no sensitive fields
- Constellation suggested-chapter navigation in the original reader

The tests run against the built Vite preview server, not the production
website. Mobile *emulation* is not evidence of successful real-phone touch
and screen-reader tests. They check DOM behavior, not whether all external
sites permit cross-origin embedding.

On CI failure, traces and screenshots are uploaded as workflow artifacts.
Failures in tests or compiled bundle block merging.

## Human acceptance ledger

`release/acceptance.json` begins with twelve `PENDING` requirements
and a `NOT_APPROVED` disposition. Each must be independently reviewed,
changed to `PASS`, and accompanied by a reference to actual acceptance
evidence (for example a GitHub Issue or a reproducible result/recording).
Set the reviewer, signed date, and exact **audited commit SHA** only when
all checks truly pass. `npm run release:status` validates the schema and
reports readiness but doesn't grant release approval itself.
`npm run release:gate` *fails* until the complete signed ledger is ready.

The CI runs the **report-only** release status check. This distinction lets
a PR merge while still preventing an accidental announcement that the domain
migration is approved.

## Manual matrix

Desktop and short-height screens; physical phone portrait/landscape touch;
NVDA/VoiceOver; Tab/Escape and focus return; reduced motion; representative
iframe-hostile games, studios, and research; full current catalog and deep
links; portfolio/personalization continuity; live share-card preview;
long-catalog memory/performance; domain registrar ownership and rollback
evidence; DNS/HTTPS/redirect rehearsal.

See `docs/ENTERTHEFIELD_ORG_LAUNCH.md`. The domain remains untouched
until a separate, explicitly approved deployment PR, with tested rollback.
