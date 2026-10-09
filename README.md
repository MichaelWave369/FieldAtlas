# The Field Atlas ✦

**A cozy, interactive living library of public GitHub Pages projects.**

## v0.8: The Reader's Sanctuary

Focus Mode turns the *existing* living book into the centerpiece of the study without loading a duplicate live website. A compact gold **Focus Mode** button sits just above the reader. Entering sanctuary:

- Dims the room illustration and surrounding lighting, then enlarges the same central book on desktop.
- Temporarily hides the expansive rooms, Visitor's Desk, chapter shelf, introduction and other surrounding sections. The book's live preview, circular page arrows, chapter filters, and controls remain usable.
- Offers **Return to Library** in the same toolbar, restoring the full study. **Escape** also exits focus once dialogs are closed.
- Respects reduced-motion preferences; narrow mobile layouts retain the stacked book format.

**Back to the book:** Selecting a title from the chapter shelf, a room spine or cover, the directory, or a guided tour now smoothly returns the viewport to the existing reader instead of leaving it above the screen. On devices requesting reduced motion, this jump is immediate.

Focus Mode is ephemeral UI state, not stored in the visitor's passport or transmitted to GitHub. Existing bookmarks, public Pages discovery, FieldCeption, and project iframe permissions are unaffected.

## v0.7: Endless Pages and Book-First Layout

- **Circular book navigation:** When on chapter 1, the left arrow (and `←` key) wraps to the final chapter. At the final chapter, right arrow (`→`) wraps to chapter 1. This works within the current wing, search results, and category filters, with no invalid navigation for a one-chapter or empty result.
- **The book is the main event:** A compact room-selection rail sits immediately below the title, then the living book, its search/progress bar and chapter index. The full room cards, Visitor's Desk, and expanded room entry are still present lower on the page.
- **A little larger, a lot higher:** The desktop book has more horizontal space and a taller maximum height. Shorter desktop viewports constrain height so the living page remains usable. Phones retain their stacked two-page reader with compact, horizontally scrollable room choices.
- **Accessible feedback:** Circular edge arrows have meaningful aria labels, and users can still navigate by pointer or keyboard. Empty or one-page lists disable turning rather than incorrectly looping.

The existing FieldCeption mirror, live site iframes, guided tours, bookmarks and public Pages discovery are preserved.

## v0.6: The Visitor's Desk

The Field Atlas now has **four guided discovery walks** for people who have never seen the ecosystem:

- **First Light:** SuperPhiVessel → FieldAtlas → PhiOS → FieldDeck → FieldAccord.
- **The Artist's Lantern:** Domistika → Silicon Louvre → PixelForge → Auralith → Infinity Lens.
- **Research Constellation:** NestedBubbleGear → PhiMirrorHex → ParticleForge → Schumann Resonance Observatory → VAL.
- **After Hours:** GiltHouse → PhiCade → PorchQuest → Parallax Arc → NightCircuit.

Tours only include projects already present in the accessible public or locally curated catalog; missing or unavailable stops are skipped. Their order is intentionally editorial, not an objective project ranking.

The compact **Visitor's Desk** stays collapsed until opened, preserving the main book-first layout. Selecting a walk reveals its tour compass with direct stop navigation, previous/next controls and an exit. The existing animated pages, themed wings, book covers, library directory and FieldCeption mirror chamber are unchanged.

### Visitor passport

A browser-local passport stamps the IDs of viewed chapters and shows progress on each available tour. It requires no login, stores no personal identifiers, and is not synchronized across devices. Clearing browser site data resets the passport.

### Shareable chapter links

Click **Share chapter** to copy a URL such as:

`https://michaelwave369.github.io/FieldAtlas/?chapter=Domistika`

When sharing a tour stop, the URL also carries `tour=artists-lantern`. The destination initializes **only after** its public catalog is loaded. Unknown or malformed chapter names and tour identifiers cannot cause an external URL redirect or expose a private repository. If clipboard access is unavailable, the book displays a selectable link instead.

### Notes

- This release does not introduce accounts, analytics, external dependencies, or private repository access.
- Guided tours never execute actions in destination apps; the normal public preview and direct external link rules still apply.
- The visitor passport represents viewed chapters, not proof that a visitor read or completed a linked application.

## v0.5: FieldCeption · The Infinite Atlas

A lighthearted Easter egg inspired by the Atlas opening itself inside the Atlas.

- The public `FieldAtlas` chapter appears as **The Infinite Atlas · Φ∞**, with a violet-gold infinity crest.
- On that one verified GitHub Pages link, the right-hand live-preview page becomes a **Mirror Chamber**: illustrations of smaller books nested within smaller books.
- The **Go Deeper** and **Surface** controls change the illustrated reflection depth between **1 and 5**. A hard maximum stops accidental unbounded rendering.
- The mirror uses **React/CSS only**. No recursive iframe, recursive network fetch, server execution, or copies of the application are instantiated. The separate **Open this world** button still links to the real Atlas in a new tab.
- The fullscreen reader shows the same bounded mirror chamber. Arrow navigation, bookmarks, search and all other chapters behave normally.
- The public Pages manifest validator is now tested with real `gh-123` identifiers. This fixes a double-escaped regex that previously rejected verified public catalog entries and displayed a misleading **zero verified websites** status.

FieldCeption is a whimsical visualization, not a recursive browsing engine. The original working book and cozy study remain intact.

## v0.4: The Library Curator

A more welcoming library, while keeping the original central book and the entire public Pages inventory:

- **Curated titles and sections:** `src/curation.js` maps publicly described projects into Research, Creative, Engineering (Systems, Intelligence and Tools), Games, and the Curious Annex. Unknown projects remain in the Annex rather than being misrepresented.
- **Ornamental book covers:** each wing has a horizontally scrollable gallery of CSS-only covers, using category-specific colors, symbols, and gold filigree. No external image fetches required.
- **Doors you can enter:** clicking a wing opens an animated two-leaf door; the room reveals its cover gallery and keeps the original live page reader underneath. Accessible button controls and reduced-motion support preserve usability.
- **Complete directory:** search every available published chapter, filter by wing, browse project descriptions, visit the live site directly, or jump to that page in the Atlas.
- **Editable labels:** locally customize a title, summary, and category for your browser. Editing does not modify GitHub or change anyone else's catalog, ID, or URL.

The shared public catalog still updates automatically when deploy-time verification confirms an HTML website. The curator improves titles/categories for those verified entries. It **does not** publish any private repository or infer hidden content.

This is still a lightweight, responsive React/2.5D site. Walkable 3D rooms and camera controls remain future work.

### Curating a label for everyone

Update the public-safe metadata overrides in `src/curation.js`, review the change, and merge it. Browser-local edits in the directory are never sent to the server or merged automatically.

## v0.3: Enter the wings, open the world

**The immersive study stays lightweight.** Enter the Research, Creative, Engineering, Games, or Curious Annex rooms for an animated arched doorway, atmospheric themed light, a small interactive bookshelf with book-spine shortcuts, and the existing full living reader. Everything still works without a 3D graphics card. This is a *cinematic 2.5D transition*, not yet a walkable Three.js room.

**All verified, public GitHub Pages sites get shared chapters automatically.** On every deploy and once daily through GitHub Actions, `npm run catalog:sync`:

1. Lists **public owner repositories only** via the GitHub REST API.
2. Selects only repos with GitHub Pages enabled, excluding private, archived, and third-party repos.
3. Makes a bounded HTTPS HTTP request to their Pages URLs and checks that the result is an available HTML page. Valid HTTPS custom-domain redirects are allowed.
4. Writes `public/pages-discovered.json` with verification counts and published URL.
5. Builds and deploys that catalog so *all visitors* see confirmed public sites automatically when opening the Atlas.

The original nine curated chapters remain as a fallback. New additions are de-duplicated by repository and URL. Local user additions and hidden chapters stay private to each browser. The manual new-arrivals inbox remains available for Pages-enabled projects that cannot be confirmed automatically.

**Limits:** A valid HTML response does not guarantee iframe permission, full app functionality, or that the site is appropriate for every audience. Some domains and network edges may fail a temporary verification and can be reviewed manually. Re-checks occur during deployment, not continuously. GitHub Pages embedding restrictions still require the `Open this world` link.

```bash
npm run catalog:sync  # optional local public-only discovery
npm test              # includes safe filtering/probing tests
npm run build
```

## v0.2: The Living Library

A new row of themed rooms organizes existing chapters: **Research Wing**, **Creative Wing**, **Engineering Wing**, **Game Room**, and **Curious Annex**, plus the complete library. The book itself stays central, and page-turning still works inside any room.

**New-arrivals inbox (v0.2 manual path):** When an existing browser opens FieldAtlas, the app can check public GitHub repository metadata once every 24 hours. It lists newly discovered Pages-enabled repositories in the Curate dialog for the visitor to inspect, **not** in the actual book. Each arrival has a direct preview link, suggested category, explicit *Add chapter* approval, and a *Dismiss* control. Manual refresh is available, and automatic checks can be disabled. The app requests no GitHub credentials and never mutates repositories.

**What approval means:** browser-specific chapter approvals and dismissals are stored in localStorage. They do not add an unverified site to the shared public book for all visitors. Verified Pages in the generated manifest are shared automatically. To curate a public chapter for everyone, edit `src/catalog.js` and submit a regular GitHub pull request. This distinction is deliberate: public websites should not be globally featured from unreviewed metadata.

**Discovery limitations:** GitHub's `has_pages` flag is not proof a site is reachable, published correctly, or iframe-embeddable. Custom-domain homepages that do not use the owner's github.io host may require manual URL correction. GitHub API rate limits apply.


The React app uses an original AI-generated cozy study illustration as its backdrop, with an interactive illuminated book at its center. Each turn of the page reveals an actual web app in an iframe, along with its story and a direct link.

![The original concept art](public/study-room.webp)

## What works

- Cozy study scene with warm lamplight and optional evening mode.
- 3D-style page flip animations, left/right arrows, and keyboard navigation.
- Curated starter chapters from MichaelWave369's GitHub Pages projects.
- Live embedded website previews, **plus always-visible direct links**. (Iframe embedding is not guaranteed.)
- Fullscreen reader with direct-link fallback.
- Search, chapter categories, bookmarks, and themed library wings.
- Curate-the-book drawer: add and remove chapters.
- **Discover public GitHub Pages** through the public GitHub REST API with a manual-review inbox; uses public metadata only and never needs a token.
- Browser-local storage for customized chapters and bookmarks. No server or login.
- GitHub Actions workflow for GitHub Pages deployment.
- Mobile-friendly layout and reduced-motion support.

## Run locally

Node.js 20.19+ or Node.js 22+ recommended.

```bash
npm install
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`).

Test and build:

```bash
npm test
npm run build
npm run preview
```

## Deploy to GitHub Pages

1. Create an empty public GitHub repository, e.g. `FieldAtlas` (or `FieldStudy`).
2. Push the contents of this folder to its `main` branch.
3. In repository **Settings → Pages**, choose **GitHub Actions** as the build and deployment source.
4. Push a commit or use **Actions → Deploy The Field Atlas → Run workflow**.
5. GitHub Pages will serve it at `https://michaelwave369.github.io/FieldAtlas/` if the repository is called `FieldAtlas` and no custom domain is configured.

The Vite config uses relative asset paths so no repo-specific base pathname is required.

## Pages and permissions

The canonical publicly visible starter book is in [`src/catalog.js`](src/catalog.js). Nine examples are seeded. Some URLs were taken directly from the GitHub repository's declared homepage; others follow the GitHub Pages convention. The repository's `has_pages` flag does not guarantee that a deployed URL currently returns a functioning website. Edit or remove any inaccurate entry in the browser.

**No private repositories are scanned or exposed.** GitHub's unauthenticated public API is used for discovery, so the `has_pages` results only cover publicly accessible repositories. GitHub imposes unauthenticated API rate limits. Discovery checks the public repository list, not individual websites' iframe permissions.

### Iframe caveat

A target site may prevent framing via Content-Security-Policy `frame-ancestors` or `X-Frame-Options`, or the embedded application may require a larger viewport. The book always keeps an **Open this world** link available. It is not possible for the book to reliably detect or override every framing restriction, and the app doesn't try.

### Local storage caveat

Book customizations live only in the current browser/profile and origin. They are not synced across devices. For a canonical public catalog, update `src/catalog.js` and redeploy.

### Security + licensing

- Treat discovered and user-added URLs as external sites; verify them before featuring them in a public curated catalog.
- Never commit credentials, API keys, private repositories, private issue content, or sensitive personal data into the static site.
- The React application code is provided under MIT; the illustrated backdrop was generated for this project and is included with the app. Embedded destination projects retain their respective licenses.

## Project layout

```text
src/main.jsx     Reader, animated book, curating UI, fullscreen mode
src/style.css    Illustrated study and book visuals
src/catalog.js   Starter chapters, URL validation, GitHub Pages discovery
public/          Optimized room artwork
.github/workflows/deploy.yml  GitHub Pages deploy
```

## Next phases

- Operator-controlled pinning, naming, and manually-reviewed exclusions for the auto-generated verified catalog.
- Optional screenshots when a target refuses iframe embedding.
- Richer 3D camera transitions (Three.js), optional spatial audio, and a walkable VR study.
- Accessible page thumbnails/reading mode for low-bandwidth devices.

## Instant browser preview (no setup)

Double-click `preview.html`. It is a **lightweight standalone companion**, not the React production build. It includes the same book look, page navigation, a live iframe, favorites, filtering, and a fullscreen view; the React version adds the full shelf editor and public Pages discovery.
