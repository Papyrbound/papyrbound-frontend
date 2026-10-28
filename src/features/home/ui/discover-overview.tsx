"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRightIcon,
  ArrowRightIcon,
  BookOpenIcon,
  CheckIcon,
} from "lucide-react";
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";
import { Button } from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/shared/ui/sheet";
import type { SampleBook } from "../model/sample-books";
import { BookCover } from "./book-cover";
import { ReadingTile } from "./reading-tile";
import { ReaderPreview } from "./reader-preview";

function BookRow({ book, onOpen }: { book: SampleBook; onOpen: () => void }) {
  return (
    <Button
      variant="ghost"
      onClick={onOpen}
      aria-label={`Open ${book.title}`}
      className="group h-auto min-w-0 justify-start gap-4 rounded-xl p-2 text-left whitespace-normal"
    >
      <span className="w-12 shrink-0 overflow-hidden rounded-[3px_5px_5px_3px] [&_.cover-type]:hidden [&_.cover-credit]:hidden">
        <BookCover book={book} />
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block truncate text-sm font-medium">
          {book.title}
        </strong>
        <span className="mt-1 block truncate text-xs text-muted-foreground">
          {book.author}
        </span>
        <span className="mt-2 block text-[11px] text-muted-foreground">
          {book.progress >= 100
            ? "Finished"
            : book.progress
              ? `${book.progress}% read`
              : `${book.genre} · ${book.pages} pages`}
        </span>
      </span>
      <ArrowUpRightIcon className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" />
    </Button>
  );
}

export function DiscoverOverview() {
  const { books } = useReadingLists();
  const [selected, setSelected] = useState<SampleBook | null>(null);
  const [reading, setReading] = useState<SampleBook | null>(null);
  const readingBooks = books.filter(
    (book) => book.progress > 0 && book.progress < 100,
  );
  const nextBooks = books.filter((book) => book.progress === 0).slice(0, 1);
  const finishedBooks = books.filter((book) => book.progress >= 100);
  return (
    <main className="mx-auto w-full max-w-[1536px] min-w-0 bg-background min-h-[calc(100vh-64px)] px-10 pb-12 pt-7 max-[1000px]:px-6 max-[600px]:px-5">
      <header className="mb-7 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-medium tracking-[.16em] text-muted-foreground uppercase">
            Your personal library
          </p>
          <h1 className="text-[30px] leading-tight font-medium tracking-[-.04em]">
            Reading now
          </h1>
        </div>
        <Button
          nativeButton={false}
          role="link"
          variant="ghost"
          size="sm"
          render={<Link href="/library" />}
          className="text-muted-foreground"
        >
          Open library
          <ArrowUpRightIcon />
        </Button>
      </header>
      <section aria-labelledby="recent-reading-title">
        <div className="mb-4 flex items-center gap-3">
          <h2 id="recent-reading-title" className="text-sm font-medium">
            Pick up where you left off
          </h2>
          <span className="text-[11px] text-muted-foreground">
            {readingBooks.length} in progress
          </span>
        </div>
        {readingBooks.length ? (
          <div className="grid grid-cols-[repeat(3,minmax(0,260px))] gap-5 max-[1100px]:gap-4 max-[900px]:auto-cols-[210px] max-[900px]:grid-flow-col max-[900px]:grid-cols-none max-[900px]:overflow-x-auto max-[900px]:snap-x pb-2 ">
            {readingBooks.slice(0, 3).map((book) => (
              <ReadingTile
                key={book.id}
                book={book}
                onRead={() => setReading(book)}
                onDetails={() => setSelected(book)}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border">
            <BookOpenIcon className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Your next chapter starts in the library.
            </p>
            <Button
              nativeButton={false}
              render={<Link href="/library" />}
              role="link"
              size="sm"
            >
              Browse books
              <ArrowRightIcon />
            </Button>
          </div>
        )}
      </section>
      <div className="mt-8 grid grid-cols-[1fr_1fr] gap-10 border-t border-border/70 pt-6 max-[1050px]:grid-cols-1 max-[1050px]:gap-7">
        <section aria-labelledby="next-up-title">
          <div className="mb-3 flex items-center justify-between">
            <h2
              id="next-up-title"
              className="text-base font-medium tracking-tight"
            >
              Next up
            </h2>
            <span className="text-[11px] text-muted-foreground">
              Waiting on your shelf
            </span>
          </div>
          <div className="grid gap-1">
            {nextBooks.map((book) => (
              <BookRow
                key={book.id}
                book={book}
                onOpen={() => setReading(book)}
              />
            ))}
            {!nextBooks.length && (
              <p className="py-5 text-sm text-muted-foreground">
                You’re all caught up with your shelf.
              </p>
            )}
          </div>
        </section>
        <section aria-labelledby="recent-added-title">
          <div className="mb-3 flex items-center justify-between">
            <h2
              id="recent-added-title"
              className="text-base font-medium tracking-tight"
            >
              Recently added
            </h2>
            <Button
              nativeButton={false}
              role="link"
              variant="ghost"
              size="icon-sm"
              aria-label="View library"
              render={<Link href="/library" />}
            >
              <ArrowRightIcon />
            </Button>
          </div>
          <div className="grid gap-1">
            {[...books]
              .reverse()
              .slice(0, 3)
              .map((book) => (
                <BookRow
                  key={book.id}
                  book={book}
                  onOpen={() => setSelected(book)}
                />
              ))}
          </div>
        </section>
      </div>
      {finishedBooks.length > 0 && (
        <section
          className="mt-7 border-t border-border/70 pt-6"
          aria-labelledby="finished-title"
        >
          <h2
            id="finished-title"
            className="mb-3 flex items-center gap-2 text-base font-medium"
          >
            <CheckIcon className="size-4 text-muted-foreground" />
            Finished
          </h2>
          <div className="grid grid-cols-3 gap-5 max-[1050px]:grid-cols-2 max-[650px]:grid-cols-1">
            {finishedBooks.map((book) => (
              <BookRow
                key={book.id}
                book={book}
                onOpen={() => setSelected(book)}
              />
            ))}
          </div>
        </section>
      )}
      <Sheet
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <SheetContent className="overflow-y-auto">
          <SheetHeader className="pr-14">
            <SheetTitle>Book information</SheetTitle>
            <SheetDescription>From your Papyrbound library</SheetDescription>
          </SheetHeader>
          {selected && (
            <div className="px-6 pb-8">
              <div className="mx-auto mb-7 mt-1 w-40 [&_.cover-type]:text-lg">
                <BookCover book={selected} />
              </div>
              <p className="text-[10px] tracking-widest text-muted-foreground uppercase">
                {selected.genre}
              </p>
              <h2 className="mt-2 text-2xl leading-tight font-medium tracking-tight">
                {selected.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {selected.author}
              </p>
              <div className="mt-6 flex items-center gap-3">
                <Progress
                  value={selected.progress}
                  aria-label="Reading progress"
                  className="flex-1 [&_[data-slot=progress-track]]:h-1"
                />
                <span className="text-xs text-muted-foreground">
                  {selected.progress}%
                </span>
              </div>
              <dl className="mt-6 divide-y divide-border text-sm">
                {[
                  ["Length", `${selected.pages} pages`],
                  ["Format", "EPUB · Demo library"],
                  [
                    "Status",
                    selected.progress >= 100
                      ? "Finished"
                      : selected.progress
                        ? "In progress"
                        : "Not started",
                  ],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 py-3">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <Button
                className="mt-6 w-full"
                onClick={() => {
                  setReading(selected);
                  setSelected(null);
                }}
              >
                <BookOpenIcon />
                Open reading preview
              </Button>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                Sample text only. EPUB loading comes later.
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>
      {reading && (
        <ReaderPreview
          key={reading.id}
          book={reading}
          onClose={() => setReading(null)}
        />
      )}
    </main>
  );
}
