# Penpot fidelity review

Reviewed on devel-ui against the latest **Panels — Reference recreation** screens. Scope: shared shell, Library, Reading Now, Collections, shelves, Annotations, Settings, Reading activity, menus and dialogs. This remains a frontend preview.

## Evidence and verification

- Exported Library and Reading Now boards at 1920 × 1080; captured the running web app at the same viewport in light mode and assembled source/app comparisons.
- Inspected Collections, Annotations, Settings and Reading activity in the browser against measured source positions and exported boards.
- Checked Library and Reading Now at 1280 × 900 and 390 × 844. Checked Settings at 390 × 844; fixed control overflow and confirmed document width stays within the viewport.
- Verified filtering updates the book count, grid/list switching, and opening/closing the synopsis dialog.
- Measured the open library menu: opaque rgb(252,252,252), opacity 1, radius 12px.
- TypeScript, ESLint and the webpack production build pass. Turbopack is not the production verification path in this Windows environment.

## Corrections

Removed stale global component overrides, bundled the source typeface, corrected semantic colours/radii/shadows, matched shell and cover dimensions, rebuilt screen spacing, aligned side-panel information/actions, and adapted settings controls for narrow windows.

## Fidelity limits

Close visual alignment, not a claim of pixel identity. The live profile retains the user's name/avatar. Existing library filtering, custom-list creation, profile editing and reduced-motion controls remain available although absent from some source boards. Sample activity totals and collection counts are derived from the available fixtures rather than painted source numbers. Preview-only notices remain visible. Platform text rasterisation may differ. The reference has no mobile or dark-mode boards; those layouts were checked for usability rather than pixel parity. The reader preview and older profile dialogs were not individually rebuilt as new reference screens in this pass.

Local comparison artifacts are in the Codex visualization workspace under `papyrbound-fidelity`: `library-comparison.jpg` and `home-comparison.jpg` (Penpot above, browser below), plus compact-window and menu captures. No blocking overflow remains in the inspected states. Broader state coverage should continue as actual EPUB functionality is integrated.
