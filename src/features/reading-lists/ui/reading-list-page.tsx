"use client";

import { useLocalUIState } from "@/shared/hooks/use-local-ui-state";

import { useSearchParams } from "next/navigation";

import Link from "next/link";

import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";
import { BookDetailsPanel } from "@/features/library/ui/book-details-panel";
import { BookGallery } from "@/features/library/ui/book-gallery";
import { ShelfStatusBar } from "@/features/library/ui/shelf-status-bar";
import { useWorkspace } from "@/app-shell/workspace-store";
import { ReadingListEditor } from "./reading-list-editor";

export function ReadingListsPage() {
  const { books, lists, updateList } = useReadingLists();
  const { filter, sort } = useWorkspace();
  const [isEditing, setIsEditing] = useLocalUIState(false);
  const searchParams = useSearchParams();
  const selectedListId = searchParams.get("list");
  const selectedList = lists.find((list) => list.id === selectedListId);
  const listBooks = books
    .filter((book) => selectedList?.bookIds?.includes(book.id))
    .filter((book) =>
      filter === "reading"
        ? book.progress > 0 && book.progress < 100
        : filter === "new"
          ? book.progress === 0
          : filter === "finished"
            ? book.progress >= 100
            : true,
    )
    .toSorted((a, b) =>
      sort === "recent"
        ? books.indexOf(a) - books.indexOf(b)
        : a.title.localeCompare(b.title) * (sort === "za" ? -1 : 1),
    );

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] min-h-0">
      <section
        className="flex min-w-0 flex-1 flex-col"
        aria-label={selectedList?.name ?? "Reading lists"}
      >
        <div className="@container min-h-0 flex-1 overflow-y-auto px-5 pt-[34px] pb-8 md:pl-9 md:pr-7">
          {selectedList ? (
            <BookGallery
              books={listBooks}
              emptyMessage={
                selectedList.id === "completed"
                  ? "Books you mark as read will appear here."
                  : selectedList.isDefault
                    ? "Add books to this list from the book menus in your library."
                    : "No books here yet. Choose Add books to build your list."
              }
              listId={selectedList.id}
              onAddBooks={
                selectedList.isDefault ? undefined : () => setIsEditing(true)
              }
            />
          ) : (
            <div className="reading-list-directory">
              {lists.map((list) => (
                <Link
                  key={list.id}
                  href={list.url}
                  className="reading-list-directory-item"
                >
                  <span
                    className="size-6 rounded-lg"
                    style={{ background: list.color ?? "var(--muted)" }}
                    aria-hidden="true"
                  />
                  <span>{list.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {list.bookIds?.length ?? 0}{" "}
                    {list.bookIds?.length === 1 ? "book" : "books"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
        <ShelfStatusBar
          label={selectedList ? `Reading lists / ${selectedList.name}` : "Reading lists / All shelves"}
          count={selectedList ? listBooks.length : lists.length}
          unit={selectedList ? "book" : "shelf"}
        />
        {isEditing && selectedList && (
          <ReadingListEditor
            list={selectedList}
            onClose={() => setIsEditing(false)}
            onSave={(details) => {
              updateList(selectedList.id, details);
              setIsEditing(false);
            }}
          />
        )}
      </section>
      <BookDetailsPanel />
    </div>
  );
}
