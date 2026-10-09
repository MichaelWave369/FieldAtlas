# The Field Atlas ✦

**A cozy, interactive library of live GitHub Pages projects.**

The React app uses an original AI-generated cozy study illustration as its backdrop, with an interactive illuminated book at its center. Each turn of the page reveals an actual web app in an iframe, along with its story and a direct link.

![The original concept art](public/study-room.webp)

## What works

- Cozy study scene with warm lamplight and optional evening mode.
- 3D-style page flip animations, left/right arrows, and keyboard navigation.
- Curated starter chapters from MichaelWave369's GitHub Pages projects.
- Live embedded website previews, **plus always-visible direct links**. (Iframe embedding is not guaranteed.)
- Fullscreen reader with direct-link fallback.
- Search, chapter categories, and bookmarks.
- Curate-the-book drawer: add and remove chapters.
- **Discover public GitHub Pages** with the public GitHub REST API; uses public metadata only and never needs a token.
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

The chapter registry is in [`src/catalog.js`](src/catalog.js). Nine examples are seeded. Some URLs were taken directly from the GitHub repository's declared homepage; others follow the GitHub Pages convention. The repository's `has_pages` flag does not guarantee that a deployed URL currently returns a functioning website. Edit or remove any inaccurate entry in the browser.

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

- Persistent canonical catalog synchronized to `catalog.json` in GitHub.
- Optional screenshots when a target refuses iframe embedding.
- Richer 3D camera transitions (Three.js), optional spatial audio, and a walkable VR study.
- Accessible page thumbnails/reading mode for low-bandwidth devices.

## Instant browser preview (no setup)

Double-click `preview.html`. It is a **lightweight standalone companion**, not the React production build. It includes the same book look, page navigation, a live iframe, favorites, filtering, and a fullscreen view; the React version adds the full shelf editor and public Pages discovery.
