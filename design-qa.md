# Collection cover design QA

**Visual truth and capture**

- Selected option 3: `docs/design-preview/collections-featured-reference.png` (1152 × 1365 px).
- Rendered desktop: `docs/design-preview/collections-featured-desktop.png` (1440 × 900 px at a 1440 × 900 CSS viewport).
- Rendered narrow: `docs/design-preview/collections-featured-narrow.png` (390 × 844 px at a 390 × 844 CSS viewport).
- Normalized side-by-side crop: `docs/design-preview/collections-featured-comparison.png`. The source crop is 750 × 1000 px and the implementation crop is 300 × 400 px; both are scaled to 600 × 800 px for comparison. Browser density is 1×.
- State: dark theme, collections overview, three books in the first collection. The desktop screenshot was captured after the card reveal animation settled.

**Findings**

No actionable P0–P2 mismatch remains. The first book leads at roughly the same relative scale as the selected design, two narrower books peek from behind its right edge, and title and metadata remain centered below on the dotted dark surface. The narrow layout keeps the full cover composition and metadata within the viewport.

The source mock uses textured raster cover illustrations, while the implementation preserves Papyrbound's actual dynamic `BookCover` artwork and the books in each collection. This is an intentional product-content difference. The source has slightly more detailed secondary spines and looser vertical spacing (P3).

**Comparison history**

- Initial render: the rear books exposed portions of their front-cover artwork and extended below the featured cover (P2). Their titles appeared as fragments.
- Fix: reduced the rear books, aligned their lower edges with the featured book, and placed their titles vertically in the visible edges.
- Post-fix evidence: `docs/design-preview/collections-featured-comparison.png` and `docs/design-preview/collections-featured-narrow.png`.

**Fidelity and interaction checks**

- Typography: existing Papyrbound font, title hierarchy, muted metadata and compact book lettering remain legible.
- Layout: the cover group is centered, with no clipped books or horizontal overflow at desktop and narrow widths.
- Color: existing per-book paper and ink colors preserve the selected image's lilac, sage and peach balance without introducing a new card background.
- Image quality: dynamic cover artwork remains sharp in the browser; no folder asset remains in the collection preview.
- Copy: collection names, book counts and last-book-added dates come from app data.
- Clicking the cover and metadata opened `/collections?collection=quiet-afternoons`. Browser console reported no errors.
- Prettier, TypeScript, ESLint and `next build --webpack` passed. The default Turbopack build hit a local worker-process startup error while processing the existing global CSS.

final result: passed
