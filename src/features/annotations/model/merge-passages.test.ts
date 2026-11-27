import assert from "node:assert/strict";
import { test } from "node:test";
import { mergePassageAnnotations } from "./merge-passages";
import { readerAnnotation } from "@/features/reader/model/reader-annotation";

const context = { bookId: "book", chapter: "Chapter 1", location: { index: 0, path: "chapter.xhtml", offset: 0.3 }, selection: { start: 10, end: 16, quote: "future" } };

test("adding a note to an existing highlight preserves its identity and avoids duplicate rows", () => {
  const highlight = { ...readerAnnotation(context), color: "rose" as const };
  const note = readerAnnotation({ ...context, note: "Hooray." });
  const merged = mergePassageAnnotations([highlight, note, readerAnnotation(context)]);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].id, highlight.id);
  assert.equal(merged[0].color, "rose");
  assert.equal(merged[0].note, "Hooray.");
});

test("older duplicates retain distinct notes and tolerate trailing selection whitespace", () => {
  const first = readerAnnotation({ ...context, note: "First thought" });
  const second = readerAnnotation({ ...context, selection: { start: 10, end: 17, quote: "future " }, note: "Second thought" });
  const merged = mergePassageAnnotations([first, second]);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].note, "First thought\n\nSecond thought");
});

test("identical words at different locations, books, bookmarks and standalone notes stay separate", () => {
  const items = [readerAnnotation(context), readerAnnotation({ ...context, selection: { start: 30, end: 36, quote: "future" } }), readerAnnotation({ ...context, bookId: "other" }), readerAnnotation({ ...context, bookmark: true }), readerAnnotation({ ...context, selection: undefined, note: "Chapter note" })];
  assert.equal(mergePassageAnnotations(items), items);
});
