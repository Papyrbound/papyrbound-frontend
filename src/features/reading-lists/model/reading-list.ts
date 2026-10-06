export type ReadingListIcon = "heart" | "book-open" | "completed" | "tag"

export type ReadingList = {
  id: string
  name: string
  url: string
  icon: ReadingListIcon
  isDefault?: boolean
}

export const defaultReadingLists: ReadingList[] = [
  {
    id: "favourites",
    name: "Favourites",
    url: "/reading-lists#favourites",
    icon: "heart",
    isDefault: true,
  },
  {
    id: "want-to-read",
    name: "Want To Read",
    url: "/reading-lists#want-to-read",
    icon: "book-open",
    isDefault: true,
  },
  {
    id: "completed",
    name: "Completed",
    url: "/reading-lists#completed",
    icon: "completed",
    isDefault: true,
  },
]
