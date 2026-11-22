"use client";

import { useLocalUIState } from "@/shared/hooks/use-local-ui-state";

import { CheckIcon, PlusIcon, ShuffleIcon } from "lucide-react";
import { useActiveLibrary } from "@/features/library/model/use-active-library";
import { BookCover } from "@/features/home/ui/book-cover";
import { Button } from "@/shared/ui/button";
import { TooltipHint } from "@/shared/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";

export function NextReadDialog() {
  const { books, lists, toggleBook, noun, plural } = useActiveLibrary();
  const [open, setOpen] = useLocalUIState(false);
  const [selectedId, setSelectedId] = useLocalUIState<string | null>(null);
  const unread = books.filter((book) => book.progress <= 0);
  const wantToRead =
    lists.find((list) => list.id === "want-to-read")?.bookIds ?? [];
  const queued = unread.filter((book) => wantToRead.includes(book.id));
  const candidates = queued.length > 0 ? queued : unread;
  const selected = unread.find((book) => book.id === selectedId);
  const inQueue = selected ? wantToRead.includes(selected.id) : false;

  function pickAnother() {
    const alternatives = candidates.filter((book) => book.id !== selectedId);
    const otherUnread = unread.filter((book) => book.id !== selectedId);
    const pool =
      alternatives.length > 0
        ? alternatives
        : otherUnread.length > 0
          ? otherUnread
          : candidates;
    setSelectedId(pool[Math.floor(Math.random() * pool.length)]?.id ?? null);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) pickAnother();
        setOpen(next);
      }}
    >
      <TooltipHint content={unread.length === 0 ? `Add an unread ${noun} to get a suggestion` : `Choose an unread ${noun} from your library`}>
      <span className="inline-flex" tabIndex={unread.length === 0 ? 0 : undefined} aria-label={unread.length === 0 ? "Pick my next read" : undefined}>
      <DialogTrigger
        disabled={unread.length === 0}
        render={
          <Button variant="outline" size="sm" className="next-read-trigger" />
        }
      >
        <ShuffleIcon />
        Pick my next read
      </DialogTrigger>
      </span>
      </TooltipHint>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Your next chapter</DialogTitle>
          <DialogDescription>
            {inQueue
              ? "An unread pick from your Want To Read list."
              : "An unread pick from your library."}
          </DialogDescription>
        </DialogHeader>
        {selected ? (
          <>
            <div className="flex items-center gap-6 py-2">
              <div className="next-read-cover w-28 shrink-0" aria-hidden="true">
                <BookCover book={selected} />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-medium wrap-anywhere">
                  {selected.title}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {selected.author}
                </p>
                <p className="mt-4 text-xs text-muted-foreground">
                  {selected.genre}
                  {selected.pages > 0 ? ` · ${selected.pages} pages` : ""}
                </p>
                <span className="mt-3 inline-block rounded-md bg-muted px-2 py-1 text-xs">
                  Not started
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={pickAnother}
                disabled={unread.length < 2}
              >
                <ShuffleIcon />
                Another pick
              </Button>
              <Button
                type="button"
                disabled={inQueue}
                onClick={() => toggleBook("want-to-read", selected.id)}
              >
                {inQueue ? <CheckIcon /> : <PlusIcon />}
                {inQueue ? "In Want To Read" : "Add to Want To Read"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <p className="py-6 text-sm text-muted-foreground">
            No unread {plural} available. Add a {noun} to find your next read.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
