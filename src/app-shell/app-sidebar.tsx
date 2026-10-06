"use client"

import * as React from "react"

import { mainNavigation } from "@/app-shell/navigation"
import { NavMain } from "@/app-shell/nav-main"
import { TeamSwitcher } from "@/app-shell/team-switcher"
import { localProfile } from "@/features/profile/model/profile"
import { NavProfile } from "@/features/profile/ui/nav-profile"
import { defaultReadingLists } from "@/features/reading-lists/model/reading-list"
import { NavReadingLists } from "@/features/reading-lists/ui/nav-reading-lists"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/shared/ui/sidebar"
import { GalleryVerticalEndIcon } from "lucide-react"

const data = {
  teams: [
    {
      name: "Papyrbound",
      logo: <GalleryVerticalEndIcon />,
      plan: "Personal Library",
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={mainNavigation} />
        <NavReadingLists readingLists={defaultReadingLists} />
      </SidebarContent>
      <SidebarFooter>
        <NavProfile profile={localProfile} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
