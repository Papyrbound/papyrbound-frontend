"use client";

import { useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { readingEase, useReadingMotion } from "@/shared/ui/reading-motion";
import {
  CheckIcon,
  HeartIcon,
  ListPlusIcon,
  MoreHorizontalIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/shared/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/shared/ui/sheet";
import { BookCover } from "@/features/home/ui/book-cover";
import type { SampleBook } from "@/features/home/model/sample-books";
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";
import { ReadingListEditor } from "@/features/reading-lists/ui/reading-list-editor";
import { useCollections } from "@/features/collections/stores/collections-store";

export function BookGallery({
  books,
  listId,
  onAddBooks,
  emptyMessage = "No books here yet. Add a few to start your list.",
}: {
  books: SampleBook[];
  listId?: string;
  onAddBooks?: () => void;
  emptyMessage?: string;
}) {
  const [selected, setSelected] = useState<SampleBook | null>(null);
  const [newListBook, setNewListBook] = useState<SampleBook | null>(null);
  const [deletingBook, setDeletingBook] = useState<SampleBook | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const confirmedDeletion = useRef(false);
  const { setCollections } = useCollections();
  const {
    lists,
    toggleBook,
    createList,
    markAsRead,
    markAsUnread,
    deleteBook,
  } = useReadingLists();
  const reduced = useReadingMotion();

  return (
    <>
      <div
        ref={galleryRef}
        tabIndex={-1}
        className="library-book-grid relative grid grid-cols-[repeat(auto-fill,160px)] gap-x-7 gap-y-5 outline-none max-[767px]:grid-cols-[repeat(2,minmax(0,132px))] max-[767px]:gap-5"
      >
        {onAddBooks && (
          <button
            type="button"
            className="gallery-add-book hover:bg-[var(--row-hover)] hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-[6px] max-[767px]:h-[198px] h-[240px] flex flex-col items-center justify-center gap-[12px] rounded-[18px] text-muted-foreground cursor-pointer [transition:background_150ms,_color_150ms]"
            onClick={onAddBooks}
          >
            <PlusIcon className="size-7" aria-hidden="true" />
            <span>Add books</span>
          </button>
        )}
        <AnimatePresence initial={true} mode="popLayout">
          {books.map((book, index) => (
            <m.article
              key={book.id}
              className="gallery-book group/book min-w-0"
              layout={reduced ? false : "position"}
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: reduced ? 0 : 0.2 },
                y: {
                  duration: reduced ? 0 : 0.4,
                  delay: reduced ? 0 : Math.min(index, 6) * 0.035,
                  ease: readingEase,
                },
                layout: { type: "spring", stiffness: 380, damping: 36 },
              }}
            >
              <div className="gallery-book-stage max-[767px]:h-[198px] relative h-[240px] flex items-center justify-center">
                <button
                  type="button"
                  className="gallery-cover-button group/cover hover:-translate-y-[3px] hover:-rotate-1 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-[6px] max-[767px]:w-[min(132px,100%)] max-[767px]:[&_.cover-type]:text-[17px] relative w-[min(160px,_100%)] cursor-pointer rounded-[8px] [transition:transform_200ms]"
                  onClick={() => setSelected(book)}
                  aria-label={`View ${book.title}`}
                >
                  <BookCover book={book} />
                  <span
                    className="gallery-cover-actions group-hover/cover:opacity-100 group-focus-visible/cover:opacity-100 max-[767px]:hidden absolute left-[50%] bottom-[12px] [transform:translateX(-50%)] opacity-[0] [pointer-events:none] [transition:opacity_150ms] whitespace-nowrap rounded-full p-[7px_14px] text-[13px] [background:var(--foreground)] [color:var(--background)]"
                    aria-hidden="true"
                  >
                    View book
                  </span>
                </button>
              </div>
              <div className="gallery-book-caption max-[767px]:w-[min(132px,100%)] flex items-center justify-between gap-[8px] pt-[4px] w-[min(160px,_100%)] [margin-inline:auto]">
                <h2 className="sr-only">{book.title}</h2>
                <span
                  className={
                    book.progress <= 0 || book.progress >= 100
                      ? "gallery-book-status gallery-status-label rounded bg-muted px-[6px] py-[2px] text-[10px] font-medium text-muted-foreground tabular-nums"
                      : "gallery-book-status text-[11px] text-muted-foreground tabular-nums"
                  }
                >
                  {book.progress >= 100
                    ? "Completed"
                    : book.progress > 0
                      ? `${book.progress}%`
                      : "New"}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="gallery-book-menu group-hover/book:opacity-100 group-focus-within/book:opacity-100 aria-expanded:opacity-100 [@media(hover:none)]:opacity-100 max-[767px]:w-7 max-[767px]:opacity-100 shrink-0 opacity-[0] [transition:opacity_150ms]"
                      />
                    }
                    aria-label={`More options for ${book.title}`}
                  >
                    <MoreHorizontalIcon />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="bottom"
                    align="end"
                    className="w-64 max-w-[calc(100vw-2rem)]"
                  >
                    <DropdownMenuItem onClick={() => setSelected(book)}>
                      View book details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      {lists
                        .filter(
                          (list) =>
                            list.isDefault &&
                            list.id !== "completed" &&
                            list.id !== listId,
                        )
                        .map((list) => (
                          <DropdownMenuItem
                            key={list.id}
                            onClick={() => toggleBook(list.id, book.id)}
                          >
                            {list.bookIds?.includes(book.id) ? (
                              <CheckIcon />
                            ) : list.id === "favourites" ? (
                              <HeartIcon />
                            ) : (
                              <PlusIcon />
                            )}
                            {list.bookIds?.includes(book.id)
                              ? `Remove from ${list.name}`
                              : `Add to ${list.name}`}
                          </DropdownMenuItem>
                        ))}
                      <DropdownMenuItem
                        onClick={() =>
                          book.progress >= 100
                            ? markAsUnread(book.id)
                            : markAsRead(book.id)
                        }
                      >
                        <CheckIcon />
                        {book.progress >= 100
                          ? "Mark as unread"
                          : "Mark as read"}
                      </DropdownMenuItem>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <ListPlusIcon />
                          Add to custom list
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-64 max-w-[calc(100vw-2rem)]">
                          <DropdownMenuItem
                            onClick={() => setNewListBook(book)}
                          >
                            <PlusIcon />
                            Create new list
                          </DropdownMenuItem>
                          {lists.some((list) => !list.isDefault) && (
                            <DropdownMenuSeparator />
                          )}
                          {lists
                            .filter((list) => !list.isDefault)
                            .map((list) => (
                              <DropdownMenuItem
                                key={list.id}
                                disabled={list.bookIds?.includes(book.id)}
                                onClick={() => toggleBook(list.id, book.id)}
                              >
                                {list.bookIds?.includes(book.id) ? (
                                  <CheckIcon />
                                ) : (
                                  <PlusIcon />
                                )}
                                <span className="truncate">{list.name}</span>
                              </DropdownMenuItem>
                            ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    </DropdownMenuGroup>
                    {listId && listId !== "completed" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => toggleBook(listId, book.id)}
                        >
                          <Trash2Icon />
                          Remove from this list
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => {
                        confirmedDeletion.current = false;
                        setDeletingBook(book);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2Icon />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </m.article>
          ))}
        </AnimatePresence>
      </div>
      {books.length === 0 && (
        <p
          className="gallery-empty mt-[32px] text-[13px] text-muted-foreground"
          role="status"
        >
          {emptyMessage}
        </p>
      )}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onOpenChangeComplete={(open) => {
          if (!open) setDeletingBook(null);
        }}
      >
        <AlertDialogContent
          initialFocus={cancelRef}
          finalFocus={() =>
            confirmedDeletion.current ? galleryRef.current : true
          }
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{deletingBook?.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This book will be removed from your library, reading lists, and
              collections.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel ref={cancelRef}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (!deletingBook) return;
                confirmedDeletion.current = true;
                deleteBook(deletingBook.id);
                setCollections((current) =>
                  current.map((collection) => ({
                    ...collection,
                    bookIds: collection.bookIds.filter(
                      (id) => id !== deletingBook.id,
                    ),
                  })),
                );
                if (selected?.id === deletingBook.id) setSelected(null);
                setDeleteDialogOpen(false);
              }}
            >
              Delete book
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {newListBook && (
        <ReadingListEditor
          initialBookIds={[newListBook.id]}
          onClose={() => setNewListBook(null)}
          onSave={(details) => {
            createList({
              ...details,
              bookIds: [...new Set([...details.bookIds, newListBook.id])],
            });
            setNewListBook(null);
          }}
        />
      )}
      <Sheet
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Book details</SheetTitle>
            <SheetDescription>
              Title, author, and reading progress.
            </SheetDescription>
          </SheetHeader>
          {selected && (
            <div className="px-6 pb-6">
              <div className="book-detail-cover w-[160px] m-[16px_auto_24px]">
                <BookCover book={selected} />
              </div>
              <h2 className="text-2xl">{selected.title}</h2>
              <p className="mt-2 text-muted-foreground">{selected.author}</p>
              <dl className="mt-6 divide-y divide-border">
                {[
                  ["Genre", selected.genre],
                  ["Length", `${selected.pages} pages`],
                  [
                    "Progress",
                    selected.progress
                      ? `${selected.progress}% read`
                      : "Not started",
                  ],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-4">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
