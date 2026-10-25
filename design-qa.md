# Collection cover design QA

- Source: `C:/Users/joshd/Desktop/HVUE-CjWAAA_1dr.jpg` (2400 × 1800 px).
- Rendered desktop: `docs/design-preview/collections-folder-v2-desktop.jpg` (1440 × 900 px, dark theme).
- Rendered narrow view: `docs/design-preview/collections-folder-v2-narrow.jpg` (607 × 717 px, dark theme).
- Focused comparison: `docs/design-preview/collections-folder-v2-comparison.png`. The source's first folder and the rendered first collection were cropped and scaled to the same width. The full source and both full app views were inspected.

**Findings**

No P0–P2 fidelity issues remain. The old short, rounded cover box is gone. A taller, softer folder with a curved opening and live book covers now floats above a centered name and metadata, matching the reference's visual hierarchy. Muted per-collection colors distinguish the folders. Cards are centered in the grid, with a subtle colored surface and lift on hover.

The source is a light-theme knowledge-base mockup with paper sheets and a selected gray panel. Papyrbound keeps its own dark theme, real book covers, pin/menu controls, and book-added date; the panel appears on hover. The folder's front material remains slightly smoother and simpler than the source artwork (P3 polish).

**Interaction and validation**

- Clicking the folder cover and the metadata both opened `/collections?collection=quiet-afternoons`, showing its three books.
- The desktop three-column and narrow one-column layouts have no clipping or overlap. Light-theme contrast was also inspected.
- Browser console: no errors. TypeScript, Prettier, ESLint, and production build passed.

final result: passed
