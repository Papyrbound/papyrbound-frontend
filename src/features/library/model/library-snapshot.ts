import type { SampleBook } from "@/features/home/model/sample-books";
import type { ReadingList } from "@/features/reading-lists/model/reading-list";
import type { ReadingActivityEvent } from "@/features/reading-lists/stores/reading-lists-store";
import { isRecord } from "@/shared/lib/device-storage";

export type LibrarySnapshot = { books: SampleBook[]; lists: ReadingList[]; activity: ReadingActivityEvent[]; order: string[] };

export function isLibrarySnapshot(value: unknown): value is LibrarySnapshot {
  return isRecord(value) && Array.isArray(value.books) && value.books.every((book) =>
    isRecord(book) && !book.sourceId && typeof book.id === "string" && typeof book.title === "string" &&
    typeof book.author === "string" && typeof book.genre === "string" && typeof book.progress === "number" &&
    book.progress >= 0 && book.progress <= 100 && typeof book.pages === "number" &&
    typeof book.paper === "string" && typeof book.ink === "string" && typeof book.tone === "string" &&
    ["orbit", "lines", "wave"].includes(String(book.art))) &&
    Array.isArray(value.lists) && value.lists.every((list) => isRecord(list) && typeof list.id === "string" &&
      typeof list.name === "string" && typeof list.sortOrder === "number" && Array.isArray(list.bookIds) && list.bookIds.every((id) => typeof id === "string")) &&
    Array.isArray(value.activity) && value.activity.every((event) => isRecord(event) && typeof event.id === "string" &&
      typeof event.bookTitle === "string" && typeof event.at === "string" && ["added", "completed", "unread", "deleted"].includes(String(event.kind))) &&
    Array.isArray(value.order) && value.order.every((id) => typeof id === "string");
}

export function librarySnapshot(state: { books: SampleBook[]; lists: ReadingList[]; activity: ReadingActivityEvent[] }): LibrarySnapshot {
  return { books: state.books.filter((book) => !book.sourceId), lists: state.lists, activity: state.activity, order: state.books.map((book) => book.id) };
}

export function restoreBookOrder(books: SampleBook[], order: string[]) {
  const positions = new Map(order.map((id, index) => [id, index]));
  return books.toSorted((a, b) => (positions.get(a.id) ?? -1) - (positions.get(b.id) ?? -1));
}
