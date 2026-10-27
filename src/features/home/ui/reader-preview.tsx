"use client";
import { useState } from "react";
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ListIcon,
  MinusIcon,
  PlusIcon,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/shared/ui/dialog";
import type { SampleBook } from "../model/sample-books";
import { previewChapters } from "../model/reader-preview";

export function ReaderPreview({
  book,
  onClose,
}: {
  book: SampleBook;
  onClose: () => void;
}) {
  const [chapter, setChapter] = useState(0);
  const [fontSize, setFontSize] = useState(19);
  const [contents, setContents] = useState(false);
  const current = previewChapters[chapter];
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[min(900px,94dvh)] w-[calc(100%-32px)] max-w-none flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[1400px]"
      >
        <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Return to reading now"
          >
            <ArrowLeftIcon />
          </Button>
          <div className="min-w-0 flex-1">
            <DialogTitle className="truncate text-sm">{book.title}</DialogTitle>
            <DialogDescription className="mt-1 text-[11px]">
              Reading preview · Original sample text
            </DialogDescription>
          </div>
          <Button
            variant={contents ? "secondary" : "ghost"}
            size="icon-sm"
            aria-label="Toggle contents"
            aria-pressed={contents}
            onClick={() => setContents(!contents)}
          >
            <ListIcon />
          </Button>
          <span className="mx-1 h-4 w-px bg-border" />
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Decrease text size"
            disabled={fontSize <= 16}
            onClick={() => setFontSize(fontSize - 1)}
          >
            <MinusIcon />
          </Button>
          <span className="w-5 text-center text-xs tabular-nums">
            {fontSize}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Increase text size"
            disabled={fontSize >= 25}
            onClick={() => setFontSize(fontSize + 1)}
          >
            <PlusIcon />
          </Button>
        </header>
        <div className="flex min-h-0 flex-1">
          {contents && (
            <nav
              aria-label="Sample chapters"
              className="w-56 shrink-0 overflow-y-auto border-r border-border bg-muted/25 p-4 max-[650px]:w-40"
            >
              <p className="mb-5 px-2 text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
                Contents
              </p>
              {previewChapters.map((item, index) => (
                <Button
                  key={item.title}
                  variant={chapter === index ? "secondary" : "ghost"}
                  aria-current={chapter === index ? "page" : undefined}
                  className="mb-1 h-auto w-full justify-start rounded-lg px-3 py-3 text-left text-xs whitespace-normal"
                  onClick={() => setChapter(index)}
                >
                  <span className="mr-1 text-muted-foreground">
                    0{index + 1}
                  </span>
                  {item.title}
                </Button>
              ))}
            </nav>
          )}
          <div
            key={chapter}
            className="min-w-0 flex-1 overflow-y-auto bg-[#faf7f0] text-[#342f28] dark:bg-[#24231f] dark:text-[#e4dfd3]"
          >
            <article
              className="mx-auto max-w-[690px] px-8 py-12 max-[650px]:px-5 max-[650px]:py-8"
              style={{ fontSize }}
            >
              <p className="mb-4 text-[11px] tracking-[.18em] opacity-50 uppercase">
                Chapter {chapter + 1}
              </p>
              <h2 className="mb-9 font-serif text-[1.85em] leading-tight font-normal tracking-tight">
                {current.title}
              </h2>
              <div className="space-y-6 font-serif leading-[1.85]">
                {current.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <p className="mt-12 text-center text-[11px] tracking-widest opacity-40">
                PAPYRBOUND
              </p>
            </article>
          </div>
        </div>
        <footer className="flex shrink-0 items-center justify-between border-t border-border px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            disabled={chapter === 0}
            onClick={() => setChapter(chapter - 1)}
          >
            <ChevronLeftIcon />
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            {chapter + 1} of {previewChapters.length} sample chapters
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={chapter === previewChapters.length - 1}
            onClick={() => setChapter(chapter + 1)}
          >
            Next
            <ChevronRightIcon />
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
