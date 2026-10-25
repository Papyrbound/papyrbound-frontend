# Collection cover design QA

- Source: `C:/Users/joshd/AppData/Local/Temp/codex-clipboard-e222666e-f2fb-45e7-a60b-c675440a5ff4.png` (633 × 245 px).
- Rendered desktop: `docs/design-preview/collections-folder-matte-desktop.jpg` (1440 × 900 px, dark theme).
- Rendered narrow view: `docs/design-preview/collections-folder-matte-narrow.jpg` (607 × 717 px, dark theme).
- Light-theme comparison: `docs/design-preview/collections-folder-matte-comparison.png`. The supplied first folder and rendered first collection were cropped and scaled to the same width. Full desktop and narrow views were also inspected.

**Findings**

The prior glossy folder had a bright specular rim, near-black opening, and steep front gradient. Together they made a lightweight book collection look like a rigid metal container. The replacement uses a diffuse, matte paperlike surface, a lighter opening, gentle color shifts, and a softer ground shadow. It keeps the live covers, centered labels, and per-collection coloring. No P0–P2 visual issue remains in the requested material treatment.

The source has paper sheets and a light gray selected panel. Papyrbound keeps real book covers, pin/menu controls, and the last-book-added date. The selected surface appears on hover. The simplified folder artwork is still slightly more symmetrical than the reference (P3 polish).

**Interaction and validation**

- The cover and metadata remain clickable links to the collection; their behavior was verified in the preceding layout pass, and this pass only changes the folder asset and color filter.
- Desktop dark and light themes and the narrow one-column layout have no clipping or overlap.
- Browser console: no errors. TypeScript, Prettier, ESLint, and production build passed.

final result: passed
