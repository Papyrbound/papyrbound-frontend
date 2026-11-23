import "fake-indexeddb/auto";
import assert from "node:assert/strict";
import { test } from "node:test";
import { sampleBooks } from "@/features/home/model/sample-books";
import { getImportedFile, loadImportedBooks, replaceImportedFiles } from "./import-storage";
test("legacy file storage upgrades without losing originals and large catalog hydration reads only metadata", async () => {
  const book = { ...sampleBooks[0], id: "legacy", sourceId: "legacy" };
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.open("papyrbound-imports", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("files", { keyPath: "id" });
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result, transaction = db.transaction("files", "readwrite");
      transaction.objectStore("files").put({ id: book.id, book, file: new Blob(["legacy original"]) });
      transaction.oncomplete = () => { db.close(); resolve(); };
    };
  });
  assert.deepEqual(await loadImportedBooks(), [book]);
  assert.equal(await (await getImportedFile(book.id))?.text(), "legacy original");
  const records = Array.from({ length: 1000 }, (_, index) => ({ id: `stress-${index}`, book: { ...book, id: `stress-${index}`, sourceId: `stress-${index}` }, file: new Blob([`original ${index}`]) }));
  await replaceImportedFiles(records, () => undefined);
  const original = IDBObjectStore.prototype.getAll;
  const stores: string[] = [];
  IDBObjectStore.prototype.getAll = function (...args: Parameters<typeof original>) { stores.push(this.name); return original.apply(this, args); };
  try { assert.equal((await loadImportedBooks()).length, 1000); assert.deepEqual(stores, ["metadata"]); }
  finally { IDBObjectStore.prototype.getAll = original; }
  assert.equal(await (await getImportedFile("stress-999"))?.text(), "original 999");
});
