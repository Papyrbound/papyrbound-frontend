"use client"

import { Fragment, Suspense, useSyncExternalStore } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import { MoonIcon, SunIcon } from "lucide-react"
import { SidebarTrigger } from "@/shared/ui/sidebar"
import { Button } from "@/shared/ui/button"
import { BookSearchDialog } from "@/features/home/ui/book-search-dialog"
import { AddBookDialog } from "@/features/library/ui/add-book-dialog"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/shared/ui/breadcrumb"
import { useCollections } from "@/features/collections/stores/collections-store"
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store"

const routeLabels: Record<string, string> = {
  "/": "Home",
  "/library": "Library",
  "/collections": "Collections",
  "/annotations": "Annotations",
  "/reading-lists": "Reading lists",
}

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
  return () => observer.disconnect()
}
const getSnapshot = () => document.documentElement.classList.contains("dark")
const getServerSnapshot = () => false

function RouteBreadcrumbs({ pathname }: { pathname: string }) {
  const searchParams = useSearchParams()
  const { collections } = useCollections()
  const { books, lists } = useReadingLists()
  const segments = pathname.split("/").filter(Boolean)
  const items = segments.length === 0 ? [{ label: "Home", href: "/" }] : segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`
    const label = routeLabels[href]
      ?? collections.find((collection) => collection.id === segment)?.name
      ?? lists.find((list) => list.id === segment)?.name
      ?? books.find((book) => book.id === segment)?.title
      ?? decodeURIComponent(segment).replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
    return { label, href }
  })
  const selectedCollection = pathname === "/collections" ? collections.find((collection) => collection.id === searchParams.get("collection")) : undefined
  const selectedList = pathname === "/reading-lists" ? lists.find((list) => list.id === searchParams.get("list")) : undefined
  const selectedName = selectedCollection?.name ?? selectedList?.name
  if (selectedName) items.push({ label: selectedName, href: `${pathname}?${searchParams.toString()}` })

  return <Breadcrumb className="min-w-0 flex-1">
    <BreadcrumbList className="flex-nowrap overflow-hidden text-sm">
      {items.map((item, index) => <Fragment key={item.href}>
        {index > 0 && <BreadcrumbSeparator className="shrink-0" />}
        <BreadcrumbItem className="min-w-0">
          {index === items.length - 1 ? <BreadcrumbPage className="truncate" title={item.label}>{item.label}</BreadcrumbPage> : <BreadcrumbLink render={<Link href={item.href} />} className="truncate" title={item.label}>{item.label}</BreadcrumbLink>}
        </BreadcrumbItem>
      </Fragment>)}
    </BreadcrumbList>
  </Breadcrumb>
}

export function AppHeader() {
  const pathname = usePathname()
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return (
    <header className="app-header flex shrink-0 items-center gap-3">
      <SidebarTrigger className="text-muted-foreground" />
      <span className="h-4 w-px bg-border" aria-hidden="true" />
      <Suspense fallback={<span className="min-w-0 flex-1 truncate text-sm">{routeLabels[pathname] ?? "Papyrbound"}</span>}><RouteBreadcrumbs pathname={pathname} /></Suspense>
      <div className="ml-auto flex shrink-0 items-center gap-2">
      <Button
        className="text-muted-foreground"
        variant="ghost"
        size="icon"
        aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
        onClick={() => document.documentElement.classList.toggle("dark")}
      >
        {dark ? <SunIcon /> : <MoonIcon />}
      </Button>
      <BookSearchDialog />
      <AddBookDialog />
      </div>
    </header>
  )
}
