"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowRightIcon, BookOpenIcon, ChevronRightIcon } from "lucide-react";

import { useCollections } from "@/features/collections/stores/collections-store";
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";
import { useAccount } from "@/features/profile/stores/account-store";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { type SampleBook } from "../model/sample-books";
import { BookCover } from "./book-cover";

export function EditorialOverview() {
  const { profile } = useAccount();
  const { books, markAsRead } = useReadingLists();
  const { collections } = useCollections();
  const [selected, setSelected] = useState<SampleBook | null>(null);
  const readingBooks = books.filter(
    (book) => book.progress > 0 && book.progress < 100,
  );
  const primaryBook = readingBooks[0];
  const otherReads = readingBooks.slice(1, 3);
  const shelfBooks = books.slice(-4).reverse();
  const featuredCollections = [...collections]
    .sort((first, second) => Number(second.pinned) - Number(first.pinned))
    .slice(0, 2);
  const firstName = profile.name.trim().split(/\s+/)[0] || "reader";

  return (
    <main className="w-full min-w-0 px-10 pb-16 pt-10 max-[1100px]:px-7 max-[700px]:px-5 max-[700px]:pt-7">
      <header className="mb-9 max-[700px]:mb-8">
        <p className="mb-1 text-xs text-muted-foreground">
          Welcome back, {firstName}
        </p>
        <h1 className="text-[clamp(1.9rem,2.7vw,2.55rem)] leading-tight font-semibold tracking-tight">
          Your next chapter awaits.
        </h1>
      </header>

      <section aria-labelledby="continue-reading-title">
        <h2
          id="continue-reading-title"
          className="mb-4 text-lg font-medium tracking-tight"
        >
          Continue reading
        </h2>
        {primaryBook ? (
          <div className="grid grid-cols-[minmax(0,1.9fr)_minmax(255px,1fr)] gap-5 max-[1050px]:grid-cols-1 max-[700px]:gap-3">
            <Card
              className="relative isolate min-h-[296px] min-w-0 flex-row gap-0 overflow-hidden rounded-[22px] border-0 bg-[color-mix(in_srgb,var(--feature-paper)_55%,#f8f3ed)] p-0 text-[#412e37] shadow-none dark:bg-[color-mix(in_srgb,var(--feature-paper)_20%,var(--card))] dark:text-foreground max-[700px]:min-h-[250px]"
              style={{ "--feature-paper": primaryBook.paper } as CSSProperties}
            >
              <div className="relative z-10 flex w-[62%] min-w-0 flex-col items-start p-7 max-[700px]:w-[65%] max-[700px]:p-5">
                <p className="text-[11px] font-medium uppercase tracking-wide opacity-70">
                  Last opened
                </p>
                <h3 className="mt-5 line-clamp-2 text-[clamp(1.5rem,2.25vw,2.25rem)] leading-tight font-semibold tracking-tight max-[700px]:mt-4">
                  {primaryBook.title}
                </h3>
                <p className="mt-2 text-sm opacity-75 max-[700px]:text-xs">
                  {primaryBook.author} · {primaryBook.progress}% complete
                </p>
                <div
                  className="mt-5 h-1 w-[min(100%,260px)] overflow-hidden rounded-full bg-current/15"
                  role="progressbar"
                  aria-label={`${primaryBook.title} reading progress`}
                  aria-valuenow={primaryBook.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <span
                    className="block h-full rounded-full bg-[#6c3048] dark:bg-current"
                    style={{ width: `${primaryBook.progress}%` }}
                  />
                </div>
                <Button
                  className="mt-auto gap-5 bg-[#6c3048] text-white hover:bg-[#55253a] dark:bg-primary dark:text-primary-foreground max-[700px]:gap-2"
                  onClick={() => setSelected(primaryBook)}
                >
                  Continue reading
                  <ArrowRightIcon aria-hidden="true" />
                </Button>
              </div>
              <div className="absolute inset-y-0 right-0 flex w-[38%] items-center justify-center rounded-l-[22px] bg-[color-mix(in_srgb,var(--feature-paper)_72%,#cfae9c)] dark:bg-[color-mix(in_srgb,var(--feature-paper)_28%,var(--card))]">
                <div className="w-[min(55%,170px)] -rotate-3 drop-shadow-[0_16px_18px_rgb(40_25_30_/_22%)] max-[700px]:w-[70%] [&_.cover-type]:text-[clamp(10px,1.3vw,19px)]">
                  <BookCover book={primaryBook} />
                </div>
              </div>
            </Card>

            <div className="grid min-w-0 grid-rows-2 gap-4 max-[1050px]:grid-cols-2 max-[1050px]:grid-rows-1 max-[700px]:gap-3 max-[540px]:grid-cols-1">
              {otherReads.map((book) => (
                <Button
                  key={book.id}
                  variant="ghost"
                  className="group h-full min-h-[140px] w-full min-w-0 justify-start gap-4 rounded-2xl bg-[color-mix(in_srgb,var(--mini-paper)_62%,#f7f4f2)] p-4 text-left whitespace-normal hover:bg-[color-mix(in_srgb,var(--mini-paper)_72%,#f7f4f2)] dark:bg-[color-mix(in_srgb,var(--mini-paper)_15%,var(--card))] dark:hover:bg-[color-mix(in_srgb,var(--mini-paper)_23%,var(--card))] max-[540px]:min-h-[128px]"
                  style={{ "--mini-paper": book.paper } as CSSProperties}
                  onClick={() => setSelected(book)}
                  aria-label={`Continue reading ${book.title}`}
                >
                  <span className="w-[72px] shrink-0 drop-shadow-sm [&_.cover-type]:text-[9px] [&_.cover-credit]:text-[4px]">
                    <BookCover book={book} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col self-stretch py-1">
                    <strong className="line-clamp-2 text-sm leading-snug font-medium">
                      {book.title}
                    </strong>
                    <span className="mt-2 text-xs text-muted-foreground">
                      {book.progress}% complete
                    </span>
                    <span className="mt-auto flex items-center justify-between gap-2 text-xs font-medium">
                      Continue
                      <ChevronRightIcon
                        className="size-4 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </span>
                </Button>
              ))}
              {otherReads.length === 0 && (
                <Button
                  nativeButton={false}
                  role="link"
                  variant="ghost"
                  render={<Link href="/library" />}
                  className="h-full min-h-[140px] justify-between rounded-2xl bg-muted/70 p-5 text-left whitespace-normal hover:bg-muted"
                >
                  <span>Find another book to read</span>
                  <ArrowRightIcon className="size-4" aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>
        ) : (
          <Card className="min-h-56 items-start justify-center gap-3 rounded-[22px] border-0 bg-[color-mix(in_srgb,var(--content-lilac)_34%,var(--card))] p-8 shadow-none">
            <BookOpenIcon
              className="size-7 text-muted-foreground"
              aria-hidden="true"
            />
            <h3 className="text-xl font-medium">A new story is waiting.</h3>
            <p className="text-sm text-muted-foreground">
              Pick a book from your library to begin reading.
            </p>
            <Button
              nativeButton={false}
              role="link"
              render={<Link href="/library" />}
            >
              Open library <ArrowRightIcon aria-hidden="true" />
            </Button>
          </Card>
        )}
      </section>

      <div className="mt-11 grid grid-cols-[minmax(0,1.9fr)_minmax(255px,1fr)] items-start gap-6 max-[1050px]:grid-cols-1 max-[700px]:mt-9">
        <section className="min-w-0" aria-labelledby="new-shelf-title">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2
              id="new-shelf-title"
              className="text-lg font-medium tracking-tight"
            >
              New on your shelf
            </h2>
            <Button
              nativeButton={false}
              role="link"
              variant="ghost"
              size="sm"
              render={<Link href="/library" />}
            >
              Open library <ChevronRightIcon aria-hidden="true" />
            </Button>
          </div>
          {shelfBooks.length > 0 ? (
            <div className="grid grid-cols-4 gap-4 max-[700px]:gap-3 max-[480px]:grid-cols-2">
              {shelfBooks.map((book) => (
                <Button
                  key={book.id}
                  variant="ghost"
                  className="group flex h-auto min-w-0 flex-col items-stretch justify-start gap-2 rounded-none bg-transparent p-0 text-left whitespace-normal hover:bg-transparent"
                  onClick={() => setSelected(book)}
                  aria-label={`View ${book.title} by ${book.author}`}
                >
                  <span
                    className="flex aspect-[152/208] w-full items-center justify-center rounded-[14px] bg-[color-mix(in_srgb,var(--shelf-paper)_33%,var(--card))] p-[10%] dark:bg-[color-mix(in_srgb,var(--shelf-paper)_17%,var(--card))]"
                    style={{ "--shelf-paper": book.paper } as CSSProperties}
                  >
                    <span className="w-full max-w-[116px] transition-transform group-hover:-translate-y-1 [&_.cover-type]:text-[clamp(9px,1.05vw,15px)] [&_.cover-credit]:text-[5px]">
                      <BookCover book={book} />
                    </span>
                  </span>
                  <span className="line-clamp-2 text-sm leading-snug font-medium">
                    {book.title}
                  </span>
                </Button>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl bg-muted/60 p-6 text-sm text-muted-foreground">
              Books you add will appear here.
            </p>
          )}
        </section>

        <section className="min-w-0" aria-labelledby="moods-title">
          <h2
            id="moods-title"
            className="mb-5 text-lg font-medium tracking-tight"
          >
            Made for your moods
          </h2>
          <div className="grid gap-4 max-[1050px]:grid-cols-2 max-[600px]:grid-cols-1">
            {featuredCollections.map((collection) => {
              const collectionBooks = collection.bookIds
                .map((id) => books.find((book) => book.id === id))
                .filter((book): book is SampleBook => Boolean(book));

              return (
                <Link
                  key={collection.id}
                  href={`/collections?collection=${encodeURIComponent(collection.id)}`}
                  className="group relative flex min-h-[130px] items-center overflow-hidden rounded-2xl bg-[color-mix(in_srgb,var(--mood-paper)_40%,#f7f5f2)] p-5 text-foreground hover:bg-[color-mix(in_srgb,var(--mood-paper)_54%,#f7f5f2)] focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-3 dark:bg-[color-mix(in_srgb,var(--mood-paper)_17%,var(--card))] dark:hover:bg-[color-mix(in_srgb,var(--mood-paper)_24%,var(--card))]"
                  style={{ "--mood-paper": collection.color } as CSSProperties}
                >
                  <span className="relative z-10 flex min-w-0 flex-1 flex-col self-stretch justify-center pr-2">
                    <span className="text-xs text-muted-foreground">
                      {collectionBooks.length}{" "}
                      {collectionBooks.length === 1 ? "book" : "books"}
                    </span>
                    <strong className="mt-2 line-clamp-2 text-base font-medium">
                      {collection.name}
                    </strong>
                    <span className="mt-1 text-xs text-muted-foreground">
                      Explore collection
                    </span>
                  </span>
                  <span
                    className="relative flex h-[88px] w-[92px] shrink-0 items-end justify-end"
                    aria-hidden="true"
                  >
                    {collectionBooks.slice(0, 2).map((book, index) => (
                      <span
                        key={book.id}
                        className={`absolute bottom-0 w-[48px] drop-shadow-[0_4px_6px_rgb(0_0_0_/_16%)] [&_.cover-type]:text-[5px] [&_.cover-credit]:hidden ${index === 0 ? "right-8 -rotate-7" : "right-0 rotate-6"}`}
                      >
                        <BookCover book={book} />
                      </span>
                    ))}
                    {collectionBooks.length === 0 && (
                      <BookOpenIcon className="size-8 opacity-50" />
                    )}
                  </span>
                </Link>
              );
            })}
            {featuredCollections.length === 0 && (
              <Link
                href="/collections"
                className="flex min-h-[130px] items-center justify-between gap-4 rounded-2xl bg-muted/60 p-5 text-sm hover:bg-muted"
              >
                Create a collection
                <ArrowRightIcon className="size-4" aria-hidden="true" />
              </Link>
            )}
          </div>
        </section>
      </div>

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
