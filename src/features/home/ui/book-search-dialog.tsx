"use client";

import { useEffect, useRef, useState } from "react";
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
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<SampleBook | null>(null);
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
  }, []);

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
            className="header-search max-[639px]:w-10 max-[639px]:justify-center max-[639px]:p-0 justify-start text-muted-foreground w-[224px]"
          />
        }
        aria-label="Search books"
        aria-keyshortcuts="Control+k Meta+k"
      >
        <SearchIcon aria-hidden="true" />
        <span className="hidden sm:inline">Find a book…</span>
        <KbdGroup className="ml-auto hidden sm:flex" aria-hidden="true">
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-opacity duration-180 data-starting-style:opacity-0 data-ending-style:opacity-0" />
        <Dialog.Popup
          initialFocus={inputRef}
          finalFocus={triggerRef}
          className="book-search-dialog fixed top-[12vh] left-1/2 z-50 max-h-[calc(88dvh-24px)] w-[min(600px,calc(100vw-32px))] -translate-x-1/2 overflow-y-auto rounded-3xl bg-popover p-6 text-foreground shadow-[0_24px_80px_rgb(0_0_0_/_15%)] [transition:opacity_180ms_ease-out,translate_180ms_ease-out,scale_180ms_ease-out] data-starting-style:translate-y-2 data-starting-style:scale-[.98] data-starting-style:opacity-0 data-ending-style:translate-y-2 data-ending-style:scale-[.98] data-ending-style:opacity-0 max-[639px]:top-6 max-[639px]:max-h-[calc(100dvh-48px)] max-[639px]:p-5"
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
              <div className="book-detail-cover w-[160px] m-[16px_auto_24px]">
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
              <div className="book-list [&_.book-item:last-child]:border-b-0 [&_.book-item.search-result]:rounded-xl [&_.book-item.search-result]:px-[10px] [&_.cover-type]:hidden [&_.cover-credit]:hidden mt-4 flex flex-col [&_.book-item]:[flex-direction:row] [&_.book-item]:items-center [&_.book-item]:p-[12px_0] [&_.book-item]:rounded-[0] [&_.book-item]:[border-bottom:1px_solid_var(--border)] [&_.book-cover]:w-[42px] [&_.book-caption]:flex-1 [&_.book-author]:[display:inline]">
                {results.map((book) => (
                  <button
                    key={book.id}
                    type="button"
                    className="book-item search-result hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4 hover:[&_.book-cover]:-translate-y-1 hover:[&_.book-cover]:-rotate-1 flex flex-col gap-[12px] min-w-0 text-left rounded-[12px]"
                    onClick={() => setSelected(book)}
                    aria-label={`View ${book.title} by ${book.author}`}
                  >
                    <BookCover book={book} />
                    <span className="book-caption">
                      <span className="book-title text-[14px] font-medium block">
                        {book.title}
                      </span>
                      <span className="book-author text-muted-foreground text-[12px] block mt-[2px]">
                        {book.author}
                      </span>
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
