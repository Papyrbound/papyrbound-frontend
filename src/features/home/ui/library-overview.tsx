"use client";

import { useWorkspace } from "@/app-shell/workspace-store";
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";
import { BookDetailsPanel } from "@/features/library/ui/book-details-panel";
import { BookCover } from "./book-cover";
import type { SampleBook } from "../model/sample-books";

export function LibraryOverview() {
  const { books, lists } = useReadingLists();
  const { selectBook, selectedId, setDialog } = useWorkspace();
  const recent = books.filter((book) => book.progress > 0).slice(0, 4);
  const finished = books.filter((book) => book.progress >= 100);
  const next = books
    .filter(
      (book) =>
        lists
          .find((list) => list.id === "want-to-read")
          ?.bookIds?.includes(book.id) || book.progress === 0,
    )
    .slice(0, 1);
  const added = [...books]
    .sort((a, b) => books.indexOf(b) - books.indexOf(a))
    .filter((book) => book.addedLabel)
    .slice(0, 3);

  function row(book: SampleBook, kind: "next" | "finished" | "added") {
    return (
      <button
        key={book.id}
        onClick={() => selectBook(book.id)}
        className="flex w-full items-start gap-[19px] rounded-xl text-left outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="block w-[55px] shrink-0">
          <BookCover book={book} />
        </span>
        <span className="min-w-0 pt-2.5">
          <span className="block truncate text-sm font-semibold leading-[22px]">
            {book.title}
          </span>
          <span className="mt-[5px] block text-xs leading-[18px] text-muted-foreground">
            {kind === "finished"
              ? (book.completedLabel ?? "Recently")
              : book.author}
          </span>
          {kind !== "next" && (
            <span className="mt-[5px] block text-xs leading-[18px] text-muted-foreground">
              {kind === "finished"
                ? "100%"
                : (book.addedLabel ?? "Recently added")}
            </span>
          )}
        </span>
      </button>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] min-h-0">
      <main className="@container min-w-0 flex-1 overflow-y-auto px-5 pb-9 pt-[35px] lg:pl-12 lg:pr-3">
        <div className="max-w-[1236px]">
          <h1 className="mb-4 text-[28px] font-semibold leading-[38px]">
            Recent reads
          </h1>
          <div className="grid grid-cols-2 gap-7 @min-[750px]:grid-cols-3 @min-[1100px]:grid-cols-4">
            {recent.map((book) => (
              <button
                key={book.id}
                className={`relative aspect-[2/3] w-full max-w-72 overflow-hidden rounded-[20px] text-left outline-none focus-visible:ring-2 focus-visible:ring-ring ${selectedId === book.id ? "ring-1 ring-muted-foreground ring-offset-2 ring-offset-background" : ""}`}
                onClick={() => selectBook(book.id)}
                onDoubleClick={() => {
                  selectBook(book.id);
                  setDialog("reader");
                }}
                aria-label={`Continue reading ${book.title}`}
              >
                <BookCover book={book} />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-14">
                  <span className="block truncate text-base font-medium leading-[22px] text-white">
                    {book.title}
                  </span>
                  <span className="mt-[18px] block h-[3px] overflow-hidden rounded-full bg-white/35">
                    <span
                      className="block h-full bg-white"
                      style={{ width: `${book.progress}%` }}
                    />
                  </span>
                </span>
              </button>
            ))}
          </div>
          {!recent.length && (
            <p className="py-12 text-muted-foreground">
              Start a book from your library to see it here.
            </p>
          )}
          <div className="mt-[39px] grid gap-12 @min-[750px]:grid-cols-[minmax(0,1.26fr)_minmax(0,1fr)] lg:mr-10">
            <div>
              <section>
                <h2 className="mb-[17px] text-2xl font-semibold leading-[33px]">
                  Next Up
                </h2>
                {next.map((book) => row(book, "next"))}
                {!next.length && (
                  <p className="text-sm text-muted-foreground">
                    Your next book is waiting in the library.
                  </p>
                )}
              </section>
              <section className="mt-[44.5px]">
                <h2 className="mb-[18px] text-2xl font-semibold leading-[33px]">
                  Finished
                </h2>
                <div className="space-y-[25.5px]">
                  {finished.slice(0, 2).map((book) => row(book, "finished"))}
                </div>
                {!finished.length && (
                  <p className="text-sm text-muted-foreground">
                    Books you finish will appear here.
                  </p>
                )}
              </section>
            </div>
            <section>
              <h2 className="mb-[17px] text-2xl font-semibold leading-[33px]">
                Recently added
              </h2>
              <div className="space-y-[25.5px]">
                {added.map((book) => row(book, "added"))}
              </div>
            </section>
          </div>
        </div>
      </main>
      <BookDetailsPanel reading fallback={recent[0]} />
    </div>
  );
}
