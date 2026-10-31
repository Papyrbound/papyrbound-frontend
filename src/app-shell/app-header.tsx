"use client";

import { Fragment, Suspense } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutGridIcon,
  ListIcon,
  PanelRightIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useWorkspace } from "./workspace-store";
import { SidebarTrigger } from "@/shared/ui/sidebar";
import { Button } from "@/shared/ui/button";
import { LibraryFilter } from "@/features/library/ui/library-filter";
import { AddBookDialog } from "@/features/library/ui/add-book-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb";
import { useCollections } from "@/features/collections/stores/collections-store";
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";

const routeLabels: Record<string, string> = {
  "/": "Reading Now",
  "/library": "Library",
  "/collections": "Collections",
  "/annotations": "Annotations",
  "/reading-lists": "Reading lists",
  "/reading-titles": "Reading titles",
  "/reading-activity": "Reading activity",
  "/settings": "Settings",
};

function RouteBreadcrumbs({ pathname }: { pathname: string }) {
  const searchParams = useSearchParams();
  const { collections } = useCollections();
  const { books, lists } = useReadingLists();
  const segments = pathname.split("/").filter(Boolean);
  const items =
    segments.length === 0
      ? [{ label: "Reading Now", href: "/" }]
      : segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const label =
            routeLabels[href] ??
            collections.find((collection) => collection.id === segment)?.name ??
            lists.find((list) => list.id === segment)?.name ??
            books.find((book) => book.id === segment)?.title ??
            decodeURIComponent(segment)
              .replace(/[-_]/g, " ")
              .replace(/\b\w/g, (letter) => letter.toUpperCase());
          return { label, href };
        });
  const selectedCollection =
    pathname === "/collections"
      ? collections.find(
          (collection) => collection.id === searchParams.get("collection"),
        )
      : undefined;
  const selectedList =
    pathname === "/reading-lists"
      ? lists.find((list) => list.id === searchParams.get("list"))
      : undefined;
  const selectedName = selectedCollection?.name ?? selectedList?.name;
  if (selectedName)
    items.push({
      label: selectedName,
      href: `${pathname}?${searchParams.toString()}`,
    });

  return (
    <Breadcrumb className="min-w-0 flex-1">
      <BreadcrumbList className="flex-nowrap overflow-hidden text-sm">
        {items.map((item, index) => (
          <Fragment key={item.href}>
            {index > 0 && <BreadcrumbSeparator className="shrink-0" />}
            <BreadcrumbItem className="min-w-0">
              {index === items.length - 1 ? (
                <BreadcrumbPage className="truncate" title={item.label}>
                  {item.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  render={<Link href={item.href} />}
                  className="truncate"
                  title={item.label}
                >
                  {item.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { view, setView, panelOpen, setPanelOpen } = useWorkspace();
  const gallery =
    pathname === "/library" ||
    pathname === "/reading-lists" ||
    pathname === "/collections";
  const hasPanel = gallery || pathname === "/";
  return (
    <header className="flex h-16 shrink-0 items-center border-b border-border/55 bg-background px-4">
      <SidebarTrigger className="mr-3 text-muted-foreground md:hidden" />
      <div className="mr-[19px] hidden items-center gap-1 md:flex">
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="Go back"
          onClick={() => router.back()}
        >
          <ChevronLeft className="size-[17px] text-muted-foreground" />
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="Go forward"
          onClick={() => router.forward()}
        >
          <ChevronRight className="size-[17px] text-muted-foreground" />
        </Button>
      </div>
      <Suspense fallback={<span className="flex-1 text-sm">Papyrbound</span>}>
        <RouteBreadcrumbs pathname={pathname} />
      </Suspense>
      <div className="ml-auto flex items-center gap-4">
        {pathname === "/library" && <LibraryFilter iconOnly />}
        <AddBookDialog />
        {gallery && (
          <div
            className="flex h-10 w-[88px] items-center justify-center gap-1 rounded-xl border border-soft-border bg-secondary p-1 shadow-soft"
            role="group"
            aria-label="Library view"
          >
            {(["grid", "list"] as const).map((v) => (
              <Button
                key={v}
                variant="ghost"
                size="icon-sm"
                className={
                  view === v
                    ? "h-8 w-[36px] rounded-lg bg-selected shadow-soft"
                    : "h-8 w-[36px] rounded-lg text-muted-foreground"
                }
                aria-label={`${v} view`}
                aria-pressed={view === v}
                onClick={() => setView(v)}
              >
                {v === "grid" ? <LayoutGridIcon /> : <ListIcon />}
              </Button>
            ))}
          </div>
        )}
        {hasPanel && (
          <Button
            variant="outline"
            size="icon"
            className="rounded-lg"
            aria-label={panelOpen ? "Hide details panel" : "Show details panel"}
            aria-pressed={panelOpen}
            onClick={() => setPanelOpen(!panelOpen)}
          >
            <PanelRightIcon />
          </Button>
        )}
      </div>
    </header>
  );
}
