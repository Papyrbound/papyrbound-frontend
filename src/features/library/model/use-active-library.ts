"use client";

import { useWorkspace } from "@/app-shell/workspace-store";
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";
import { belongsToLibrary, libraryCopy } from "./library-kind";
import type { ReadingListDetails } from "@/features/reading-lists/model/reading-list";

export function useActiveLibrary() {
  const state = useReadingLists();
  const kind = useWorkspace((state) => state.libraryKind);
  const books = state.books.filter((book) => belongsToLibrary(book, kind));
  const ids = new Set(books.map((book) => book.id));
  return {
    ...state,
    books,
    lists: state.lists.filter((list) => list.isDefault || (list.kind ?? "books") === kind)
      .map((list) => ({ ...list, bookIds: list.bookIds?.filter((id) => ids.has(id)) })),
    activity: state.activity.filter((event) => (event.libraryKind ?? "books") === kind),
    createList: (details: ReadingListDetails) => state.createList({ ...details, kind }),
    kind,
    ...libraryCopy[kind],
  };
}
