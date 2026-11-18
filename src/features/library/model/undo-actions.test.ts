import "fake-indexeddb/auto";
import assert from "node:assert/strict";
import { test } from "node:test";
import { sampleBooks } from "@/features/home/model/sample-books";
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";
import { useCollections } from "@/features/collections/stores/collections-store";
import { useAnnotations } from "@/features/annotations/stores/annotations-store";
import { deleteImportedFile, getImportedFile, saveImportedFile } from "./import-storage";
import { removeAnnotation, removeBooks, removeCollection, restoreRemoved } from "./undo-actions";

test("undo restores book memberships and annotations without reverting subsequent edits", async () => {
  const previous = useReadingLists.getState();
  const notes = useAnnotations.getState().annotations;
  const action = await removeBooks(["quiet"]);
  assert.equal(useReadingLists.getState().books.some((book) => book.id === "quiet"), false);
  assert.equal(useAnnotations.getState().annotations.some((note) => note.bookId === "quiet"), false);
  useReadingLists.getState().updateBook("wild", { title: "A later title edit", author: "A later author" });
  useCollections.getState().setCollections((items) => items.map((item) => ({ ...item, name: "Renamed after deletion" })));
  await action.undo();
  assert.deepEqual(useReadingLists.getState().books.map((book) => book.id), previous.books.map((book) => book.id));
  assert.equal(useReadingLists.getState().books.find((book) => book.id === "wild")?.title, "A later title edit");
  assert.deepEqual(useReadingLists.getState().lists, previous.lists);
  assert.deepEqual(useAnnotations.getState().annotations, notes);
  assert.ok(useCollections.getState().collections.every((item) => item.name === "Renamed after deletion"));
  assert.ok(useCollections.getState().collections.find((item) => item.id === "quiet-afternoons")?.bookIds.includes("quiet"));
});

test("undo restores an imported file byte-for-byte after its persisted deletion", async () => {
  const book = { ...sampleBooks[0], id: "undo-import", sourceId: "undo-import", sourceName: "original.epub" };
  const file = new File([new Uint8Array([0, 255, 1, 42])], "original.epub");
  await saveImportedFile(book, file);
  useReadingLists.setState((state) => ({ books: [...state.books, book] }));
  const action = await removeBooks([book.id]);
  await deleteImportedFile(book.id);
  assert.equal(await getImportedFile(book.id), undefined);
  await action.undo();
  assert.deepEqual(new Uint8Array(await (await getImportedFile(book.id))!.arrayBuffer()), new Uint8Array(await file.arrayBuffer()));
  assert.equal(useReadingLists.getState().books.find((item) => item.id === book.id)?.progress, book.progress);
});

test("missing original files prevent deletion before any store changes", async () => {
  const book = { ...sampleBooks[0], id: "missing-file", sourceId: "missing-file" };
  useReadingLists.setState((state) => ({ books: [...state.books, book] }));
  const before = useReadingLists.getState();
  await assert.rejects(removeBooks([book.id]), /Nothing has been deleted/);
  assert.equal(useReadingLists.getState(), before);
});

test("collection and annotation undo preserve newly added records and do not duplicate items", () => {
  const before = useCollections.getState().collections;
  const action = removeCollection(before[0].id);
  useCollections.getState().setCollections((items) => [...items, { ...before[0], id: "later-collection" }]);
  action.undo(); action.undo();
  assert.equal(useCollections.getState().collections.filter((item) => item.id === before[0].id).length, 1);
  assert.ok(useCollections.getState().collections.some((item) => item.id === "later-collection"));
  const note = useAnnotations.getState().annotations[0];
  const annotation = removeAnnotation(note.id);
  useAnnotations.getState().setAnnotations((items) => [...items, { ...note, id: "later-note" }]);
  annotation.undo();
  assert.ok(useAnnotations.getState().annotations.some((item) => item.id === note.id));
  assert.ok(useAnnotations.getState().annotations.some((item) => item.id === "later-note"));
  assert.deepEqual(restoreRemoved(["new", "b", "d"], ["a", "b", "c", "d"], new Set(["a", "c"]), (item) => item), ["new", "a", "b", "c", "d"]);
});
