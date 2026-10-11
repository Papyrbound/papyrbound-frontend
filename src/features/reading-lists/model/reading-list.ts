export type ReadingListIcon = "heart" | "book-open" | "completed" | "tag"

export const readingListColors = [
  { name: "Lilac", value: "#ded4ed" },
  { name: "Rose", value: "#efd0df" },
  { name: "Sage", value: "#dbe5cd" },
  { name: "Sand", value: "#e6dfbd" },
  { name: "Mint", value: "#cce5de" },
  { name: "Peach", value: "#f2dacb" },
] as const

export type ReadingListDetails = {
  name: string
  color: string
  bookIds: string[]
}

export type ReadingList = {
  id: string
  name: string
  url: string
  icon: ReadingListIcon
  isDefault?: boolean
  isPinned?: boolean
  sortOrder: number
  color?: string
  bookIds?: string[]
}

export const MAX_PINNED_CUSTOM_LISTS = 5

export function getReadingListUrl(id: string) {
  return `/reading-lists?list=${encodeURIComponent(id)}`
}

export const defaultReadingLists: ReadingList[] = [
  {
    id: "favourites",
    name: "Favourites",
    url: getReadingListUrl("favourites"),
    icon: "heart",
    isDefault: true,
    isPinned: true,
    sortOrder: 0,
  },
  {
    id: "want-to-read",
    name: "Want To Read",
    url: getReadingListUrl("want-to-read"),
    icon: "book-open",
    isDefault: true,
    isPinned: true,
    sortOrder: 1,
  },
  {
    id: "completed",
    name: "Completed",
    url: getReadingListUrl("completed"),
    icon: "completed",
    isDefault: true,
    isPinned: true,
    sortOrder: 2,
  },
]
