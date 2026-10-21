# R5C · Visitor Accessibility and Browser Regression

R5C follows the merged R5B Playwright foundation. It upgrades the release
process without changing deployment origins, browser-local storage,
chapter taxonomy, embeds or authored website metadata.

## Visitor-facing improvements

- **Skip to living book** is the first keyboard focus stop. The link stays
  visually tucked away until keyboard focus and goes straight to the
  single original book, which is programmatically focusable.
- The directory traps Tab within the active modal and restores focus to its
  opener on Escape. We removed premature HTML autofocus, which previously
  captured the dialog input as the opener before the focus manager ran.
- Book covers use their visible title/category as the accessible button name.
  The mobile icon-only curator action now has a matching spoken name.
- Reduced-motion chapter turns navigate without the page-flip transition.
- Invalid passport JSON is rejected without changing saved visit IDs.
- Desktop and emulated-mobile Playwright suites include WCAG 2.0/2.1 A/AA
  automated scans of the header and directory, failing on serious or critical
  findings. These tests do **not** certify overall WCAG conformance.

## Manual acceptance still required

Keyboard-only testing of all book tabs, dialogs and external iframes;
actual NVDA/VoiceOver semantics and reading order; physical phone touch
at multiple sizes; caption/text scaling; motion preferences; contrast checks
across both lamp modes; and actual game/editor iframe compatibility.

Axe checks cannot fully evaluate screen-reader experience, external app
permissions, touch ergonomics, text clarity or mobile screen clipping.

## Launch status

The signed manual gate in `release/acceptance.json` remains
`NOT_APPROVED`. Static CI and browser tests can pass without inventing
manual evidence. `enterthefield.org` is still a **proposed** future
origin, and this PR makes no DNS/CNAME/redirect/canonical change.
