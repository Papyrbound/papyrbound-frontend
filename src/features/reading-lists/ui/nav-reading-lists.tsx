"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import {
  BookOpenIcon,
  CheckCircle2Icon,
  CheckIcon,
  HeartIcon,
  ListFilterIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PinIcon,
  PinOffIcon,
  PlusIcon,
  TagIcon,
  Trash2Icon,
  type LucideIcon,
} from "lucide-react"

import {
  MAX_PINNED_CUSTOM_LISTS,
  type ReadingList,
  type ReadingListIcon,
} from "@/features/reading-lists/model/reading-list"
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
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

function ReadingListMenuItem({
  item,
  isActive,
  canPin,
  onDelete,
  onTogglePinned,
}: {
  item: ReadingList
  isActive: boolean
  canPin: boolean
  onDelete: (id: string) => void
  onTogglePinned: (id: string) => void
}) {
  const { isMobile } = useSidebar()
  const ListIcon = listIcons[item.icon]

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={<Link href={item.url} />}
        isActive={isActive}
        tooltip={item.name}
        className="hover:bg-sidebar-accent/70"
      >
        <ListIcon
          className="size-4 fill-none text-sidebar-foreground/70"
          aria-hidden="true"
        />
        <span>{item.name}</span>
        {item.isPinned && !item.isDefault ? (
          <PinIcon
            className="ml-auto text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden"
            aria-label="Pinned"
          />
        ) : null}
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
          <MoreHorizontalIcon />
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
              <DropdownMenuItem
                disabled={!item.isPinned && !canPin}
                onClick={() => onTogglePinned(item.id)}
              >
                {item.isPinned ? <PinOffIcon /> : <PinIcon />}
                {item.isPinned ? "Unpin from sidebar" : "Pin to sidebar"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(item.id)}
              >
                <Trash2Icon /> Delete list
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}

export function NavReadingLists() {
  const { state } = useSidebar()
  const { lists, createList, deleteList, togglePinned } = useReadingLists()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const selectedListId = searchParams.get("list")
  const [isCreating, setIsCreating] = useState(false)
  const [name, setName] = useState("")
  const [overflowQuery, setOverflowQuery] = useState("")

  const orderedLists = [...lists].sort(
    (first, second) => first.sortOrder - second.sortOrder
  )
  const pinnedCustomLists = orderedLists
    .filter((list) => !list.isDefault && list.isPinned)
    .slice(0, MAX_PINNED_CUSTOM_LISTS)
  const collapsedLists = [
    ...orderedLists.filter((list) => list.isDefault),
    ...pinnedCustomLists,
  ]
  const collapsedIds = new Set(collapsedLists.map((list) => list.id))
  const overflowLists = orderedLists.filter((list) => !collapsedIds.has(list.id))
  const normalizedQuery = overflowQuery.trim().toLocaleLowerCase()
  const filteredOverflowLists = normalizedQuery
    ? overflowLists.filter((list) =>
        list.name.toLocaleLowerCase().includes(normalizedQuery)
      )
    : overflowLists
  const visibleLists = state === "collapsed" ? collapsedLists : orderedLists
  const canPin = pinnedCustomLists.length < MAX_PINNED_CUSTOM_LISTS

  function submitList() {
    const trimmedName = name.trim()
    if (!trimmedName) return
    createList(trimmedName)
    setName("")
    setIsCreating(false)
  }

  return (
    <SidebarGroup>
      <div className="flex items-center justify-between group-data-[collapsible=icon]:hidden">
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
        {visibleLists.map((item) => (
          <ReadingListMenuItem
            key={item.id}
            item={item}
            isActive={
              pathname === "/reading-lists" && selectedListId === item.id
            }
            canPin={canPin}
            onDelete={deleteList}
            onTogglePinned={togglePinned}
          />
        ))}

        {state === "collapsed" && overflowLists.length > 0 ? (
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    aria-label={`More reading lists (${overflowLists.length})`}
                    tooltip="More reading lists"
                  />
                }
              >
                <ListFilterIcon />
                <span>More lists</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-64"
                side="right"
                align="start"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    {overflowLists.length} more reading lists
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <div className="px-1.5 pb-1.5">
                  <Input
                    value={overflowQuery}
                    onChange={(event) => setOverflowQuery(event.target.value)}
                    onKeyDown={(event) => event.stopPropagation()}
                    placeholder="Find a list"
                    aria-label="Find a reading list"
                    className="h-9"
                  />
                </div>
                <DropdownMenuSeparator />
                {filteredOverflowLists.length > 0 ? (
                  filteredOverflowLists.map((item) => {
                    const ListIcon = listIcons[item.icon]

                    return (
                      <DropdownMenuItem
                        key={item.id}
                        render={<Link href={item.url} />}
                      >
                        <ListIcon />
                        <span>{item.name}</span>
                      </DropdownMenuItem>
                    )
                  })
                ) : (
                  <p className="px-3.5 py-3 text-sm text-muted-foreground">
                    No matching lists
                  </p>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ) : null}

        {isCreating ? (
          <li className="space-y-2 rounded-lg bg-sidebar-accent/50 p-2 group-data-[collapsible=icon]:hidden">
            <Input
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") submitList()
                if (event.key === "Escape") setIsCreating(false)
              }}
              placeholder="List name"
              className="h-8 bg-sidebar"
            />
            <div className="flex justify-end">
              <Button
                size="icon-xs"
                onClick={submitList}
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
