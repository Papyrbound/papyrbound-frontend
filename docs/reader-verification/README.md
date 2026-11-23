# Reader verification

These original fixtures contain no third-party book or comic content.

- `reader-verification.epub`: two chapters, navigation, local CSS and an image. Deliberately unsafe markup exercises the reader's sanitization.
- `reader-verification.cbz`: three illustrated PNG pages named 1, 2 and 10 to check natural ordering.

Import the EPUB in Books and the CBZ in Comics. Open each reader, navigate, close and reopen to check resume. Reload the app and repeat. Finish the comic to check 100% progress and the Finished shelf. Reading activity should show actual sessions for the selected library.

The automated reader tests also cover damaged archives, local resource paths, sanitization, object URL cleanup, midnight splitting, idle time, snapshot persistence, backup restoration and deletion Undo. EPUB page totals are estimates; only DRM-free EPUB and CBZ files are supported.

Run `node --import tsx scripts/create-reader-stress-fixtures.ts` from the repository root to generate an original 100-chapter EPUB and a 200-page CBZ under `docs/reader-verification/generated/`. The comic repeats the project's original illustrations to exercise page count and cache behavior. Generated archives are excluded from Git.

The storage migration test creates a 1,000-title catalog and verifies that hydration reads only the metadata store while original files remain available. The large-comic test verifies that image bytes stay compressed until requested and old decoded page URLs are evicted. See [desktop-release.md](desktop-release.md) for installer and installed-app checks.
