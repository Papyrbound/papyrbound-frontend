"use client";
import { create } from "zustand";
import { type PropsWithChildren } from "react";
import { defaultReadingLists, getReadingListUrl, MAX_PINNED_CUSTOM_LISTS, type ReadingList, type ReadingListDetails } from "@/features/reading-lists/model/reading-list";
import { sampleBooks, type SampleBook } from "@/features/home/model/sample-books";
export type ReadingActivityEvent = { id: string; bookTitle: string; kind: "added" | "completed" | "unread" | "deleted"; at: string };
type ReadingListsState = {
  updateBook: (id: string, details: {title: string; author: string}) => void
  books: SampleBook[]
  activity: ReadingActivityEvent[]
  addBook: (details: { title: string; author: string }) => void
  markAsRead: (bookId: string) => void
  markAsUnread: (bookId: string) => void
  deleteBook: (bookId: string) => void
  lists: ReadingList[]
  createList: (details: ReadingListDetails) => string | undefined
  updateList: (id: string, details: ReadingListDetails) => void
  deleteList: (id: string) => void
  togglePinned: (id: string) => void
  toggleBook: (listId: string, bookId: string) => void
}

export const useReadingLists = create<ReadingListsState>((set, get) => {
const setBooks = (update: (books: (SampleBook & { previousProgress?: number })[]) => SampleBook[]) => set(s => ({books: update(s.books)}));
const setLists = (update: (lists: ReadingList[]) => ReadingList[]) => set(s => ({lists: update(s.lists)}));
const recordActivity = (bookTitle: string, kind: ReadingActivityEvent["kind"]) => set(s => ({activity: [{id: crypto.randomUUID(), bookTitle, kind, at: new Date().toISOString()}, ...s.activity].slice(0,200)}));
  const addBook = ((details: { title: string; author: string }) => {
    if (!details.title.trim() || !details.author.trim()) return
    const book: SampleBook = {
      id: crypto.randomUUID(), title: details.title.trim(), author: details.author.trim(),
      genre: "Uncategorized", pages: 0, progress: 0,
      paper: "#d9cae9", ink: "#494059", tone: "var(--content-lilac)", art: "orbit",
    }
    setBooks((current) => [...current, book])
    recordActivity(book.title, "added")
  })

  const markAsRead = ((bookId: string) => {
    const target = get().books.find((book) => book.id === bookId)
    if (!target || target.progress >= 100) return
    setBooks((current) => current.map((book) => book.id === bookId && book.progress < 100 ? { ...book, previousProgress: book.progress, progress: 100 } : book))
    setLists((current) => current.map((list) => list.id === "completed"
      ? { ...list, bookIds: [...new Set([...(list.bookIds ?? []), bookId])] }
      : list))
    recordActivity(target.title, "completed")
  })

  const markAsUnread = ((bookId: string) => {
    const target = get().books.find((book) => book.id === bookId)
    if (!target || target.progress < 100) return
    setBooks((current) => current.map((book) => book.id === bookId && book.progress >= 100
      ? { ...book, progress: book.previousProgress ?? 0, previousProgress: undefined }
      : book))
    setLists((current) => current.map((list) => list.id === "completed"
      ? { ...list, bookIds: list.bookIds?.filter((id) => id !== bookId) }
      : list))
    recordActivity(target.title, "unread")
  })

  const deleteBook = ((bookId: string) => {
    const target = get().books.find((book) => book.id === bookId)
    if (!target) return
    setBooks((current) => current.filter((book) => book.id !== bookId))
    setLists((current) => current.map((list) => ({ ...list, bookIds: list.bookIds?.filter((id) => id !== bookId) })))
    recordActivity(target.title, "deleted")
  })

  const createList = ((details: ReadingListDetails) => {
    const trimmedName = details.name.trim()
    if (!trimmedName) return
    const id = crypto.randomUUID()
    setLists((current) => {
      const nextSortOrder = current.reduce(
        (highest, list) => Math.max(highest, list.sortOrder),
        -1
      ) + 1

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
      ]
    })
    return id
  })

  const updateList = ((id: string, details: ReadingListDetails) => {
    if (!details.name.trim()) return
    setLists((current) => current.map((list) =>
      list.id === id && !list.isDefault
        ? { ...list, ...details, name: details.name.trim() }
        : list
    ))
  })

  const deleteList = ((id: string) => {
    setLists((current) => {
      if (current.find((list) => list.id === id)?.isDefault) return current
      return current.filter((list) => list.id !== id)
    })
  })

  const togglePinned = ((id: string) => {
    setLists((current) => {
      const target = current.find((list) => list.id === id)
      if (!target || target.isDefault) return current

      const pinnedCustomCount = current.filter(
        (list) => !list.isDefault && list.isPinned
      ).length

      if (!target.isPinned && pinnedCustomCount >= MAX_PINNED_CUSTOM_LISTS) {
        return current
      }

      return current.map((list) =>
        list.id === id ? { ...list, isPinned: !list.isPinned } : list
      )
    })
  })

  const toggleBook = ((listId: string, bookId: string) => {
    setLists((current) => current.map((list) => {
      if (list.id !== listId) return list
      const bookIds = list.bookIds ?? []
      return { ...list, bookIds: bookIds.includes(bookId) ? bookIds.filter((id) => id !== bookId) : [...bookIds, bookId] }
    }))
  })

return { updateBook: (id, details) => set(s => ({books: s.books.map(b => b.id === id ? {...b, ...details} : b)})), books: sampleBooks, lists: defaultReadingLists, activity: [], addBook, markAsRead, markAsUnread, deleteBook, createList, updateList, deleteList, togglePinned, toggleBook };
});
export function ReadingListsProvider({children}: PropsWithChildren) { return children; }
