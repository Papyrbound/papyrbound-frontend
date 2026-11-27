import assert from "node:assert/strict";
import { test } from "node:test";
import { readerAnnotation } from "./reader-annotation";
import { readerCollectionItems } from "./reader-collections";

test("reader lists separate bookmarks, filter attached notes and favourites, and sort dates", () => {
  const context = { bookId: "book", chapter: "Chapter", location: { index: 0, path: "one.xhtml" } };
  const highlight = { ...readerAnnotation({ ...context, selection: { start: 0, end: 4, quote: "Word" } }), createdAt: "2026-01-01T00:00:00Z" };
  const note = { ...readerAnnotation({ ...context, note: "Thought" }), starred: true, createdAt: "2026-01-02T00:00:00Z" };
  const attached = { ...highlight, id: "attached", location: { ...context.location, path: "two.xhtml" }, note: "About the quote", createdAt: "2026-01-03T00:00:00Z" };
  const bookmark = readerAnnotation({ ...context, bookmark: true });
  const items = [highlight, note, attached, bookmark, { ...note, bookId: "other" }];
  const defaults = { bookId: "book", bookmarks: false, filter: "all" as const, path: "one.xhtml", starred: false, oldest: false };
  assert.deepEqual(readerCollectionItems(items, defaults), [attached, note, highlight]);
  assert.deepEqual(readerCollectionItems(items, { ...defaults, oldest: true }), [highlight, note, attached]);
  assert.deepEqual(readerCollectionItems(items, { ...defaults, filter: "notes" }), [attached, note]);
  assert.deepEqual(readerCollectionItems(items, { ...defaults, starred: true }), [note]);
  assert.deepEqual(readerCollectionItems(items, { ...defaults, bookmarks: true }), [bookmark]);
  assert.deepEqual(readerCollectionItems(items, { ...defaults, filter: "chapter" }), [note, highlight]);
});
