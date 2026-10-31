"use client";

import Link from "next/link";

import {
  BookOpen,
  Heart,
  FolderPlus,
  Library,
  Pencil,
  Trash2,
  List,
  Bookmark,
  Highlighter,
  FileText,
  Check,
  ChevronRight,
} from "lucide-react";

import { useWorkspace } from "@/app-shell/workspace-store";

import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";

import { useCollections } from "@/features/collections/stores/collections-store";

import { useAnnotations } from "@/features/annotations/stores/annotations-store";

import { BookCover } from "@/features/home/ui/book-cover";

import { Button } from "@/shared/ui/button";

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
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/shared/ui/alert-dialog";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/ui/dropdown-menu";

import { Input } from "@/shared/ui/input";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";

import { useIsCompactWindow } from "@/shared/hooks/use-mobile";

import type { SampleBook } from "@/features/home/model/sample-books";

export function BookDetailsPanel({
  reading = false,
  fallback,
}: {
  reading?: boolean;
  fallback?: SampleBook;
}) {
  const {
    books,
    lists,
    toggleBook,
    markAsRead,
    markAsUnread,
    deleteBook,
    updateBook,
  } = useReadingLists();

  const { collections, setCollections } = useCollections();
  const { setAnnotations } = useAnnotations();

  const { selectedId, panelOpen, setPanelOpen, dialog, setDialog, selectBook } =
    useWorkspace();

  const mobile = useIsCompactWindow();
  const book = books.find((b) => b.id === selectedId) ?? fallback ?? books[0];

  if (!book) return null;

  const favourite = lists
    .find((l) => l.id === "favourites")
    ?.bookIds?.includes(book.id);

  const actionClass = `${reading ? "h-9" : "h-8"} w-full justify-start rounded-[10px] px-3 text-sm`;

  const menuActionClass =
    "min-h-8 h-auto w-full justify-start gap-2 rounded-lg px-2 py-1.5 text-sm font-normal hover:bg-foreground/10 focus-visible:bg-foreground/10";

  const body = (
    <>
      <div className="mx-auto w-48 shrink-0">
        <BookCover book={book} />
      </div>
      <div className={reading ? "mt-[26px]" : "mt-6"}>
        <p className="h-5 text-xs leading-5 text-muted-foreground">
          {reading ? "Currently reading" : "Book"}
        </p>
        <h2
          className={`${reading ? "mt-2.5" : "mt-2"} text-2xl font-semibold leading-[34px]`}
        >
          {book.title}
        </h2>
        <p className="mt-1.5 text-sm leading-5 text-muted-foreground">
          {book.author}
        </p>
        {!reading && (
          <Button
            variant="outline"
            className={`${actionClass} mt-2`}
            onClick={() => setDialog("synopsis")}
          >
            <FileText />
            Read synopsis
          </Button>
        )}
      </div>

      <h3
        className={`${reading ? "mb-[22px] mt-9" : "mb-[15px] mt-4"} text-[15px] font-semibold leading-[21px]`}
      >
        {reading ? "Your progress" : "Information"}
      </h3>
      <dl className="space-y-1 text-[13px] leading-[18px]">
        {(reading
          ? [
              [
                "Current chapter",
                `Chapter ${Math.max(1, Math.floor((book.progress / 100) * 18))} of 18`,
              ],
              [
                "Pages read",
                `${Math.round((book.pages * book.progress) / 100)} of ${book.pages}`,
              ],
              ["Last read", "Today, 9:41 AM"],
            ]
          : [
              ["File format", "EPUB"],
              ["Length", `${book.pages} pages`],
              ["Progress", `${book.progress}%`],
              ["Last opened", book.progress ? "Today" : "Not opened"],
              ["Location", "On this device"],
            ]
        ).map(([k, v]) => (
          <div key={k} className="flex h-8 items-center justify-between gap-4">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="text-right">{v}</dd>
          </div>
        ))}
      </dl>
      {reading && (
        <div className="mt-[13px]">
          <div className="h-1 overflow-hidden rounded-full bg-border">
            <div
              className="h-full bg-muted-foreground"
              style={{ width: `${book.progress}%` }}
            />
          </div>
          <p className="mt-3 text-xs leading-[18px] text-muted-foreground">
            {book.progress}% complete
          </p>
        </div>
      )}

      <h3
        className={`${reading ? "mt-10" : "mt-5"} mb-2 text-base font-semibold leading-6`}
      >
        {reading ? "Reading actions" : "Actions"}
      </h3>
      <div className="rounded-menu border border-soft-border bg-popover p-1.5 text-popover-foreground shadow-menu">
        <Button
          variant="ghost"
          className={menuActionClass}
          onClick={() => setDialog("reader")}
        >
          <BookOpen />
          {book.progress ? "Continue reading" : "Start reading"}
        </Button>
        {reading ? (
          <>
            <Button
              variant="ghost"
              className={menuActionClass}
              onClick={() => setDialog("reader")}
            >
              <List />
              View chapters
            </Button>
            <Button
              variant="ghost"
              className={menuActionClass}
              onClick={() => setDialog("reader")}
            >
              <Bookmark />
              Bookmarks
            </Button>
            <Button
              variant="ghost"
              className={menuActionClass}
              nativeButton={false}
              render={<Link href="/annotations" />}
            >
              <Highlighter />
              Annotations
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              className={menuActionClass}
              onClick={() => toggleBook("favourites", book.id)}
            >
              <Heart className={favourite ? "fill-current" : ""} />
              {favourite ? "Remove from favourites" : "Add to favourites"}
            </Button>
            <Button
              variant="ghost"
              className={menuActionClass}
              onClick={() => setDialog("collections")}
            >
              <FolderPlus />
              Add to collection…
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" className={menuActionClass} />}
              >
                <Library />
                Move to shelf…
                <ChevronRight className="ml-auto" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => toggleBook("want-to-read", book.id)}
                >
                  <Bookmark />
                  Want to Read
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    book.progress >= 100
                      ? markAsUnread(book.id)
                      : markAsRead(book.id)
                  }
                >
                  <Check />
                  {book.progress >= 100 ? "Mark as unread" : "Finished"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              className={menuActionClass}
              onClick={() => setDialog("edit")}
            >
              <Pencil />
              Edit book details…
            </Button>
            <div
              role="separator"
              className="-mx-1.5 my-1.5 h-px bg-foreground/5"
            />
            <Button
              variant="ghost"
              className={`${menuActionClass} text-destructive hover:text-destructive`}
              onClick={() => setDialog("delete")}
            >
              <Trash2 />
              Delete book…
            </Button>
          </>
        )}
      </div>
    </>
  );

  return (
    <>
      {panelOpen && (
        <aside
          aria-label={reading ? "Reading panel" : "Book details"}
          className={`hidden w-[360px] shrink-0 self-stretch overflow-y-auto bg-card px-6 pb-10 lg:block ${reading ? "pt-16" : "pt-[42px]"}`}
        >
          <div>{body}</div>
        </aside>
      )}

      <Sheet
        open={mobile && panelOpen && selectedId !== null}
        onOpenChange={setPanelOpen}
      >
        <SheetContent className="overflow-y-auto bg-card">
          <SheetHeader>
            <SheetTitle>
              {reading ? "Reading panel" : "Book details"}
            </SheetTitle>
          </SheetHeader>
          <div className="px-6 pb-8">{body}</div>
        </SheetContent>
      </Sheet>

      <Dialog
        open={dialog !== null && dialog !== "delete"}
        onOpenChange={(o) => {
          if (!o) setDialog(null);
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="max-h-[85dvh] overflow-y-auto rounded-3xl bg-card sm:max-w-[560px]"
        >
          <DialogHeader>
            <DialogTitle>
              {dialog === "synopsis"
                ? "Synopsis"
                : dialog === "collections"
                  ? "Add to collection"
                  : dialog === "edit"
                    ? "Edit book details"
                    : "Reader preview"}
            </DialogTitle>
            <DialogDescription>
              {book.title} · {book.author}
            </DialogDescription>
          </DialogHeader>

          {dialog === "synopsis" && (
            <p className="text-sm leading-7">
              {book.synopsis ?? "No synopsis available for this book."}
            </p>
          )}

          {dialog === "reader" && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Visual preview · EPUB rendering is not connected.
              </p>
              <h3 className="font-serif text-2xl">Chapter one</h3>
              <p className="font-serif text-lg leading-8">
                The room grew quiet as the afternoon light moved across the
                floor. She turned the page, and for a moment the rest of the
                world could wait.
              </p>
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href="/annotations" />}
              >
                View saved annotations
              </Button>
            </div>
          )}

          {dialog === "collections" && (
            <div className="space-y-2">
              {collections.map((c) => (
                <Button
                  key={c.id}
                  aria-pressed={c.bookIds.includes(book.id)}
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() =>
                    setCollections((current) =>
                      current.map((item) =>
                        item.id === c.id
                          ? {
                              ...item,
                              bookIds: item.bookIds.includes(book.id)
                                ? item.bookIds.filter((id) => id !== book.id)
                                : [...item.bookIds, book.id],
                              lastBookAddedAt: item.bookIds.includes(book.id)
                                ? item.lastBookAddedAt
                                : new Date().toISOString(),
                            }
                          : item,
                      ),
                    )
                  }
                >
                  {c.name}
                  {c.bookIds.includes(book.id) && <Check />}
                </Button>
              ))}
              {!collections.length && (
                <p className="text-sm text-muted-foreground">
                  Create a collection from the Collections page first.
                </p>
              )}
            </div>
          )}

          {dialog === "edit" && (
            <form
              id="edit-book"
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                const title = String(data.get("title") ?? "").trim(),
                  author = String(data.get("author") ?? "").trim();
                if (title && author) {
                  updateBook(book.id, { title, author });
                  setDialog(null);
                }
              }}
            >
              <label className="block space-y-2">
                Title
                <Input
                  name="title"
                  defaultValue={book.title}
                  required
                  maxLength={200}
                />
              </label>
              <label className="block space-y-2">
                Author
                <Input
                  name="author"
                  defaultValue={book.author}
                  required
                  maxLength={200}
                />
              </label>
            </form>
          )}

          <DialogFooter>
            {dialog === "edit" ? (
              <>
                <DialogClose render={<Button variant="outline" />}>
                  Cancel
                </DialogClose>
                <Button form="edit-book" type="submit">
                  Save changes
                </Button>
              </>
            ) : (
              <DialogClose render={<Button />}>Done</DialogClose>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={dialog === "delete"}
        onOpenChange={(o) => {
          if (!o) setDialog(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete book?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove {book.title} from your library? Its annotations and reading
              progress will also be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                deleteBook(book.id);
                setCollections((cs) =>
                  cs.map((c) => ({
                    ...c,
                    bookIds: c.bookIds.filter((id) => id !== book.id),
                  })),
                );
                setAnnotations((a) => a.filter((n) => n.bookId !== book.id));
                setDialog(null);
                const next = books.find((b) => b.id !== book.id);
                if (next) selectBook(next.id);
              }}
            >
              Delete book
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
