# R5A · Safe Grand Opening Preparation

R5A builds two missing pieces: an opt-in portable visitor passport and a
reproducible **static build preflight**. Neither authorizes a custom-domain move.

## Visitor passport transfer

- Existing browser storage key `field-atlas-visitor-passport-v6` is unchanged.
- **Export passport** downloads only the bounded list of visited chapter IDs,
  schema version, and export timestamp. It does **not** export account data,
  personally curated chapter URLs, favorite bookmarks, or local label edits.
- **Import passport** reads a user-selected JSON file (64 KiB maximum),
  validates a strict schema and safe chapter IDs, and **merges** only IDs
  already accessible in the current Atlas. It never deletes prior stamps,
  and it does not accept code, HTML, arbitrary URLs or remote imports.
- Duplicates and unavailable IDs are skipped. Visitor passport remains local;
  choosing a file does not upload it.
- Existing chapter navigation alone is responsible for new visit stamps.

## Static build preflight

Run:

```sh
npm test
npm run build
npm run launch:preflight
```

Preflight verifies the compiled output has an accessible title/language,
canonical current GitHub Pages address, social sharing metadata, relative Vite
asset paths, robots and sitemap, and **no CNAME** in the build.

Both pull-request CI and the deployment build should run this preflight;
a failed static check blocks publication. This is **not** a browser,
accessibility, availability, iframe compatibility or DNS acceptance test.

## Current vs proposed domain

The active canonical address continues to be:

`https://michaelwave369.github.io/FieldAtlas/`

The proposed `enterthefield.org` must **not** be written into canonical,
Open Graph or sitemap URLs until R5 has manual sign-off, control of the
domain is verified, and the DNS/HTTPS migration has a reversible rollout plan.

## Remaining acceptance evidence (not yet claimed)

Use `docs/ENTERTHEFIELD_ORG_LAUNCH.md` and
`docs/V1_GRAND_OPENING_CHECKLIST.md` to record actual desktop, mobile,
keyboard, touch, screen-reader, reduced-motion, deep-link and iframe results,
including representative creative tools and games. Confirm importer error
messaging, downloaded backup restoration and network-offline behavior.

A green Actions workflow proves the static checks ran successfully; it is
**not** the sign-off for an actual domain switch.
