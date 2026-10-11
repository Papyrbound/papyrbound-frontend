"use client"

import { useSyncExternalStore } from "react"
import { usePathname } from "next/navigation"
import { MoonIcon, SunIcon } from "lucide-react"
import { SidebarTrigger } from "@/shared/ui/sidebar"
import { Button } from "@/shared/ui/button"

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
    <header className="app-header flex shrink-0 items-center gap-3">
      <SidebarTrigger className="text-muted-foreground" />
      <span className="h-4 w-px bg-border" aria-hidden="true" />
      <span className="text-sm">{routeLabels[pathname] ?? "Papyrbound"}</span>
      <Button
        className="ml-auto text-muted-foreground"
        variant="ghost"
        size="icon"
        aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
        onClick={() => document.documentElement.classList.toggle("dark")}
      >
        {dark ? <SunIcon /> : <MoonIcon />}
      </Button>
    </header>
  )
}
