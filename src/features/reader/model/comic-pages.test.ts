import assert from "node:assert/strict";
import { test } from "node:test";
import { comicPages } from "./comic-pages";
test("comic spreads preserve a single cover, normalize page picks and handle odd endings", () => {
  assert.deepEqual(comicPages(0, 6, true), { pages: [0], previous: -1, next: 1 });
  assert.deepEqual(comicPages(2, 6, true), { pages: [1, 2], previous: 0, next: 3 });
  assert.deepEqual(comicPages(5, 6, true), { pages: [5], previous: 3, next: -1 });
  assert.deepEqual(comicPages(1, 3, false), { pages: [1], previous: 0, next: 2 });
});
