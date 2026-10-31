"use client";

import { useLocalUIState } from "@/shared/hooks/use-local-ui-state";

import { useEffect, useRef } from "react";
import { Dialog } from "@base-ui/react/dialog";
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Kbd, KbdGroup } from "@/shared/ui/kbd";
import { type SampleBook } from "../model/sample-books";
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";
import { BookCover } from "./book-cover";

export function BookSearchDialog() {
  const { books } = useReadingLists();
  const [open, setOpen] = useLocalUIState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [query, setQuery] = useLocalUIState("");
  const [selected, setSelected] = useLocalUIState<SampleBook | null>(null);
  const normalizedQuery = query.trim().toLowerCase();
  const results = books.filter((book) =>
    `${book.title} ${book.author} ${book.genre}`
      .toLowerCase()
      .includes(normalizedQuery),
  );

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if (
        (event.ctrlKey || event.metaKey) &&
        !event.altKey &&
        !event.shiftKey &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        if (event.repeat) return;
        setOpen(true);
        setSelected(null);
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, [setOpen, setSelected]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) {
          setQuery("");
          setSelected(null);
        }
      }}
    >
      <Dialog.Trigger
        render={
          <Button
            ref={triggerRef}
            variant="secondary"
            className="h-9 w-full justify-start rounded-lg border-0 bg-white dark:bg-background px-3 text-xs text-muted-foreground shadow-none"
          />
        }
        aria-label="Search books"
        aria-keyshortcuts="Control+k Meta+k"
      >
        <SearchIcon aria-hidden="true" />
        <span>Search library</span>
        <KbdGroup className="ml-auto" aria-hidden="true">
          <Kbd className="h-5 w-12 rounded-sm bg-secondary text-[10px] font-medium shadow-none">
            Ctrl K
          </Kbd>
        </KbdGroup>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-opacity duration-180 data-starting-style:opacity-0 data-ending-style:opacity-0" />
        <Dialog.Popup
          initialFocus={inputRef}
          finalFocus={triggerRef}
          className="book-search-dialog"
        >
          <Dialog.Title className="pr-10 text-lg font-semibold">
            Search books
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-xs text-muted-foreground">
            Search your library by title, author, or genre.
          </Dialog.Description>
          {selected ? (
            <div className="mt-6">
              <Button variant="ghost" onClick={() => setSelected(null)}>
                <ArrowLeftIcon /> Back to results
              </Button>
              <div className="book-detail-cover">
                <BookCover book={selected} />
              </div>
              <h2 className="text-2xl">{selected.title}</h2>
              <p className="mt-2 text-muted-foreground">{selected.author}</p>
              <p className="mt-4 text-sm">
                {selected.genre} · {selected.pages} pages ·{" "}
                {selected.progress
                  ? `${selected.progress}% read`
                  : "Not started"}
              </p>
            </div>
          ) : (
            <>
              <div className="relative mt-6">
                <SearchIcon
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  ref={inputRef}
                  autoFocus
                  type="search"
                  aria-label="Search your books"
                  placeholder="Find a book…"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="h-11 pl-9"
                />
              </div>
              <div className="book-list mt-4">
                {results.map((book) => (
                  <button
                    key={book.id}
                    type="button"
                    className="book-item search-result"
                    onClick={() => setSelected(book)}
                    aria-label={`View ${book.title} by ${book.author}`}
                  >
                    <BookCover book={book} />
                    <span className="book-caption">
                      <span className="book-title">{book.title}</span>
                      <span className="book-author">{book.author}</span>
                    </span>
                    <ChevronRightIcon
                      className="size-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>
              <p
                role="status"
                className={
                  results.length
                    ? "sr-only"
                    : "py-10 text-center text-muted-foreground"
                }
              >
                {results.length
                  ? `${results.length} books found`
                  : "No books match. Try another title, author, or genre."}
              </p>
            </>
          )}
          <Dialog.Close
            render={
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4"
              />
            }
            aria-label="Close search"
          >
            <XIcon />
          </Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
