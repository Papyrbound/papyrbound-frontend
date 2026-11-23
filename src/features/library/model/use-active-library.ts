"use client";

import { useWorkspace } from "@/app-shell/workspace-store";
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";
import { belongsToLibrary, libraryCopy } from "./library-kind";
import { visibleLibraryBooks } from "./demo-data";
import { useSettingsUI } from "@/features/profile/stores/settings-ui-store";

export function useActiveLibrary() {
  const state = useReadingLists();
  const kind = useWorkspace((state) => state.libraryKind);
  const showDemo = useSettingsUI((state) => state.showDemo);
  const books = visibleLibraryBooks(state.books, showDemo).filter((book) => belongsToLibrary(book, kind));
  const ids = new Set(books.map((book) => book.id));
  return {
    ...state,
    books,
    lists: state.lists.filter((list) => list.isDefault || (list.kind ?? "books") === kind)
      .map((list) => ({ ...list, bookIds: list.bookIds?.filter((id) => ids.has(id)) })),
    activity: state.activity.filter((event) => (event.libraryKind ?? "books") === kind),
    kind,
    ...libraryCopy[kind],
  };
}
