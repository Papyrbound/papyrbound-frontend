export type ReadingListIcon = "heart" | "book-open" | "completed" | "tag"

export type ReadingList = {
  id: string
  name: string
  url: string
  icon: ReadingListIcon
  isDefault?: boolean
  isPinned?: boolean
  sortOrder: number
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
