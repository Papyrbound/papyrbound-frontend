import type { SampleBook } from "@/features/home/model/sample-books";

export type StoredImport = { id: string; book: SampleBook; file: Blob };
const DATABASE = "papyrbound-imports";
let pending: Promise<unknown> = Promise.resolve();

function queue<T>(operation: () => Promise<T>): Promise<T> {
  const result = pending.then(operation);
  pending = result.catch(() => undefined);
  return result;
}

function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("files")) db.createObjectStore("files", { keyPath: "id" });
      const metadata = db.createObjectStore("metadata", { keyPath: "id" });
      const cursor = request.transaction!.objectStore("files").openCursor();
      cursor.onsuccess = () => { const item = cursor.result; if (item) { metadata.put((item.value as StoredImport).book); item.continue(); } };
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Could not open local library storage."));
  });
}

async function transact<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore, result: (value: T) => void) => void) {
  const db = await database();
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = db.transaction(["files", "metadata"], mode);
      let value: T;
      transaction.oncomplete = () => resolve(value);
      transaction.onerror = () => reject(new Error("Could not save the local library. Check available disk space."));
      transaction.onabort = () => reject(new Error("The local library update was interrupted."));
      try { operation(transaction.objectStore("files"), (result) => { value = result; }); }
      catch (error) { transaction.abort(); reject(error); }
    });
  } finally {
    db.close();
  }
}

export function loadImportedBooks() {
  return queue(() => transact<SampleBook[]>("readonly", (store, result) => {
    const request = store.transaction.objectStore("metadata").getAll();
    request.onsuccess = () => result(request.result as SampleBook[]);
  }));
}

export function saveImportedFile(book: SampleBook, file: File) {
  return queue(() => transact<void>("readwrite", (store) => {
    store.put({ id: book.id, book, file } satisfies StoredImport);
    store.transaction.objectStore("metadata").put(book);
  }));
}

export function updateImportedMetadata(book: SampleBook) {
  return queue(() => transact<void>("readwrite", (store) => {
    const request = store.get(book.id);
    request.onsuccess = () => {
      const record = request.result as StoredImport | undefined;
      if (record) { store.put({ ...record, book }); store.transaction.objectStore("metadata").put(book); }
    };
  }));
}

export function deleteImportedFile(id: string) {
  return queue(() => transact<void>("readwrite", (store) => { store.delete(id); store.transaction.objectStore("metadata").delete(id); }));
}

export function getImportedFile(id: string) {
  return queue(() => transact<Blob | undefined>("readonly", (store, result) => {
    const request = store.get(id);
    request.onsuccess = () => result((request.result as StoredImport | undefined)?.file);
  }));
}

/** Returns files and metadata together, after all queued library writes finish. */
export function loadStoredImports() {
  return queue(() => transact<StoredImport[]>("readonly", (store, result) => {
    const request = store.getAll();
    request.onsuccess = () => result(request.result as StoredImport[]);
  }));
}

/** The synchronous metadata commit runs before the file transaction can commit. */
export function replaceImportedFiles(records: StoredImport[], commitMetadata: () => void) {
  return queue(() => transact<void>("readwrite", (store) => {
    let lastRequest: IDBRequest = store.clear();
    const metadata = store.transaction.objectStore("metadata");
    lastRequest = metadata.clear();
    for (const record of records) { store.put(record); lastRequest = metadata.put(record.book); }
    lastRequest.onsuccess = () => {
      try { commitMetadata(); }
      catch { store.transaction.abort(); }
    };
  }));
}
