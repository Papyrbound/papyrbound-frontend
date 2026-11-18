import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";
import { useCollections } from "@/features/collections/stores/collections-store";
import type { UndoableAction } from "./undo-actions";

export type BulkAction =
  | { kind: "favourite"; value: boolean }
  | { kind: "finished" | "unread" | "want-to-read" }
  | { kind: "collection"; id: string };

export function applyBulkAction(bookIds: string[], action: BulkAction): UndoableAction {
  const before = useReadingLists.getState();
  const ids = new Set(bookIds.filter((id) => before.books.some((book) => book.id === id)));
  if (!ids.size) throw new Error("Select at least one item first.");
  if (action.kind === "collection") {
    const collection = useCollections.getState().collections.find((item) => item.id === action.id);
    if (!collection || before.books.some((book) => ids.has(book.id) && (book.kind ?? "books") !== (collection.kind ?? "books"))) {
      throw new Error("Choose a collection from the same library.");
    }
    const added = new Set([...ids].filter((id) => !collection.bookIds.includes(id)));
    const timestamp = new Date().toISOString();
    useCollections.getState().setCollections((items) => items.map((item) => item.id === collection.id ? { ...item, bookIds: [...item.bookIds, ...added], lastBookAddedAt: added.size ? timestamp : item.lastBookAddedAt } : item));
    return {
      message: `${ids.size} items added to “${collection.name}”`,
      undo: () => useCollections.getState().setCollections((items) => items.map((item) => item.id === collection.id ? { ...item, bookIds: item.bookIds.filter((id) => !added.has(id)), lastBookAddedAt: item.lastBookAddedAt === timestamp ? collection.lastBookAddedAt : item.lastBookAddedAt } : item)),
    };
  }
  if (action.kind === "favourite" || action.kind === "want-to-read") {
    if (action.kind === "want-to-read") for (const id of ids) before.markAsUnread(id);
    const listId = action.kind === "favourite" ? "favourites" : "want-to-read";
    const adding = action.kind !== "favourite" || action.value;
    useReadingLists.setState((state) => ({ lists: state.lists.map((list) => list.id === listId ? { ...list, bookIds: adding ? [...new Set([...(list.bookIds ?? []), ...ids])] : list.bookIds?.filter((id) => !ids.has(id)) } : list) }));
  } else for (const id of ids) {
    if (action.kind === "finished") before.markAsRead(id);
    else before.markAsUnread(id);
  }
  const after = useReadingLists.getState();
  const oldEvents = new Set(before.activity.map((event) => event.id));
  const events = new Set(after.activity.filter((event) => !oldEvents.has(event.id)).map((event) => event.id));
  return {
    message: `${ids.size} items updated`,
    undo: () => useReadingLists.setState((current) => ({
      books: current.books.map((book) => {
        const old = before.books.find((item) => item.id === book.id);
        const applied = after.books.find((item) => item.id === book.id);
        return ids.has(book.id) && old && applied && book.progress === applied.progress ? { ...book, progress: old.progress } : book;
      }),
      lists: current.lists.map((list) => {
        const old = new Set(before.lists.find((item) => item.id === list.id)?.bookIds);
        const applied = new Set(after.lists.find((item) => item.id === list.id)?.bookIds);
        const next = new Set(list.bookIds);
        for (const id of ids) if (next.has(id) === applied.has(id) && old.has(id) !== applied.has(id)) {
          if (old.has(id)) next.add(id); else next.delete(id);
        }
        return { ...list, bookIds: [...next] };
      }),
      activity: current.activity.filter((event) => !events.has(event.id)),
    })),
  };
}
