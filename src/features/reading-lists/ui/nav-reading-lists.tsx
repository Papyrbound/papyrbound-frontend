"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconBookFilled,
  IconCircleCheckFilled,
  IconHeartFilled,
  IconTagFilled,
} from "@tabler/icons-react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  ArrowUpRightIcon,
  BookOpenIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  HeartIcon,
  ListFilterIcon,
  MinusIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PinIcon,
  PinOffIcon,
  PlusIcon,
  TagIcon,
  Trash2Icon,
  type LucideIcon,
} from "lucide-react";

import {
  MAX_PINNED_CUSTOM_LISTS,
  type ReadingList,
  type ReadingListIcon,
  getReadingListUrl,
} from "@/features/reading-lists/model/reading-list";
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { ReadingListEditor } from "./reading-list-editor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/ui/sidebar";

const listIcons: Record<ReadingListIcon, LucideIcon> = {
  heart: HeartIcon,
  "book-open": BookOpenIcon,
  completed: CheckCircle2Icon,
  tag: TagIcon,
};

const customListIcons = {
  heart: IconHeartFilled,
  "book-open": IconBookFilled,
  completed: IconCircleCheckFilled,
  tag: IconTagFilled,
};

function ReadingListMenuItem({
  item,
  isActive,
  canPin,
  onDelete,
  onTogglePinned,
  onEdit,
}: {
  item: ReadingList;
  isActive: boolean;
  canPin: boolean;
  onDelete: (id: string) => void;
  onTogglePinned: (id: string) => void;
  onEdit: (list: ReadingList) => void;
}) {
  const { isMobile } = useSidebar();
  const ListIcon = item.isDefault
    ? listIcons[item.icon]
    : customListIcons[item.icon];

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={<Link href={item.url} />}
        isActive={isActive}
        aria-current={isActive ? "page" : undefined}
        tooltip={item.name}
        className="reading-list-link hover:text-foreground focus-visible:text-foreground data-active:text-foreground"
      >
        <ListIcon
          className="size-4"
          style={item.color ? { color: item.color } : undefined}
          aria-hidden="true"
        />
        <span>{item.name}</span>
      </SidebarMenuButton>
      {!item.isDefault && (
        <SidebarMenuAction
          showOnHover
          className="list-pin-action"
          aria-label={`${item.isPinned ? "Unpin" : "Pin"} ${item.name}`}
          disabled={!item.isPinned && !canPin}
          onClick={() => onTogglePinned(item.id)}
        >
          {item.isPinned ? <PinOffIcon /> : <PinIcon />}
        </SidebarMenuAction>
      )}
      {!item.isDefault && (
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
            <DropdownMenuItem onClick={() => onEdit(item)}>
              <PencilIcon /> Edit list
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
      )}
    </SidebarMenuItem>
  );
}

export function NavReadingLists() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const { lists, createList, updateList, deleteList, togglePinned } =
    useReadingLists();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedListId = searchParams.get("list");
  const [isCreating, setIsCreating] = useState(false);
  const [editingList, setEditingList] = useState<ReadingList | undefined>();
  const [sectionOpen, setSectionOpen] = useState(true);
  const [overflowQuery, setOverflowQuery] = useState("");
  const isCollapsed = state === "collapsed" && !isMobile;

  const orderedLists = [...lists].sort(
    (first, second) => first.sortOrder - second.sortOrder,
  );
  const pinnedCustomLists = orderedLists
    .filter((list) => !list.isDefault && list.isPinned)
    .slice(0, MAX_PINNED_CUSTOM_LISTS);
  const collapsedLists = [
    ...orderedLists.filter((list) => list.isDefault),
    ...pinnedCustomLists,
  ];
  const collapsedIds = new Set(collapsedLists.map((list) => list.id));
  const overflowLists = orderedLists.filter(
    (list) => !collapsedIds.has(list.id),
  );
  const normalizedQuery = overflowQuery.trim().toLocaleLowerCase();
  const filteredOverflowLists = normalizedQuery
    ? overflowLists.filter((list) =>
        list.name.toLocaleLowerCase().includes(normalizedQuery),
      )
    : overflowLists;
  const visibleLists = isCollapsed ? collapsedLists : orderedLists;
  const canPin = pinnedCustomLists.length < MAX_PINNED_CUSTOM_LISTS;

  function openEditor(list?: ReadingList) {
    setEditingList(list);
    setIsCreating(true);
  }

  return (
    <SidebarGroup className="reading-lists-section [&_.reading-list-link[data-active]]:text-foreground text-muted-foreground [&_.reading-list-link]:text-muted-foreground [&_.list-pin-action]:[right:28px]">
      {isCollapsed ? (
        <div
          className="flex h-9 w-full shrink-0 items-center justify-center"
          aria-hidden="true"
        >
          <MinusIcon className="size-4 shrink-0" />
        </div>
      ) : (
        <div className="list-section-heading group/list hover:text-foreground focus-within:text-foreground flex items-center gap-[2px] p-[0_8px] min-h-[36px]">
          <button
            type="button"
            className="list-section-toggle max-[767px]:min-h-10 flex flex-1 items-center gap-[4px] min-w-0 text-left text-[12px] cursor-pointer"
            aria-expanded={sectionOpen}
            aria-controls="reading-lists-menu"
            onClick={() => setSectionOpen((open) => !open)}
          >
            Reading lists{" "}
            <ChevronDownIcon
              className={`list-heading-action size-3 opacity-0 transition-opacity duration-150 group-hover/list:opacity-100 group-focus-within/list:opacity-100 [@media(hover:none)]:opacity-100 max-[767px]:opacity-100 ${sectionOpen ? "" : "-rotate-90"}`}
              aria-hidden="true"
            />
          </button>
          <Button
            nativeButton={false}
            variant="ghost"
            size="icon-xs"
            className="list-heading-action opacity-0 transition-opacity duration-150 group-hover/list:opacity-100 group-focus-within/list:opacity-100 aria-expanded:opacity-100 [@media(hover:none)]:opacity-100 max-[767px]:opacity-100"
            aria-label="View all reading lists"
            title="View all reading lists"
            render={
              <Link
                href="/reading-lists"
                onClick={() => setOpenMobile(false)}
              />
            }
          >
            <ArrowUpRightIcon />
          </Button>
        </div>
      )}

      <SidebarMenu
        id="reading-lists-menu"
        hidden={!sectionOpen && !isCollapsed}
      >
        {visibleLists.map((item) => (
          <ReadingListMenuItem
            key={item.id}
            item={item}
            isActive={
              pathname === "/reading-lists" && selectedListId === item.id
            }
            canPin={canPin}
            onEdit={openEditor}
            onDelete={(id) => {
              deleteList(id);
              if (selectedListId === id) router.push("/reading-lists");
            }}
            onTogglePinned={togglePinned}
          />
        ))}

        {isCollapsed && overflowLists.length > 0 ? (
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
              <DropdownMenuContent className="w-64" side="right" align="start">
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
                    const ListIcon = item.isDefault
                      ? listIcons[item.icon]
                      : customListIcons[item.icon];

                    return (
                      <DropdownMenuItem
                        key={item.id}
                        render={<Link href={item.url} />}
                      >
                        <ListIcon
                          style={item.color ? { color: item.color } : undefined}
                        />
                        <span>{item.name}</span>
                      </DropdownMenuItem>
                    );
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

        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="Custom Reading List"
            onClick={() => openEditor()}
            className="reading-list-link hover:text-foreground focus-visible:text-foreground data-active:text-foreground"
          >
            <PlusIcon />
            <span>Custom Reading List</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      {isCreating && (
        <ReadingListEditor
          list={editingList}
          onClose={() => setIsCreating(false)}
          onSave={(details) => {
            const id = editingList ? editingList.id : createList(details);
            if (editingList) updateList(editingList.id, details);
            setIsCreating(false);
            if (isMobile) setOpenMobile(false);
            if (id) router.push(getReadingListUrl(id));
          }}
        />
      )}
    </SidebarGroup>
  );
}
