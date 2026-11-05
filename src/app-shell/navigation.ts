import {
  FolderHeart,
  House,
  Library,
  NotebookPen,
  type LucideIcon,
} from "lucide-react"

export type NavigationItem = {
  title: string
  url: string
  icon: LucideIcon
  items?: Omit<NavigationItem, "icon" | "items">[]
}

export const mainNavigation: NavigationItem[] = [
  { title: "Home", url: "/", icon: House },
  { title: "Library", url: "/library", icon: Library },
  { title: "Collections", url: "/collections", icon: FolderHeart },
  { title: "Annotations", url: "/annotations", icon: NotebookPen },
]
