"use client"

import { useSyncExternalStore } from "react"
import { usePathname } from "next/navigation"
<<<<<<< HEAD
import { MoonIcon, SunIcon } from "lucide-react"
=======

import { NavActions } from "@/app-shell/nav-actions"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/shared/ui/breadcrumb"
import { Separator } from "@/shared/ui/separator"
>>>>>>> ffc4d700659f5630b3cf220aaac2e7c869e897f7
import { SidebarTrigger } from "@/shared/ui/sidebar"
import { Button } from "@/shared/ui/button"
import { BookSearchDialog } from "@/features/home/ui/book-search-dialog"
import { AddBookDialog } from "@/features/library/ui/add-book-dialog"

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

export function AppHeader() {
  const pathname = usePathname()
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return (
<<<<<<< HEAD
    <header className="app-header flex shrink-0 items-center gap-3">
      <SidebarTrigger className="text-muted-foreground" />
      <span className="h-4 w-px bg-border" aria-hidden="true" />
      <span className="text-sm">{routeLabels[pathname] ?? "Papyrbound"}</span>
      <div className="ml-auto flex items-center gap-2">
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
=======
    <header className="flex h-14 shrink-0 items-center gap-2">
      <div className="flex flex-1 items-center gap-2 px-3">
        <SidebarTrigger />
        <Separator
          orientation="vertical"
          className="mr-2 data-vertical:h-4 data-vertical:self-auto"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="line-clamp-1">{label}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="ml-auto px-3">
        <NavActions />
>>>>>>> ffc4d700659f5630b3cf220aaac2e7c869e897f7
      </div>
    </header>
  )
}
