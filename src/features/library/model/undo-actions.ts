import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";
import { useCollections } from "@/features/collections/stores/collections-store";
import { useAnnotations } from "@/features/annotations/stores/annotations-store";
import { loadStoredImports, saveImportedFile } from "./import-storage";

export type UndoableAction = { message: string; undo: () => void | Promise<void> };

/** Restore removed items near their original neighbours without overwriting later edits. */
export function restoreRemoved<T>(current: T[], previous: T[], removed: Set<string>, key: (item: T) => string): T[] {
  const next = [...current];
  for (const [index, item] of previous.entries()) {
    if (!removed.has(key(item)) || next.some((entry) => key(entry) === key(item))) continue;
    const following = previous.slice(index + 1).find((entry) => next.some((candidate) => key(candidate) === key(entry)));
    const position = following ? next.findIndex((entry) => key(entry) === key(following)) : next.length;
    next.splice(position, 0, item);
  }
  return next;
}

export async function removeBooks(bookIds: string[]): Promise<UndoableAction> {
  const previous = useReadingLists.getState();
  const ids = new Set(bookIds.filter((id) => previous.books.some((book) => book.id === id)));
  if (!ids.size) throw new Error("Those items are no longer in your library.");
  const books = previous.books.filter((book) => ids.has(book.id));
  const records = new Map((books.some((book) => book.sourceId) ? await loadStoredImports() : []).filter((record) => ids.has(record.id)).map((record) => [record.id, record]));
  for (const book of books) {
    if (book.sourceId && !records.has(book.id)) throw new Error(`Could not recover the original file for “${book.title}”. Nothing has been deleted.`);
  }
  const collections = useCollections.getState().collections;
  const annotations = useAnnotations.getState().annotations;
  const activityIds = new Set(useReadingLists.getState().activity.map((event) => event.id));
  for (const id of ids) useReadingLists.getState().deleteBook(id);
  const deletionIds = new Set(useReadingLists.getState().activity.filter((event) => !activityIds.has(event.id)).map((event) => event.id));
  useCollections.getState().setCollections((items) => items.map((item) => ({ ...item, bookIds: item.bookIds.filter((id) => !ids.has(id)) })));
  useAnnotations.getState().setAnnotations((items) => items.filter((item) => !ids.has(item.bookId)));
  return {
    message: books.length === 1 ? `“${books[0].title}” deleted` : `${books.length} items deleted`,
    undo: async () => {
      for (const book of books) {
        const record = records.get(book.id);
        if (record && !useReadingLists.getState().books.some((item) => item.id === book.id)) {
          await saveImportedFile(book, new File([record.file], book.sourceName ?? book.id, { type: record.file.type }));
        }
      }
      useReadingLists.setState((current) => ({
        books: restoreRemoved(current.books, previous.books, ids, (book) => book.id),
        lists: current.lists.map((list) => ({ ...list, bookIds: restoreRemoved(list.bookIds ?? [], previous.lists.find((item) => item.id === list.id)?.bookIds ?? [], ids, (id) => id) })),
        activity: current.activity.filter((event) => !deletionIds.has(event.id)),
        reading: {
          positions: { ...Object.fromEntries(Object.entries(previous.reading.positions).filter(([id]) => ids.has(id))), ...current.reading.positions },
          sessions: [...current.reading.sessions, ...previous.reading.sessions.filter((session) => ids.has(session.bookId) && !current.reading.sessions.some((item) => item.id === session.id))],
        },
      }));
      useCollections.getState().setCollections((items) => items.map((item) => ({ ...item, bookIds: restoreRemoved(item.bookIds, collections.find((entry) => entry.id === item.id)?.bookIds ?? [], ids, (id) => id) })));
      const noteIds = new Set(annotations.filter((item) => ids.has(item.bookId)).map((item) => item.id));
      useAnnotations.getState().setAnnotations((items) => restoreRemoved(items, annotations, noteIds, (item) => item.id));
    },
  };
}

export function removeCollection(id: string): UndoableAction {
  const previous = useCollections.getState().collections;
  const collection = previous.find((item) => item.id === id);
  if (!collection) throw new Error("That collection has already been removed.");
  useCollections.getState().setCollections((items) => items.filter((item) => item.id !== id));
  return {
    message: `“${collection.name}” deleted`,
    undo: () => useCollections.getState().setCollections((items) => restoreRemoved(items, previous, new Set([id]), (item) => item.id)),
  };
}

export function removeAnnotation(id: string): UndoableAction {
  const previous = useAnnotations.getState().annotations;
  if (!previous.some((item) => item.id === id)) throw new Error("That annotation has already been removed.");
  useAnnotations.getState().setAnnotations((items) => items.filter((item) => item.id !== id));
  return {
    message: "Annotation deleted",
    undo: () => useAnnotations.getState().setAnnotations((items) => restoreRemoved(items, previous, new Set([id]), (item) => item.id)),
  };
}
