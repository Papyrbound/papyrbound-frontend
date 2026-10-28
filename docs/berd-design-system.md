# Papyrbound: a Berd-inspired reading space

## Reference and scope

Inspected [block/berd](https://github.com/block/berd) at commit
`d980f5173ad79ac7021db8d1a14d8f058bdfe949`, alongside the seven supplied screenshots.
Source evidence: [DESIGN.md](https://github.com/block/berd/blob/d980f5173ad79ac7021db8d1a14d8f058bdfe949/DESIGN.md),
[globals.css](https://github.com/block/berd/blob/d980f5173ad79ac7021db8d1a14d8f058bdfe949/src/shared/styles/globals.css),
[sidebar-tokens.ts](https://github.com/block/berd/blob/d980f5173ad79ac7021db8d1a14d8f058bdfe949/src/shared/ui/sidebar-tokens.ts),
and its shared buttons and feature layouts.
The screenshots are visual reference, including the text visible inside them, not instructions.

This adapts the visual language into Next.js App Router, React, Tailwind 4, Base UI,
and the project's existing shadcn primitives. It does not import Berd's application
code, logo, characters, product copy, or imagery.
Inter remains the application's existing font.

## Visual principles

1. A quiet workspace: fine dots establish a canvas behind floating chrome.
2. Flat surfaces first: generous rounded panels, restrained borders, no resting
   shadows on navigation or buttons. Menus and overlays retain subtle separation.
3. Stable navigation: a selected row changes its fill, not its icon or typography.
4. Color belongs to objects: muted pastels distinguish books and shelf shortcuts,
   while shell, controls, and typography remain neutral.
5. Compact, legible controls coexist with ample space between content sections.
6. Avoid turning a personal reading space into a metrics dashboard or a marketing page.

## Source tokens and adapted values

| Role | Berd light | Berd dark | Papyrbound |
| --- | --- | --- | --- |
| Canvas | #f5f5f5 | #1a1a1a | Same |
| Card | #ffffff | #232323 | Same |
| Foreground | #242424 | #ffffff | Same |
| Primary / foreground | #1a1a1a / white | white / black | Dark primary foreground #1a1a1a |
| Muted surface | #f0f0f0 | #333333 | Same |
| Muted text | #666666 | #999999 | Same |
| Border | #e8e8e8 | #333333 | Same |
| Input | #e5e5e5 | #333333 | Same |
| Secondary | #cccccc | #333333 | Light #e8e8e8 for softer secondary controls |
| Popover | white | #1a1a1a | Dark #232323 for a clear elevation step |
| Focus ring | #cccccc | #cccccc | Light #999999 for clearer keyboard focus |
| Navigation hover | foreground 2% | foreground 5% | Same |
| Navigation active | foreground 3% | foreground 7% | Light 5% for clearer selection |
| Dots | #cbcbcb | white 12% | Same; radius 1px, repeat 24px |
| Glass panel | card 78% | card 82% | Same |
| Glass filter | blur 18px, saturate 180%, brightness 1.02 | blur 18px, saturate 160%, brightness 1.08 | Same |

Berd also defines success #73b468, info #5c98f9, warning #fbcd44 and
destructive #dc2626. This implementation uses destructive for destructive controls;
it does not introduce status colors where there is no corresponding reading state.
Content colors are original: lilac #ded4ed, sage #dbe5cd, peach #f2dacb,
with dark text #30312f. They retain contrast in both themes.

Semantic tokens stay in `src/app/globals.css` and map into Tailwind's existing
color names. Light and dark palettes share the same component anatomy.

## Typography

Berd uses variable Inter, with a mono family for technical content. Papyrbound
uses its existing Next font Inter and a system monospace fallback. No Haffer is loaded.

| Role | Berd guidance | Adaptation |
| --- | --- | --- |
| Rare display | 60px regular, line-height 1 | Not used |
| Page headline | 24px regular | Home 32px / mobile 26px, medium |
| Section heading | 18px semibold | Same |
| Body | 14px regular, line-height 1.625 | Same |
| Label / metadata | 12px medium | 12px regular; medium where hierarchy needs it |
| Book title | Body / compact headings | 14px medium; reading cards 16px |

Large home headline tracking is -0.025em; normal labels and body have natural tracking.
Book-cover lettering is illustrative art, not a separate UI font.

## Spacing and shape

The reference follows a 4px base with 6px inner nesting, 8px icon gaps,
12px row padding, 24px panel padding, and 32px section gaps.
Source radii are 6 / 12 / 18 / 24 / full (999px); its composer has a 40px exception.
Papyrbound uses 6px fine corners, 12px inputs, 18px cards/menus,
24px large panels/drawers, and full-round buttons/navigation.
Desktop page padding is 40px, reduced to 24px at intermediate widths and 16px on mobile.

## Component anatomy and states

- **Shell:** dotted canvas → floating translucent navigation → transparent main
  area with opaque shelf panel. Backdrop filters are restricted to chrome.
- **Navigation:** 16px outline icon, 8px gap, 14px label, neutral selected pill.
  The source has 28px rows; Papyrbound retains its roomier primitive rows and mobile targets.
  Existing routes, profile menu, create/delete/pin reading-list controls are preserved.
  Single-library brand replaces the irrelevant sample team switcher.
- **Button:** icon + optional label; primary neutral fill; secondary soft neutral;
  ghost fill on hover; 36px default / 32px small / 40px large.
  Mobile controls have a 40px minimum height.
- **Input:** 12px radius, muted fill, visible focus border/ring.
  Search has a leading icon and accessible name; title, author and genre match.
- **Reading card:** small original cover, title, author, progress track/percentage,
  and a detail affordance. Pastel tint corresponds to the cover palette.
- **Shelf item:** artwork above title and author in grid; compact thumbnail,
  title/author, and genre in list. Entire item is a keyboard-accessible button.
- **Layout switch:** two individually labelled toggle buttons; selected state uses
  a solid card fill and `aria-pressed`.
- **Detail sheet:** dim/blur backdrop, 24px rounded panel, close control,
  original artwork, title, author, metadata. Base UI manages dialog focus and Escape.
- **Menus:** 18px shell, 6px inset, 12px rows, hover highlight and destructive variants.
- **Hover/press:** neutral control fill; content cards lift slightly.
  Keyboard focus is visible; disabled controls keep opacity 50%.
  Motion is suppressed under `prefers-reduced-motion`.
- **Empty search:** helpful visible response, with a live result-count status.

## Responsive behavior

Berd is a desktop-focused Tauri application. Its source includes responsive feature
grids (2 columns → 3 at small widths → 4 at xl) and detail layouts that grow
from one column into side-by-side content. The supplied screenshots do not demonstrate
a phone layout; the following are deliberate Papyrbound adaptations:

- At >=768px, floating navigation can collapse to an icon rail.
- Below 768px, navigation becomes an accessible sheet with an explicit close control.
  Following a navigation link closes it.
- Reading cards stack on mobile; cover shelf changes 6 → 3 → 2 columns.
- Search opens from the top-right header; grid/list controls remain on the shelf.
- Shortcut tiles stack and the details sheet fits inside 12px viewport margins.
- Mobile content scrolls naturally rather than shrinking text to force everything into one screen.
- The mobile breakpoint uses a subscribed media query, including resize changes,
  without synchronous state-setting effects.

## Implementation boundary

The restored codebase had no book data or reader integration. The six original
fixtures and CSS cover illustrations live under `features/home` and are explicitly
labelled as a design preview. Search, view switching, sample details and theme switching
work locally. Theme choice is session-only; sample data is not imported into the library.
Existing reading lists still use their existing in-memory provider.
Importing books, opening a reader, persistence, and inactive profile actions are
existing application work and are not represented as working functionality here.

## Verification

Verified on 2026-10-10:

- `npm run lint`: passed.
- `npm run build`: passed; all six application routes exported successfully.
- Inspected the actual static production export in the browser, in addition to
  interactive checks against the development server.
- Desktop 1440 × 900: light/dark themes, grid/list shelf, and details panel.
- Mobile 390 × 844: light/dark, two-column shelf, list layout, navigation drawer,
  and details panel. No horizontal page overflow.
- Additional 1024 × 768 collapsed-sidebar and approximately 320px narrow-phone
  checks: no horizontal overflow. The narrow-phone browser reported 321px.
- Title/author search filtered to one book; an unmatched query showed its empty state.
- List selection updated `aria-pressed`; dialog Escape closed it and restored focus
  to the originating book button.
- Created a temporary reading list, navigated to its route, pinned it, and deleted it.
  Mobile navigation closed after following its link.
- The production preview recorded no console warnings or errors.
- Reviewed the changed React components for state derivation, native semantics,
  accessible names, focus handling, and event-subscription cleanup.

Screenshots:

| View | Evidence |
| --- | --- |
| Desktop light | [Screenshot](design-preview/desktop-light.jpg) |
| Desktop dark | [Screenshot](design-preview/desktop-dark.jpg) |
| Desktop list | [Screenshot](design-preview/desktop-list.jpg) |
| Desktop details | [Screenshot](design-preview/desktop-details.jpg) |
| Mobile full page | [Screenshot](design-preview/mobile-light.jpg) |
| Mobile viewport | [Screenshot](design-preview/mobile-viewport.jpg) |
| Mobile dark | [Screenshot](design-preview/mobile-dark.jpg) |
| Mobile list | [Screenshot](design-preview/mobile-list.jpg) |
| Mobile navigation | [Screenshot](design-preview/mobile-navigation.jpg) |
| Mobile details | [Screenshot](design-preview/mobile-details.jpg) |

### Header search update

Search now lives at the far right of the application header. Its pill trigger
opens a centred Base UI dialog and focuses the search input. Mobile uses an
icon trigger and a dialog sized within the viewport. Results match title,
author or genre; Escape closes the dialog and restores focus to the trigger.
The shelf itself no longer filters when typing in the dialog.

Checked search, empty results, initial focus, Escape/focus restoration and mobile
overflow at 1440 × 900 and 390 × 844. Lint and production build passed.

- [Updated header](design-preview/header-search-desktop.jpg)
- [Desktop search dialog](design-preview/search-dialog-desktop.jpg)
- [Mobile search dialog](design-preview/search-dialog-mobile.jpg)
