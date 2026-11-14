import assert from "node:assert/strict";
import { test } from "node:test";
import { sampleAnnotations } from "./annotation";
import { sampleBooks } from "@/features/home/model/sample-books";
import { annotationDate, annotationsMarkdown, visibleAnnotations } from "./annotation-view";

test("annotation filtering respects the active library, trims queries, and sorts dates", () => {
  const comics = [{ ...sampleBooks[0], id: "comic", kind: "comics" as const }];
  assert.deepEqual(visibleAnnotations(sampleAnnotations, comics, "all", ""), []);
  const results = visibleAnnotations(sampleAnnotations, sampleBooks, "missing", "  DOOR  ");
  assert.deepEqual(results.map((note) => note.id), ["quiet-2"]);
  assert.equal(visibleAnnotations(sampleAnnotations, sampleBooks, "all", "", "oldest")[0].id, "sun-2");
});

test("Markdown export includes only supplied notes and preserves multiline quotes and thoughts", () => {
  const note = { ...sampleAnnotations[0], content: "First line\nSecond line", note: "My thoughts" };
  const markdown = annotationsMarkdown([note], sampleBooks);
  assert.match(markdown, /Crimson Vow/);
  assert.match(markdown, /> First line\n> Second line/);
  assert.match(markdown, /Page 72/);
  assert.match(markdown, /My thoughts/);
  assert.doesNotMatch(markdown, /The Midnight Labyrinth/);
});

test("annotation dates stop saying Today when the calendar day changes", () => {
  const created = new Date(2026, 10, 12, 9, 28).toISOString();
  assert.match(annotationDate(created, new Date(2026, 10, 12, 20)), /^Today/);
  assert.match(annotationDate(created, new Date(2026, 10, 13, 8)), /^Yesterday/);
  assert.equal(annotationDate(created, new Date(2026, 10, 15)), "Nov 12");
});
