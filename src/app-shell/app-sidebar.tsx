"use client"

import { Suspense, type ComponentProps } from "react"

import { mainNavigation } from "@/app-shell/navigation"
import { NavMain } from "@/app-shell/nav-main"
import { TeamSwitcher } from "@/app-shell/team-switcher"
import { localProfile } from "@/features/profile/model/profile"
import { NavProfile } from "@/features/profile/ui/nav-profile"
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

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
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
