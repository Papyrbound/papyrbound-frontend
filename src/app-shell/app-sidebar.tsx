"use client";
import { Suspense, type ComponentProps } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  BookOpen,
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
import { Button } from "@/shared/ui/button";
import { useLocalUIState } from "@/shared/hooks/use-local-ui-state";
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";
import { ReadingListEditor } from "@/features/reading-lists/ui/reading-list-editor";

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
              className={`h-8 rounded-lg px-3 text-[13px] leading-4 ${labels ? "" : "[&>span]:sr-only"}`}
              isActive={
                href.includes("?")
                  ? path + "?" + search.toString() === href
                  : path === href
              }
              render={<Link href={href} onClick={() => setOpenMobile(false)} />}
            >
              <Icon
                className="size-4 text-muted-foreground"
                strokeWidth={1.5}
              />
              <span>{label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    );
  }
  return (
    <>
      <div className="px-3">{links(navigation)}</div>
      <div className="mt-6 px-3">
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
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="gap-4 px-3 pb-0 pt-4">
        <Link href="/" className="h-8 px-2 text-lg font-semibold leading-8">
          Papyrbound
        </Link>
        <BookSearchDialog />
      </SidebarHeader>
      <SidebarContent className="gap-0 pt-4">
        <Suspense>
          <Navigation />
        </Suspense>
      </SidebarContent>
      <SidebarFooter className="px-5 pb-5 pt-3">
        <NavProfile />
      </SidebarFooter>
    </Sidebar>
  );
}
