"use client";

import { create } from "zustand";

import { useRouter } from "next/navigation";

import {
  Search,
  ListFilter,
  MoreHorizontal,
  BookOpen,
  Copy,
  Highlighter,
  Trash2,
  StickyNote,
  Check,
  ChevronsUpDown,
  NotebookPen,
  Download,
  Pencil,
} from "lucide-react";

import { useAnnotations } from "../stores/annotations-store";

import { annotationColors } from "../model/annotation";
import type { Annotation } from "../model/annotation";
import { annotationDate, annotationsMarkdown, downloadAnnotations, visibleAnnotations } from "../model/annotation-view";
import { AnnotationEditor } from "./annotation-editor";
import { Card, CardContent } from "@/shared/ui/card";

import { useActiveLibrary } from "@/features/library/model/use-active-library";

import { useWorkspace } from "@/app-shell/workspace-store";

import { BookCover } from "@/features/home/ui/book-cover";

import { Button } from "@/shared/ui/button";
import { TooltipHint } from "@/shared/ui/tooltip";

import { Input } from "@/shared/ui/input";
import { Popover, PopoverContent, PopoverTrigger, PopoverTitle } from "@/shared/ui/popover";

import {
  Trace,
  TraceLine,
  TraceIcon,
  TraceTitle,
  TraceDescription,
  TraceCollapsible,
  TraceCollapsibleTrigger,
  TraceCollapsibleContent,
} from "@/shared/ui/trace";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from "@/shared/ui/dropdown-menu";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/shared/ui/alert-dialog";

const useAnnotationUI = create<{
  query: string;
  book: string;
  sort: string;
  expanded: string[];
  deleting: string | null;
  message: string;
  editing: Annotation | "new" | null;
  patch: (
    v: Partial<{
      query: string;
      book: string;
      sort: string;
      expanded: string[];
      deleting: string | null;
      message: string;
      editing: Annotation | "new" | null;
    }>,
  ) => void;
}>((set) => ({
  query: "",
  book: "all",
  sort: "newest",
  expanded: ["quiet"],
  deleting: null,
  message: "",
  editing: null,
  patch: (v) => set(v),
}));

export function AnnotationsToolbar() {
  const ui = useAnnotationUI();
  const { annotations } = useAnnotations();
  const { books, plural, noun, kind } = useActiveLibrary();
  const selectedBook = books.some((book) => book.id === ui.book) ? ui.book : "all";
  const visible = visibleAnnotations(annotations, books, ui.book, ui.query, ui.sort);
  const groups = books.filter((book) => visible.some((item) => item.bookId === book.id));
  return (
    <>
      <Popover>
        <PopoverTrigger aria-label="Search annotations" render={<Button variant="secondary" size="icon-sm" />}><Search /></PopoverTrigger>
        <PopoverContent align="end" className="w-72 max-w-[calc(100vw-2rem)]">
          <PopoverTitle>Search annotations</PopoverTitle>
          <Input
            placeholder="Search quotes and notes"
            aria-label="Search annotations"
            value={ui.query}
            onChange={(e) => {
              const query = e.target.value;
              ui.patch({
                query,
                expanded: query ? books.filter((book) => annotations.some((a) =>
                  a.bookId === book.id && `${a.content} ${a.note}`.toLowerCase().includes(query.toLowerCase()),
                )).map((book) => book.id) : ui.expanded,
              });
            }}
          />
        </PopoverContent>
      </Popover>
        <DropdownMenu>
          <TooltipHint content={books.find((b) => b.id === ui.book)?.title ?? `All ${plural}`}><DropdownMenuTrigger
            aria-label={`Filter annotations by ${noun}`}
            render={<Button variant="secondary" size="icon-sm" />}
          >
            <BookOpen />
          </DropdownMenuTrigger></TooltipHint>
          <DropdownMenuContent align="end" className="w-[272px]">
            <DropdownMenuRadioGroup
              value={selectedBook}
              onValueChange={(book) => ui.patch({ book })}
            >
              <DropdownMenuRadioItem value="all">
                All {plural}
              </DropdownMenuRadioItem>
              {books
                .filter((b) => annotations.some((a) => a.bookId === b.id))
                .map((b) => (
                  <DropdownMenuRadioItem key={b.id} value={b.id}>
                    {b.title}
                  </DropdownMenuRadioItem>
                ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="secondary" size="icon-sm" aria-label="Annotation view and export options" />}
          >
            <ListFilter />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={ui.sort}
                onValueChange={(sort) => ui.patch({ sort })}
              >
                <DropdownMenuRadioItem value="newest">
                  Newest first
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="oldest">
                  Oldest first
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => ui.patch({ expanded: groups.every((book) => ui.expanded.includes(book.id)) ? [] : groups.map((book) => book.id) })}>
              <ChevronsUpDown />
              {groups.length && groups.every((book) => ui.expanded.includes(book.id)) ? "Collapse all" : "Expand all"}
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!visible.length} onClick={() => {
              downloadAnnotations(annotationsMarkdown(visible, books), kind);
              ui.patch({ message: "Annotations exported as Markdown." });
            }}>
              <Download /> Export visible annotations
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <TooltipHint content="New note"><Button
          variant="secondary"
          size="icon-sm"
          aria-label="New note"
          disabled={!books.length}
          onClick={() => ui.patch({ editing: "new" })}
        >
          <NotebookPen />
        </Button></TooltipHint>
    </>
  );
}

export function AnnotationsPage() {
  const { annotations, setAnnotations } = useAnnotations();
  const { books, noun, plural } = useActiveLibrary();
  const selectBook = useWorkspace((state) => state.revealBook);
  const ui = useAnnotationUI();
  const router = useRouter();
  const selectedBook = books.some((book) => book.id === ui.book) ? ui.book : "all";
  const visible = visibleAnnotations(annotations, books, ui.book, ui.query, ui.sort);
  const groups = books.filter((b) => visible.some((a) => a.bookId === b.id));
  const expanded = ui.expanded;

  return (
    <main aria-label="Annotations" className="px-5 pt-[34px] pb-8 md:pl-9 md:pr-7">
      <Trace className="gap-6">
        {groups.map((book) => (
          <TraceCollapsible
            key={book.id}
            open={expanded.includes(book.id)}
            onOpenChange={(open) => ui.patch({
              expanded: open
                ? [...new Set([...ui.expanded, book.id])]
                : ui.expanded.filter((id) => id !== book.id),
            })}
          >
            <TraceCollapsibleTrigger className="w-full gap-3 px-3 py-3 hover:bg-hover">
              <TraceLine className="w-full gap-3 text-foreground">
                <TraceIcon className="h-12 w-8 [&_.book-cover]:rounded-sm [&_.cover-type]:hidden [&_.cover-credit]:hidden">
                  <BookCover book={book} />
                </TraceIcon>
                <TraceTitle className="flex-1">
                  <span className="block truncate text-base font-medium">{book.title}</span>
                  <span className="mt-1 block truncate text-xs text-muted-foreground">{book.author}</span>
                </TraceTitle>
                <TraceDescription className="text-xs">
                  {visible.filter((a) => a.bookId === book.id).length} annotations
                </TraceDescription>
              </TraceLine>
            </TraceCollapsibleTrigger>
            <TraceCollapsibleContent className="ml-7 pr-1 pl-5">
              <Trace className="gap-0 divide-y divide-border">
                {visible
                  .filter((a) => a.bookId === book.id)
                  .map((a) => (
                    <article
                      key={a.id}
                      className="py-5"
                    >
                      <header className="mb-3">
                        <TraceLine className="w-full flex-wrap text-xs">
                          <TraceIcon style={{ color: annotationColors[a.color] }}>
                            {a.kind === "highlight" ? <Highlighter /> : <StickyNote />}
                          </TraceIcon>
                          <TraceTitle className="flex-1 whitespace-normal">
                          {a.chapter ? `${a.chapter} · ` : ""}Page{" "}
                          {a.page ?? "—"}
                          </TraceTitle>
                          <span className="ml-auto inline-flex shrink-0 items-center gap-2">
                          <TraceDescription className="text-xs">
                        <time dateTime={a.createdAt}>
                          {annotationDate(a.createdAt)}
                        </time>
                          </TraceDescription>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                            />
                          }
                          aria-label="Annotation options"
                        >
                          <MoreHorizontal />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[272px]">
                          <DropdownMenuItem onClick={() => ui.patch({ editing: a })}>
                            <Pencil /> {a.kind === "highlight" ? "Edit highlight note" : "Edit note"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              selectBook(book.id);
                              router.push("/library");
                            }}
                          >
                            <BookOpen />
                            Open {noun} details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(a.content);
                                ui.patch({ message: "Quote copied." });
                              } catch {
                                ui.patch({
                                  message:
                                    "Clipboard is unavailable in this window.",
                                });
                              }
                            }}
                          >
                            <Copy />
                            Copy quote
                          </DropdownMenuItem>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <Highlighter />
                              Change highlight colour
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              {Object.entries(annotationColors).map(
                                ([name, color]) => (
                                  <DropdownMenuItem
                                    key={name}
                                    onClick={() =>
                                      setAnnotations((items) =>
                                        items.map((item) =>
                                          item.id === a.id
                                            ? {
                                                ...item,
                                                color:
                                                  name as keyof typeof annotationColors,
                                              }
                                            : item,
                                        ),
                                      )
                                    }
                                  >
                                    <span
                                      className="size-3 rounded-full"
                                      style={{ background: color }}
                                    />
                                    {name}
                                    {a.color === name && (
                                      <Check className="ml-auto" />
                                    )}
                                  </DropdownMenuItem>
                                ),
                              )}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => ui.patch({ deleting: a.id })}
                          >
                            <Trash2 />
                            Delete annotation
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                          </span>
                        </TraceLine>
                      </header>
                      <p
                        className="border-l-2 py-1 pl-4 text-base leading-7 text-foreground"
                        style={{ borderColor: annotationColors[a.color] }}
                      >
                        {a.kind === "highlight" ? `“${a.content}”` : a.content}
                      </p>
                      {a.note && (
                        <div className="mt-4 flex items-center gap-3 text-sm leading-[22px] text-muted-foreground">
                          <StickyNote className="size-3.5 shrink-0" />
                          <p>
                            <span className="sr-only">Your note: </span>
                            {a.note}
                          </p>
                        </div>
                      )}


                    </article>
                  ))}
              </Trace>
            </TraceCollapsibleContent>
          </TraceCollapsible>
        ))}
      </Trace>
      {!groups.length && (
        <Card className="mx-auto my-8 max-w-md border border-dashed border-border bg-transparent shadow-none ring-0">
          <CardContent className="py-6 text-center">
            <NotebookPen className="mx-auto mb-4 size-7 text-muted-foreground" />
            <h2 className="text-base font-medium">{ui.query.trim() || selectedBook !== "all" ? "No matching annotations" : "Your thoughts belong here"}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {ui.query.trim() || selectedBook !== "all" ? "Try another search or clear the filters." : `Save notes alongside your ${plural}, then find or export them here.`}
            </p>
            {ui.query.trim() || selectedBook !== "all" ? (
              <Button className="mt-5" variant="secondary" onClick={() => ui.patch({ query: "", book: "all" })}>Clear filters</Button>
            ) : books.length ? (
              <Button className="mt-5" variant="secondary" onClick={() => ui.patch({ editing: "new" })}><NotebookPen /> Add your first note</Button>
            ) : <p className="mt-4 text-xs text-muted-foreground">Import a {noun} to get started.</p>}
          </CardContent>
        </Card>
      )}
      <p className="sr-only" role="status">
        {ui.message}
      </p>
      {ui.editing && books.length > 0 && (
        <AnnotationEditor
          key={ui.editing === "new" ? "new" : ui.editing.id}
          annotation={ui.editing === "new" ? undefined : ui.editing}
          books={books}
          noun={noun}
          defaultBookId={selectedBook !== "all" ? selectedBook : books[0].id}
          onClose={() => ui.patch({ editing: null })}
          onSave={(details) => {
            const editing = ui.editing;
            setAnnotations((items) => editing && editing !== "new"
              ? items.map((item) => item.id === editing.id ? { ...item, ...details } : item)
              : [{ ...details, id: crypto.randomUUID(), createdAt: new Date().toISOString(), starred: false }, ...items]);
            ui.patch({ editing: null, query: "", book: details.bookId, expanded: [...new Set([...ui.expanded, details.bookId])] });
          }}
        />
      )}

      <AlertDialog
        open={!!ui.deleting}
        onOpenChange={(o) => {
          if (!o) ui.patch({ deleting: null });
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete annotation?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the saved quote and its note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setAnnotations((items) =>
                  items.filter((a) => a.id !== ui.deleting),
                );
                ui.patch({ deleting: null });
              }}
            >
              Delete annotation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
