"use client";
import { useWorkspace } from "@/app-shell/workspace-store";
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";
import { BookGallery } from "./book-gallery";
import { BookDetailsPanel } from "./book-details-panel";
export function LibraryPage() {
  const { books } = useReadingLists();
  const { filter, sort } = useWorkspace();
  const visible = books
    .filter((b) =>
      filter === "reading"
        ? b.progress > 0 && b.progress < 100
        : filter === "new"
          ? b.progress === 0
          : filter === "finished"
            ? b.progress >= 100
            : true,
    )
    .toSorted((a, b) =>
      sort === "recent"
        ? books.indexOf(a) - books.indexOf(b)
        : a.title.localeCompare(b.title) * (sort === "za" ? -1 : 1),
    );
  return (
    <div className="flex h-[calc(100dvh-4rem)] min-h-0">
      <main className="flex min-w-0 flex-1 flex-col" aria-label="Library">
        <div className="@container min-h-0 flex-1 overflow-y-auto px-5 pt-[34px] pb-8 md:pl-9 md:pr-7">
          <BookGallery
            books={visible}
            emptyMessage="No books match these filters."
          />
        </div>
        <footer className="flex h-9 shrink-0 items-center justify-between gap-4 bg-background px-[30px] text-xs text-muted-foreground">
          <span>Library / All books</span>
          <span>{visible.length} books</span>
        </footer>
      </main>
      <BookDetailsPanel />
    </div>
  );
}
