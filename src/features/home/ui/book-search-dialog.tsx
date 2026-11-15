"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  Search,
  ChevronRight,
} from "lucide-react";
import { useLocalUIState } from "@/shared/hooks/use-local-ui-state";
import { useWorkspace } from "@/app-shell/workspace-store";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Kbd, KbdGroup } from "@/shared/ui/kbd";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/shared/ui/dialog";
import type { SampleBook } from "../model/sample-books";
import { useActiveLibrary } from "@/features/library/model/use-active-library";
import { BookCover } from "./book-cover";

export function BookSearchDialog() {
  const { books, plural, noun } = useActiveLibrary();
  const selectBook = useWorkspace((state) => state.revealBook);
  const router = useRouter();
  const [open, setOpen] = useLocalUIState(false);
  const [query, setQuery] = useLocalUIState("");
  const [selected, setSelected] = useLocalUIState<SampleBook | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
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
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setQuery("");
          setSelected(null);
        }
      }}
    >
      <DialogTrigger
        ref={triggerRef}
        render={
          <Button
            variant="secondary"
            className="h-9 w-full justify-start gap-2 rounded-lg border-0 bg-white px-3 text-xs text-muted-foreground shadow-none dark:bg-background"
          />
        }
        aria-label={`Search ${plural}`}
        aria-keyshortcuts="Control+k Meta+k"
      >
        <Search aria-hidden="true" />
        <span>Search library</span>
        <KbdGroup className="ml-auto" aria-hidden="true">
          <Kbd className="h-5 w-12 rounded-sm bg-secondary text-[10px] font-medium shadow-none">
            Ctrl K
          </Kbd>
        </KbdGroup>
      </DialogTrigger>
      <DialogContent
        initialFocus={inputRef}
        finalFocus={triggerRef}
        className="top-[min(12vh,120px)] flex max-h-[80dvh] -translate-y-0 flex-col gap-0 overflow-hidden bg-popover p-0 sm:max-w-[560px]"
      >
        <header className="shrink-0 px-5 pb-4 pt-5">
          <DialogTitle className="pr-10 text-base font-semibold">
            Search library
          </DialogTitle>
          <DialogDescription className="sr-only">
            Find {plural} by title, author, or genre. Use the arrow keys to move
            through results and Enter to view a {noun}.
          </DialogDescription>
          {!selected && (
            <div className="relative mt-4">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                ref={inputRef}
                type="search"
                aria-label={`Search your ${plural}`}
                placeholder="Title, author, or genre…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    resultsRef.current
                      ?.querySelector<HTMLButtonElement>("button")
                      ?.focus();
                  }
                  if (event.key === "Enter" && results[0]) {
                    event.preventDefault();
                    setSelected(results[0]);
                  }
                }}
                className="h-11 rounded-xl border-0 bg-secondary pl-10 pr-3 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-ring/30"
              />
            </div>
          )}
        </header>
        {selected ? (
          <div className="min-h-0 overflow-y-auto border-t border-border px-5 pb-5">
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 my-3 text-muted-foreground"
              onClick={() => {
                setSelected(null);
                requestAnimationFrame(() => inputRef.current?.focus());
              }}
            >
              <ArrowLeft />
              Back to results
            </Button>
            <div className="flex items-start gap-5">
              <div className="w-24 shrink-0">
                <BookCover book={selected} />
              </div>
              <div className="min-w-0 pt-1">
                <h2 className="text-xl font-semibold leading-7">
                  {selected.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selected.author}
                </p>
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  {selected.genre} · {selected.pages > 0 ? `${selected.pages} pages` : "Page count unavailable"}
                  <br />
                  {selected.progress
                    ? `${selected.progress}% read`
                    : "Not started"}
                </p>
              </div>
            </div>
            {selected.synopsis && (
              <p className="mt-5 text-sm leading-6 text-muted-foreground">
                {selected.synopsis}
              </p>
            )}
            <Button
              className="mt-5 w-full"
              onClick={() => {
                selectBook(selected.id);
                setOpen(false);
                setSelected(null);
                setQuery("");
                router.push("/library");
              }}
            >
              View in library
              <ArrowUpRight />
            </Button>
          </div>
        ) : (
          <>
            <div className="flex shrink-0 items-center justify-between border-t border-border px-5 py-3 text-xs text-muted-foreground">
              <span>{normalizedQuery ? "Results" : "Your library"}</span>
              <span role="status">
                {results.length} {results.length === 1 ? noun : plural}
              </span>
            </div>
            <div
              ref={resultsRef}
              className="min-h-0 overflow-y-auto px-2 pb-2"
              onKeyDown={(event) => {
                if (
                  !["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)
                )
                  return;
                const buttons = Array.from(
                  event.currentTarget.querySelectorAll<HTMLButtonElement>(
                    "button",
                  ),
                );
                const index = buttons.indexOf(
                  event.target as HTMLButtonElement,
                );
                if (index < 0) return;
                event.preventDefault();
                if (event.key === "ArrowUp" && index === 0) {
                  inputRef.current?.focus();
                  return;
                }
                const next =
                  event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? buttons.length - 1
                      : (index +
                          (event.key === "ArrowDown" ? 1 : -1) +
                          buttons.length) %
                        buttons.length;
                buttons[next]?.focus();
              }}
            >
              {results.map((book) => (
                <button
                  key={book.id}
                  type="button"
                  className="group flex min-h-[76px] w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left outline-none hover:bg-secondary focus-visible:bg-secondary focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/30"
                  onClick={() => setSelected(book)}
                  aria-label={`View ${book.title} by ${book.author}`}
                >
                  <span className="block w-9 shrink-0">
                    <BookCover book={book} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium leading-5">
                      {book.title}
                    </span>
                    <span className="mt-1 block truncate text-xs leading-[18px] text-muted-foreground">
                      {book.author}
                    </span>
                  </span>
                  <ChevronRight
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </button>
              ))}
              {!results.length && (
                <div className="px-6 py-10 text-center">
                  <Search className="mx-auto mb-3 size-5 text-muted-foreground" />
                  <p className="text-sm font-medium">No {plural} found</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Try another title, author, or genre.
                  </p>
                </div>
              )}
            </div>
            <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-border px-5 py-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <ArrowUp className="size-3" />
                <ArrowDown className="size-3" />
                Navigate<span className="ml-2">↵ View {noun}</span>
              </span>
              <span>Esc to close</span>
            </footer>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
