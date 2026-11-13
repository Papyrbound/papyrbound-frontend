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
import { TooltipHint } from "@/shared/ui/tooltip";
import { LibraryFilter } from "@/features/library/ui/library-filter";
import { AddBookDialog } from "@/features/library/ui/add-book-dialog";
import { CollectionToolbar } from "@/features/collections/ui/collections-page";
import { AnnotationsToolbar } from "@/features/annotations/ui/annotations-page";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb";
import { useCollections } from "@/features/collections/stores/collections-store";
import { useActiveLibrary } from "@/features/library/model/use-active-library";

const routeLabels: Record<string, string> = {
  "/": "Reading Now",
  "/library": "Library",
  "/collections": "Collections",
  "/annotations": "Annotations",
  "/reading-lists": "Reading lists",
  "/reading-titles": "Reading titles",
  "/reading-activity": "Reading activity",
  "/settings": "Settings",
  "/profile": "Profile",
};

function RouteBreadcrumbs({ pathname }: { pathname: string }) {
  const searchParams = useSearchParams();
  const { collections: allCollections } = useCollections();
  const { books, lists, kind } = useActiveLibrary();
  const collections = allCollections.filter((collection) => (collection.kind ?? "books") === kind);
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
                <TooltipHint content={item.label}>
                <BreadcrumbPage className="truncate" tabIndex={0}>
                  {item.label}
                </BreadcrumbPage>
                </TooltipHint>
              ) : (
                <TooltipHint content={item.label}>
                <BreadcrumbLink
                  render={<Link href={item.href} />}
                  className="truncate"
                >
                  {item.label}
                </BreadcrumbLink>
                </TooltipHint>
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
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center border-b border-border/55 bg-background px-4">
      <SidebarTrigger className="mr-3 text-muted-foreground md:hidden" />
      <div className="mr-[19px] hidden items-center gap-1 md:flex">
        <TooltipHint content="Go back"><Button
          size="icon-sm"
          variant="ghost"
          aria-label="Go back"
          onClick={() => router.back()}
        >
          <ChevronLeft className="size-[17px] text-muted-foreground" />
        </Button></TooltipHint>
        <TooltipHint content="Go forward"><Button
          size="icon-sm"
          variant="ghost"
          aria-label="Go forward"
          onClick={() => router.forward()}
        >
          <ChevronRight className="size-[17px] text-muted-foreground" />
        </Button></TooltipHint>
      </div>
      <Suspense fallback={<span className="flex-1 text-sm">Papyrbound</span>}>
        <RouteBreadcrumbs pathname={pathname} />
      </Suspense>
      <div className="ml-auto flex items-center gap-3">
        {pathname === "/annotations" && <AnnotationsToolbar />}
        {(pathname === "/library" || pathname === "/reading-lists") && (
          <LibraryFilter iconOnly />
        )}
        {pathname === "/collections" && (
          <Suspense>
            <CollectionToolbar />
          </Suspense>
        )}
        <AddBookDialog />
        {gallery && (
          <div
            className="flex h-8 w-[72px] items-center justify-center gap-1 rounded-lg border border-soft-border bg-secondary p-1 shadow-soft"
            role="group"
            aria-label="Library view"
          >
            {(["grid", "list"] as const).map((v) => (
              <TooltipHint key={v} content={v === "grid" ? "Grid view" : "List view"}><Button
                key={v}
                variant="ghost"
                size="icon-sm"
                className={
                  view === v
                    ? "h-6 w-7 rounded-md border-foreground/10 bg-selected text-foreground shadow-soft hover:bg-selected dark:bg-foreground/15 dark:hover:bg-foreground/20"
                    : "h-6 w-7 rounded-md text-muted-foreground"
                }
                aria-label={`${v} view`}
                aria-pressed={view === v}
                onClick={() => setView(v)}
              >
                {v === "grid" ? <LayoutGridIcon /> : <ListIcon />}
              </Button></TooltipHint>
            ))}
          </div>
        )}
        {hasPanel && (
          <TooltipHint content={panelOpen ? "Hide details panel" : "Show details panel"}><Button
            variant="outline"
            size="icon-sm"
            className="rounded-lg"
            aria-label={panelOpen ? "Hide details panel" : "Show details panel"}
            aria-pressed={panelOpen}
            onClick={() => setPanelOpen(!panelOpen)}
          >
            <PanelRightIcon />
          </Button></TooltipHint>
        )}
      </div>
    </header>
  );
}
