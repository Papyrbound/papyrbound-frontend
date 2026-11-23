# Windows release checks

The Verify and package Papyrbound workflow runs lint, TypeScript, model tests, a static production build, native Rust tests, and an NSIS installer build. It uploads an installer artifact for each pull request, main/devel-ui push, or manual dispatch. It does not publish releases or install the application automatically.

Before publishing an installer:

1. Install the artifact on a Windows test account and launch Papyrbound with no imported content.
2. Import the original verification EPUB and CBZ. Confirm text, local images, chapter/page navigation, fit modes, spreads, and manga direction.
3. Select text across inline formatting, save a highlight and note, and create a bookmark. Reopen the app, search for the passage, and jump back from Annotations.
4. Change text size, zoom and appearance. Close/reopen the reader and restart the application; verify preferences and position remain.
5. Drag an EPUB and CBZ into the application. Use File Explorer's Open with action while the application is closed, then repeat while it is already running. Only one instance should remain.
6. Export a backup, delete a verification title and Undo it, then restore the backup. Confirm original files, notes, positions and sessions survive.
7. Upgrade an existing development installation. Existing Windows WebView data under `com.tauri.dev` is retained when present; new installations use the Papyrbound application identifier.
8. Test a large library and the generated stress fixtures. Check cancellation, responsiveness, keyboard focus and memory usage.

Installers are unsigned until the project supplies a Windows code-signing identity. Treat an installer build as packaging verification; complete the installed-app checks above before a public release.

References: [Tauri file associations](https://v2.tauri.app/reference/config/#fileassociation), [single instance](https://v2.tauri.app/plugin/single-instance/), [Windows installers](https://v2.tauri.app/distribute/windows-installer/).
