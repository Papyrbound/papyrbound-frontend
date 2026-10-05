"use client"

import * as React from "react"

import { NavMain } from "@/components/navbar/nav-main"
import { NavReadingLists } from "@/components/navbar/nav-reading-lists"
import { NavUser } from "@/components/navbar/nav-user"
import { TeamSwitcher } from "@/components/navbar/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { GalleryVerticalEndIcon, House, Library, FolderHeart, NotebookPen, Heart, BookOpen, CheckCircle2 } from "lucide-react"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Papyrbound",
      logo: <GalleryVerticalEndIcon />,
      plan: "Personal Library",
    },
  ],
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: <House />,
      isActive: true,
    },
    {
      title: "Library",
      url: "/library",
      icon: <Library />,
    },
    {
      title: "Collections",
      url: "/collections",
      icon: <FolderHeart />,
    },
    {
      title: "Annotations",
      url: "/annotations",
      icon: <NotebookPen />,
    },
  ],
  readingLists: [
    {
      name: "Favourites",
      url: "#",
      icon: <Heart className="fill-current" />,
      color: "rose" as const,
      isDefault: true,
    },
    {
      name: "Want To Read",
      url: "#",
      icon: <BookOpen className="fill-current" />,
      color: "blue" as const,
      isDefault: true,
    },
    {
      name: "Completed",
      url: "#",
      icon: <CheckCircle2 className="fill-current stroke-white" />,
      color: "green" as const,
      isDefault: true,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavReadingLists readingLists={data.readingLists} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
