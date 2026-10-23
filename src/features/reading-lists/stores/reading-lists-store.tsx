"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

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
  id: string;
  bookTitle: string;
  kind: "added" | "completed" | "unread" | "deleted";
  at: string;
};

type ReadingListsContextValue = {
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

const ReadingListsContext = createContext<ReadingListsContextValue | null>(
  null,
);

export function ReadingListsProvider({ children }: PropsWithChildren) {
  const [books, setBooks] =
    useState<(SampleBook & { previousProgress?: number })[]>(sampleBooks);
  const [lists, setLists] = useState<ReadingList[]>(defaultReadingLists);
  const [activity, setActivity] = useState<ReadingActivityEvent[]>([]);
  const recordActivity = useCallback(
    (bookTitle: string, kind: ReadingActivityEvent["kind"]) => {
      const event: ReadingActivityEvent = {
        id: crypto.randomUUID(),
        bookTitle,
        kind,
        at: new Date().toISOString(),
      };
      setActivity((current) => [event, ...current].slice(0, 200));
    },
    [],
  );

  const addBook = useCallback(
    (details: { title: string; author: string }) => {
      if (!details.title.trim() || !details.author.trim()) return;
      const book: SampleBook = {
        id: crypto.randomUUID(),
        title: details.title.trim(),
        author: details.author.trim(),
        genre: "Uncategorized",
        pages: 0,
        progress: 0,
        paper: "#d9cae9",
        ink: "#494059",
        tone: "var(--content-lilac)",
        art: "orbit",
      };
      setBooks((current) => [...current, book]);
      recordActivity(book.title, "added");
    },
    [recordActivity],
  );

  const markAsRead = useCallback(
    (bookId: string) => {
      const target = books.find((book) => book.id === bookId);
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
            : list,
        ),
      );
      recordActivity(target.title, "completed");
    },
    [books, recordActivity],
  );

  const markAsUnread = useCallback(
    (bookId: string) => {
      const target = books.find((book) => book.id === bookId);
      if (!target || target.progress < 100) return;
      setBooks((current) =>
        current.map((book) =>
          book.id === bookId && book.progress >= 100
            ? {
                ...book,
                progress: book.previousProgress ?? 0,
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
      recordActivity(target.title, "unread");
    },
    [books, recordActivity],
  );

  const deleteBook = useCallback(
    (bookId: string) => {
      const target = books.find((book) => book.id === bookId);
      if (!target) return;
      setBooks((current) => current.filter((book) => book.id !== bookId));
      setLists((current) =>
        current.map((list) => ({
          ...list,
          bookIds: list.bookIds?.filter((id) => id !== bookId),
        })),
      );
      recordActivity(target.title, "deleted");
    },
    [books, recordActivity],
  );

  const createList = useCallback((details: ReadingListDetails) => {
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
  }, []);

  const updateList = useCallback((id: string, details: ReadingListDetails) => {
    if (!details.name.trim()) return;
    setLists((current) =>
      current.map((list) =>
        list.id === id && !list.isDefault
          ? { ...list, ...details, name: details.name.trim() }
          : list,
      ),
    );
  }, []);

  const deleteList = useCallback((id: string) => {
    setLists((current) => {
      if (current.find((list) => list.id === id)?.isDefault) return current;
      return current.filter((list) => list.id !== id);
    });
  }, []);

  const togglePinned = useCallback((id: string) => {
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
  }, []);

  const toggleBook = useCallback((listId: string, bookId: string) => {
    setLists((current) =>
      current.map((list) => {
        if (list.id !== listId) return list;
        const bookIds = list.bookIds ?? [];
        return {
          ...list,
          bookIds: bookIds.includes(bookId)
            ? bookIds.filter((id) => id !== bookId)
            : [...bookIds, bookId],
        };
      }),
    );
  }, []);

  const value = useMemo(
    () => ({
      books,
      activity,
      addBook,
      markAsRead,
      markAsUnread,
      deleteBook,
      lists,
      createList,
      updateList,
      deleteList,
      togglePinned,
      toggleBook,
    }),
    [
      books,
      activity,
      addBook,
      markAsRead,
      markAsUnread,
      deleteBook,
      lists,
      createList,
      updateList,
      deleteList,
      togglePinned,
      toggleBook,
    ],
  );

  return (
    <ReadingListsContext.Provider value={value}>
      {children}
    </ReadingListsContext.Provider>
  );
}

export function useReadingLists() {
  const context = useContext(ReadingListsContext);

  if (!context) {
    throw new Error("useReadingLists must be used within ReadingListsProvider");
  }

  return context;
}
