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
} from "lucide-react";

import { useAnnotations } from "../stores/annotations-store";

import { annotationColors } from "../model/annotation";

import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";

import { useWorkspace } from "@/app-shell/workspace-store";

import { BookCover } from "@/features/home/ui/book-cover";

import { Button } from "@/shared/ui/button";

import { Input } from "@/shared/ui/input";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/shared/ui/accordion";

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
  patch: (
    v: Partial<{
      query: string;
      book: string;
      sort: string;
      expanded: string[];
      deleting: string | null;
      message: string;
    }>,
  ) => void;
}>((set) => ({
  query: "",
  book: "all",
  sort: "newest",
  expanded: ["quiet"],
  deleting: null,
  message: "",
  patch: (v) => set(v),
}));

export function AnnotationsPage() {
  const { annotations, setAnnotations } = useAnnotations();
  const { books } = useReadingLists();
  const { selectBook } = useWorkspace();
  const ui = useAnnotationUI();
  const router = useRouter();
  const visible = annotations
    .filter(
      (a) =>
        (ui.book === "all" || a.bookId === ui.book) &&
        `${a.content} ${a.note}`.toLowerCase().includes(ui.query.toLowerCase()),
    )
    .toSorted(
      (a, b) =>
        (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) *
        (ui.sort === "newest" ? 1 : -1),
    );
  const groups = books.filter((b) => visible.some((a) => a.bookId === b.id));
  const expanded = ui.query ? groups.map((b) => b.id) : ui.expanded;

  return (
    <main className="p-5 lg:px-12 lg:py-8">
      <h1 className="text-3xl font-semibold leading-[42px]">Annotations</h1>
      <p className="mt-3 text-[13px] leading-6 text-muted-foreground">
        {annotations.length} annotations across{" "}
        {new Set(annotations.map((a) => a.bookId)).size} books
      </p>
      <div className="mb-8 mt-[26px] flex flex-wrap items-center gap-4">
        <div className="relative w-full sm:mr-2 sm:w-[540px]">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            className="h-10 rounded-xl border-0 bg-secondary pl-10"
            placeholder="Search quotes and notes"
            aria-label="Search annotations"
            value={ui.query}
            onChange={(e) => ui.patch({ query: e.target.value })}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="secondary" className="w-44" />}
          >
            {books.find((b) => b.id === ui.book)?.title ?? "All books"}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[300px]">
            <DropdownMenuRadioGroup
              value={ui.book}
              onValueChange={(book) => ui.patch({ book })}
            >
              <DropdownMenuRadioItem value="all">
                All books
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
            render={<Button variant="secondary" className="w-[104px]" />}
          >
            <ListFilter />
            Filter
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
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
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto text-xs text-muted-foreground"
          onClick={() =>
            ui.patch({
              expanded: ui.expanded.length ? [] : groups.map((b) => b.id),
            })
          }
        >
          {ui.expanded.length ? "Collapse all" : "Expand all"}
        </Button>
      </div>

      <Accordion
        multiple
        value={expanded}
        onValueChange={(expanded) => ui.patch({ expanded })}
        className="space-y-6"
      >
        {groups.map((book) => (
          <AccordionItem key={book.id} value={book.id}>
            <AccordionTrigger className="h-[88px] gap-5 rounded-[14px] bg-secondary px-4 py-3 hover:bg-muted">
              <span className="w-10 shrink-0 [&_.cover-type]:hidden [&_.cover-credit]:hidden">
                <BookCover book={book} />
              </span>
              <span className="min-w-0">
                <span className="block text-lg font-semibold">
                  {book.title}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {book.author} ·{" "}
                  {visible.filter((a) => a.bookId === book.id).length}{" "}
                  annotations
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="divide-y divide-border pl-3 sm:pl-[76px]">
                {visible
                  .filter((a) => a.bookId === book.id)
                  .map((a, index) => (
                    <article
                      key={a.id}
                      className={`relative pr-10 ${index ? "py-6" : "py-7"}`}
                    >
                      <header className="mb-4 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                        <span>
                          {a.chapter ? `${a.chapter} · ` : ""}Page{" "}
                          {a.page ?? "—"}
                        </span>
                        <time dateTime={a.createdAt}>
                          {a.createdLabel ??
                            new Date(a.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                        </time>
                      </header>
                      <p
                        className="-ml-6 border-l-[3px] py-[9px] pl-[21px] text-xl leading-7"
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

                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="absolute right-0 top-7"
                            />
                          }
                          aria-label="Annotation options"
                        >
                          <MoreHorizontal />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[300px]">
                          <DropdownMenuItem
                            onClick={() => {
                              selectBook(book.id);
                              router.push("/library");
                            }}
                          >
                            <BookOpen />
                            Open book details
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
                            Delete annotation…
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </article>
                  ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      {!groups.length && (
        <p className="py-16 text-center text-muted-foreground">
          No annotations match your search.
        </p>
      )}
      <p className="sr-only" role="status">
        {ui.message}
      </p>

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
