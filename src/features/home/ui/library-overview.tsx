"use client";

import Link from "next/link";
import { BookOpen, LoaderCircle } from "lucide-react";
import { useWorkspace } from "@/app-shell/workspace-store";
import { useActiveLibrary } from "@/features/library/model/use-active-library";
import { BookDetailsPanel } from "@/features/library/ui/book-details-panel";
import { BookCover } from "./book-cover";
import type { SampleBook } from "../model/sample-books";
import { orderBooks, nextUnreadBook } from "@/features/library/model/book-order";
import { AddBookDialog } from "@/features/library/ui/add-book-dialog";
import { Progress } from "@/shared/ui/progress";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/shared/ui/empty";

export function LibraryOverview() {
  const { books, lists, noun, plural, label, kind, importsReady } = useActiveLibrary();
  const { selectBook, selectedId, openReader } = useWorkspace();
  const recent = books.filter((book) => book.progress > 0).slice(0, 4);
  const finished = books.filter((book) => book.progress >= 100);
  const queued = nextUnreadBook(books, lists.find((list) => list.id === "want-to-read")?.bookIds);
  const next = queued ? [queued] : [];
  const added = orderBooks(books).slice(0, 3);

  if (!books.length) {
    return (
      <main aria-label="Reading Now" className="grid h-[calc(100dvh-3.5rem)] min-h-0 place-items-center overflow-y-auto px-6 py-12">
        {importsReady ? (
          <Empty className="min-h-80 max-w-lg">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="mb-3 size-12 rounded-2xl text-muted-foreground"><BookOpen aria-hidden="true" className="size-6" /></EmptyMedia>
              <EmptyTitle role="heading" aria-level={1}>No {plural} yet</EmptyTitle>
              <EmptyDescription>
                Import {kind === "comics" ? "a CBZ comic" : "an EPUB book"} to get started. Your recent reads and reading progress will appear here.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent><AddBookDialog /></EmptyContent>
          </Empty>
        ) : (
          <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle aria-hidden="true" className="size-4 animate-spin" />Loading your library…</p>
        )}
      </main>
    );
  }

  function row(book: SampleBook, kind: "next" | "finished" | "added") {
    return (
      <button
        key={book.id}
        onClick={() => selectBook(book.id)}
        onDoubleClick={() => openReader(book.id)}
        aria-pressed={selectedId === book.id}
        className="-mx-3 flex w-[calc(100%+1.5rem)] items-center gap-4 rounded-xl px-3 py-3 text-left outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="block w-12 shrink-0 [&_.book-cover]:rounded-[4px]">
          <BookCover book={book} />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold leading-5">
            {book.title}
          </span>
          <span className="mt-1 block text-xs leading-5 text-muted-foreground">
            {kind === "finished"
              ? (book.completedLabel ?? "Recently")
              : book.author}
          </span>
          {kind !== "next" && (
            <span className="mt-1 block text-xs leading-5 text-muted-foreground">
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
    <div className="flex h-[calc(100dvh-3.5rem)] min-h-0">
      <main className="@container min-w-0 flex-1 overflow-y-auto px-6 py-8 lg:px-10">
        <div className="max-w-6xl">
          <h1 className="mb-5 text-ui-title">
            Recent reads
          </h1>
          <div className="grid max-w-4xl grid-cols-[repeat(2,minmax(0,192px))] gap-x-6 gap-y-8 @min-[750px]:grid-cols-[repeat(4,minmax(0,192px))]">
            {recent.map((book) => (
              <button
                key={book.id}
                className={`group w-full max-w-48 rounded-control p-2 text-left outline-none transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring ${selectedId === book.id ? "bg-selected" : ""}`}
                aria-pressed={selectedId === book.id}
                onClick={() => selectBook(book.id)}
                onDoubleClick={() => {
                  selectBook(book.id);
                  openReader(book.id);
                }}
                aria-label={`Continue reading ${book.title}`}
              >
                <span className="block overflow-hidden rounded-sm [&_.book-cover]:rounded-sm"><BookCover book={book} /></span>
                <span className="mt-3 block truncate text-sm font-medium">{book.title}</span>
                <span className="mt-1 block truncate text-ui-meta text-muted-foreground">{book.author}</span>
                <span className="mt-3 flex items-center gap-2">
                  <Progress value={book.progress} aria-label={`${book.title} reading progress`} className="h-1 flex-1" />
                  <span className="text-ui-meta tabular-nums text-muted-foreground">{book.progress}%</span>
                </span>
              </button>
            ))}
          </div>
          {!recent.length && (
            <p className="py-12 text-muted-foreground">
              Start a {noun} from your library to see it here.
            </p>
          )}
          <div className="mt-8 grid gap-8 @min-[750px]:grid-cols-[minmax(0,1.26fr)_minmax(0,1fr)]">
            <div>
              <section>
                <h2 className="mb-4 text-ui-section">
                  Next Up
                </h2>
                {next.map((book) => row(book, "next"))}
                {!next.length && (
                  <p className="text-sm text-muted-foreground">
                    Your next {noun} is waiting in the library.
                  </p>
                )}
              </section>
              <section className="mt-8">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-ui-section">
                    Finished
                  </h2>
                  <Link
                    href="/reading-lists?list=completed"
                    aria-label={`View all finished ${noun}s`}
                    className="shrink-0 rounded-sm text-sm text-muted-foreground outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    View all
                  </Link>
                </div>
                <div className="space-y-2">
                  {finished.slice(0, 2).map((book) => row(book, "finished"))}
                </div>
                {!finished.length && (
                  <p className="text-sm text-muted-foreground">
                    {label} you finish will appear here.
                  </p>
                )}
              </section>
            </div>
            <section>
              <h2 className="mb-4 text-ui-section">
                Recently added
              </h2>
              <div className="space-y-2">
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
