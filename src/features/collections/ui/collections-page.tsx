"use client";

import { create } from "zustand";
import { useIsCompactWindow } from "@/shared/hooks/use-mobile";

import { useRouter, useSearchParams } from "next/navigation";

import {
  Plus,
  Pin,
  PinOff,
  Pencil,
  BookPlus,
  Trash2,
  FolderOpen,
  Check,
  ListFilter,
  Folder,
  Clock,
  Languages,
  Calendar,
  ArrowUp,
  ArrowDown,
  BookOpen,
} from "lucide-react";

import { useCollections, type Collection } from "../stores/collections-store";

import { useActiveLibrary } from "@/features/library/model/use-active-library";

import { useWorkspace } from "@/app-shell/workspace-store";

import { BookCover } from "@/features/home/ui/book-cover";

import { LibraryFilter } from "@/features/library/ui/library-filter";

import { BookGallery } from "@/features/library/ui/book-gallery";

import { BookDetailsPanel } from "@/features/library/ui/book-details-panel";
import { ShelfStatusBar } from "@/features/library/ui/shelf-status-bar";

import { Button } from "@/shared/ui/button";

import { Input } from "@/shared/ui/input";

import { Checkbox } from "@/shared/ui/checkbox";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/shared/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/shared/ui/dropdown-menu";

const useCollectionUI = create<{
  selected: string | null;
  editor: Collection | "new" | null;
  deleting: Collection | null;
  sort: string;
  order: string;
  pinned: boolean;
  patch: (
    v: Partial<{
      selected: string | null;
      editor: Collection | "new" | null;
      deleting: Collection | null;
      sort: string;
      order: string;
      pinned: boolean;
    }>,
  ) => void;
}>((set) => ({
  selected: null,
  editor: null,
  deleting: null,
  sort: "added",
  order: "desc",
  pinned: false,
  patch: (v) => set(v),
}));

function date(value?: string) {
  return value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "Nothing added yet";
}

export function CollectionToolbar() {
  const ui = useCollectionUI();
  const search = useSearchParams();
  const { collections } = useCollections();
  const { kind, plural } = useActiveLibrary();
  const opened = collections.find((c) => c.id === search.get("collection") && (c.kind ?? "books") === kind);
  if (opened) return (
    <>
      <LibraryFilter iconOnly />
      <Button variant="secondary" onClick={() => ui.patch({ editor: opened })}>
        <BookPlus />
        Add {plural}
      </Button>
    </>
  );
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Filter collections"
          render={<Button variant="secondary" size="icon-sm" className="rounded-lg" />}
        >
          <ListFilter />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Show</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={ui.pinned ? "pinned" : "all"}
              onValueChange={(value) =>
                ui.patch({ pinned: value === "pinned" })
              }
            >
              <DropdownMenuRadioItem value="all">
                <Folder
                  aria-hidden="true"
                  className="text-muted-foreground"
                />
                All collections
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="pinned">
                <Pin
                  aria-hidden="true"
                  className="text-muted-foreground"
                />
                Pinned only
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={ui.sort}
              onValueChange={(sort) => ui.patch({ sort })}
            >
              {(
                [
                  ["added", "Last book added", Clock],
                  ["name", "Collection name", Languages],
                  ["created", "Date created", Calendar],
                ] as const
              ).map(([v, l, Icon]) => (
                <DropdownMenuRadioItem key={v} value={v}>
                  <Icon
                    aria-hidden="true"
                    className="text-muted-foreground"
                  />
                  {l}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>Order</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={ui.order}
              onValueChange={(order) => ui.patch({ order })}
            >
              <DropdownMenuRadioItem value="asc">
                <ArrowUp
                  aria-hidden="true"
                  className="text-muted-foreground"
                />
                Ascending
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="desc">
                <ArrowDown
                  aria-hidden="true"
                  className="text-muted-foreground"
                />
                Descending
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button onClick={() => ui.patch({ editor: "new" })}>
        <Plus />
        <span className="hidden sm:inline">New collection</span>
        <span className="sr-only sm:hidden">New collection</span>
      </Button>
    </>
  );
}

export function CollectionStack({
  collection,
  small = false,
  panel = false,
}: {
  collection: Collection;
  small?: boolean;
  panel?: boolean;
}) {
  const { books } = useActiveLibrary();
  const covers = collection.bookIds
    .map((id) => books.find((b) => b.id === id))
    .filter((b) => b !== undefined)
    .slice(0, 3);
  return (
    <span
      className={`relative block ${small ? "h-12 w-8 [&_.cover-type]:hidden [&_.cover-credit]:hidden" : panel ? "h-[304px] w-[200px]" : "h-[280px] w-[180px]"}`}
    >
      {(small ? covers.slice(0, 1) : covers.slice().reverse())
        .map((book, i) => (
          <span
            key={book.id}
            className={`absolute left-0 top-0 block [&_.book-cover]:rounded-[7px] ${small ? "w-8" : panel ? "w-48" : "w-[172.8px]"}`}
            style={{
              transform: small ? "none" : `translate(${i === 0 ? 6 : i === 1 ? 0 : 0}px,${i === 1 ? -7 : 0}px) rotate(${i === 0 ? 3 : -3}deg)`,
            }}
          >
            <BookCover book={book} />
          </span>
        ))}
      {!covers.length && (
        <span className="flex h-full items-center justify-center rounded-xl bg-muted">
          <BookOpen className="size-8 text-muted-foreground" />
        </span>
      )}
    </span>
  );
}

export function CollectionsPage() {
  const compact = useIsCompactWindow();
  const { collections: allCollections, setCollections } = useCollections();
  const { books, markAsRead, kind, plural, noun, label } = useActiveLibrary();
  const collections = allCollections.filter((collection) => (collection.kind ?? "books") === kind);
  const { view, panelOpen, filter, sort } = useWorkspace();
  const ui = useCollectionUI();
  const router = useRouter();
  const search = useSearchParams();
  const opened = collections.find((c) => c.id === search.get("collection"));
  const selected =
    collections.find((c) => c.id === ui.selected) ?? collections[0];
  const visible = collections
    .filter((c) => !ui.pinned || c.pinned)
    .toSorted((a, b) => {
      const result =
        ui.sort === "name"
          ? a.name.localeCompare(b.name)
          : new Date(
              (ui.sort === "created" ? a.createdAt : a.lastBookAddedAt) ?? 0,
            ).getTime() -
            new Date(
              (ui.sort === "created" ? b.createdAt : b.lastBookAddedAt) ?? 0,
            ).getTime();
      return result * (ui.order === "desc" ? -1 : 1);
    });
  const collectionBooks = opened
    ? books
        .filter((book) => opened.bookIds.includes(book.id))
        .filter((book) =>
          filter === "reading"
            ? book.progress > 0 && book.progress < 100
            : filter === "new"
              ? book.progress === 0
              : filter === "finished"
                ? book.progress >= 100
                : true,
        )
        .toSorted((a, b) =>
          sort === "recent"
            ? books.indexOf(a) - books.indexOf(b)
            : a.title.localeCompare(b.title) * (sort === "za" ? -1 : 1),
        )
    : [];
  function edit(c: Collection) {
    ui.patch({ editor: c });
  }
  function pin(c: Collection) {
    setCollections((cs) =>
      cs.map((v) => (v.id === c.id ? { ...v, pinned: !v.pinned } : v)),
    );
  }
  const menuActionClass =
    "min-h-8 h-auto -mx-2 w-[calc(100%+1rem)] justify-start gap-2 rounded-lg px-2 py-1.5 text-sm font-normal hover:bg-foreground/10 focus-visible:bg-foreground/10";
  const actions = selected && (
    <div className="space-y-1">
      <Button
        variant="ghost"
        className={menuActionClass}
        onClick={() => router.push(`/collections?collection=${selected.id}`)}
      >
        <FolderOpen />
        Open collection
      </Button>
      {[
        [`Add ${plural}`, BookPlus, () => edit(selected)],
        ["Rename collection", Pencil, () => edit(selected)],
        [
          selected.pinned ? "Unpin collection" : "Pin collection",
          selected.pinned ? PinOff : Pin,
          () => pin(selected),
        ],
        [
          "Mark all as finished",
          Check,
          () => selected.bookIds.forEach(markAsRead),
        ],
      ].map(([label, Icon, action]) => {
        const I = Icon as typeof Pin;
        return (
          <Button
            key={String(label)}
            variant="ghost"
            className={menuActionClass}
            onClick={action as () => void}
          >
            <I />
            {String(label)}
          </Button>
        );
      })}
      <div role="separator" className="my-1.5 h-px bg-foreground/5" />
      <Button
        variant="ghost"
        className={`${menuActionClass} text-destructive hover:text-destructive`}
        onClick={() => ui.patch({ deleting: selected })}
      >
        <Trash2 />
        Delete collection
      </Button>
    </div>
  );

  return (
    <>
      <div className="flex h-[calc(100dvh-3.5rem)] min-h-0">
        <main className="flex min-w-0 flex-1 flex-col">
          <div className="@container min-h-0 flex-1 overflow-y-auto px-5 pt-[34px] pb-8 md:pl-9 md:pr-7">
            {opened ? (
              <>
                <BookGallery
                  books={collectionBooks}
                  onAddBooks={() => edit(opened)}
                />
              </>
            ) : (
              <>
                <div
                  className={
                    view === "grid"
                      ? panelOpen
                        ? "grid grid-cols-1 gap-x-6 gap-y-8 @min-[448px]:grid-cols-2 @min-[700px]:grid-cols-3 @min-[896px]:grid-cols-4"
                        : "grid grid-cols-[repeat(auto-fill,minmax(min(100%,212px),212px))] gap-x-24 gap-y-8"
                      : "space-y-1"
                  }
                >
                  {visible.map((c) => (
                    <button
                      key={c.id}
                      className={`min-w-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring ${selected?.id === c.id ? "bg-selected shadow-selection" : "hover:bg-hover"} ${view === "grid" ? "w-full max-w-[212px] rounded-2xl p-4 pb-2" : "flex w-full items-center gap-4 rounded-selection px-3 py-2 pr-6"}`}
                      onClick={() => {
                        ui.patch({ selected: c.id });
                        if (compact)
                          router.push(`/collections?collection=${c.id}`);
                      }}
                      onDoubleClick={() =>
                        router.push(`/collections?collection=${c.id}`)
                      }
                      aria-label={`Select ${c.name}. Double click to open.`}
                      aria-pressed={selected?.id === c.id}
                    >
                      <CollectionStack collection={c} small={view === "list"} />
                      <span
                        className={
                          view === "grid"
                            ? "mt-4 block max-w-48"
                            : "min-w-0 flex-1"
                        }
                      >
                        <span className={`flex items-center gap-2 ${view === "grid" ? "text-lg font-medium leading-7" : "h-6 text-sm font-semibold leading-6"}`}>
                          <span className="truncate">{c.name}</span>
                          {c.pinned && (
                            <Pin className="size-3 text-muted-foreground" />
                          )}
                        </span>
                        <span className={`mt-1 block text-xs text-muted-foreground ${view === "grid" ? "leading-5" : "h-[18px] leading-[18px]"}`}>
                          {c.bookIds.length} {c.bookIds.length === 1 ? noun : plural}
                        </span>
                      </span>
                      {view === "list" && (
                        <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                          Added {date(c.lastBookAddedAt)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {!visible.length && (
                  <p className="py-16 text-center text-muted-foreground">
                    No collections match. Create a collection or clear the filter.
                  </p>
                )}
              </>
            )}
          </div>
          <ShelfStatusBar
            label={opened ? `Collections / ${opened.name}` : "Collections / All collections"}
            count={opened ? collectionBooks.length : visible.length}
            unit={opened ? noun : "collection"}
          />
        </main>
        {opened ? (
          <BookDetailsPanel />
        ) : (
          panelOpen &&
          selected && (
            <aside className="hidden w-[360px] shrink-0 overflow-y-auto bg-card px-6 pb-10 pt-20 lg:block">
              <div className="mx-auto w-fit">
                <CollectionStack collection={selected} panel />
              </div>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                Collection
              </p>
              <h2 className="mt-3 text-2xl font-semibold leading-10">
                {selected.name}
              </h2>
              <h3 className="mb-2 mt-8 text-base font-semibold leading-8">
                Information
              </h3>
              <dl className="space-y-1 text-xs">
                {[
                  ["Created", date(selected.createdAt)],
                  [`Last ${noun} added`, date(selected.lastBookAddedAt)],
                  ["Location", "My library"],
                  ["Contents", `${selected.bookIds.length} ${selected.bookIds.length === 1 ? noun : plural}`],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex h-8 items-center justify-between gap-3"
                  >
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <h3 className="mb-2 mt-4 text-base font-semibold leading-6">
                Actions
              </h3>
              {actions}
            </aside>
          )
        )}
      </div>

      <Dialog
        open={ui.editor !== null}
        onOpenChange={(o) => {
          if (!o) ui.patch({ editor: null });
        }}
      >
        <DialogContent className="max-h-[85dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {ui.editor === "new" ? "New collection" : "Edit collection"}
            </DialogTitle>
            <DialogDescription>Bring your {plural} together.</DialogDescription>
          </DialogHeader>
          {ui.editor && (
            <form
              key={ui.editor === "new" ? "new" : ui.editor.id}
              id="collection-form"
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget),
                  name = String(data.get("name") ?? "").trim(),
                  bookIds = data.getAll("books").map(String);
                if (!name) return;
                const current = ui.editor !== "new" ? ui.editor : null;
                const at = new Date().toISOString();
                setCollections((cs) =>
                  current
                    ? cs.map((c) =>
                        c.id === current.id
                          ? {
                              ...c,
                              name,
                              bookIds,
                              lastBookAddedAt: bookIds.some(
                                (id) => !c.bookIds.includes(id),
                              )
                                ? at
                                : c.lastBookAddedAt,
                            }
                          : c,
                      )
                    : [
                        ...cs,
                        {
                          id: crypto.randomUUID(),
                          kind,
                          name,
                          bookIds,
                          color: "#d9cae9",
                          pinned: false,
                          createdAt: at,
                          lastBookAddedAt: bookIds.length ? at : undefined,
                        },
                      ],
                );
                ui.patch({ editor: null });
              }}
            >
              <label className="block space-y-2">
                Name
                <Input
                  name="name"
                  defaultValue={ui.editor === "new" ? "" : ui.editor.name}
                  required
                  maxLength={80}
                />
              </label>
              <fieldset>
                <legend className="mb-3 text-sm">{label}</legend>
                <div className="max-h-60 space-y-2 overflow-y-auto">
                  {books.map((b) => (
                    <label
                      key={b.id}
                      className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted"
                    >
                      <Checkbox
                        name="books"
                        value={b.id}
                        defaultChecked={
                          ui.editor !== "new" &&
                          !!ui.editor?.bookIds.includes(b.id)
                        }
                      />
                      <span className="text-sm">{b.title}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </form>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button form="collection-form" type="submit">
              {ui.editor === "new" ? "Create" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!ui.deleting}
        onOpenChange={(o) => {
          if (!o) ui.patch({ deleting: null });
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete collection?</DialogTitle>
            <DialogDescription>
              Delete {ui.deleting?.name}? Its {plural} will stay in your library.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                setCollections((cs) =>
                  cs.filter((c) => c.id !== ui.deleting?.id),
                );
                ui.patch({ deleting: null, selected: null });
              }}
            >
              Delete collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
