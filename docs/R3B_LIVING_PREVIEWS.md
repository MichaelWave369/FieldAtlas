# R3B · Illustrated Chapter Previews

R3B adds a small **Peek inside** affordance to each Grand Catalog entry.
The preview opens inline inside the *existing* directory dialog, preserving the
original book, fore-edge index, and existing chapter/visitor data.

## Design and safety

- Default is an **original editorial illustration** (glyph, nested rings,
  chapter title/category, host and description). It is expressly not a screenshot
  or a claim that the linked app currently works.
- **Launch live preview** is a deliberate per-chapter action, not automatic.
  At most one directory preview window is mounted at a time.
- The main book's live iframe is suspended while the directory is open, so the
  directory doesn't create a second concurrently running app. The main reader
  resumes normally on closing the directory, but an in-progress embedded app
  may reload. Open the app directly if you need continuity.
- Previews use the same opaque-origin R1 sandbox, no same-origin privileges,
  no clipboard grant, and a strict referrer policy. Some games and apps relying
  on localStorage, cookies, CORS or other permissions may not work there.
  Always keep **Open original site** and **Read in the book** available.
- Zenodo research and the finite Atlas mirror use static references instead
  of an embedded remote PDF or recursive app.
- Peek selection never marks a book as visited; opening it in the real reader
  still stamps the existing v6 browser-local passport.

## Review / future work

Run the automated test suite and build. Manually inspect desktop/mobile visual
layout, keyboard focus, old saved chapters, game/tool embed compatibility,
click-to-open and stop behavior, escape/close restoration, and direct links.

Capturing **real screenshot thumbnails** requires a future opt-in publication
pipeline with attribution, stable image metadata, size limits and screenshot
freshness checks. This pass does not pretend synthetic/illustrated covers are
website captures and downloads no third-party images.

No custom domain or DNS changes are included. `enterthefield.org` remains a
post-R5 launch decision.
