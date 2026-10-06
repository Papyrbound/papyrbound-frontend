"use client"

import { usePathname } from "next/navigation"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/shared/ui/breadcrumb"
import { Separator } from "@/shared/ui/separator"
import { SidebarTrigger } from "@/shared/ui/sidebar"

const routeLabels: Record<string, string> = {
  "/": "Home",
  "/library": "Library",
  "/collections": "Collections",
  "/annotations": "Annotations",
  "/reading-lists": "Reading Lists",
}

export function AppHeader() {
  const pathname = usePathname()
  const label = routeLabels[pathname] ?? "Papyrbound"

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <SidebarTrigger className="-ml-1 p-2 bg-control/40 hover:bg-control/70 cursor-pointer" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{label}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}
