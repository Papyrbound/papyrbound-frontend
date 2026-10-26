"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowRightIcon, BookOpenIcon, HeartIcon } from "lucide-react";

import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";
import { Button } from "@/shared/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { type SampleBook } from "../model/sample-books";
import { BookCover } from "./book-cover";

function uniqueBooks(books: SampleBook[]) {
  return books.filter(
    (book, index) =>
      books.findIndex((candidate) => candidate.id === book.id) === index,
  );
}

export function DiscoverOverview() {
  const { books, lists, markAsRead } = useReadingLists();
  const [selected, setSelected] = useState<SampleBook | null>(null);
  const readingBooks = books.filter(
    (book) => book.progress > 0 && book.progress < 100,
  );
  const recentReads = uniqueBooks([
    ...readingBooks,
    ...[...books].reverse(),
  ]).slice(0, 4);
  const favouriteIds =
    lists.find((list) => list.id === "favourites")?.bookIds ?? [];
  const favouriteBooks = favouriteIds
    .map((id) => books.find((book) => book.id === id))
    .filter((book): book is SampleBook => Boolean(book))
    .slice(0, 8);

  return (
    <main className="min-w-0 px-9 pb-14 pt-8 max-[700px]:px-5 max-[700px]:pt-6">
      <h1 className="sr-only">Home</h1>

      <section aria-labelledby="home-continue-title">
        <h2
          id="home-continue-title"
          className="mb-4 text-lg font-medium tracking-tight"
        >
          Continue reading
        </h2>
        {recentReads.length ? (
          <div className="grid auto-cols-[minmax(300px,calc(50%-10px))] grid-flow-col gap-5 overflow-x-auto pb-3 snap-x snap-proximity [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[700px]:auto-cols-[minmax(260px,88%)] max-[700px]:gap-3">
            {recentReads.slice(0, 3).map((book) => (
              <Button
                key={book.id}
                variant="ghost"
                className="group relative isolate flex h-[228px] w-full min-w-0 snap-start items-center justify-between gap-4 overflow-hidden rounded-2xl p-6 text-left whitespace-normal [background:linear-gradient(110deg,var(--card)_8%,color-mix(in_srgb,var(--feature-paper)_9%,var(--card))_48%,color-mix(in_srgb,var(--feature-paper)_26%,var(--card))_100%)] hover:brightness-[1.04] max-[700px]:h-[204px] max-[700px]:p-5"
                style={
                  {
                    "--feature-paper": book.paper,
                  } as CSSProperties
                }
                onClick={() => setSelected(book)}
                aria-label={`Open ${book.title} by ${book.author}`}
              >
                <span
                  className="pointer-events-none absolute -right-[12%] -top-[40%] -z-10 w-[65%] -rotate-12 opacity-[.19] grayscale [mask-image:linear-gradient(to_right,transparent,black_70%)] [&_.cover-type]:hidden [&_.cover-credit]:hidden"
                  aria-hidden="true"
                >
                  <BookCover book={book} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col self-stretch gap-2">
                  <span className="text-[11px] text-muted-foreground">
                    {book.genre}
                  </span>
                  <strong className="line-clamp-3 text-[clamp(18px,1.7vw,25px)] leading-[1.12] font-semibold tracking-[-.03em]">
                    {book.title}
                  </strong>
                  <span className="mt-auto flex items-center gap-2.5 text-xs">
                    {book.progress > 0
                      ? `${book.progress}% read`
                      : "Start a new chapter"}
                    <ArrowRightIcon
                      className="size-4 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </span>
                <span className="w-[106px] shrink-0 rotate-5 drop-shadow-[0_12px_18px_rgb(0_0_0_/_20%)] max-[700px]:w-[86px] [&_.book-cover]:rounded-[3px_6px_6px_3px] [&_.cover-type]:text-xs [&_.cover-credit]:text-[4px]">
                  <BookCover book={book} />
                </span>
              </Button>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[180px] flex-col items-start justify-center gap-3 rounded-2xl bg-card p-6">
            <BookOpenIcon
              className="size-6 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="text-sm text-muted-foreground">
              Add your first book from the library.
            </p>
            <Button
              nativeButton={false}
              role="link"
              size="sm"
              render={<Link href="/library" />}
            >
              Open library <ArrowRightIcon aria-hidden="true" />
            </Button>
          </div>
        )}
      </section>

      <section className="mt-9" aria-labelledby="home-favourites-title">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2
            id="home-favourites-title"
            className="flex items-center gap-2 text-base font-medium tracking-tight"
          >
            <HeartIcon className="size-4" aria-hidden="true" />
            Favourite books
          </h2>
          <Button
            nativeButton={false}
            role="link"
            variant="ghost"
            size="sm"
            render={<Link href="/reading-lists?list=favourites" />}
          >
            See all <ArrowRightIcon aria-hidden="true" />
          </Button>
        </div>
        {favouriteBooks.length ? (
          <div className="grid grid-cols-2 gap-x-6 max-[700px]:grid-cols-1">
            {favouriteBooks.map((book) => (
              <Button
                key={book.id}
                variant="ghost"
                className="group flex h-auto min-w-0 justify-start gap-3 rounded-md border-t border-border bg-transparent px-1.5 py-2.5 text-left whitespace-normal hover:bg-[var(--row-hover)]"
                onClick={() => setSelected(book)}
                aria-label={`Open ${book.title} by ${book.author}`}
              >
                <span className="w-8 shrink-0 [&_.cover-type]:hidden [&_.cover-credit]:hidden">
                  <BookCover book={book} />
                </span>
                <span className="grid min-w-0 flex-1 gap-0.5">
                  <strong className="truncate text-sm font-medium">
                    {book.title}
                  </strong>
                  <span className="truncate text-xs text-muted-foreground">
                    {book.author}
                  </span>
                </span>
                <ArrowRightIcon
                  className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Button>
            ))}
          </div>
        ) : (
          <div className="flex min-h-24 items-center justify-between gap-4 rounded-xl border border-dashed border-border px-5 py-4">
            <p className="text-sm text-muted-foreground">
              Your favourite books will appear here.
            </p>
            <Button
              nativeButton={false}
              role="link"
              variant="ghost"
              size="sm"
              className="shrink-0"
              render={<Link href="/library" />}
            >
              Browse books <ArrowRightIcon aria-hidden="true" />
            </Button>
          </div>
        )}
      </section>

      <section className="mt-9" aria-labelledby="home-added-title">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2
            id="home-added-title"
            className="text-base font-medium tracking-tight"
          >
            Recently added
          </h2>
          <Button
            nativeButton={false}
            role="link"
            variant="ghost"
            size="sm"
            render={<Link href="/library" />}
          >
            See all <ArrowRightIcon aria-hidden="true" />
          </Button>
        </div>
        {books.length ? (
          <div className="grid auto-cols-[130px] grid-flow-col gap-5 overflow-x-auto pb-3 snap-x snap-proximity [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[700px]:auto-cols-[110px] max-[700px]:gap-4">
            {[...books]
              .reverse()
              .slice(0, 8)
              .map((book) => (
                <Button
                  key={book.id}
                  variant="ghost"
                  className="group flex h-auto min-w-0 snap-start flex-col items-stretch justify-start gap-1 rounded-md bg-transparent p-0 text-left whitespace-normal hover:bg-transparent"
                  onClick={() => setSelected(book)}
                  aria-label={`Open ${book.title} by ${book.author}`}
                >
                  <span className="mb-1 block overflow-hidden rounded-[4px_7px_7px_4px] [&_.book-cover]:transition-[filter,transform] [&_.book-cover]:duration-200 group-hover:[&_.book-cover]:-translate-y-1 group-hover:[&_.book-cover]:brightness-105 [&_.cover-type]:text-[15px] [&_.cover-credit]:text-[5px]">
                    <BookCover book={book} />
                  </span>
                  <strong className="truncate text-xs font-medium">
                    {book.title}
                  </strong>
                  <span className="truncate text-[11px] text-muted-foreground">
                    {book.author}
                  </span>
                </Button>
              ))}
          </div>
        ) : (
          <p className="py-5 text-sm text-muted-foreground">
            Your new books will appear here.
          </p>
        )}
      </section>

      <Sheet
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <SheetContent>
          <SheetHeader className="pr-16">
            <SheetTitle>Book details</SheetTitle>
            <SheetDescription>
              About this book in your library.
            </SheetDescription>
          </SheetHeader>
          {selected && (
            <div className="px-6 pb-6">
              <div className="mx-auto mb-6 mt-4 w-40">
                <BookCover book={selected} />
              </div>
              <h2 className="text-2xl font-medium">{selected.title}</h2>
              <p className="mt-2 text-muted-foreground">{selected.author}</p>
              <dl className="mt-8 divide-y divide-border">
                {[
                  ["Genre", selected.genre],
                  [
                    "Length",
                    selected.pages ? `${selected.pages} pages` : "Unknown",
                  ],
                  [
                    "Progress",
                    selected.progress >= 100
                      ? "Completed"
                      : selected.progress
                        ? `${selected.progress}% read`
                        : "Not started",
                  ],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 py-4">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              {selected.progress > 0 && selected.progress < 100 && (
                <Button
                  variant="outline"
                  className="mt-6 w-full"
                  onClick={() => {
                    markAsRead(selected.id);
                    setSelected(null);
                  }}
                >
                  Mark as read
                </Button>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </main>
  );
}
