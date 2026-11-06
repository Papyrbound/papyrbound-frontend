"use client";
import { Suspense, type ComponentProps } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  BookOpen,
  PanelsTopLeft,
  Settings,
  Library,
  Highlighter,
  Heart,
  Folder,
  Bookmark,
  CircleCheck,
  Plus,
  Tag,
} from "lucide-react";
import { useSettingsUI } from "@/features/profile/stores/settings-ui-store";
import { NavProfile } from "@/features/profile/ui/nav-profile";
import { BookSearchDialog } from "@/features/home/ui/book-search-dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/shared/ui/sidebar";
import { useWorkspace } from "@/app-shell/workspace-store";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/shared/ui/dropdown-menu";
import { Button } from "@/shared/ui/button";
import { useLocalUIState } from "@/shared/hooks/use-local-ui-state";
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";
import { ReadingListEditor } from "@/features/reading-lists/ui/reading-list-editor";
import { AddBookDialog } from "@/features/library/ui/add-book-dialog";

const navigation = [
  { label: "Reading Now", href: "/", icon: BookOpen },
  { label: "Library", href: "/library", icon: Library },
  { label: "Annotations", href: "/annotations", icon: Highlighter },
];
const shelves = [
  { label: "Favourites", href: "/reading-lists?list=favourites", icon: Heart },
  { label: "Collections", href: "/collections", icon: Folder },
  {
    label: "Want to Read",
    href: "/reading-lists?list=want-to-read",
    icon: Bookmark,
  },
  {
    label: "Finished",
    href: "/reading-lists?list=completed",
    icon: CircleCheck,
  },
];
const descriptions: Record<string, string> = {
  "Reading Now": "Pick up where you left off",
  Library: "All your books in one place",
  Annotations: "Highlights and notes",
  Favourites: "Books you love",
  Collections: "Stories, grouped your way",
  "Want to Read": "Your next chapter",
  Finished: "Books you’ve completed",
};
function Navigation() {
  const labels = useSettingsUI((s) => s.labels);
  const { lists, createList } = useReadingLists();
  const [creating, setCreating] = useLocalUIState(false);
  const path = usePathname();
  const search = useSearchParams();
  const { setOpenMobile } = useSidebar();
  function links(items: typeof navigation) {
    return (
      <SidebarMenu>
        {items.map(({ label, href, icon: Icon }) => (
          <SidebarMenuItem key={href}>
            <SidebarMenuButton
              className={`h-[52px] gap-3 rounded-xl px-2.5 text-[13px] leading-4 hover:bg-muted/70 data-active:bg-muted/80 data-active:font-normal ${labels ? "" : "[&>span:last-child]:sr-only"}`}
              isActive={
                href.includes("?")
                  ? path + "?" + search.toString() === href
                  : path === href
              }
              render={<Link href={href} onClick={() => setOpenMobile(false)} />}
            >
              <Icon
                className="size-6 shrink-0 text-muted-foreground"
                strokeWidth={1.5}
              />
              <span className="grid min-w-0 gap-1">
                <span className="truncate font-medium">{label}</span>
                <span className="truncate text-xs font-normal text-muted-foreground">{descriptions[label] ?? "Your personal reading shelf"}</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    );
  }
  return (
    <>
      <div className="px-2">{links(navigation)}</div>
      <div className="mt-4 px-2">
        <div className="mb-3 flex h-5 items-center justify-between px-2">
          <Link
            href="/reading-lists"
            className="text-[11px] leading-5 text-muted-foreground hover:text-foreground"
          >
            Shelves
          </Link>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Create reading list"
            onClick={() => setCreating(true)}
          >
            <Plus />
          </Button>
        </div>
        {links([
          ...shelves,
          ...lists
            .filter((list) => !list.isDefault)
            .map((list) => ({ label: list.name, href: list.url, icon: Tag })),
        ])}
      </div>
      {creating && (
        <ReadingListEditor
          onClose={() => setCreating(false)}
          onSave={(details) => {
            createList(details);
            setCreating(false);
          }}
        />
      )}
    </>
  );
}
export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  const libraryKind = useWorkspace((state) => state.libraryKind);
  const setLibraryKind = useWorkspace((state) => state.setLibraryKind);
  return (
    <Sidebar variant="floating" collapsible="offcanvas" className="[&_[data-slot=sidebar-inner]]:rounded-[24px]" {...props}>
      <SidebarHeader className="gap-2 px-2 pb-0 pt-2">
        <Link href="/" className="sr-only">
          Papyrbound
        </Link>
        <div className="grid grid-cols-3 gap-2">
        <BookSearchDialog compact />
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`Library type: ${libraryKind === "books" ? "Books" : "Comics"}`}
            render={
              <Button
                variant="secondary"
                title={libraryKind === "books" ? "Books" : "Comics"}
                className="h-9 w-full justify-center rounded-full border-0 bg-muted text-muted-foreground shadow-none hover:bg-accent"
              />
            }
          >
            {libraryKind === "books" ? (
              <BookOpen aria-hidden="true" strokeWidth={1.5} />
            ) : (
              <PanelsTopLeft aria-hidden="true" strokeWidth={1.5} />
            )}
            <span className="sr-only">{libraryKind === "books" ? "Books" : "Comics"}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-40"
          >
            <DropdownMenuRadioGroup
              value={libraryKind}
              onValueChange={(value) => {
                if (value === "books" || value === "comics")
                  setLibraryKind(value);
              }}
            >
              <DropdownMenuRadioItem value="books" closeOnClick>
                <BookOpen
                  aria-hidden="true"
                  className="text-current"
                  strokeWidth={1.5}
                />
                Books
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="comics" closeOnClick>
                <PanelsTopLeft
                  aria-hidden="true"
                  className="text-current"
                  strokeWidth={1.5}
                />
                Comics
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <AddBookDialog compact />
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-0 pt-2">
        <Suspense>
          <Navigation />
        </Suspense>
      </SidebarContent>
      <SidebarFooter className="gap-3 px-2 pb-2 pt-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/settings" />} className="h-9 rounded-xl px-3 text-muted-foreground">
              <Settings strokeWidth={1.5} />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <NavProfile />
      </SidebarFooter>
    </Sidebar>
  );
}
