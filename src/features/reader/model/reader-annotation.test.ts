import assert from "node:assert/strict";
import { test } from "node:test";
import { readerAnnotation } from "./reader-annotation";
import { validAnnotationLocation } from "@/features/annotations/model/annotation";

const context = { bookId: "test-book", chapter: "Chapter 2", location: { index: 3, path: "chapter2.xhtml", offset: 0.4 } };
const selection = { start: 12, end: 23, quote: "paper boats" };

test("reader highlights and attached notes retain the selected passage and exact location", () => {
  const highlight = readerAnnotation({ ...context, selection });
  const note = readerAnnotation({ ...context, selection, note: "  Remember this passage  " });
  assert.equal(highlight.kind, "highlight");
  assert.equal(highlight.content, selection.quote);
  assert.deepEqual(highlight.location, { ...context.location, ...selection });
  assert.equal(note.note, "Remember this passage");
  assert.equal(note.content, selection.quote);
  assert.ok(validAnnotationLocation(note.location));
  assert.notEqual(highlight.id, note.id);
});

test("notes without a selection and bookmarks use the current reading position", () => {
  const note = readerAnnotation({ ...context, note: "  A chapter note  " });
  const bookmark = readerAnnotation({ ...context, selection, bookmark: true });
  assert.equal(note.kind, "note");
  assert.equal(note.content, "A chapter note");
  assert.equal(note.note, "");
  assert.deepEqual(note.location, context.location);
  assert.equal(bookmark.bookmark, true);
  assert.equal(bookmark.content, "Bookmark: Chapter 2");
  assert.deepEqual(bookmark.location, context.location);
});
