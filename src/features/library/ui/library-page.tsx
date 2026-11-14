"use client";
import { useWorkspace } from "@/app-shell/workspace-store";
import { useActiveLibrary } from "@/features/library/model/use-active-library";
import { BookGallery } from "./book-gallery";
import { BookDetailsPanel } from "./book-details-panel";
import { ShelfStatusBar } from "./shelf-status-bar";
import { orderBooks } from "../model/book-order";
import { AddBookDialog } from "./add-book-dialog";
import { Button } from "@/shared/ui/button";
export function LibraryPage() {
  const { books, plural, noun } = useActiveLibrary();
  const { filter, sort, setFilter } = useWorkspace();
  const visible = orderBooks(books
    .filter((b) =>
      filter === "reading"
        ? b.progress > 0 && b.progress < 100
        : filter === "new"
          ? b.progress === 0
          : filter === "finished"
            ? b.progress >= 100
            : true,
    ), sort);
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] min-h-0">
      <main className="flex min-w-0 flex-1 flex-col" aria-label="Library">
        <div className="@container min-h-0 flex-1 overflow-y-auto px-5 pt-[34px] pb-8 md:pl-9 md:pr-7">
          <BookGallery
            books={visible}
            emptyMessage={books.length ? `Try another filter to find your ${plural}.` : `Import your first ${noun} to keep your reading in one place.`}
            emptyTitle={books.length ? `No matching ${plural}` : `Your ${noun} library starts here`}
            emptyAction={books.length && filter !== "all" ? <Button variant="secondary" onClick={() => setFilter("all")}>Clear filters</Button> : <AddBookDialog />}
          />
        </div>
        <ShelfStatusBar label={`Library / ${filter === "reading" ? "Currently reading" : filter === "new" ? `Unread ${plural}` : filter === "finished" ? `Finished ${plural}` : `All ${plural}`}`} count={visible.length} total={books.length} unit={noun} />
      </main>
      <BookDetailsPanel scope={visible} />
    </div>
  );
}
