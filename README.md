# The Field Atlas

*A cozy study with a living book of open project worlds.*

The Field Atlas is a public, interactive portfolio for the projects of [MichaelWave369](https://github.com/MichaelWave369). Each turn of the illuminated book reveals one live GitHub Pages application, alongside its chapter title, notes, and a direct launch link.

## Current release: v0.1, illustrated reader

- Original cozy study illustration, stored as an optimized local WebP.
- Animated chapter turns, keyboard arrows, search/filter, favorites, and evening mode.
- Embedded live sites through iframes with always-visible direct-launch links.
- Nine curated starting chapters: SuperPhiVessel, PhiOS, PixelForge Studio, Silicon Louvre, FieldDeck, Domistika, Auralith, Phi Mirror Hex, and GiltHouse.
- No logins, tracking, API keys, or private repository scans.

**Implementation note:** This first GitHub Pages release is the lightweight stand-alone reader. The separate [React/Vite project package](https://github.com/MichaelWave369/FieldAtlas/issues) is the next integration milestone, adding the shelf editor and GitHub Pages discovery. Don't describe this initial branch as already using React.

## GitHub Pages

1. Merge the release PR into `main`.
2. Under **Settings → Pages**, select **GitHub Actions** as the source.
3. The `Publish Field Atlas` workflow verifies the site and deploys it.

Expected public URL, after a successful Pages deployment:

https://michaelwave369.github.io/FieldAtlas/

The deployment URL is not confirmed live until GitHub Actions completes successfully.

## How chapters work

Every chapter displays a project description and a live iframe view of its public website. Browsers may block iframe embedding due to the *destination site's* security policy; the **Open this world** link remains functional as a fallback. Public Pages availability can change independently of the atlas.

To update the curated project list in v0.1, edit the `seed` array in `index.html`. A future React upgrade can use a separate `src/catalog.js` and add owner-specific GitHub Pages discovery.

## Privacy and provenance

- Public destinations only. Never embed private credentials, internal archives, or proprietary data.
- The reader is informational and navigational. Its link targets retain their own licenses.
- Original study artwork is bundled in `assets/study-room.webp`.
- Site code is MIT-licensed. Embedded third-party websites and their content are not relicensed by this repository.

## Development

This first reader has no build dependencies. For a local preview, serve the directory from a simple local web server:

```bash
python -m http.server 8000
```

Then open http://localhost:8000/ .

Run the static repository verification script with Node.js 20+:

```bash
node scripts/verify.mjs
```

## Future milestones

1. Integrate the React/Vite source project and its richer library editor.
2. Autodiscover public GitHub Pages repos and allow admin-curated chapters.
3. Add robust screenshots/posters for sites that forbid iframe embedding.
4. Add optional ambient sound, responsive 3D environment, and eventually walkable VR.
