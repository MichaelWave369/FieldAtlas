# Curated Zenodo research-object chapters

This proposed addition makes the existing **Publications** shelf in the Research Wing useful beyond a link to the archive homepage.

**Provenance:** The initial 15 record references come from the author-maintained `MichaelWave369/enter-the-field-research` public site, `index.html` fallback catalog. Their titles, abbreviated descriptions, record kinds, dates, and DOI IDs are *curated references*, not independently revalidated current Zenodo metadata. The official **Zenodo record** is authoritative for the exact title, date, creator list, version, availability, files, and DOI registration. This implementation did not successfully query Zenodo's live API; do not describe it as synchronizing or verifying the records today.

**Behavior**
- Keep the `Enter the Field Research` GitHub Pages chapter as the research-archive entry point.
- Add 15 individually addressable, clearly labeled research-object chapters from the public index, with `zenodo-ID` chapter IDs and stable share URLs.
- Display a read-only book-style reference card instead of a Zenodo iframe. The **Open Zenodo record** link opens the official external source; no papers or posters are copied.
- Preserve the six established physical rooms, existing page-turn navigation, bookmarks, passport, share links, and reader Focus Mode.
- Publication chapters are merged into the accessible catalog even for browsers with saved older page lists; no destructive localStorage migration.
- Browser-local category edits take precedence; the existing Curate dialog can hide individual reference chapters locally. Resetting the library restores shared defaults.
- Store only metadata in `src/publications.js`. No account tokens, analytics, remote scripts, live API calls, private projects, or new dependencies.

**Scope:** This is a conservative **starter set**, not the complete Zenodo community, and not necessarily the newest version of every research object. After visual QA and editorial review, a future phase can compare authoritative Zenodo metadata and curate other records with explicit identifiers. Preserve provenance labels and avoid fabricating completeness or live verification.
