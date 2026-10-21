# R5E · Visitor Readiness and Audit Packet

R5E adds a **real human review aid** without converting automated success
into release authorization.

## Expanded browser smoke

Three extra tests per Chromium project (desktop + Pixel 7 emulation):

- Layout at 320, 375, 390, 768, 1024, and 1440 CSS pixels: visible book,
  sane document width and bounded header.
- Local bookmarks and day/night lighting persist after browser reload.
- Peeking inside a directory chapter does **not** stamp a passport; opening
  it and reloading does preserve the stamp.

These complement R5B-D's Playwright, WCAG-scoped axe, post-deploy HTTP and
exact commit identity checks. They do not certify full accessibility or
physical device layout.

## Machine-readable acceptance packet

Every PR validation run now emits
`release-evidence/acceptance-packet.json`. It reads Playwright's JSON reporter
to record pass/fail/skipped/flaky totals, project names, source commit and a
GitHub Actions evidence link. The post-deploy job emits a separate packet
for tests against the **actual** Pages deployment.

The packet explicitly distinguishes:

- `browserAutomated`: checks we can rerun, including failures.
- `humanReview`: requirements from `release/acceptance.json`.
- `domainMigrationPermitted: false`: a permanent reminder this report
  is observational and is **never** an approval or migration tool.

Packets are uploaded to GitHub Actions with traces when available.
Missing Playwright JSON becomes `NOT_RUN`, never a fake pass. The
manual gate remains `NOT_APPROVED` until direct, reviewed evidence is
collected. No new analytics, network access, user data, CNAME or DNS changes.

## Human sign-off instructions

1. Start from the post-deploy production verification workflow associated
   with the exact candidate source SHA.
2. Check the acceptance packet and production HTTP receipt.
3. Perform physical-phone touch, NVDA or VoiceOver, reduced-motion,
   cross-origin editor/game compatibility, real share previews, performance,
   live-catalog accuracy, and secure domain ownership checks.
4. For each of the 12 `release/acceptance.json` items, record PASS/FAIL/BLOCKED
   and a link or path to verifiable evidence. Keep PENDING for untested items.
5. Only after all checks pass, a human reviewer may sign the exact audited SHA.
   The existing `npm run release:gate` then allows a **release review**,
   not automatic DNS modification or approval for third-party services.

Don't migrate `enterthefield.org` or tag a release as accepted based on
CI checks alone. The original GitHub Pages URL must remain reachable.
