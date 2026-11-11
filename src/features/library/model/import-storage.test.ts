import "fake-indexeddb/auto";
import assert from "node:assert/strict";
import { test } from "node:test";
import { deleteImportedFile, getImportedFile, loadImportedBooks, saveImportedFile, updateImportedMetadata } from "./import-storage";
import { useWorkspace } from "@/app-shell/workspace-store";
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";
import type { SampleBook } from "@/features/home/model/sample-books";

test("preserves original bytes and metadata across reads, updates, and deletion", async () => {
  const book: SampleBook = { id: "import-test", sourceId: "import-test", title: "A comic", kind: "comics", format: "CBZ", author: "Artist", genre: "Comics", pages: 2, progress: 0, paper: "#fff", ink: "#000", tone: "#ddd", art: "orbit" };
  const file = new File(["original archive bytes"], "comic.cbz");
  await saveImportedFile(book, file);
  assert.equal((await loadImportedBooks())[0].title, "A comic");
  assert.equal(await (await getImportedFile(book.id))?.text(), "original archive bytes");
  await updateImportedMetadata({ ...book, title: "Edited title", progress: 100 });
  assert.equal((await loadImportedBooks())[0].progress, 100);
  assert.equal((await loadImportedBooks())[0].title, "Edited title");
  assert.equal(await (await getImportedFile(book.id))?.text(), "original archive bytes");
  await deleteImportedFile(book.id);
  await updateImportedMetadata(book);
  assert.equal((await loadImportedBooks()).length, 0);
  assert.equal(await getImportedFile(book.id), undefined);
});

test("switching library clears stale selection and dialogs", () => {
  useWorkspace.setState({ selectedId: "quiet", dialog: "edit", query: "a title" });
  useWorkspace.getState().setLibraryKind("comics");
  assert.equal(useWorkspace.getState().libraryKind, "comics");
  assert.equal(useWorkspace.getState().selectedId, null);
  assert.equal(useWorkspace.getState().dialog, null);
  assert.equal(useWorkspace.getState().query, "");
});

test("importing the same file twice adds one item and records the right library context", async () => {
  const book: SampleBook = { id: "duplicate-check", sourceId: "duplicate-check", kind: "comics", format: "CBZ", title: "A duplicate check", author: "Artist", genre: "Comics", pages: 1, progress: 0, paper: "#fff", ink: "#000", tone: "#ddd", art: "orbit" };
  const file = new File(["archive"], "example.cbz");
  assert.equal(await useReadingLists.getState().importBook(book, file), true);
  assert.equal(await useReadingLists.getState().importBook(book, file), false);
  assert.equal(useReadingLists.getState().books.filter((item) => item.id === book.id).length, 1);
  assert.equal(useReadingLists.getState().activity[0].libraryKind, "comics");
  assert.equal((await loadImportedBooks()).filter((item) => item.id === book.id).length, 1);
  await deleteImportedFile(book.id);
});
