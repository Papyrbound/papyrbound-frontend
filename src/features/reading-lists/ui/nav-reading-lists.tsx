"use client"

import { useState } from "react"
import Link from "next/link"
import {
  BookOpenIcon,
  CheckCircle2Icon,
  CheckIcon,
  HeartIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  TagIcon,
  Trash2Icon,
  type LucideIcon,
} from "lucide-react"

import type {
  ReadingList,
  ReadingListIcon,
} from "@/features/reading-lists/model/reading-list"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/ui/sidebar"

const listIcons: Record<ReadingListIcon, LucideIcon> = {
  heart: HeartIcon,
  "book-open": BookOpenIcon,
  completed: CheckCircle2Icon,
  tag: TagIcon,
}

export function NavReadingLists({
  readingLists,
}: {
  readingLists: ReadingList[]
}) {
  const { isMobile } = useSidebar()
  const [lists, setLists] = useState(readingLists)
  const [isCreating, setIsCreating] = useState(false)
  const [name, setName] = useState("")

  function createList() {
    const trimmedName = name.trim()
    if (!trimmedName) return
    const id = crypto.randomUUID()
    setLists((current) => [
      ...current,
      {
        id,
        name: trimmedName,
        url: `/reading-lists#${id}`,
        icon: "tag",
      },
    ])
    setName("")
    setIsCreating(false)
  }

  function deleteList(id: string) {
    setLists((current) => {
      if (current.find((list) => list.id === id)?.isDefault) {
        return current
      }
      return current.filter((list) => list.id !== id)
    })
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <div className="flex items-center justify-between">
        <SidebarGroupLabel>Reading Lists</SidebarGroupLabel>
        <Button
          variant="ghost"
          size="icon-xs"
          className="mr-2 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          onClick={() => setIsCreating((open) => !open)}
          aria-label="Create reading list"
        >
          <PlusIcon />
        </Button>
      </div>

      <SidebarMenu>
        {lists.map((item) => {
          const ListIcon = listIcons[item.icon]

          return (
            <SidebarMenuItem key={item.id} className="flex items-center justify-center">
              <SidebarMenuButton
                render={<Link href={item.url} />}
                className="hover:bg-sidebar-accent/70"
              >
                <ListIcon
                  className="size-4 fill-none text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="text-accent-foreground hover:text-secondary-foreground">{item.name}</span>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <SidebarMenuAction
                      showOnHover
                      className="aria-expanded:bg-muted"
                    />
                  }
                  
                >
                  <MoreHorizontalIcon className="" />
                  <span className="sr-only">More options for {item.name}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-fit"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem>
                    <PencilIcon /> Rename list
                  </DropdownMenuItem>
                  {!item.isDefault ? (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => deleteList(item.id)}
                      >
                        <Trash2Icon /> Delete list
                      </DropdownMenuItem>
                    </>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          )
        })}

        {isCreating ? (
          <li className="space-y-2 rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-2">
            <Input
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") createList()
                if (event.key === "Escape") setIsCreating(false)
              }}
              placeholder="List name"
              className="h-8 bg-sidebar"
            />
            <div className="flex justify-end">
              <Button
                size="icon-xs"
                onClick={createList}
                aria-label="Create list"
              >
                <CheckIcon />
              </Button>
            </div>
          </li>
        ) : null}
      </SidebarMenu>
    </SidebarGroup>
  )
}
