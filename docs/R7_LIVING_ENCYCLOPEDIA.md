# R7 · The Living Encyclopedia

**Status:** code candidate; not release approval. **Trust boundary:** public GitHub repository history is not a live website or working product.

## What visitors get

The Atlas keeps its original book, reader, chapters, passport, local curation and verified live Pages catalog. Below the rooms is a collapsible **Living Encyclopedia** containing one **source dossier** per owner-public GitHub repository observed during deployment. Source-only projects do not silently become website chapters, get an iframe, acquire permissions, or appear as a verified deployed app.

Each dossier shows:
- Owner-public GitHub repository name, public description, language (if supplied), GitHub numeric identity, archival/fork labels.
- Repository creation timestamp and latest observed push timestamp, explicitly described as *observations*, not claims of release.
- Up to four recent **actually merged** public pull requests, each labeled with its exact number, merge date, source PR link and merge commit abbreviation when GitHub supplies one. A merged PR is **not** evidence of deployment, final acceptance, feature quality, or runtime correctness.
- A link to the public repository; a Constellation locator using the public repository's **numeric GitHub ID**. The Constellation's inventory can differ and the link does not imply a live peer or cross-app state.
- An **Open live chapter** action *only if* the current visitor's accessible catalog contains the same repo ID validated against the already-verified Pages manifest.
- Citation-pinned documented relationships, where both endpoints are present in the public source snapshot. These reuse the existing R4B reviewed source ledger; direction and scope remain explicit. Unrecorded connections are not inferred from similar names.
- A shareable `?dossier=<public-repository-name>#living-encyclopedia` URL. This is independent of the existing `?chapter=`, `?tour=`, `?project=` aliases.

New Horizons has an **Open dossier** action only when a public-source entry exists in the delivered snapshot.

## How the encyclopedia evolves

`npm run encyclopedia:sync` uses the same bounded GitHub public-owner listing as Pages discovery (up to ten pages of 100; no private repository scans). For each unique owner-public repo, it requests the latest 15 closed PRs and records at most four that have a `merged_at` timestamp. Failed PR lookups are explicitly `unavailable`, not falsely called zero merges.

The `public/encyclopedia.json` asset is rebuilt on PR validation and at every Pages deployment, including the existing scheduled daily refresh. An eight-repository, source-checked, explicitly **partial** fallback remains checked in for API outages; the page labels partial state clearly. The daily refresh updates the deployed static asset, **not** a Git commit, visitor storage, or a live polling feed.

**History limits:** PRs outside the latest 15 closed results may be absent. The creation and last-push dates are GitHub metadata observations. The snapshot is not a complete chronological Git log, audited changelog, proof of release, or an automatically verified dependency map. Archive/repository visibility may change between snapshots. No token goes to the browser.

## Privacy and safety

- Only owner-matched, public, numeric GitHub IDs and safe repository names pass validation.
- The browser reconstructs canonical `https://github.com/MichaelWave369/<repo>` links instead of trusting arbitrary URLs in JSON.
- No OAuth, user cookie, GitHub browser token, private repo or new third-party iframe. Source snapshots are served as static files from the same origin.
- No new persistent personal data and no migration of existing passport, bookmarks, custom chapters, or local edits.
- Unverified links never bypass the existing `constellationProjectId` check for the **Open live chapter** action.
- The existing R4B evidence ledger remains commit-pinned and documentary, not independently runtime-proven.
- No DNS, CNAME, `enterthefield.org` cutover, canonical change, or manual-acceptance ledger edits. Issue #32's twelve human gates remain required.

## Acceptance and smoke tests

`npm test` covers snapshot public-only filtering, sorting, PR records, invalid data and duplicate identities, exact source destinations, query safety, relationship evidence, old reader invariants and the partial fallback.

`npm run test:e2e` covers a dossier deep link, browser directory selection, New Horizons source navigation and safe external links in desktop/mobile emulation.

After merge, inspect the actual public deployed build and verify with a real device. Automated browser checks are not permission to mark issue #32's manual gates as PASS.
