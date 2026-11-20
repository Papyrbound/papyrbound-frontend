# Reader verification

These original fixtures contain no third-party book or comic content.

- `reader-verification.epub`: two chapters, navigation, local CSS and an image. Deliberately unsafe markup exercises the reader's sanitization.
- `reader-verification.cbz`: three illustrated PNG pages named 1, 2 and 10 to check natural ordering.

Import the EPUB in Books and the CBZ in Comics. Open each reader, navigate, close and reopen to check resume. Reload the app and repeat. Finish the comic to check 100% progress and the Finished shelf. Reading activity should show actual sessions for the selected library.

The automated reader tests also cover damaged archives, local resource paths, sanitization, object URL cleanup, midnight splitting, idle time, snapshot persistence, backup restoration and deletion Undo. EPUB page totals are estimates; only DRM-free EPUB and CBZ files are supported.
