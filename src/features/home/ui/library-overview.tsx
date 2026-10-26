"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  BookOpenIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FolderIcon,
  LibraryIcon,
  PinIcon,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { RevealCard } from "@/shared/ui/reading-motion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { type SampleBook } from "../model/sample-books";
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";
import { useCollections } from "@/features/collections/stores/collections-store";
import { BookCover } from "./book-cover";
import { ReadingGoalsCard } from "./reading-goals-card";

export function LibraryOverview() {
  const { books, lists, markAsRead } = useReadingLists();
  const { collections } = useCollections();
  const [selected, setSelected] = useState<SampleBook | null>(null);
  const readingBooks = books.filter(
    (book) => book.progress > 0 && book.progress < 100,
  );
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const readingIndex = Math.max(
    0,
    readingBooks.findIndex((book) => book.id === activeBookId),
  );
  const currentBook = readingBooks[readingIndex];
  const recentBooks = books.slice(-4).reverse();
  const featuredCollections = [...collections]
    .sort((a, b) => Number(b.pinned) - Number(a.pinned))
    .slice(0, 2);
  const wishlistIds =
    lists.find((list) => list.id === "want-to-read")?.bookIds ?? [];
  const unreadBooks = books.filter((book) => book.progress <= 0);
  const nextBook =
    wishlistIds
      .map((id) => unreadBooks.find((book) => book.id === id))
      .find(Boolean) ?? unreadBooks[0];
  const nextFromList = nextBook ? wishlistIds.includes(nextBook.id) : false;

  return (
    <div className="home-overview max-[1150px]:p-6 max-[600px]:px-5 max-[600px]:pt-5 max-[600px]:pb-8 w-full min-w-0 p-[28px_40px_36px]">
      <header className="home-heading max-[900px]:items-start max-[600px]:mb-6 max-[600px]:flex-col max-[600px]:gap-5 max-[600px]:[&_h1]:text-[28px] flex justify-between items-center gap-[24px] mb-[28px] [&_h1]:text-[30px] [&_h1]:font-medium [&_h1]:[line-height:1.2] [&_h1]:tracking-[-1px]">
        <div>
          <p className="home-eyebrow max-[600px]:block text-muted-foreground text-[11px] mb-[6px]">
            Your reading space
          </p>
          <h1>Welcome back.</h1>
          <p className="home-intro mt-2 text-[13px] text-muted-foreground">
            A book to return to. A new one to discover.
          </p>
        </div>
        <Button
          nativeButton={false}
          role="link"
          variant="ghost"
          className="home-library-shortcut h-auto shrink-0 gap-3 rounded-2xl bg-[color-mix(in_srgb,var(--foreground)_3%,transparent)] px-3 py-[10px] text-left [&>span:nth-child(2)]:grid [&>span:nth-child(2)]:gap-1 [&>span:nth-child(2)>span]:text-[11px] [&>span:nth-child(2)>span]:text-muted-foreground [&_strong]:text-[12px] [&_strong]:font-medium"
          render={<Link href="/library" />}
        >
          <span className="home-library-icon grid [place-items:center] w-[38px] h-[38px] rounded-[12px] bg-muted text-muted-foreground [&_svg]:w-[19px] [&_svg]:h-[19px]">
            <LibraryIcon />
          </span>
          <span>
            <strong>Your library</strong>
            <span>
              {books.length} {books.length === 1 ? "book" : "books"} on your
              shelf
            </span>
          </span>
          <ArrowUpRightIcon className="size-4 text-muted-foreground" />
        </Button>
      </header>

      <div className="home-bento max-[600px]:gap-[14px] grid [grid-template-columns:repeat(12,_minmax(0,_1fr))] gap-[16px] [align-items:stretch]">
        <RevealCard
          index={0}
          className="home-bento-tile min-w-0 gap-0 rounded-3xl border border-[color-mix(in_srgb,var(--foreground)_5%,transparent)] bg-card p-[22px] shadow-none ring-0 max-[600px]:rounded-[20px] max-[600px]:p-[18px] home-bento-reading max-[1150px]:[&_.home-section-heading>div]:gap-0 [grid-area:reading] [&_.home-section-heading]:mb-[18px] [&_.home-section-heading]:[flex-wrap:wrap] [&_.home-featured-art]:w-[44%] [&_.home-featured-art]:[right:-10%] [&_.home-featured-art]:[top:-50%] [&_.home-featured-art]:opacity-[.19] max-[600px]:[&_.home-featured-art]:w-[70%] max-[600px]:[&_.home-featured-art]:top-0 max-[600px]:[&_.home-featured-art]:opacity-[.07] [&_.home-featured-progress]:max-w-[300px] [&_.home-featured-progress]:mt-[14px] [&_.home-featured-actions]:mt-[14px]"
          aria-labelledby="home-reading-title"
        >
          <div className="home-section-heading flex items-center justify-between gap-[8px] min-h-[32px] mb-[12px] [&_h2]:text-[16px] [&_h2]:font-medium [&_h2]:tracking-[-.3px] [&_h2>span]:text-muted-foreground [&_h2>span]:text-[12px] [&_h2>span]:ml-[6px] [&_h2>span]:font-normal [&>a]:text-muted-foreground [&>a]:text-[12px] [&>a]:pr-[0]">
            <h2 id="home-reading-title">
              <BookOpenIcon className="mr-2 inline size-4" />
              Continue reading
            </h2>
            <div className="flex items-center gap-2">
              {readingBooks.length > 1 && (
                <div
                  className="flex items-center gap-1"
                  role="group"
                  aria-label="Browse current reads"
                >
                  <span
                    className="mr-2 text-xs text-muted-foreground"
                    aria-live="polite"
                  >
                    {readingIndex + 1} / {readingBooks.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Previous current read"
                    onClick={() =>
                      setActiveBookId(
                        readingBooks[
                          (readingIndex - 1 + readingBooks.length) %
                            readingBooks.length
                        ].id,
                      )
                    }
                  >
                    <ChevronLeftIcon />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Next current read"
                    onClick={() =>
                      setActiveBookId(
                        readingBooks[(readingIndex + 1) % readingBooks.length]
                          .id,
                      )
                    }
                  >
                    <ChevronRightIcon />
                  </Button>
                </div>
              )}
              <Button
                nativeButton={false}
                role="link"
                variant="ghost"
                size="sm"
                render={<Link href="/library" />}
              >
                View all
                <ArrowRightIcon />
              </Button>
            </div>
          </div>
          {currentBook && (
            <Card
              key={currentBook.id}
              className="home-featured-read relative isolate flex min-h-0 flex-1 flex-row items-center gap-6 overflow-visible rounded-none border-0 bg-transparent p-0 shadow-none ring-0 max-[600px]:gap-4 [animation:reading-book-swap_340ms_var(--motion-reading-ease)_both]"
              style={{ "--book-color": currentBook.paper } as CSSProperties}
            >
              <div
                className="home-featured-art pointer-events-none absolute -z-10 grayscale [transform:rotate(-12deg)] [mask-image:linear-gradient(to_right,transparent,black_65%)] [&_.cover-type]:hidden [&_.cover-credit]:hidden [transition:opacity_350ms_ease,transform_600ms_var(--motion-reading-ease)]"
                aria-hidden="true"
              >
                <BookCover book={currentBook} />
              </div>
              <Button
                variant="ghost"
                className="home-featured-cover h-auto w-[clamp(82px,7vw,112px)] shrink-0 rounded-[5px_8px_8px_5px] border-0 bg-transparent p-0 whitespace-normal max-[600px]:w-[76px] max-[600px]:[&_.cover-type]:text-[10px] [&_.book-cover]:rounded-[inherit] [&_.cover-type]:text-[13px] [&_.cover-credit]:text-[5px]"
                onClick={() => setSelected(currentBook)}
                aria-label={`View ${currentBook.title}`}
              >
                <BookCover book={currentBook} />
              </Button>
              <div
                className="home-featured-info [&_h3]:text-[19px] max-[1150px]:[&_h3]:text-[17px] max-[600px]:[&_h3]:text-[16px] min-w-0 w-[min(100%,_460px)] [&_h3]:text-[20px] [&_h3]:[line-height:1.35] [&_h3]:font-medium [&_h3]:tracking-[-.4px] [&>p]:text-[13px] [&>p]:text-muted-foreground [&>p]:mt-[5px]"
                aria-live="polite"
              >
                <h3>{currentBook.title}</h3>
                <p>{currentBook.author}</p>
                <span className="home-featured-genre inline-flex mt-[9px] p-[2px_8px] rounded-full [background:color-mix(in_srgb,_var(--foreground)_5%,_transparent)] text-muted-foreground text-[10px]">
                  {currentBook.genre}
                </span>
                <div className="home-featured-progress flex items-center gap-[14px] mt-[18px] max-w-[380px] text-[11px] text-muted-foreground [&_.home-progress]:flex-1 [&_.home-progress]:m-[0] [&_.home-progress]:h-[4px] [&_.home-progress>span]:[background:var(--foreground)] [&_.home-progress>span]:[transition:width_420ms_var(--motion-reading-ease)]">
                  <div
                    className="home-progress h-[3px] [background:color-mix(in_srgb,_var(--foreground)_10%,_transparent)] overflow-hidden rounded-full mt-[20px] [&>span]:block [&>span]:h-full [&>span]:[background:color-mix(in_srgb,_var(--book-color)_60%,_var(--foreground))] [&>span]:rounded-[inherit]"
                    role="progressbar"
                    aria-label={`${currentBook.title} reading progress`}
                    aria-valuenow={currentBook.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <span style={{ width: `${currentBook.progress}%` }} />
                  </div>
                  <span>{currentBook.progress}%</span>
                </div>
                <div className="home-featured-actions max-[600px]:flex-wrap flex items-center gap-[10px] mt-[16px]">
                  <Button size="sm" onClick={() => setSelected(currentBook)}>
                    View book
                    <ArrowRightIcon />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAsRead(currentBook.id)}
                  >
                    <CheckIcon />
                    Mark as read
                  </Button>
                </div>
              </div>
            </Card>
          )}
          {readingBooks.length === 0 && (
            <Card className="home-empty flex-row flex-wrap items-center gap-4 p-6 shadow-none ring-0 [&_p]:mt-[6px] [&_p]:text-xs [&_p]:text-muted-foreground [&_h3]:text-[14px] [&>a]:ml-[auto]">
              <BookOpenIcon />
              <div>
                <h3>A new chapter is waiting</h3>
                <p>Explore your library to find your next read.</p>
              </div>
              <Button
                nativeButton={false}
                role="link"
                variant="secondary"
                render={<Link href="/library" />}
              >
                Browse books
                <ChevronRightIcon />
              </Button>
            </Card>
          )}
        </RevealCard>
        <RevealCard
          index={1}
          className="home-bento-tile home-bento-next min-w-0 gap-0 rounded-3xl border border-[color-mix(in_srgb,var(--foreground)_5%,transparent)] bg-[color-mix(in_srgb,var(--next-color)_10%,var(--card))] p-[22px] shadow-none ring-0 [grid-area:notebook] max-[600px]:rounded-[20px] max-[600px]:p-[18px]"
          aria-labelledby="home-next-title"
          style={
            {
              "--next-color": nextBook?.paper ?? "var(--content-sage)",
            } as CSSProperties
          }
        >
          <div className="home-next-heading flex items-center justify-between gap-[10px] [&_h2]:text-[14px] [&_h2]:font-medium [&>span]:text-[10px] [&>span]:text-muted-foreground">
            <h2 id="home-next-title">Up next</h2>
            <span>A fresh chapter</span>
          </div>
          {nextBook ? (
            <>
              <p className="home-next-source text-[11px] text-muted-foreground mt-[6px]">
                {nextFromList
                  ? "From your Want To Read list"
                  : "Waiting in your library"}
              </p>
              <div className="home-next-book flex items-center gap-[18px] mt-[22px]">
                <div
                  className="home-next-cover w-[84px] shrink-0 [&_.cover-type]:text-[10px] [&_.cover-credit]:text-[4px]"
                  aria-hidden="true"
                >
                  <BookCover book={nextBook} />
                </div>
                <div className="home-next-info min-w-0 [&_h3]:text-[18px] [&_h3]:font-medium [&_h3]:tracking-[-.3px] [&_h3]:[line-height:1.35] [&_h3]:[overflow-wrap:anywhere] [&_p]:mt-[6px] [&_p]:text-[12px] [&_p]:text-muted-foreground [&>span]:block [&>span]:mt-[14px] [&>span]:text-[10px] [&>span]:[line-height:1.6] [&>span]:text-muted-foreground">
                  <h3>{nextBook.title}</h3>
                  <p>{nextBook.author}</p>
                  <span>
                    {nextBook.genre}
                    {nextBook.pages > 0 ? ` · ${nextBook.pages} pages` : ""}
                  </span>
                </div>
              </div>
              <div className="home-next-action [&_[data-slot=button]]:w-full [&_[data-slot=button]]:justify-between mt-auto pt-[20px]">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelected(nextBook)}
                >
                  Explore book
                  <ArrowRightIcon />
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="home-next-empty p-[24px_0_0] [&>svg]:text-muted-foreground [&>svg]:mb-[14px] [&_h3]:text-[20px] [&_h3]:[line-height:1.4] [&_p]:mt-[8px] [&_p]:text-[12px] [&_p]:[line-height:1.7] [&_p]:text-muted-foreground">
                <BookOpenIcon className="size-8" />
                <h3>Make room for your next story.</h3>
                <p>
                  Add an unread book to your library and it will appear here.
                </p>
              </div>
              <div className="home-next-action [&_[data-slot=button]]:w-full [&_[data-slot=button]]:justify-between mt-auto pt-[20px]">
                <Button
                  nativeButton={false}
                  role="link"
                  variant="secondary"
                  size="sm"
                  render={<Link href="/library" />}
                >
                  Browse library
                  <ArrowRightIcon />
                </Button>
              </div>
            </>
          )}
        </RevealCard>
        <RevealCard
          index={2}
          className="home-bento-tile min-w-0 gap-0 rounded-3xl border border-[color-mix(in_srgb,var(--foreground)_5%,transparent)] bg-card p-[22px] shadow-none ring-0 max-[600px]:rounded-[20px] max-[600px]:p-[18px] home-bento-recent [grid-area:recent] [&_.home-recent-grid]:[grid-template-columns:repeat(4,_minmax(0,_1fr))] [&_.home-recent-grid]:gap-[16px] [&_.home-recent-grid]:[justify-content:start] [&_.home-recent-book]:max-w-[120px] [&_.cover-type]:text-[clamp(9px,_.9vw,_14px)]"
          aria-labelledby="home-recent-title"
        >
          <div className="home-section-heading flex items-center justify-between gap-[8px] min-h-[32px] mb-[12px] [&_h2]:text-[16px] [&_h2]:font-medium [&_h2]:tracking-[-.3px] [&_h2>span]:text-muted-foreground [&_h2>span]:text-[12px] [&_h2>span]:ml-[6px] [&_h2>span]:font-normal [&>a]:text-muted-foreground [&>a]:text-[12px] [&>a]:pr-[0]">
            <h2 id="home-recent-title">Recently added</h2>
            <Button
              nativeButton={false}
              role="link"
              variant="ghost"
              size="sm"
              render={<Link href="/library" />}
            >
              View all
              <ChevronRightIcon />
            </Button>
          </div>
          <div className="home-recent-grid max-[1150px]:gap-[14px] max-[900px]:grid-cols-[repeat(4,minmax(0,120px))] max-[900px]:gap-6 max-[600px]:grid-cols-4 max-[600px]:gap-3 grid [grid-template-columns:repeat(4,_minmax(0,_1fr))] gap-[20px]">
            {recentBooks.map((book) => (
              <Button
                key={book.id}
                variant="ghost"
                className="home-recent-book flex h-auto min-w-0 max-w-[120px] flex-col items-stretch justify-start gap-[9px] rounded-lg bg-transparent p-0 whitespace-normal hover:bg-transparent hover:[&_.book-cover]:brightness-105 max-[600px]:[&_.cover-type]:text-[9px] max-[600px]:[&_.cover-credit]:text-[3px] [&_.book-cover]:rounded-[4px_8px_8px_4px] [&_.book-cover]:[transition:filter_180ms] [&_.cover-type]:text-[clamp(11px,_1.1vw,_18px)] [&_.cover-credit]:text-[5px]"
                onClick={() => setSelected(book)}
                aria-label={`View ${book.title} by ${book.author}`}
              >
                <BookCover book={book} />
                <span className="home-book-status inline-flex items-center gap-[4px] text-[10px] text-muted-foreground text-left [&_svg]:w-[12px] [&_svg]:h-[12px]">
                  {book.progress >= 100 ? (
                    <>
                      <CheckIcon />
                      Completed
                    </>
                  ) : book.progress > 0 ? (
                    `${book.progress}% read`
                  ) : (
                    <span className="home-new-label p-[2px_6px] rounded-[4px] bg-muted">
                      New
                    </span>
                  )}
                </span>
              </Button>
            ))}
          </div>
          {recentBooks.length === 0 && (
            <p className="home-section-empty">
              Books you add will appear here.
            </p>
          )}
        </RevealCard>
        <RevealCard
          index={3}
          className="home-bento-tile min-w-0 gap-0 rounded-3xl border border-[color-mix(in_srgb,var(--foreground)_5%,transparent)] bg-card p-[22px] shadow-none ring-0 max-[600px]:rounded-[20px] max-[600px]:p-[18px] home-bento-collections [grid-area:collections] [&_.home-collection-list]:gap-[18px] [&_.home-collection-art]:w-[76px] [&_.home-collection-art]:h-[68px] [&_.home-collection-art>span]:w-[24px] [&_.home-collection]:gap-[12px] [&_.home-collection-name]:text-[12px]"
          aria-labelledby="home-collections-title"
        >
          <div className="home-section-heading flex items-center justify-between gap-[8px] min-h-[32px] mb-[12px] [&_h2]:text-[16px] [&_h2]:font-medium [&_h2]:tracking-[-.3px] [&_h2>span]:text-muted-foreground [&_h2>span]:text-[12px] [&_h2>span]:ml-[6px] [&_h2>span]:font-normal [&>a]:text-muted-foreground [&>a]:text-[12px] [&>a]:pr-[0]">
            <h2 id="home-collections-title">Your collections</h2>
            <Button
              nativeButton={false}
              role="link"
              variant="ghost"
              size="sm"
              aria-label="View all collections"
              render={<Link href="/collections" />}
            >
              <ChevronRightIcon />
            </Button>
          </div>
          <div className="home-collection-list grid gap-[12px]">
            {featuredCollections.map((collection) => {
              const collectionBooks = collection.bookIds
                .map((id) => books.find((book) => book.id === id))
                .filter((book): book is SampleBook => Boolean(book));
              return (
                <Button
                  nativeButton={false}
                  role="link"
                  variant="ghost"
                  className="home-collection -m-[6px] flex h-auto justify-start gap-[14px] rounded-[14px] p-[6px] text-left whitespace-normal max-[1150px]:flex-wrap max-[900px]:flex-nowrap [&>svg]:w-[14px] [&>svg]:h-[14px] [&>svg]:shrink-0 [&>svg]:text-muted-foreground"
                  key={collection.id}
                  render={
                    <Link
                      href={`/collections?collection=${encodeURIComponent(collection.id)}`}
                    />
                  }
                >
                  <span
                    className="home-collection-art [&>span+span]:-ml-[6px] [&>span:first-child]:-rotate-8 [&>span:nth-child(3)]:rotate-8 max-[1150px]:h-[86px]! max-[1150px]:w-full! max-[900px]:h-[68px]! max-[900px]:w-[76px]! w-[96px] h-[76px] flex items-center justify-center shrink-0 rounded-[12px] [background:color-mix(in_srgb,_var(--collection-color)_18%,_var(--card))] p-[10px] [&>span]:w-[28px] [&>span]:shrink-0 [&_.book-cover]:rounded-[2px_3px_3px_2px] [&_.cover-type]:text-[3px] [&_.cover-credit]:hidden"
                    style={
                      {
                        "--collection-color": collection.color,
                      } as CSSProperties
                    }
                    aria-hidden="true"
                  >
                    {collectionBooks.length ? (
                      collectionBooks.slice(0, 3).map((book) => (
                        <span key={book.id}>
                          <BookCover book={book} />
                        </span>
                      ))
                    ) : (
                      <FolderIcon />
                    )}
                  </span>
                  <span className="home-collection-info max-[1150px]:basis-[70%] max-[900px]:basis-auto block min-w-0 flex-1">
                    <span className="home-collection-name flex items-center gap-[5px] text-[13px] font-medium [&_svg]:w-[11px] [&_svg]:h-[11px] [&_svg]:text-muted-foreground">
                      {collection.name}
                      {collection.pinned && <PinIcon aria-label="Pinned" />}
                    </span>
                    <span className="home-collection-count block mt-[6px] text-[11px] text-muted-foreground">
                      {collectionBooks.length}{" "}
                      {collectionBooks.length === 1 ? "book" : "books"}
                    </span>
                  </span>
                  <ChevronRightIcon />
                </Button>
              );
            })}
          </div>
          {featuredCollections.length === 0 && (
            <Button
              nativeButton={false}
              role="link"
              variant="outline"
              render={<Link href="/collections" />}
            >
              Create a collection
              <ChevronRightIcon />
            </Button>
          )}
        </RevealCard>
        <ReadingGoalsCard books={books} onSelect={setSelected} />
      </div>

      <Sheet
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
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
              <div className="book-detail-cover w-[160px] m-[16px_auto_24px]">
                <BookCover book={selected} />
              </div>
              <h2 className="text-2xl">{selected.title}</h2>
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
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
