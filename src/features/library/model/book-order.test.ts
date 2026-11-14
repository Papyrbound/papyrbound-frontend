import assert from "node:assert/strict";
import { test } from "node:test";
import { sampleBooks } from "@/features/home/model/sample-books";
import { nextUnreadBook, orderBooks } from "./book-order";

test("recent sorting uses added dates and keeps legacy entries in a stable order", () => {
  const imported = { ...sampleBooks[0], id: "new-import", addedAt: "2026-11-13T12:00:00Z" };
  assert.deepEqual(orderBooks([...sampleBooks, imported]).slice(0, 3).map((book) => book.id), ["new-import", "night", "sun"]);
  const legacy = { ...imported, id: "legacy", addedAt: undefined };
  assert.deepEqual(orderBooks([legacy, imported]).map((book) => book.id), ["legacy", "new-import"]);
  assert.equal(orderBooks(sampleBooks, "za")[0].title, "Where Shadows Bloom");
});

test("next up prioritizes the unread queue and excludes finished queue entries", () => {
  const another = { ...sampleBooks[4], id: "unread-2" };
  assert.equal(nextUnreadBook([...sampleBooks, another], ["wild", "unread-2"])?.id, "unread-2");
  assert.equal(nextUnreadBook(sampleBooks, ["wild"])?.id, "night");
});
