# Field Atlas · R3A Grand Catalog

R3A makes the existing directory a genuine exploration desk without replacing
the book or creating additional live iframes.

## Features

- **Ctrl+K / ⌘K** from anywhere in the regular Atlas opens the directory and
  focuses search. The shortcut does not override other open dialogs.
- A **Find a chapter** button offers the same path for touch and discoverability.
- Four directory collections: All, Recently explored, Bookmarked, Unexplored.
  These are read-only views of the same canonical catalog, not duplicate data.
- The existing wing selector and text search continue to combine with each
  collection. Recently explored uses the order of first passport stamps, with
  the most recent newly discovered chapter appearing first. It does **not**
  claim to track repeat visits or exact timestamps.
- Collection counts are wing-scoped, and live search-result counts report what
  is currently displayed. No newly fetched data, hosted service, extra
  network request, or per-card iframe has been added.
- Existing original book-cover illustrations act as lightweight static previews.

## Verification

Automated tests cover collection counts, wing scoping, passport ordering,
favorites, empty states, keyboard shortcut recognition and source wiring.
Review the interactions with keyboard, screen reader, mobile touch, both
lamp modes and a browser that already has saved bookmarks/visits.

**Next, R3B:** optional/on-demand live previews and editorial visual metadata
after the iframe compatibility gate is reviewed. No domain or DNS changes.
