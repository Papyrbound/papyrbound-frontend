"use client";

import { useId, useRef, useState, type CSSProperties } from "react";
import { LayoutGroup, m } from "motion/react";
import {
  BookOpenIcon,
  ChevronDownIcon,
  HighlighterIcon,
  MoreHorizontalIcon,
  NotebookPenIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  StarIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useAnnotations } from "@/features/annotations/stores/annotations-store";
import {
  annotationColors,
  type Annotation,
  type AnnotationDetails,
} from "@/features/annotations/model/annotation";
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";
import { BookCover } from "@/features/home/ui/book-cover";
import { AnnotationEditor } from "./annotation-editor";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import { RevealText, useReadingMotion } from "@/shared/ui/reading-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";

const filters = [
  { id: "all", label: "All annotations" },
  { id: "highlight", label: "Highlights" },
  { id: "note", label: "Notes" },
  { id: "starred", label: "Starred" },
] as const;
type Filter = (typeof filters)[number]["id"];
const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

export function AnnotationsPage() {
  const filterGroupId = useId();
  const reduced = useReadingMotion();
  const { books } = useReadingLists();
  const { annotations, setAnnotations } = useAnnotations();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [bookFilter, setBookFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [editor, setEditor] = useState<{ annotation?: Annotation } | null>(
    null,
  );
  const [deleting, setDeleting] = useState<Annotation | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const cancelDeleteRef = useRef<HTMLButtonElement>(null);
  const booksById = new Map(books.map((book) => [book.id, book]));
  // Entries from deleted books are excluded, like the library's other book views.
  const available = annotations.filter((annotation) =>
    booksById.has(annotation.bookId),
  );
  const annotatedBookIds = new Set(
    available.map((annotation) => annotation.bookId),
  );
  const [expandedBooks, setExpandedBooks] = useState<string[]>(() =>
    available.length ? [available[0].bookId] : [],
  );
  const normalizedQuery = query.trim().toLowerCase();
  const visible = available
    .filter((annotation) => {
      const book = booksById.get(annotation.bookId)!;
      return (
        (filter === "all" ||
          (filter === "starred"
            ? annotation.starred
            : annotation.kind === filter)) &&
        (bookFilter === "all" || annotation.bookId === bookFilter) &&
        `${annotation.content} ${annotation.note} ${book.title} ${book.author}`
          .toLowerCase()
          .includes(normalizedQuery)
      );
    })
    .sort((a, b) =>
      sort === "oldest"
        ? a.createdAt.localeCompare(b.createdAt)
        : b.createdAt.localeCompare(a.createdAt),
    );
  const selectedBook = booksById.get(bookFilter);
  const visibleBookCount = new Set(visible.map((item) => item.bookId)).size;
  const hasFilters = query !== "" || filter !== "all" || bookFilter !== "all";
  const grouped = new Map<string, Annotation[]>();
  for (const annotation of visible) {
    const group = grouped.get(annotation.bookId);
    if (group) group.push(annotation);
    else grouped.set(annotation.bookId, [annotation]);
  }

  function saveAnnotation(details: AnnotationDetails) {
    const editingId = editor?.annotation?.id;
    setAnnotations((current) =>
      editingId
        ? current.map((item) =>
            item.id === editingId
              ? {
                  ...item,
                  ...details,
                  ...(item.kind === "highlight"
                    ? {
                        content: item.content,
                        kind: item.kind,
                        bookId: item.bookId,
                        page: item.page,
                      }
                    : {}),
                }
              : item,
          )
        : [
            {
              ...details,
              id: crypto.randomUUID(),
              starred: false,
              createdAt: new Date().toISOString(),
            },
            ...current,
          ],
    );
    setEditor(null);
    setExpandedBooks((current) =>
      current.includes(details.bookId) ? current : [...current, details.bookId],
    );
    if (!editingId) {
      setQuery("");
      setFilter("all");
      setBookFilter("all");
      setSort("newest");
    }
  }

  return (
    <section
      className="annotations-page min-w-0 px-10 pt-9 pb-12 max-[700px]:px-5 max-[700px]:pt-6 max-[700px]:pb-10"
      aria-label="Annotations"
    >
      <header className="annotations-heading max-[700px]:mb-6 max-[700px]:flex-wrap max-[700px]:items-start max-[700px]:gap-4 max-[700px]:[&_h1]:text-2xl flex items-center justify-between gap-[20px] mb-[32px] [&_h1]:text-[28px] [&_h1]:[line-height:1.2] [&_h1]:font-medium [&_h1]:tracking-[-1px] [&_p]:text-muted-foreground [&_p]:text-[13px] [&_p]:mt-[8px]">
        <div>
          <h1>
            <RevealText>Your annotations</RevealText>
          </h1>
          <p>Highlights and thoughts worth coming back to.</p>
        </div>
        {available.length > 0 && (
          <Button disabled={books.length === 0} onClick={() => setEditor({})}>
            <PlusIcon />
            New annotation
          </Button>
        )}
      </header>
      <div className="annotations-toolbar max-[700px]:gap-4 flex flex-wrap justify-between items-center gap-[20px] pb-[20px] [border-bottom:1px_solid_var(--border)]">
        <LayoutGroup id={filterGroupId}>
          <div
            className="annotation-filters [&_[aria-pressed=false]]:text-muted-foreground max-[700px]:gap-1"
            role="group"
            aria-label="Filter annotations"
          >
            {filters.map((item) => (
              <Button
                key={item.id}
                size="sm"
                variant="ghost"
                className="annotation-filter-tab"
                aria-pressed={filter === item.id}
                onClick={() => setFilter(item.id)}
              >
                {filter === item.id && (
                  <m.span
                    layoutId="active-filter"
                    className="annotation-filter-indicator absolute [inset:0] z-[-1] rounded-[inherit] bg-muted [pointer-events:none]"
                    transition={{
                      type: "spring",
                      stiffness: 450,
                      damping: 36,
                      duration: reduced ? 0 : undefined,
                    }}
                  />
                )}
                {item.id === "starred" && <StarIcon />}
                {item.label}
                <span className="annotation-filter-count text-[11px] opacity-[.65] [font-variant-numeric:tabular-nums]">
                  {
                    available.filter(
                      (annotation) =>
                        item.id === "all" ||
                        (item.id === "starred"
                          ? annotation.starred
                          : annotation.kind === item.id),
                    ).length
                  }
                </span>
              </Button>
            ))}
          </div>
        </LayoutGroup>
        <div className="annotation-tools max-[700px]:w-full gap-[12px]">
          <div className="annotation-search max-[700px]:w-full max-[700px]:min-w-0 max-[700px]:flex-[1_0_100%] relative w-[230px] [&>svg]:absolute [&>svg]:[left:12px] [&>svg]:[top:50%] [&>svg]:w-[16px] [&>svg]:h-[16px] [&>svg]:[transform:translateY(-50%)] [&>svg]:text-muted-foreground [&>svg]:[pointer-events:none] [&_input]:pl-[36px] [&_input]:[background:color-mix(in_srgb,_var(--foreground)_3%,_transparent)] [&_input]:[border-color:transparent]">
            <SearchIcon aria-hidden="true" />
            <Input
              type="search"
              aria-label="Search annotations"
              placeholder="Search your annotations…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className="annotation-book-filter max-[700px]:max-w-full max-w-[220px]"
                />
              }
              aria-label={`Filter by book: ${selectedBook?.title ?? "All books"}`}
            >
              <BookOpenIcon />
              <span className="truncate">
                {selectedBook?.title ?? "All books"}
              </span>
              <ChevronDownIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64">
              <DropdownMenuRadioGroup
                value={bookFilter}
                onValueChange={setBookFilter}
              >
                <DropdownMenuRadioItem value="all">
                  All books
                </DropdownMenuRadioItem>
                {books
                  .filter((book) => annotatedBookIds.has(book.id))
                  .map((book) => (
                    <DropdownMenuRadioItem key={book.id} value={book.id}>
                      {book.title}
                    </DropdownMenuRadioItem>
                  ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="annotations-results flex flex-wrap items-center justify-between gap-[12px] p-[18px_0] text-muted-foreground text-[12px] [&_button]:text-[12px]">
        <p aria-live="polite">
          {visible.length} {visible.length === 1 ? "annotation" : "annotations"}
          {bookFilter === "all" &&
            ` across ${visibleBookCount} ${visibleBookCount === 1 ? "book" : "books"}`}
        </p>
        <div className="annotation-layout-controls flex items-center gap-[12px] ml-[auto]">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="sm" />}
              aria-label="Sort annotations"
            >
              {sort === "newest" ? "Newest first" : "Oldest first"}
              <ChevronDownIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
                <DropdownMenuRadioItem value="newest">
                  Newest first
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="oldest">
                  Oldest first
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Accordion
        multiple
        value={expandedBooks}
        onValueChange={setExpandedBooks}
        className="annotation-book-groups gap-2 overflow-visible! rounded-none! border-0!"
      >
        {[...grouped].map(([bookId, entries]) => {
          const book = booksById.get(bookId)!;
          return (
            <AccordionItem
              key={bookId}
              value={bookId}
              className="annotation-book-group overflow-visible! rounded-none! border-0! bg-transparent! [&_[data-slot=accordion-content]]:p-0"
            >
              <AccordionTrigger className="annotation-book-trigger mx-0! w-full cursor-pointer items-center gap-5 rounded-[var(--radius-lg)] border-0! px-[14px] py-6 transition-colors duration-160 hover:bg-[var(--row-hover)] hover:no-underline focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2 max-[700px]:flex-wrap max-[700px]:gap-3 max-[700px]:px-[14px] max-[700px]:py-5">
                <span
                  className="annotation-group-cover max-[700px]:w-10 block w-[52px] shrink-0 [&_.cover-type]:text-[6px] [&_.cover-credit]:text-[2px]"
                  aria-hidden="true"
                >
                  <BookCover book={book} />
                </span>
                <span className="annotation-group-info max-[700px]:max-w-none max-[700px]:flex-1 grid gap-[6px] min-w-0 max-w-[55%]">
                  <span className="annotation-group-title max-[700px]:text-sm text-[16px] font-medium [overflow-wrap:anywhere]">
                    {book.title}
                  </span>
                  <span className="annotation-group-author text-[12px] font-normal text-muted-foreground">
                    {book.author}
                  </span>
                </span>
                <span
                  className="annotation-group-rule max-[700px]:hidden flex-1 h-[1px] min-w-[16px] [background:var(--border)]"
                  aria-hidden="true"
                />
                <span className="annotation-group-count max-[700px]:[&_span]:hidden text-[11px] font-normal text-muted-foreground whitespace-nowrap">
                  {entries.length}
                  <span>
                    {" "}
                    {entries.length === 1 ? "annotation" : "annotations"}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="annotation-group-content max-[700px]:pl-0 p-[0_0_20px_72px] [&_p]:mb-[0]">
                <div className="annotation-entries flex flex-col">
                  {entries.map((annotation) => {
                    return (
                      <article
                        key={annotation.id}
                        className="annotation-entry [&+.annotation-entry]:mt-2 [&+.annotation-entry]:border-t [&+.annotation-entry]:border-border min-w-0 p-[16px] rounded-[var(--radius-md)] [background:color-mix(in_srgb,_var(--card)_60%,_transparent)]"
                        style={
                          {
                            "--annotation-color":
                              annotationColors[annotation.color],
                          } as CSSProperties
                        }
                      >
                        <div className="annotation-source flex items-center gap-[10px] mb-[10px]">
                          <span className="annotation-location flex-1 text-[12px] text-muted-foreground">
                            {annotation.page
                              ? `Page ${annotation.page}`
                              : annotation.kind === "highlight"
                                ? "Saved passage"
                                : "Reading note"}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="annotation-star text-muted-foreground aria-pressed:text-[#8a6b36] dark:aria-pressed:text-[#d6be87]"
                            aria-label={`${annotation.starred ? "Unstar" : "Star"} annotation from ${book.title}${annotation.page ? `, page ${annotation.page}` : ""}`}
                            aria-pressed={annotation.starred}
                            onClick={() =>
                              setAnnotations((current) =>
                                current.map((item) =>
                                  item.id === annotation.id
                                    ? { ...item, starred: !item.starred }
                                    : item,
                                ),
                              )
                            }
                          >
                            <StarIcon
                              fill={
                                annotation.starred ? "currentColor" : "none"
                              }
                            />
                          </Button>
                        </div>
                        <div className="annotation-body min-w-0 max-w-[900px]">
                          {annotation.kind === "highlight" ? (
                            <blockquote className="annotation-passage [&_p]:whitespace-pre-wrap [&_p]:[overflow-wrap:anywhere] [border-left:3px_solid_var(--annotation-color)] bg-transparent p-[0_0_0_16px] rounded-[0] text-[15px] [line-height:1.65] tracking-[-.2px]">
                              <p>{annotation.content}</p>
                            </blockquote>
                          ) : (
                            <p className="annotation-note-content whitespace-pre-wrap [overflow-wrap:anywhere] text-[15px] [line-height:1.8]">
                              {annotation.content}
                            </p>
                          )}
                          {annotation.note && (
                            <p className="annotation-thought mt-[18px] whitespace-pre-wrap text-[13px] leading-[1.8] text-muted-foreground [overflow-wrap:anywhere]">
                              {annotation.note}
                            </p>
                          )}
                        </div>
                        <div className="annotation-footer flex items-center gap-[12px] mt-[14px] text-muted-foreground text-[11px] [&_time]:ml-[auto] [&_button]:mr-[-6px]">
                          <span className="annotation-kind inline-flex items-center gap-[6px] p-[3px_8px] rounded-full [background:color-mix(in_srgb,_var(--annotation-color)_12%,_transparent)] [&_svg]:w-[13px] [&_svg]:h-[13px]">
                            {annotation.kind === "highlight" ? (
                              <HighlighterIcon />
                            ) : (
                              <NotebookPenIcon />
                            )}
                            {annotation.kind === "highlight"
                              ? "Highlight"
                              : "Note"}
                          </span>
                          <time dateTime={annotation.createdAt}>
                            {dateFormat.format(new Date(annotation.createdAt))}
                          </time>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={<Button variant="ghost" size="icon-sm" />}
                              aria-label={`Options for ${book.title}${annotation.page ? `, page ${annotation.page}` : ""}`}
                            >
                              <MoreHorizontalIcon />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => setEditor({ annotation })}
                              >
                                <PencilIcon />
                                {annotation.kind === "highlight"
                                  ? "Highlight options"
                                  : "Edit note"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => {
                                  setDeleting(annotation);
                                  setDeleteOpen(true);
                                }}
                              >
                                <Trash2Icon />
                                Delete annotation
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
      {visible.length === 0 && (
        <div className="annotations-empty flex flex-col items-center text-center gap-[14px] p-[80px_20px] [&>svg]:w-[32px] [&>svg]:h-[32px] [&>svg]:text-muted-foreground [&>svg]:mb-[8px] [&_h2]:text-[20px] [&_p]:text-[13px] [&_p]:text-muted-foreground">
          <NotebookPenIcon />
          <h2>
            {hasFilters
              ? "No matching annotations"
              : "A place for what stays with you"}
          </h2>
          <p>
            {hasFilters
              ? "Try another book or a different search."
              : "Save a passage or write your first note about a book."}
          </p>
          {hasFilters ? (
            <Button
              variant="secondary"
              onClick={() => {
                setQuery("");
                setFilter("all");
                setBookFilter("all");
              }}
            >
              <XIcon />
              Clear filters
            </Button>
          ) : (
            <Button disabled={books.length === 0} onClick={() => setEditor({})}>
              <PlusIcon />
              New annotation
            </Button>
          )}
        </div>
      )}
      {editor && (
        <AnnotationEditor
          annotation={editor.annotation}
          books={books}
          defaultBookId={selectedBook?.id ?? books[0]?.id ?? ""}
          onSave={saveAnnotation}
          onClose={() => setEditor(null)}
        />
      )}
      <AlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onOpenChangeComplete={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <AlertDialogContent initialFocus={cancelDeleteRef}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete annotation?</AlertDialogTitle>
            <AlertDialogDescription>
              This annotation and its attached thoughts will be removed. Your
              book will stay in your library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel ref={cancelDeleteRef}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setAnnotations((current) =>
                  current.filter((item) => item.id !== deleting?.id),
                );
                setDeleteOpen(false);
              }}
            >
              Delete annotation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
