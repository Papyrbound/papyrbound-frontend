# Offline English dictionary

Select one word in an EPUB, open its context menu with right-click or Shift+F10,
and choose **Look up**. The shadcn popover displays parts of speech, pronunciation
text when available, definitions and examples. Additional meanings expand in
place. Escape and the close button return to reading. Multiword selections and
comic image content cannot be looked up.

The bundled Open English WordNet 2025 index contains 127,311 normalized entries.
It uses approximately 32 MiB of uncompressed JSON, split into alphabetic shards.
Native lookup parses each needed shard once on a worker thread and caches it.
The browser preview fetches only local same-origin shards on demand; it never
contacts a dictionary service. There is no API key, account, runtime download,
or remote transmission of selected text. Lookup handles the source's irregular
forms, possessives and common English suffixes; absent words have an empty state.

The reader and Settings link to `public/dictionary/NOTICE.txt`, including source,
CC BY 4.0 attribution and a description of the adaptations. Phonetic text is
included where available; pronunciation audio is not included.

To rebuild the index:

```powershell
python scripts/build-dictionary.py
```

An existing official export ZIP may be supplied as the first argument. The
script writes version, source URL and archive SHA-256 to `metadata.json`. The
source ZIP is not needed to run the app and is not committed.

Validation includes selection normalization, real offline data, irregular forms,
missing definitions, native command bounds and Rust lookup. Browser verification
covers the EPUB selection/context menu and displayed dictionary results.
