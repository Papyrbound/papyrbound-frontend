"use client"

import { Suspense, type ComponentProps } from "react"
import Link from "next/link"

import { mainNavigation } from "@/app-shell/navigation"
import { NavMain } from "@/app-shell/nav-main"
import { localProfile } from "@/features/profile/model/profile"
import { NavProfile } from "@/features/profile/ui/nav-profile"
import { NavReadingLists } from "@/features/reading-lists/ui/nav-reading-lists"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/ui/sidebar"
import { GalleryVerticalEndIcon } from "lucide-react"

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const { isMobile, setOpenMobile } = useSidebar()
  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="Papyrbound" render={<Link href="/" onClick={() => setOpenMobile(false)} />}>
              <GalleryVerticalEndIcon aria-hidden="true" />
              <span className="font-medium group-data-[collapsible=icon]:hidden">Papyrbound</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent onClick={(event) => {
        if (isMobile && event.target instanceof Element && event.target.closest("a[href]")) setOpenMobile(false)
      }}>
        <NavMain items={mainNavigation} />
        <Suspense fallback={null}>
          <NavReadingLists />
        </Suspense>
      </SidebarContent>
      <SidebarFooter>
        <NavProfile profile={localProfile} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
