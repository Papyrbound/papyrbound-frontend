"use client";

import { Fragment, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LayoutGridIcon, ListIcon, PanelRightIcon } from "lucide-react";
import { useWorkspace } from "./workspace-store";
import { SidebarTrigger } from "@/shared/ui/sidebar";
import { Button } from "@/shared/ui/button";
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
  const { view, setView, panelOpen, setPanelOpen } = useWorkspace();
  const gallery =
    pathname === "/library" ||
    pathname === "/reading-lists" ||
    pathname === "/collections";
  const hasPanel = gallery || pathname === "/";
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border/60 px-5 lg:px-8">
      <SidebarTrigger className="text-muted-foreground" />
      <Suspense fallback={<span className="flex-1 text-sm">Papyrbound</span>}>
        <RouteBreadcrumbs pathname={pathname} />
      </Suspense>
      <div className="ml-auto flex items-center gap-3">
        <AddBookDialog />
        {gallery && (
          <div
            className="flex rounded-xl border border-white/80 bg-secondary p-1 shadow-sm"
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
                    ? "rounded-lg bg-background shadow-sm"
                    : "rounded-lg text-muted-foreground"
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
