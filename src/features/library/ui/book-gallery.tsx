"use client";

import {
  BookOpen,
  Heart,
  Check,
  FolderPlus,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";

import { useWorkspace } from "@/app-shell/workspace-store";

import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";

import { BookCover } from "@/features/home/ui/book-cover";

import type { SampleBook } from "@/features/home/model/sample-books";

import { Button } from "@/shared/ui/button";

import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/shared/ui/context-menu";

export function BookGallery({
  books,
  onAddBooks,
  emptyMessage = "No books here yet.",
  listId,
}: {
  books: SampleBook[];
  onAddBooks?: () => void;
  emptyMessage?: string;
  listId?: string;
}) {
  const { view, selectedId, selectBook, setDialog } = useWorkspace();
  const {
    books: libraryBooks,
    toggleBook,
    markAsRead,
    markAsUnread,
  } = useReadingLists();
  const activeId = selectedId ?? libraryBooks[0]?.id;

  if (!books.length)
    return (
      <div className="py-20 text-center">
        <BookOpen className="mx-auto mb-4 size-8 text-muted-foreground" />
        <p className="text-muted-foreground">{emptyMessage}</p>
        {onAddBooks && (
          <Button className="mt-5" onClick={onAddBooks}>
            <Plus />
            Add books
          </Button>
        )}
      </div>
    );

  return (
    <div
      className={
        view === "grid"
          ? "grid grid-cols-2 items-start gap-y-[36.8px] @min-[840px]:grid-cols-3 @min-[1120px]:grid-cols-4"
          : "space-y-1"
      }
    >
      {books.map((book) => (
        <ContextMenu
          key={book.id}
          onOpenChange={(open) => {
            if (open) selectBook(book.id);
          }}
        >
          <ContextMenuTrigger
            render={<article />}
            className={`group relative min-w-0 rounded-selection ${activeId === book.id ? "bg-selected shadow-selection" : "hover:bg-hover"} ${view === "list" ? "flex items-center pr-3" : "w-full max-w-[196.8px] px-3 pt-3 pb-2.5"}`}
          >
            <button
              className={`min-w-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring ${view === "list" ? "flex flex-1 items-center gap-4 rounded-xl px-3 py-2" : "block w-full"}`}
              onClick={() => selectBook(book.id)}
              onDoubleClick={() => {
                selectBook(book.id);
                setDialog("reader");
              }}
              aria-label={`View ${book.title}`}
              aria-pressed={activeId === book.id}
            >
              <span
                className={`block shrink-0 ${view === "list" ? "w-8 [&_.cover-type]:hidden [&_.cover-credit]:hidden" : "w-full"}`}
              >
                <BookCover book={book} />
              </span>
              <span
                className={view === "list" ? "min-w-0 flex-1" : "mt-3 block"}
              >
                <span className="block h-6 truncate text-sm font-semibold leading-6">
                  {book.title}
                </span>
                <span className="mt-1 block h-[18px] truncate text-xs leading-[18px] text-muted-foreground">
                  {book.author}
                </span>
              </span>
              {view === "list" && (
                <span className="hidden text-xs text-muted-foreground sm:block">
                  {book.progress >= 100
                    ? "Finished"
                    : book.progress
                      ? `${book.progress}% read`
                      : "New"}{" "}
                  · EPUB
                </span>
              )}
            </button>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-[300px]">
            <ContextMenuItem
              onClick={() => {
                selectBook(book.id);
                setDialog("reader");
              }}
            >
              <BookOpen />
              {book.progress ? "Continue reading" : "Start reading"}
            </ContextMenuItem>
            <ContextMenuItem onClick={() => toggleBook("favourites", book.id)}>
              <Heart />
              Toggle favourite
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                selectBook(book.id);
                setDialog("collections");
              }}
            >
              <FolderPlus />
              Add to collection…
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() =>
                book.progress >= 100
                  ? markAsUnread(book.id)
                  : markAsRead(book.id)
              }
            >
              <Check />
              {book.progress >= 100 ? "Mark as unread" : "Mark as finished"}
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                selectBook(book.id);
                setDialog("edit");
              }}
            >
              <Pencil />
              Edit book details…
            </ContextMenuItem>
            {listId && listId !== "completed" && (
              <ContextMenuItem onClick={() => toggleBook(listId, book.id)}>
                Remove from shelf
              </ContextMenuItem>
            )}
            <ContextMenuSeparator />
            <ContextMenuItem
              variant="destructive"
              onClick={() => {
                selectBook(book.id);
                setDialog("delete");
              }}
            >
              <Trash2 />
              Delete book…
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ))}
    </div>
  );
}
