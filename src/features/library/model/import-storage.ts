import type { SampleBook } from "@/features/home/model/sample-books";

type StoredImport = { id: string; book: SampleBook; file: Blob };
const DATABASE = "papyrbound-imports";
let pending: Promise<unknown> = Promise.resolve();

function queue<T>(operation: () => Promise<T>): Promise<T> {
  const result = pending.then(operation);
  pending = result.catch(() => undefined);
  return result;
}

function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => request.result.createObjectStore("files", { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Could not open local library storage."));
  });
}

async function transact<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore, result: (value: T) => void) => void) {
  const db = await database();
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = db.transaction("files", mode);
      let value: T;
      transaction.oncomplete = () => resolve(value);
      transaction.onerror = () => reject(new Error("Could not save the local library. Check available disk space."));
      transaction.onabort = () => reject(new Error("The local library update was interrupted."));
      operation(transaction.objectStore("files"), (result) => { value = result; });
    });
  } finally {
    db.close();
  }
}

export function loadImportedBooks() {
  return queue(() => transact<SampleBook[]>("readonly", (store, result) => {
    const request = store.getAll();
    request.onsuccess = () => result((request.result as StoredImport[]).map((record) => record.book));
  }));
}

export function saveImportedFile(book: SampleBook, file: File) {
  return queue(() => transact<void>("readwrite", (store) => {
    store.put({ id: book.id, book, file } satisfies StoredImport);
  }));
}

export function updateImportedMetadata(book: SampleBook) {
  return queue(() => transact<void>("readwrite", (store) => {
    const request = store.get(book.id);
    request.onsuccess = () => {
      const record = request.result as StoredImport | undefined;
      if (record) store.put({ ...record, book });
    };
  }));
}

export function deleteImportedFile(id: string) {
  return queue(() => transact<void>("readwrite", (store) => { store.delete(id); }));
}

export function getImportedFile(id: string) {
  return queue(() => transact<Blob | undefined>("readonly", (store, result) => {
    const request = store.get(id);
    request.onsuccess = () => result((request.result as StoredImport | undefined)?.file);
  }));
}
