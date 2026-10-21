# R5F · External Doorway Compatibility and Human Launch Handoff

After R5E, the current Atlas has 24 locally tested browser scenarios,
6 live-site checks, an exact-commit post-deployment receipt and a distinct
machine acceptance packet. A browser test seeing an `iframe` element
**does not prove** the embedded app actually works under cross-origin
sandboxing, storage restrictions, WebGL or external authentication.

R5F checks **real outward-facing doorways** for five representative
existing chapters and makes a manual testing issue template available.

## Public chapter inspection routes

These use the *current* GitHub Pages origin (not `enterthefield.org`):

| Realm | Atlas entrance | Direct site | Human smoke test |
|---|---|---|---|
| Intelligence | `?chapter=SuperPhiVessel` | [Super Φ.Vessel](https://michaelwave369.github.io/SuperPhiVessel/) | Open full tab; review menus/permissions |
| Creative studio | `?chapter=Domistika` | [Domistika](https://michaelwave369.github.io/Domistika/) | Draw with different brushes in full tab |
| Creative tools | `?chapter=parallax-pixelforge` | [PixelForge](https://michaelwave369.github.io/parallax-pixelforge/) | Tools and export; record WebGL/storage limits |
| Game | `?chapter=GiltHouse` | [GiltHouse](https://michaelwave369.github.io/GiltHouse/) | Physical keyboard and phone touch controls |
| Research | `?chapter=zenodo-22838612` | [Zenodo technical note](https://zenodo.org/records/22838612) | Confirm citation and file links in full tab |

In each row prepend
`https://michaelwave369.github.io/FieldAtlas/` to the query shown.

## What is automated

- Live Chromium desktop and emulated-mobile open each Atlas deep link
  and confirm chapter identity and correct full-tab `href`, `target`
  and `noopener noreferrer` properties.
- For websites, tests confirm the reader uses a restricted sandbox and
  always offers an obvious independent full-tab link.
- For a curated Zenodo record, tests confirm there is no untrusted iframe.
- A targeted directory preview test confirms a user can stop an opt-in
  frame without losing the direct link.
- Embedded third-party document responses are **stubbed in these tests**.
  That isolates the Atlas's *doorway contract* and avoids misleading
  assertions about third-party iframe functionality or uptime.
- Node regression checks enforce the representative roster and sandbox.

## What must be done in person

On a real desktop and phone, open each direct site and exercise real features.
Record separately (1) full-tab works, (2) sandboxed preview works or is
limited, (3) fallback visibility and route integrity. Screenshots and dated
browser/OS notes belong in a manual acceptance issue using
`.github/ISSUE_TEMPLATE/field-atlas-launch-review.md`.

An earlier read-only retrieval of the five independent public URLs on
2026-10-21 found accessible page content. It was **not** an interaction
test, uptime guarantee or iframe compatibility proof.

A passing CI or deployment cannot update `release/acceptance.json` by
itself. Its 12 checks remain **PENDING / NOT_APPROVED** until a human
reviews each one with evidence from the exact candidate commit. There are
no DNS/CNAME/custom-domain changes in this release.
