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

## V2 · Giant living book, side-reading divider tabs

The book now expands on desktops to use more of the window instead of leaving
large empty left/right margins. The open spread targets a 675–945px desktop
height (710–1000px in Reader's Sanctuary) while retaining the original left
story page, right portal page and **one** live preview iframe. Readers may need
to scroll on short displays rather than squashing the pages.

The six tabs now look like *real, tucked-in index dividers*:
- **Encyclopedia:** portrait tab strips in a staggered sequence, with
  vertically rotated side-reading labels, small chapter numbers and glyphs.
- **Library card:** subtle grain, ivory parchment layers and archival lettering.
- **Brass:** delicate edge trim, dark binding seam and a stronger active outline.

At widths above 900px the book sits above the inner 10–30px of the tab roots:
the book's stacking order hides the attachment seam, while the outer part
remains clickable. The active tab gently slides outward. Panels still open
from the same accessible index without adding iframes or changing chapter data.

At 900px or narrower the tabs switch to an accessible horizontal scrolling
strip *beneath* the book, with horizontal text and a panel beneath the strip.
Reduced-motion preference eliminates tab translations.

### V2 manual acceptance
- Check a wide desktop (1440–1920px): bigger book, attached staggered tabs,
  vertically legible labels, clear active and hover state, no sideways scroll.
- Check short-but-wide desktop (e.g. 1280×720): page content scrolls rather
  than cropping the portal, tabs remain individually clickable.
- Check narrow desktop (901–1160px), tablet (900px), mobile (680px, 390px,
  320px): no side-obscured buttons; mobile labels are horizontal.
- Confirm the drawer is on top of the book, receives keyboard focus,
  closes on Escape, and every tab opens its existing destination.
- Confirm zoom at 200%, focus reading mode, lamplight, and reduced motion.
- Run `npm test` and `npm run build`. Manual browser acceptance is still
  necessary before calling the new visual design fully verified.
