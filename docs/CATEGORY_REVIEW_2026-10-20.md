# Field Atlas · Category review, 2026-10-20

## Why this pass happened
The open book now showed **136 accessible chapters** in its browser screenshot and a
Game Room count of **7**. The October 17 census had 105 locally visible chapters,
so its counts must **not** be presented as today's live counts.

The owner's recent public GitHub repository READMEs were reviewed, including
CommonTable, PuzzlePen, Codedex, WastelandWorkshopStudio, HueHatch,
FramefieldStudio, RastaPhi, ReelCommons, MRIPHI, RegenerationAtlas and AquaPhi.
This PR supplies **23 explicitly reviewed repo→category overrides**. It is **not**
a claim that all of those repositories have live GitHub Pages or can be embedded.

## Playing vs creating
| Public repository | Shelf | Reason |
|---|---|---|
| CommonTable | Games | Playable chess, checkers, dominoes, Mahjong Solitaire, and other tabletop games. |
| PuzzlePen | Games | Playable React puzzles; classic v2 availability remains explicitly contingent on its assets being imported. |
| Codedex | Games | Collectible Codémon browser with a standalone turn-based battle minigame; also serves as a repo explorer. |
| PhiCade | Games | Governs game runtimes, replays and player control; technically a runtime, but its intended visitor activity is play. |
| ProofArcade | Games | Playable math/physics arcade stations. |
| NightCircuit | Games | Godot Metroidvania in vertical-slice development. |
| OakStreetRumble | Games | Beat-'em-up game and agent-native game runtime. |
| HueHatch | Creative | Living coloring book with editing/export; an art-making experience, not an arcade. |
| FramefieldStudio | Creative | 3D keyframe animation authoring. |
| RastaPhi | Creative | Wall-poster and visual-art printing studio. |
| WastelandWorkshopStudio | Tools | Fallout mod-authoring studio; not a hosted Fallout game. |
| ReelCommons | Tools | Directory/player tooling for legal streams, not a game. |
| PockeRec / LoopCatch | Tools | Microphone and Windows system-audio recording tools. |
| RepoReady / FieldShield | Tools | Repo hygiene and safety inspection tools. |
| MRIPHI / RegenerationAtlas / AquaPhi | Research | Educational science visualization, molecular evidence, and experimental simulation (not validated medical devices). |
| GitPorch / TMC / FieldCloudWorker | Systems | Repository hosting, memory system, and scheduled worker infrastructure. |
| LAU | Learning | Simulated agent university/training dashboard; simulation claims remain labeled accordingly. |

The existing **Games** mappings for GiltHouse, PorchQuest369,
MythSplicer, Pulse369, Parallax Arc and Parallax Gran Prix stay in place.
ChippyDip remains **Music**, despite its retro console sound aesthetic.

## What changes and what does not
The classifier in `src/curation.js` already checks explicit census overrides
before guessing a category from a generic title or description. Thus existing
verified public chapters will move to the right shelves the next time the app
loads the updated JavaScript. Browser-local category edits still take priority.

**No new public chapter is force-added** to the ten-item starter catalog and
no manual approval is bypassed. GitHub Pages enablement alone is not proof that
a site works. `scripts/sync-public-pages.mjs` still verifies accessible HTTPS
HTML sites at deployment, and personal admissions remain browser-local.
Native/non-Pages projects in the list will not suddenly appear in the Atlas
just because they gained an override. No private repositories are included.

We retain the same six rooms, IDs, URLs, favorites, passport stamps, and the
new giant-book visual layout. Unknown repos still fall back to conservative
inference or **Other**; this is a targeted editorial revision, not a wholesale
automatic reassignment.

## Post-merge spot-check
1. Verify a successful `npm test`, public inventory step and `npm run build`.
2. Open Games and confirm CommonTable, PuzzlePen, and Codedex appear **if**
   their sites are present in the verified shared catalog.
3. Open Creative to check HueHatch, FramefieldStudio, and RastaPhi when verified.
4. Verify WastelandWorkshopStudio lives in Engineering → Tools and does not
   artificially inflate the Game Room.
5. Confirm personal browser edits take precedence; verify chapter links,
   Library Map room counts, and search still work.
6. Check `Curate the book` / review queue if a desired site has not passed
   published-HTML verification; don't invent a working live link.
