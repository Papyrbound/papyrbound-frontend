import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";
import { defaultReadingLists } from "@/features/reading-lists/model/reading-list";
import { useCollections } from "@/features/collections/stores/collections-store";
import { sampleBooks } from "@/features/home/model/sample-books";
import { useWorkspace } from "@/app-shell/workspace-store";
import { applyBulkAction } from "./bulk-actions";

beforeEach(() => {
  useReadingLists.setState({ books: sampleBooks.map((book) => ({ ...book })), lists: defaultReadingLists.map((list) => ({ ...list, bookIds: list.id === "favourites" ? ["quiet"] : [] })), activity: [] });
  useCollections.setState({ collections: [
    { id: "books", name: "Books", color: "#fff", pinned: false, bookIds: ["quiet"] },
    { id: "comics", kind: "comics", name: "Comics", color: "#fff", pinned: false, bookIds: [] },
  ] });
});

test("bulk favourites add uniformly and undo preserves unrelated edits", () => {
  const undo = applyBulkAction(["quiet", "sun"], { kind: "favourite", value: true });
  assert.deepEqual(useReadingLists.getState().lists.find((list) => list.id === "favourites")?.bookIds, ["quiet", "sun"]);
  useReadingLists.getState().toggleBook("favourites", "night");
  useReadingLists.getState().updateBook("quiet", { title: "Edited later", author: "Author" });
  undo.undo();
  assert.deepEqual(useReadingLists.getState().lists.find((list) => list.id === "favourites")?.bookIds, ["quiet", "night"]);
  assert.equal(useReadingLists.getState().books.find((book) => book.id === "quiet")?.title, "Edited later");
});

test("bulk status changes keep progress and shelves consistent and can be undone", () => {
  applyBulkAction(["quiet", "sun"], { kind: "finished" });
  assert.ok(useReadingLists.getState().books.filter((book) => ["quiet", "sun"].includes(book.id)).every((book) => book.progress === 100));
  const undo = applyBulkAction(["quiet", "sun"], { kind: "want-to-read" });
  assert.ok(useReadingLists.getState().books.filter((book) => ["quiet", "sun"].includes(book.id)).every((book) => book.progress === 0));
  assert.deepEqual(useReadingLists.getState().lists.find((list) => list.id === "completed")?.bookIds, []);
  assert.deepEqual(useReadingLists.getState().lists.find((list) => list.id === "want-to-read")?.bookIds, ["quiet", "sun"]);
  undo.undo();
  assert.ok(useReadingLists.getState().books.filter((book) => ["quiet", "sun"].includes(book.id)).every((book) => book.progress === 100));
  assert.deepEqual(useReadingLists.getState().lists.find((list) => list.id === "want-to-read")?.bookIds, []);
});

test("bulk collections reject the wrong library and undo removes only newly added members", () => {
  assert.throws(() => applyBulkAction(["quiet"], { kind: "collection", id: "comics" }), /same library/);
  const undo = applyBulkAction(["quiet", "sun", "sun"], { kind: "collection", id: "books" });
  assert.deepEqual(useCollections.getState().collections[0].bookIds, ["quiet", "sun"]);
  useCollections.getState().setCollections((items) => items.map((item) => item.id === "books" ? { ...item, bookIds: [...item.bookIds, "night"], name: "Changed later" } : item));
  undo.undo();
  assert.deepEqual(useCollections.getState().collections[0].bookIds, ["quiet", "night"]);
  assert.equal(useCollections.getState().collections[0].name, "Changed later");
});

test("switching libraries or revealing a search result clears bulk selection", () => {
  useWorkspace.setState({ libraryKind: "books", selectionMode: true, selectedIds: ["quiet"] });
  useWorkspace.getState().setLibraryKind("comics");
  assert.equal(useWorkspace.getState().selectionMode, false);
  assert.deepEqual(useWorkspace.getState().selectedIds, []);
  useWorkspace.setState({ selectionMode: true, selectedIds: ["quiet"] });
  useWorkspace.getState().revealBook("night");
  assert.equal(useWorkspace.getState().selectionMode, false);
  assert.deepEqual(useWorkspace.getState().selectedIds, []);
});
