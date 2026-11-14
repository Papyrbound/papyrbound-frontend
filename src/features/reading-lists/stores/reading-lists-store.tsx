"use client";
import { create } from "zustand";
import { useEffect, type PropsWithChildren } from "react";
import { deleteImportedFile, loadImportedBooks, saveImportedFile, updateImportedMetadata } from "@/features/library/model/import-storage";
import { isLibrarySnapshot, librarySnapshot, restoreBookOrder } from "@/features/library/model/library-snapshot";
import { readDeviceValue, subscribeDeviceState } from "@/shared/lib/device-storage";
import {
  defaultReadingLists,
  getReadingListUrl,
  MAX_PINNED_CUSTOM_LISTS,
  type ReadingList,
  type ReadingListDetails,
} from "@/features/reading-lists/model/reading-list";
import {
  sampleBooks,
  type SampleBook,
} from "@/features/home/model/sample-books";
export type ReadingActivityEvent = {
  libraryKind?: "books" | "comics";
  id: string;
  bookTitle: string;
  kind: "added" | "completed" | "unread" | "deleted";
  at: string;
};
type ReadingListsState = {
  importsReady: boolean;
  storageError: string;
  importBook: (book: SampleBook, file: File) => Promise<boolean>;
  updateBook: (id: string, details: { title: string; author: string }) => void;
  books: SampleBook[];
  activity: ReadingActivityEvent[];
  addBook: (details: { title: string; author: string }) => void;
  markAsRead: (bookId: string) => void;
  markAsUnread: (bookId: string) => void;
  deleteBook: (bookId: string) => void;
  lists: ReadingList[];
  createList: (details: ReadingListDetails) => string | undefined;
  updateList: (id: string, details: ReadingListDetails) => void;
  deleteList: (id: string) => void;
  togglePinned: (id: string) => void;
  toggleBook: (listId: string, bookId: string) => void;
};

export const useReadingLists = create<ReadingListsState>((set, get) => {
  const pendingImports = new Map<string, Promise<boolean>>();
  const setBooks = (
    update: (
      books: (SampleBook & { previousProgress?: number })[],
    ) => SampleBook[],
  ) => set((s) => ({ books: update(s.books) }));
  const setLists = (update: (lists: ReadingList[]) => ReadingList[]) =>
    set((s) => ({ lists: update(s.lists) }));
  const recordActivity = (
    bookTitle: string,
    kind: ReadingActivityEvent["kind"],
    libraryKind: "books" | "comics" = "books",
  ) =>
    set((s) => ({
      activity: [
        {
          id: crypto.randomUUID(),
          bookTitle,
          libraryKind,
          kind,
          at: new Date().toISOString(),
        },
        ...s.activity,
      ].slice(0, 200),
    }));
  const addBook = (details: { title: string; author: string }) => {
    if (!details.title.trim() || !details.author.trim()) return;
    const book: SampleBook = {
      id: crypto.randomUUID(),
      title: details.title.trim(),
      author: details.author.trim(),
      genre: "Uncategorized",
      pages: 0,
      progress: 0,
      addedAt: new Date().toISOString(),
      addedLabel: "Added today",
      paper: "#d9cae9",
      ink: "#494059",
      tone: "var(--content-lilac)",
      art: "orbit",
    };
    setBooks((current) => [book, ...current]);
    recordActivity(book.title, "added");
  };

  const markAsRead = (bookId: string) => {
    const target = get().books.find((book) => book.id === bookId);
    if (!target || target.progress >= 100) return;
    setBooks((current) =>
      current.map((book) =>
        book.id === bookId && book.progress < 100
          ? { ...book, previousProgress: book.progress, progress: 100 }
          : book,
      ),
    );
    setLists((current) =>
      current.map((list) =>
        list.id === "completed"
          ? {
              ...list,
              bookIds: [...new Set([...(list.bookIds ?? []), bookId])],
            }
          : list.id === "want-to-read" ? { ...list, bookIds: list.bookIds?.filter((id) => id !== bookId) } : list,
      ),
    );
    recordActivity(target.title, "completed", target.kind);
  };

  const markAsUnread = (bookId: string) => {
    const target = get().books.find((book) => book.id === bookId);
    if (!target || target.progress < 100) return;
    setBooks((current) =>
      current.map((book) =>
        book.id === bookId && book.progress >= 100
          ? {
              ...book,
              progress: 0,
              previousProgress: undefined,
            }
          : book,
      ),
    );
    setLists((current) =>
      current.map((list) =>
        list.id === "completed"
          ? { ...list, bookIds: list.bookIds?.filter((id) => id !== bookId) }
          : list,
      ),
    );
    recordActivity(target.title, "unread", target.kind);
  };

  const deleteBook = (bookId: string) => {
    const target = get().books.find((book) => book.id === bookId);
    if (!target) return;
    setBooks((current) => current.filter((book) => book.id !== bookId));
    setLists((current) =>
      current.map((list) => ({
        ...list,
        bookIds: list.bookIds?.filter((id) => id !== bookId),
      })),
    );
    recordActivity(target.title, "deleted", target.kind);
  };

  const createList = (details: ReadingListDetails) => {
    const trimmedName = details.name.trim();
    if (!trimmedName) return;
    const id = crypto.randomUUID();
    setLists((current) => {
      const nextSortOrder =
        current.reduce(
          (highest, list) => Math.max(highest, list.sortOrder),
          -1,
        ) + 1;

      return [
        ...current,
        {
          ...details,
          id,
          name: trimmedName,
          url: getReadingListUrl(id),
          icon: "tag",
          isPinned: false,
          sortOrder: nextSortOrder,
        },
      ];
    });
    return id;
  };

  const updateList = (id: string, details: ReadingListDetails) => {
    if (!details.name.trim()) return;
    setLists((current) =>
      current.map((list) =>
        list.id === id && !list.isDefault
          ? { ...list, ...details, name: details.name.trim() }
          : list,
      ),
    );
  };

  const deleteList = (id: string) => {
    setLists((current) => {
      if (current.find((list) => list.id === id)?.isDefault) return current;
      return current.filter((list) => list.id !== id);
    });
  };

  const togglePinned = (id: string) => {
    setLists((current) => {
      const target = current.find((list) => list.id === id);
      if (!target || target.isDefault) return current;

      const pinnedCustomCount = current.filter(
        (list) => !list.isDefault && list.isPinned,
      ).length;

      if (!target.isPinned && pinnedCustomCount >= MAX_PINNED_CUSTOM_LISTS) {
        return current;
      }

      return current.map((list) =>
        list.id === id ? { ...list, isPinned: !list.isPinned } : list,
      );
    });
  };

  const toggleBook = (listId: string, bookId: string) => {
    const book = get().books.find((item) => item.id === bookId);
    if (!book) return;
    if (listId === "completed") {
      if (book.progress >= 100) markAsUnread(bookId);
      else markAsRead(bookId);
      return;
    }
    setLists((current) =>
      current.map((list) => {
        if (list.id !== listId) return list;
        if (!list.isDefault && (list.kind ?? "books") !== (book.kind ?? "books")) return list;
        const bookIds = list.bookIds ?? [];
        return {
          ...list,
          bookIds: bookIds.includes(bookId)
            ? bookIds.filter((id) => id !== bookId)
            : [...bookIds, bookId],
        };
      }),
    );
  };

  return {
    importsReady: false,
    storageError: "",
    importBook: async (book, file) => {
      if (get().books.some((existing) => existing.id === book.id)) return false;
      const pending = pendingImports.get(book.id);
      if (pending) { await pending; return false; }
      const task = (async () => {
        await saveImportedFile(book, file);
        setBooks((current) => [book, ...current]);
        recordActivity(book.title, "added", book.kind);
        return true;
      })();
      pendingImports.set(book.id, task);
      try { return await task; } finally { pendingImports.delete(book.id); }
    },
    updateBook: (id, details) =>
      set((s) => ({
        books: s.books.map((b) => (b.id === id ? { ...b, ...details } : b)),
      })),
    books: sampleBooks,
    lists: defaultReadingLists.map((list) => ({
      ...list,
      bookIds:
        list.id === "completed"
          ? sampleBooks
              .filter((book) => book.progress >= 100)
              .map((book) => book.id)
          : list.id === "want-to-read"
            ? ["night"]
            : ["quiet", "sun", "night"],
    })),
    activity: [],
    addBook,
    markAsRead,
    markAsUnread,
    deleteBook,
    createList,
    updateList,
    deleteList,
    togglePinned,
    toggleBook,
  };
});
export function ReadingListsProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;
    const storageFailure = (error: unknown) => useReadingLists.setState({
      storageError: error instanceof Error ? error.message : "Could not update local library storage.",
    });
    const saved = readDeviceValue("papyrbound-library-v1", isLibrarySnapshot, storageFailure);
    if (saved) useReadingLists.setState({
      books: [...saved.books.map((book) => ({ ...book, addedAt: book.addedAt ?? sampleBooks.find((sample) => sample.id === book.id)?.addedAt })), ...useReadingLists.getState().books.filter((book) => book.sourceId)],
      lists: [
        ...defaultReadingLists.map((list) => ({ ...list, bookIds: saved.lists.find((item) => item.id === list.id)?.bookIds ?? [] })),
        ...saved.lists.filter((list) => !defaultReadingLists.some((item) => item.id === list.id)).map((list) => ({ ...list, isDefault: false, url: getReadingListUrl(list.id) })),
      ],
      activity: saved.activity,
    });
    loadImportedBooks().then((imported) => {
      if (!active) return;
      useReadingLists.setState((state) => ({
        importsReady: true,
        books: restoreBookOrder([...imported.filter((book) => !state.books.some((existing) => existing.id === book.id)), ...state.books], saved?.order ?? []),
        lists: state.lists.map((list) => list.id === "completed" ? {
          ...list, bookIds: [...new Set([...(list.bookIds ?? []), ...imported.filter((book) => book.progress >= 100).map((book) => book.id)])],
        } : list),
      }));
      const saveSnapshot = subscribeDeviceState(useReadingLists, "papyrbound-library-v1", librarySnapshot, storageFailure);
      const saveFiles = useReadingLists.subscribe((state, previous) => {
        if (state.books === previous.books) return;
        for (const book of state.books) {
          if (book.sourceId && previous.books.find((existing) => existing.id === book.id) !== book) {
            void updateImportedMetadata(book).catch(storageFailure);
          }
        }
        for (const book of previous.books) {
          if (book.sourceId && !state.books.some((existing) => existing.id === book.id)) {
            void deleteImportedFile(book.id).catch(storageFailure);
          }
        }
      });
      unsubscribe = () => { saveSnapshot(); saveFiles(); };
    }).catch((error) => {
      if (active) {
        storageFailure(error);
        useReadingLists.setState({ importsReady: true });
        unsubscribe = subscribeDeviceState(useReadingLists, "papyrbound-library-v1", librarySnapshot, storageFailure);
      }
    });
    return () => { active = false; unsubscribe?.(); };
  }, []);
  return children;
}
