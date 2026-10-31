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

  const actionClass = "h-8 w-full justify-start rounded-[10px] text-[13px]";

  const body = (
    <>
      <div className="mx-auto w-40 xl:w-44">
        <BookCover book={book} />
      </div>
      <div className="mt-7">
        <p className="text-xs text-muted-foreground">
          {reading ? "Currently reading" : "Book"}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          {book.title}
        </h2>
        <p className="mt-2 text-[13px] text-muted-foreground">{book.author}</p>
        {!reading && (
          <Button
            variant="outline"
            className={`${actionClass} mt-4`}
            onClick={() => setDialog("synopsis")}
          >
            <FileText />
            Read synopsis
          </Button>
        )}
      </div>

      <h3 className="mb-3 mt-6 text-sm font-semibold">
        {reading ? "Your progress" : "Information"}
      </h3>
      <dl className="space-y-3 text-xs">
        {(reading
          ? [
              [
                "Current chapter",
                `Chapter ${Math.max(1, Math.ceil((book.progress / 100) * 18))} of 18`,
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
              ["Genre", book.genre],
            ]
        ).map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="text-right">{v}</dd>
          </div>
        ))}
      </dl>
      {reading && (
        <div className="mt-5">
          <div className="h-1 overflow-hidden rounded-full bg-border">
            <div
              className="h-full bg-muted-foreground"
              style={{ width: `${book.progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {book.progress}% complete
          </p>
        </div>
      )}

      <h3 className="mb-3 mt-7 text-sm font-semibold">
        {reading ? "Reading actions" : "Actions"}
      </h3>
      <div className="space-y-1">
        <Button className={actionClass} onClick={() => setDialog("reader")}>
          <BookOpen />
          {book.progress ? "Continue reading" : "Start reading"}
        </Button>
        {reading ? (
          <>
            <Button
              variant="outline"
              className={actionClass}
              onClick={() => setDialog("reader")}
            >
              <List />
              View chapters
            </Button>
            <Button
              variant="outline"
              className={actionClass}
              onClick={() => setDialog("reader")}
            >
              <Bookmark />
              Bookmarks
            </Button>
            <Button
              variant="outline"
              className={actionClass}
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
              variant="outline"
              className={actionClass}
              onClick={() => toggleBook("favourites", book.id)}
            >
              <Heart className={favourite ? "fill-current" : ""} />
              {favourite ? "Remove from favourites" : "Add to favourites"}
            </Button>
            <Button
              variant="outline"
              className={actionClass}
              onClick={() => setDialog("collections")}
            >
              <FolderPlus />
              Add to collection…
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="outline" className={actionClass} />}
              >
                <Library />
                Move to shelf…
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
              variant="outline"
              className={actionClass}
              onClick={() => setDialog("edit")}
            >
              <Pencil />
              Edit book details…
            </Button>
            <Button
              variant="outline"
              className={`${actionClass} text-destructive`}
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
          className="hidden w-72 shrink-0 self-stretch bg-card px-6 py-8 lg:block xl:w-80"
        >
          <div className="sticky top-6">{body}</div>
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
          className="max-h-[85dvh] overflow-y-auto rounded-3xl bg-card sm:max-w-lg"
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
