"use client";

import { useRef, useState, type CSSProperties } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  CheckIcon,
  FolderPlusIcon,
  MoreVerticalIcon,
  PencilIcon,
  PinIcon,
  PinOffIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { RevealCard as Card, RevealText } from "@/shared/ui/reading-motion";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { BookCover } from "@/features/home/ui/book-cover";
import { BookGallery } from "@/features/library/ui/book-gallery";
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";
import {
  useCollections,
  type Collection,
} from "@/features/collections/stores/collections-store";

const colors = [
  { name: "Neutral", value: "#FAF9F8" },
  { name: "Lilac", value: "#d9cae9" },
  { name: "Sage", value: "#d6dfbd" },
  { name: "Peach", value: "#f0c6ac" },
  { name: "Rose", value: "#cfaaae" },
];

const folderHueByColor: Record<string, string> = {
  "#d9cae9": "185deg",
  "#d6dfbd": "0deg",
  "#f0c6ac": "-55deg",
  "#cfaaae": "-90deg",
};

function lastAddedLabel(lastBookAddedAt: string | undefined, now: number) {
  if (!lastBookAddedAt) return "No books added";
  const days = Math.max(
    0,
    Math.floor((now - new Date(lastBookAddedAt).getTime()) / 86400000),
  );
  return days === 0
    ? "Today"
    : new Intl.RelativeTimeFormat("en-US", { numeric: "always" }).format(
        -days,
        "day",
      );
}

function CollectionEditor({
  collection,
  onClose,
  onSave,
}: {
  collection?: Collection;
  onClose: () => void;
  onSave: (details: Pick<Collection, "name" | "color" | "bookIds">) => void;
}) {
  const { books } = useReadingLists();
  const [name, setName] = useState(collection?.name ?? "");
  const [color, setColor] = useState(collection?.color ?? colors[0].value);
  const [bookIds, setBookIds] = useState(collection?.bookIds ?? []);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(true);
  const titleRef = useRef<HTMLInputElement>(null);
  const pendingSave = useRef<Pick<
    Collection,
    "name" | "color" | "bookIds"
  > | null>(null);
  const results = books.filter((book) =>
    `${book.title} ${book.author}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      onOpenChangeComplete={(isOpen) => {
        if (!isOpen) {
          if (pendingSave.current) onSave(pendingSave.current);
          else onClose();
        }
      }}
    >
      <DialogContent
        initialFocus={titleRef}
        className="collection-editor max-h-[calc(100dvh-32px)] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>
            {collection ? "Edit collection" : "New collection"}
          </DialogTitle>
          <DialogDescription>
            Give your books a place together.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (!name.trim()) return;
            pendingSave.current = { name: name.trim(), color, bookIds };
            setOpen(false);
          }}
        >
          <div className="space-y-2">
            <label htmlFor="collection-name">Name</label>
            <Input
              id="collection-name"
              ref={titleRef}
              placeholder="e.g. Weekend escapes"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={80}
            />
          </div>
          <fieldset>
            <legend className="mb-2 text-sm">Collection color</legend>
            <div className="flex gap-2">
              {colors.map((option) => (
                <Button
                  key={option.name}
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={option.name}
                  aria-pressed={color === option.value}
                  style={{ background: option.value, color: "#36332f" }}
                  onClick={() => setColor(option.value)}
                >
                  {color === option.value && <CheckIcon />}
                </Button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 text-sm">
              Books · {bookIds.length} selected
            </legend>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                aria-label="Search collection books"
                placeholder="Find a book…"
                className="pl-9"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.preventDefault();
                }}
              />
            </div>
            <div className="collection-book-picker mt-3 max-h-[220px] overflow-y-auto">
              {results.map((book) => (
                <label
                  key={book.id}
                  className="collection-book-option [&_.cover-type]:hidden [&_.cover-credit]:hidden hover:bg-[var(--row-hover)] flex items-center gap-[12px] p-[8px] rounded-[12px] cursor-pointer [&_.book-cover]:w-[28px] [&_.book-cover]:rounded-[3px]"
                >
                  <BookCover book={book} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{book.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {book.author}
                    </span>
                  </span>
                  <Checkbox
                    checked={bookIds.includes(book.id)}
                    aria-label={`Include ${book.title}`}
                    onCheckedChange={(checked) =>
                      setBookIds((current) =>
                        checked
                          ? [...current, book.id]
                          : current.filter((id) => id !== book.id),
                      )
                    }
                  />
                </label>
              ))}
              {results.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No matching books.
                </p>
              )}
            </div>
          </fieldset>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              {collection ? "Save changes" : "Create collection"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CollectionsPage() {
  const { books } = useReadingLists();
  const { collections, setCollections } = useCollections();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("collection");
  const [editor, setEditor] = useState<{ collection?: Collection } | null>(
    null,
  );
  const [deleting, setDeleting] = useState<Collection | null>(null);
  const [now, setNow] = useState(() => new Date().getTime());
  const selected = collections.find(
    (collection) => collection.id === selectedId,
  );
  const collectionBooks = (collection: Collection) =>
    books.filter((book) => collection.bookIds.includes(book.id));
  function saveCollection(
    details: Pick<Collection, "name" | "color" | "bookIds">,
  ) {
    const id = editor?.collection?.id ?? crypto.randomUUID();
    const lastBookAddedAt = new Date().toISOString();
    setNow(new Date(lastBookAddedAt).getTime());
    setCollections((current) =>
      editor?.collection
        ? current.map((item) => {
            if (item.id !== id) return item;
            const hasNewBook = details.bookIds.some(
              (bookId) => !item.bookIds.includes(bookId),
            );
            return {
              ...item,
              ...details,
              lastBookAddedAt: hasNewBook
                ? lastBookAddedAt
                : item.lastBookAddedAt,
            };
          })
        : [
            ...current,
            {
              ...details,
              id,
              pinned: false,
              lastBookAddedAt:
                details.bookIds.length > 0 ? lastBookAddedAt : undefined,
            },
          ],
    );
    setEditor(null);
  }
  function togglePinned(collection: Collection) {
    setCollections((current) =>
      current.map((item) =>
        item.id === collection.id ? { ...item, pinned: !item.pinned } : item,
      ),
    );
  }

  return (
    <>
      {selected ? (
        <section className="library-gallery collections-detail w-full p-[24px_40px_48px] max-[1199px]:px-8 max-[1199px]:pt-6 max-[1199px]:pb-12 max-[767px]:px-5 max-[767px]:pt-4 max-[767px]:pb-10">
          <div className="mb-6 flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={() => router.push("/collections")}>
              <ArrowLeftIcon />
              Collections
            </Button>
            <Button
              variant="secondary"
              onClick={() => setEditor({ collection: selected })}
            >
              <PencilIcon />
              Edit collection
            </Button>
          </div>
          <div className="gallery-heading flex items-baseline gap-[12px] mb-[32px] [&_h1]:text-[20px] [&_h1]:font-medium [&>span]:text-[12px] [&>span]:text-muted-foreground">
            <h1>
              <RevealText>{selected.name}</RevealText>
            </h1>
            <span>
              {collectionBooks(selected).length}{" "}
              {collectionBooks(selected).length === 1 ? "book" : "books"}
            </span>
          </div>
          <BookGallery
            books={collectionBooks(selected)}
            onAddBooks={() => setEditor({ collection: selected })}
          />
        </section>
      ) : (
        <section
          className="collections-page w-full px-10 pt-7 pb-12 max-[767px]:px-5 max-[767px]:pt-4 max-[767px]:pb-8"
          aria-label="Collections"
        >
          <div className="collections-heading max-[767px]:mb-7 max-[767px]:flex-wrap max-[767px]:items-start max-[767px]:gap-3 max-[767px]:[&_h1]:text-[22px] flex items-center justify-between gap-[20px] mb-[32px] [&_h1]:text-[28px] [&_h1]:[line-height:1.2] [&_h1]:font-medium [&_h1]:tracking-[-.045em] [&_p]:mt-[8px] [&_p]:text-[12px] [&_p]:text-muted-foreground">
            <div>
              <h1>
                <RevealText>Your collections</RevealText>
              </h1>
              <p>
                {collections.length}{" "}
                {collections.length === 1 ? "collection" : "collections"} ·
                Books brought together by you
              </p>
            </div>
            {collections.length > 0 && (
              <Button onClick={() => setEditor({})}>
                <PlusIcon />
                New collection
              </Button>
            )}
          </div>
          <div className="collection-cards grid justify-center gap-5 [grid-template-columns:repeat(auto-fill,minmax(min(100%,270px),340px))] max-[767px]:gap-4">
            {[...collections]
              .sort(
                (first, second) => Number(second.pinned) - Number(first.pinned),
              )
              .map((collection, index) => {
                const previewBooks = collectionBooks(collection);
                return (
                  <Card
                    index={index}
                    key={collection.id}
                    className="collection-card group/collection relative min-h-[312px] cursor-pointer gap-0 overflow-hidden rounded-[30px] border border-transparent bg-transparent px-5 pb-6 pt-7 shadow-none ring-0 transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--collection-color)_7%,var(--card))] hover:text-foreground [&:has(.collection-card-title:focus-visible)]:outline-2 [&:has(.collection-card-title:focus-visible)]:outline-ring [&:has(.collection-card-title:focus-visible)]:outline-offset-2"
                    style={
                      {
                        "--collection-color": collection.color,
                        "--folder-rotation":
                          folderHueByColor[collection.color.toLowerCase()] ??
                          "0deg",
                      } as CSSProperties
                    }
                    onClick={(event) => {
                      if (
                        (event.target as HTMLElement).closest(
                          "button, a, [role='menuitem'], [data-slot='dropdown-menu-content']",
                        )
                      )
                        return;
                      router.push(
                        `/collections?collection=${encodeURIComponent(collection.id)}`,
                      );
                    }}
                  >
                    <div className="collection-open hover:bg-transparent flex flex-col justify-start w-full h-auto p-[0] border-0 rounded-[0] gap-[0] whitespace-normal overflow-visible bg-transparent [color:inherit]">
                      <span
                        className="collection-preview relative block h-[204px] w-full overflow-hidden"
                        aria-hidden="true"
                      >
                        <span className="pointer-events-none absolute inset-x-[3%] top-[15%] z-0 aspect-[1562/1007] bg-[url('/collection-folder-matte.webp')] bg-contain bg-no-repeat [clip-path:inset(0_0_52%_0)] [filter:hue-rotate(var(--folder-rotation))_saturate(1.25)]" />
                        <span className="collection-cover-stack absolute inset-x-[14%] top-[12%] z-10 flex items-start justify-center">
                          {previewBooks.slice(0, 3).map((book, coverIndex) => (
                            <span
                              className={`collection-preview-cover block w-[37%] shrink-0 origin-bottom [&_.book-cover]:rounded-[4px_7px_7px_4px] [&_.book-cover]:[box-shadow:inset_3px_0_0_rgb(0_0_0_/_10%),_3px_6px_10px_rgb(0_0_0_/_12%)] [&_.cover-type]:p-[7px_5px_0] [&_.cover-type]:text-[9px] [&_.cover-credit]:text-[4px]${coverIndex === 0 ? " translate-y-[11px] -rotate-10" : coverIndex === 1 ? " relative z-[1] -ml-[7%] -translate-y-[4px]" : " -ml-[7%] translate-y-[11px] rotate-10"}`}
                              key={book.id}
                            >
                              <BookCover book={book} />
                            </span>
                          ))}
                        </span>
                        {previewBooks.length === 0 && (
                          <BookOpenIcon className="collection-preview-empty absolute left-1/2 top-[30%] z-10 size-9 -translate-x-1/2 text-muted-foreground" />
                        )}
                        <span className="pointer-events-none absolute inset-x-[3%] top-[15%] z-20 aspect-[1562/1007] bg-[url('/collection-folder-matte.webp')] bg-contain bg-no-repeat [clip-path:inset(44%_0_0_0)] [filter:hue-rotate(var(--folder-rotation))_saturate(1.25)]" />
                      </span>
                    </div>
                    <div className="collection-card-footer relative flex items-start justify-center pt-1">
                      <div className="collection-card-info min-w-0 max-w-full text-center">
                        <div className="collection-title-row flex min-w-0 items-center justify-center gap-1.5">
                          <Button
                            variant="ghost"
                            className="collection-card-title static block h-auto w-auto min-w-0 rounded-none border-0 bg-transparent p-0 text-center text-lg leading-6 font-medium tracking-tight whitespace-normal text-inherit [overflow-wrap:anywhere]"
                            onClick={() =>
                              router.push(
                                `/collections?collection=${encodeURIComponent(collection.id)}`,
                              )
                            }
                            aria-label={`Open ${collection.name}, ${previewBooks.length} ${previewBooks.length === 1 ? "book" : "books"}`}
                          >
                            {collection.name}
                          </Button>
                          {collection.pinned && (
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              className="collection-pin relative z-[2] size-[22px]! min-w-[22px] shrink-0 rounded-full border-0 bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] p-[3px] text-muted-foreground transition-none hover:bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] hover:text-muted-foreground active:bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] [&_svg]:size-4 [&_svg]:stroke-[1.5]"
                              aria-label={`Unpin ${collection.name}`}
                              onClick={() => togglePinned(collection)}
                            >
                              <PinIcon aria-hidden="true" />
                            </Button>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          className="collection-card-meta h-auto! w-full! justify-center rounded-none! border-0! bg-transparent! p-0! text-center scale-100! hover:bg-transparent! active:bg-transparent! flex flex-wrap items-center min-h-[24px] mt-1 gap-1 text-xs font-normal text-muted-foreground"
                          aria-label={`Open books in ${collection.name}`}
                          onClick={() =>
                            router.push(
                              `/collections?collection=${encodeURIComponent(collection.id)}`,
                            )
                          }
                        >
                          <span
                            className="collection-book-count inline-flex shrink-0 items-center"
                            aria-label={`${previewBooks.length} books`}
                          >
                            {previewBooks.length}{" "}
                            {previewBooks.length === 1 ? "book" : "books"}
                          </span>
                          <span
                            aria-hidden="true"
                            className="collection-meta-dot inline-flex shrink-0 w-3 justify-center"
                          >
                            ·
                          </span>
                          <span
                            className="collection-card-updated inline-flex min-w-0 items-center whitespace-nowrap"
                            aria-label={`Last book added: ${lastAddedLabel(collection.lastBookAddedAt, now)}`}
                          >
                            {collection.lastBookAddedAt ? (
                              <time dateTime={collection.lastBookAddedAt}>
                                Added{" "}
                                {lastAddedLabel(
                                  collection.lastBookAddedAt,
                                  now,
                                )}
                              </time>
                            ) : (
                              "No books added"
                            )}
                          </span>
                        </Button>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="collection-menu absolute bottom-0 right-0 z-[2] size-7! shrink-0 rounded-full bg-transparent p-1 text-muted-foreground transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--foreground)_10%,transparent)] hover:text-foreground focus-visible:bg-[color-mix(in_srgb,var(--foreground)_10%,transparent)] aria-expanded:bg-[color-mix(in_srgb,var(--foreground)_10%,transparent)] [&_svg]:size-5"
                            />
                          }
                          aria-label={`Options for ${collection.name}`}
                        >
                          <MoreVerticalIcon />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuItem
                            onClick={() => setEditor({ collection })}
                          >
                            <PencilIcon />
                            Edit collection
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => togglePinned(collection)}
                          >
                            {collection.pinned ? <PinOffIcon /> : <PinIcon />}
                            {collection.pinned
                              ? "Unpin collection"
                              : "Pin collection"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeleting(collection)}
                          >
                            <Trash2Icon />
                            Delete collection
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Card>
                );
              })}
          </div>
          {collections.length === 0 && (
            <Card className="collection-empty items-center px-6 py-12 text-center shadow-none ring-0 [&_h2]:text-[20px] [&_p]:text-[13px] [&_p]:text-muted-foreground">
              <FolderPlusIcon className="size-10 text-muted-foreground" />
              <h2>Your next chapter starts here.</h2>
              <p>Bring a few books together in your first collection.</p>
              <Button onClick={() => setEditor({})}>
                <PlusIcon />
                New collection
              </Button>
            </Card>
          )}
        </section>
      )}
      {editor && (
        <CollectionEditor
          collection={editor.collection}
          onClose={() => setEditor(null)}
          onSave={saveCollection}
        />
      )}
      <Dialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete collection?</DialogTitle>
            <DialogDescription>
              Delete “{deleting?.name}”? Its books will stay in your library.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>
              Cancel
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                setCollections((current) =>
                  current.filter((item) => item.id !== deleting?.id),
                );
                setDeleting(null);
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
