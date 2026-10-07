"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react"

import {
  defaultReadingLists,
  getReadingListUrl,
  MAX_PINNED_CUSTOM_LISTS,
  type ReadingList,
} from "@/features/reading-lists/model/reading-list"

type ReadingListsContextValue = {
  lists: ReadingList[]
  createList: (name: string) => void
  deleteList: (id: string) => void
  togglePinned: (id: string) => void
}

const ReadingListsContext = createContext<ReadingListsContextValue | null>(
  null
)

export function ReadingListsProvider({ children }: PropsWithChildren) {
  const [lists, setLists] = useState<ReadingList[]>(defaultReadingLists)

  const createList = useCallback((name: string) => {
    const trimmedName = name.trim()
    if (!trimmedName) return

    setLists((current) => {
      const id = crypto.randomUUID()
      const nextSortOrder = current.reduce(
        (highest, list) => Math.max(highest, list.sortOrder),
        -1
      ) + 1

      return [
        ...current,
        {
          id,
          name: trimmedName,
          url: getReadingListUrl(id),
          icon: "tag",
          isPinned: false,
          sortOrder: nextSortOrder,
        },
      ]
    })
  }, [])

  const deleteList = useCallback((id: string) => {
    setLists((current) => {
      if (current.find((list) => list.id === id)?.isDefault) return current
      return current.filter((list) => list.id !== id)
    })
  }, [])

  const togglePinned = useCallback((id: string) => {
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
  }, [])

  const value = useMemo(
    () => ({ lists, createList, deleteList, togglePinned }),
    [lists, createList, deleteList, togglePinned]
  )

  return (
    <ReadingListsContext.Provider value={value}>
      {children}
    </ReadingListsContext.Provider>
  )
}

export function useReadingLists() {
  const context = useContext(ReadingListsContext)

  if (!context) {
    throw new Error("useReadingLists must be used within ReadingListsProvider")
  }

  return context
}
