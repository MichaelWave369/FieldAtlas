# The Field Atlas: Grand Opening v1.0 Candidate

This document is the **human acceptance checklist**, not proof that we have tested real-world browser behavior. CI catches code, content inventory, and production compilation. Use the live GitHub Pages deployment after merging to sign off on presentation and interactions.

## Before merge

- [ ] Node test suite passes.
- [ ] Public GitHub Pages discovery finishes successfully (no private/archived/off-owner sites).
- [ ] Vite production build passes.
- [ ] Review diff for unexpected dependencies, APIs, analytics, or permissions. This upgrade needs none.
- [ ] Keep v0.9 on main until the PR passes.

## Visitor acceptance checklist (live site)

- [ ] Desktop (wide): book remains near the top; room rail, compass, focus control, and map button fit without clipping.
- [ ] Desktop (short height): compact controls do not obscure book turns or live-page preview.
- [ ] Mobile portrait: Compass has usable labels, select, and Surprise Me button; map trail rows scroll without horizontal page overflow.
- [ ] Mobile landscape / tablet: compass and journey tiles rearrange sensibly.
- [ ] Discovery Compass All rooms: Surprise Me opens an existing accessible book, ideally unvisited, not the current page if others are available.
- [ ] Filter Research, Creative, Engineering, Games, Curious Annex: selected chapter belongs to the right wing.
- [ ] Empty/no-match filter: Surprise Me disables or explains that nothing is available; no blank URLs or errors.
- [ ] Browser local visitor passport: visited counts update on reader navigation; no login or server calls.
- [ ] Library Map: six rooms; their counts match book catalog; Escape/Return to Book work and focus returns.
- [ ] Map Explorer's Journey: start a route, click an individual stop, confirm tour compass and book match.
- [ ] After a trail stop, opening another tour preserves the new journey; leaving a tour restores ordinary browsing.
- [ ] Circular chapter arrows and keyboard left/right wrap first↔last, including filtered wings.
- [ ] Reader Sanctuary Focus Mode: ambient dimming works, Escape prioritizes modal dialogs, and Return to Library restores full page.
- [ ] The Infinite Atlas Φ∞: reflection depth remains capped at 5 with no nested app iframe.
- [ ] External GitHub Pages sites: iframe may be refused by individual hosts; direct **Open this world** link must work.
- [ ] Keyboard only: Tab through compass, select, map trail controls, reader arrows, filters, and dialog close without losing focus.
- [ ] Reduced motion: scroll and map animations should follow OS preferences.
- [ ] A screen reader announces the discovery result and provides labels for modal and trail stops.

## Known boundaries

- GitHub Pages availability (HTTP HTML check) does **not** guarantee a page allows iframe embedding.
- No search or selection can confer authority on an agent or external application.
- Visitor passport and personal chapter labels are browser-local and cleared with site data.
- Random chapters come from the already-visible catalog only; they never enumerate private repositories.
- No 3D/WebGL, cross-origin iframe scripting, persistent user accounts, or analytics introduced.

## After merge

- [ ] Wait for **Deploy The Field Atlas** action to complete green.
- [ ] Hard-refresh the public Pages URL: https://michaelwave369.github.io/FieldAtlas/
- [ ] Run the interactive checklist above.
- [ ] Once accepted, create a v1.0.0 release tag intentionally. Do not use a successful build alone as proof of user acceptance.

**Rollback:** The previous main branch commit remains in Git history. Revert the PR and redeploy through GitHub Actions if visual or interactive regressions occur.
