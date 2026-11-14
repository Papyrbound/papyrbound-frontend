import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createStore } from "zustand/vanilla";
import { isRecord, readDeviceValue, subscribeDeviceState } from "@/shared/lib/device-storage";
import { isLibrarySnapshot, librarySnapshot, restoreBookOrder } from "./library-snapshot";
import { sampleBooks } from "@/features/home/model/sample-books";
import { defaultReadingLists } from "@/features/reading-lists/model/reading-list";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const data = new Map<string, string>();
Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: {
  getItem: (key: string) => data.get(key) ?? null,
  setItem: (key: string, value: string) => data.set(key, value),
} } });
after(() => { if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow); else Reflect.deleteProperty(globalThis, "window"); });

test("device state survives reload, preserves empty arrays, and excludes transient state", () => {
  const errors: string[] = [];
  const store = createStore(() => ({ items: ["a"], editing: false }));
  const unsubscribe = subscribeDeviceState(store, "test", (state) => state.items, (message) => errors.push(message));
  store.setState({ editing: true });
  assert.equal(data.has("test"), false);
  store.setState({ items: [] });
  assert.deepEqual(readDeviceValue("test", (value): value is string[] => Array.isArray(value) && value.every((item) => typeof item === "string"), (message) => errors.push(message)), []);
  assert.deepEqual(errors, []);
  unsubscribe();
  store.setState({ items: ["unsaved"] });
  assert.deepEqual(JSON.parse(data.get("test")!).data, []);
});

test("malformed saved data is rejected without overwriting the original value", () => {
  data.set("bad", JSON.stringify({ version: 1, data: { count: "invalid" } }));
  const errors: string[] = [];
  assert.equal(readDeviceValue("bad", (value): value is { count: number } => isRecord(value) && typeof value.count === "number", (message) => errors.push(message)), undefined);
  assert.equal(errors.length, 1);
  assert.equal(JSON.parse(data.get("bad")!).data.count, "invalid");
});

test("library snapshots keep shelf changes and ordering without duplicating imported cover data", () => {
  const imported = { ...sampleBooks[0], id: "import-1", sourceId: "import-1", cover: "data:image/png;base64,large-cover" };
  const snapshot = librarySnapshot({ books: [imported, sampleBooks[1], sampleBooks[0]], lists: defaultReadingLists.map((list) => ({ ...list, bookIds: [imported.id] })), activity: [] });
  assert.equal(isLibrarySnapshot(snapshot), true);
  assert.equal(JSON.stringify(snapshot).includes("large-cover"), false);
  assert.deepEqual(restoreBookOrder([sampleBooks[0], imported, sampleBooks[1]], snapshot.order).map((book) => book.id), ["import-1", "wild", "quiet"]);
});
