# Penpot implementation reference

Source: **Panels — Reference recreation**, file `52a5041f-08a1-80f1-8008-c3ceb61a118d`, page `b6ac89e5-6209-809c-8008-dca6976d7ee7`.

The latest Panels screens override the older foundation palette and typeface. Use their soft monochrome colours and Inter Tight; retain the foundation spacing and radius scale. Shared values live in `src/app/globals.css` under `@theme` and the light/dark semantic variables. Component styling belongs in Tailwind classes.

| Role                      | Light value |
| ------------------------- | ----------- |
| Main canvas / opaque menu | #FCFCFC     |
| Sidebar and details panel | #F6F6F6     |
| Secondary control         | #F5F5F5     |
| Navigation selection      | #EAEAEA     |
| Primary button            | #303030     |
| Foreground                | #2B2B2B     |
| Muted text                | #737373     |

| Geometry                     | Value            |
| ---------------------------- | ---------------- |
| Sidebar / details panel      | 264 / 360 px     |
| Toolbar                      | 64 px high       |
| Standard toolbar control     | 40 px high       |
| Context menu radius          | 12 px            |
| Selected book radius         | 18 px            |
| Section radius               | 20 px            |
| Dialog radius                | 24 px            |
| Library cover at 1920 × 1080 | 172.8 × 259.2 px |
| Details cover                | 192 × 288 px     |
| Recent reading card          | 288 × 432 px     |

The font is bundled locally with its OFL license. Menus are opaque, with a soft border and shadow. Details panels are flat, share the sidebar background, and scroll independently. Responsive container queries reduce the number of columns without stretching covers beyond their intended size.

Avoid unlayered global selectors for shadcn slots: they previously overrode component classes and caused the design drift. Remaining legacy component rules are in `@layer components`, below utilities in the cascade.
