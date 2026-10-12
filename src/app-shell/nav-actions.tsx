"use client"

import { useState } from "react"
import Link from "next/link"
import {
  BookOpenIcon,
  FolderHeartIcon,
  ListIcon,
  MoreHorizontalIcon,
  NotebookPenIcon,
  StarIcon,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/shared/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/ui/sidebar"

type HeaderAction = {
  label: string
  url: string
  icon: LucideIcon
}

const actionGroups: HeaderAction[][] = [
  [
    { label: "Open library", url: "/library", icon: BookOpenIcon },
    { label: "View collections", url: "/collections", icon: FolderHeartIcon },
  ],
  [
    { label: "Reading lists", url: "/reading-lists", icon: ListIcon },
    { label: "Annotations", url: "/annotations", icon: NotebookPenIcon },
  ],
]

export function NavActions() {
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="hidden font-medium text-muted-foreground md:inline-block">
        Local library
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        aria-pressed={isFavorite}
        onClick={() => setIsFavorite((favorite) => !favorite)}
      >
        <StarIcon className={isFavorite ? "fill-current" : undefined} />
      </Button>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 data-open:bg-accent"
              aria-label="Open page actions"
            />
          }
        >
          <MoreHorizontalIcon />
        </PopoverTrigger>
        <PopoverContent
          className="w-56 overflow-hidden rounded-lg p-0"
          align="end"
        >
          <Sidebar collapsible="none" className="bg-transparent">
            <SidebarContent>
              {actionGroups.map((group, groupIndex) => (
                <SidebarGroup
                  key={groupIndex}
                  className="border-b last:border-none"
                >
                  <SidebarGroupContent className="gap-0">
                    <SidebarMenu>
                      {group.map((item) => (
                        <SidebarMenuItem key={item.label}>
                          <SidebarMenuButton render={<Link href={item.url} />}>
                            <item.icon />
                            <span>{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
            </SidebarContent>
          </Sidebar>
        </PopoverContent>
      </Popover>
    </div>
  )
}
