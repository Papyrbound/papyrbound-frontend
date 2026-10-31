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
  ArrowLeft,
  BookOpen,
} from "lucide-react";

import { useCollections, type Collection } from "../stores/collections-store";

import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";

import { useWorkspace } from "@/app-shell/workspace-store";

import { BookCover } from "@/features/home/ui/book-cover";

import { BookGallery } from "@/features/library/ui/book-gallery";

import { BookDetailsPanel } from "@/features/library/ui/book-details-panel";

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
  DropdownMenuCheckboxItem,
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
    : "No books added";
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
  const { books } = useReadingLists();
  const covers = collection.bookIds
    .map((id) => books.find((b) => b.id === id))
    .filter((b) => b !== undefined)
    .slice(0, 3);
  return (
    <span
      className={`relative block ${small ? "h-12 w-8 [&_.cover-type]:hidden [&_.cover-credit]:hidden" : panel ? "h-[304px] w-[200px]" : "h-[280px] w-[180px]"}`}
    >
      {covers
        .slice()
        .reverse()
        .map((book, i) => (
          <span
            key={book.id}
            className={`absolute left-0 top-0 block [&_.book-cover]:rounded-[7px] ${small ? "w-8" : panel ? "w-48" : "w-[172.8px]"}`}
            style={{
              transform: `translate(${i === 0 ? 6 : i === 1 ? 0 : 0}px,${i === 1 ? -7 : 0}px) rotate(${i === 0 ? 3 : -3}deg)`,
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
  const { collections, setCollections } = useCollections();
  const { books, markAsRead } = useReadingLists();
  const { view, panelOpen } = useWorkspace();
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
  function edit(c: Collection) {
    ui.patch({ editor: c });
  }
  function pin(c: Collection) {
    setCollections((cs) =>
      cs.map((v) => (v.id === c.id ? { ...v, pinned: !v.pinned } : v)),
    );
  }
  const actions = selected && (
    <div className="space-y-1">
      <Button
        className="h-8 w-full justify-start text-sm"
        onClick={() => router.push(`/collections?collection=${selected.id}`)}
      >
        <FolderOpen />
        Open collection
      </Button>
      {[
        ["Add books", BookPlus, () => edit(selected)],
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
        ["Delete collection…", Trash2, () => ui.patch({ deleting: selected })],
      ].map(([label, Icon, action]) => {
        const I = Icon as typeof Pin;
        return (
          <Button
            key={String(label)}
            variant="outline"
            className={`h-8 w-full justify-start text-sm ${label === "Delete collection…" ? "text-destructive" : ""}`}
            onClick={action as () => void}
          >
            <I />
            {String(label)}
          </Button>
        );
      })}
    </div>
  );

  return (
    <>
      <div className="flex h-[calc(100dvh-4rem)] min-h-0">
        <main className="@container min-w-0 flex-1 overflow-y-auto px-5 py-8 lg:px-8">
          {opened ? (
            <>
              <Button
                variant="ghost"
                onClick={() => router.push("/collections")}
              >
                <ArrowLeft />
                Collections
              </Button>
              <header className="my-6 flex items-center justify-between">
                <h1 className="text-3xl font-semibold leading-[42px]">
                  {opened.name}
                </h1>
                <Button variant="secondary" onClick={() => edit(opened)}>
                  <BookPlus />
                  Add books
                </Button>
              </header>
              <BookGallery
                books={books.filter((b) => opened.bookIds.includes(b.id))}
                onAddBooks={() => edit(opened)}
              />
            </>
          ) : (
            <>
              <header className="mb-[38px] flex min-h-[42px] flex-wrap items-center justify-between gap-4 lg:px-4">
                <h1 className="text-3xl font-semibold leading-[42px]">
                  Collections
                </h1>
                <div className="flex gap-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="secondary" />}
                    >
                      <ListFilter />
                      Filter
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[248px]">
                      <DropdownMenuCheckboxItem
                        checked={ui.pinned}
                        onCheckedChange={(pinned) => ui.patch({ pinned })}
                      >
                        Pinned only
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                        <DropdownMenuRadioGroup
                          value={ui.sort}
                          onValueChange={(sort) => ui.patch({ sort })}
                        >
                          {[
                            ["added", "Last book added"],
                            ["name", "Collection name"],
                            ["created", "Date created"],
                          ].map(([v, l]) => (
                            <DropdownMenuRadioItem key={v} value={v}>
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
                            Ascending
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="desc">
                            Descending
                          </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    className="w-[180px]"
                    onClick={() => ui.patch({ editor: "new" })}
                  >
                    <Plus />
                    New collection
                  </Button>
                </div>
              </header>
              <div
                className={
                  view === "grid"
                    ? "grid grid-cols-1 gap-y-8 @min-[500px]:grid-cols-2 @min-[840px]:grid-cols-3 @min-[1120px]:grid-cols-4"
                    : "space-y-1"
                }
              >
                {visible.map((c) => (
                  <button
                    key={c.id}
                    className={`min-w-0 rounded-2xl text-left outline-none focus-visible:ring-2 focus-visible:ring-ring ${selected?.id === c.id ? "bg-selected shadow-selection" : "hover:bg-hover"} ${view === "grid" ? "w-[212px] p-4 pb-2" : "flex h-[68px] w-full items-center gap-5 px-4"}`}
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
                      <span className="flex items-center gap-2 text-lg font-medium leading-7">
                        <span className="truncate">{c.name}</span>
                        {c.pinned && (
                          <Pin className="size-3 text-muted-foreground" />
                        )}
                      </span>
                      {view === "grid" && (
                        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                          {c.bookIds.length} books
                        </span>
                      )}
                    </span>
                    {view === "list" && (
                      <span className="text-xs text-muted-foreground">
                        {c.bookIds.length} books{" "}
                        <span className="hidden sm:inline">
                          · Added {date(c.lastBookAddedAt)}
                        </span>
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
                  ["Last book added", date(selected.lastBookAddedAt)],
                  ["Location", "My library"],
                  ["Contents", `${selected.bookIds.length} books`],
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
            <DialogDescription>Bring your books together.</DialogDescription>
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
                <legend className="mb-3 text-sm">Books</legend>
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
              Delete {ui.deleting?.name}? Its books will stay in your library.
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
