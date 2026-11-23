import assert from "node:assert/strict";
import { test } from "node:test";
import { sampleBooks } from "@/features/home/model/sample-books";
import { isDemoBook, isDemoCollection, visibleLibraryBooks } from "./demo-data";
test("demo visibility never removes personal titles or mistakes imports for samples", () => {
  const personal = { ...sampleBooks[0], id: "personal", sourceId: "personal" };
  const manual = { ...personal, id: "manual", sourceId: undefined };
  const books = [...sampleBooks, personal, manual];
  assert.deepEqual(visibleLibraryBooks(books, false), [personal, manual]);
  assert.deepEqual(visibleLibraryBooks(books, true), books);
  assert.equal(isDemoBook({ id: sampleBooks[0].id, sourceId: "import" }), false);
  assert.equal(isDemoCollection({ id: "quiet-afternoons" }), true);
  assert.equal(isDemoCollection({ id: "personal-shelf" }), false);
  assert.equal(isDemoCollection({ id: "quiet-afternoons", bookIds: ["quiet", "personal"] }), false);
});
