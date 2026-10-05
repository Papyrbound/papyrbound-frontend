"use client"

import { useState } from "react"
import { MoreHorizontalIcon, PencilIcon, Trash2Icon, PlusIcon, CheckIcon, TagIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

type ReadingList = {
  name: string
  url: string
  icon?: React.ReactNode
  color: ColorName
  isDefault?: boolean
}

type ColorName = "rose" | "blue" | "green" | "amber" | "violet" | "neutral"

const colorClasses: Record<ColorName, string> = {
  rose: "bg-rose-100 text-rose-600",
  blue: "bg-blue-100 text-blue-600",
  green: "bg-emerald-100 text-emerald-600",
  amber: "bg-amber-100 text-amber-700",
  violet: "bg-violet-100 text-violet-600",
  neutral: "bg-neutral-200 text-neutral-600",
}

const colorOptions: ColorName[] = ["rose", "blue", "green", "amber", "violet", "neutral"]

export function NavReadingLists({
  readingLists,
}: {
  readingLists: ReadingList[]
}) {
  const { isMobile } = useSidebar()
  const [lists, setLists] = useState(readingLists)
  const [isCreating, setIsCreating] = useState(false)
  const [name, setName] = useState("")
  const [color, setColor] = useState<ColorName>("violet")

  function createList() {
    const trimmedName = name.trim()
    if (!trimmedName) return
    setLists((current) => [
      ...current,
      { name: trimmedName, url: "#", color },
    ])
    setName("")
    setColor("violet")
    setIsCreating(false)
  }

  function deleteList(nameToDelete: string) {
    setLists((current) => {
      if (current.find((list) => list.name === nameToDelete)?.isDefault) {
        return current
      }
      return current.filter((list) => list.name !== nameToDelete)
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
        {lists.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton render={<a href={item.url} />} className="hover:bg-sidebar-accent">
              {item.isDefault && item.icon ? (
                <span className={cn("flex size-5 items-center justify-center", colorClasses[item.color].split(" ")[1])} aria-hidden="true">{item.icon}</span>
              ) : (
                <TagIcon className={cn("size-4", colorClasses[item.color].split(" ")[1])} aria-hidden="true" />
              )}
              <span>{item.name}</span>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger render={<SidebarMenuAction showOnHover className="aria-expanded:bg-muted" />}>
                <MoreHorizontalIcon />
                <span className="sr-only">More options for {item.name}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-fit" side={isMobile ? "bottom" : "right"} align={isMobile ? "end" : "start"}>
                <DropdownMenuItem><PencilIcon /> Rename list</DropdownMenuItem>
                {!item.isDefault ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => deleteList(item.name)}><Trash2Icon /> Delete list</DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}

        {isCreating ? (
          <li className="space-y-2 rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-2">
            <Input autoFocus value={name} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") createList(); if (event.key === "Escape") setIsCreating(false) }} placeholder="List name" className="h-8 bg-sidebar" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Tag color</span>
              <div className="flex flex-1 items-center justify-end gap-1">
                {colorOptions.map((option) => <button key={option} type="button" onClick={() => setColor(option)} className={cn("size-5 rounded-full border-2 border-transparent", colorClasses[option].split(" ")[0], color === option && "border-foreground")} aria-label={`Use ${option} color`} />)}
              </div>
              <Button size="icon-xs" onClick={createList} aria-label="Create list"><CheckIcon /></Button>
            </div>
          </li>
        ) : null}
      </SidebarMenu>
    </SidebarGroup>
  )
}
