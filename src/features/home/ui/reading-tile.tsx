"use client";
import { InfoIcon } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";
import type { SampleBook } from "../model/sample-books";
import { BookCover } from "./book-cover";

export function ReadingTile({
  book,
  onRead,
  onDetails,
}: {
  book: SampleBook;
  onRead: () => void;
  onDetails: () => void;
}) {
  return (
    <article className="group relative min-w-0 snap-start">
      <Button
        variant="ghost"
        onClick={onRead}
        aria-label={`Preview ${book.title}`}
        className="relative block h-auto w-full overflow-hidden rounded-xl bg-transparent p-0 text-left whitespace-normal ring-1 ring-foreground/5 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="block [&_.book-cover]:rounded-none [&_.cover-type]:text-[clamp(22px,2.2vw,34px)] [&_.cover-credit]:text-[8px]">
          <BookCover book={book} />
        </span>
        <span className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-gradient-to-t from-black/90 via-black/65 to-transparent px-5 pb-5 pt-20 text-white">
          <strong className="line-clamp-2 text-lg leading-tight font-medium tracking-tight">
            {book.title}
          </strong>
          <span className="text-xs text-white/65">{book.author}</span>
          <span className="mt-3 flex items-center gap-3">
            <Progress
              value={book.progress}
              aria-label={`${book.title} reading progress`}
              className="min-w-0 flex-1 [&_[data-slot=progress-track]]:h-[3px] [&_[data-slot=progress-track]]:bg-white/25 [&_[data-slot=progress-indicator]]:bg-white"
            />
            <span className="text-[11px] text-white/80 tabular-nums">
              {book.progress}%
            </span>
          </span>
        </span>
      </Button>
      <Button
        variant="secondary"
        size="icon-sm"
        aria-label={`Details for ${book.title}`}
        onClick={onDetails}
        className="absolute top-3 right-3 bg-black/35 text-white opacity-0 backdrop-blur-md transition-opacity hover:bg-black/60 group-hover:opacity-100 group-focus-within:opacity-100 max-[900px]:opacity-100"
      >
        <InfoIcon className="size-4" />
      </Button>
    </article>
  );
}
