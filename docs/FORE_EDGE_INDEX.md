# The Field Atlas · Fore-edge book index

## Intent
The upper three bars (room selector, Reader's Sanctuary toolbar and Discovery Compass)
move to the **right fore-edge of the book**. Each staggered tab resembles a divider
in a physical reference volume. This is a layout/navigation change, not a catalog
migration; saved chapters, favorites, the Explorer's Journey, deep links, curation
and safe single-preview embedding retain their existing data flows.

## Tab actions
- **Rooms:** choose a wing, or enter the existing library map.
- **Reader:** scroll to the open spread; enter or exit Focus Mode.
- **Discover:** choose a wing and ask the existing unvisited-first compass for a chapter.
- **Chapters:** search, filter, jump to a nearby matching chapter, or open the full directory.
- **Map:** open the existing library floor plan.
- **Curate:** open the existing curation panel.

The taller spread uses a larger desktop height with legible paper and a taller
embedded-page viewport. At tablet/phone widths the staggered edge index becomes a
horizontal, scrollable index *after* the book, with its drawer below the book.
No fixed right-side rail obstructs a narrow screen. The active reader's controls
remain available in Focus Mode.

## Acceptance checks
1. On desktop, the old horizontal bars do not occupy space above the spread.
2. The right-hand tabs visibly stagger; every tab works by mouse, touch and keyboard.
3. Clicking Rooms changes the active wing and closes the drawer.
4. Discover's unvisited-first choice still works and empty choices are disabled.
5. Chapters searches, filters and opens the full directory; arrows still turn pages.
6. Escape closes an open book drawer before leaving Focus Mode.
7. The live site preview remains one original iframe (no duplicated embed).
8. Test 900px, 680px and 320px widths; scroll the horizontal index without sideways page overflow.
9. Test both normal and Focus Mode, light/dark lamplight and reduced motion.
10. Validate from a GitHub Pages build before marking the PR fully accepted.

Automatic tests can cover wiring and build but cannot replace a real browser pass.
