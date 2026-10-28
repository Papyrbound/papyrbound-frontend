"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  HeartIcon,
  PencilIcon,
  PlusIcon,
  TagIcon,
} from "lucide-react";

import {
  getReadingListUrl,
  type ReadingList,
} from "@/features/reading-lists/model/reading-list";
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";
import { BookCover } from "@/features/home/ui/book-cover";
import { BookGallery } from "@/features/library/ui/book-gallery";
import { Button } from "@/shared/ui/button";
import { ReadingListEditor } from "./reading-list-editor";

const listIcons = {
  heart: HeartIcon,
  "book-open": BookOpenIcon,
  completed: CheckCircle2Icon,
  tag: TagIcon,
};

function ListIcon({ list }: { list: ReadingList }) {
  const Icon = listIcons[list.icon];

  return (
    <span
      className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--list-color)_34%,var(--card))] text-foreground dark:bg-[color-mix(in_srgb,var(--list-color)_18%,var(--card))]"
      style={{ "--list-color": list.color ?? "var(--muted)" } as CSSProperties}
      aria-hidden="true"
    >
      <Icon className="size-5 stroke-[1.7]" />
    </span>
  );
}

export function ReadingListsPage() {
  const { books, lists, createList, updateList } = useReadingLists();
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedListId = searchParams.get("list");
  const selectedList = lists.find((list) => list.id === selectedListId);
  const listBooks = books.filter((book) =>
    selectedList?.bookIds?.includes(book.id),
  );

  return (
    <section
      className="library-gallery w-full px-10 pb-12 pt-8 max-[767px]:px-5 max-[767px]:pt-6"
      aria-label={selectedList?.name ?? "Reading lists"}
    >
      {selectedList ? (
        <>
          <Link
            href="/reading-lists"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4"
          >
            <ArrowLeftIcon className="size-4" aria-hidden="true" />
            Reading lists
          </Link>
          <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <ListIcon list={selectedList} />
              <div className="min-w-0">
                <h1 className="truncate text-[28px] font-medium tracking-tight max-[767px]:text-2xl">
                  {selectedList.name}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {listBooks.length} {listBooks.length === 1 ? "book" : "books"}
                </p>
              </div>
            </div>
            {!selectedList.isDefault && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <PencilIcon aria-hidden="true" />
                Edit list
              </Button>
            )}
          </header>
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
        </>
      ) : (
        <>
          <header className="mb-9 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-[28px] font-medium tracking-tight max-[767px]:text-2xl">
                Reading lists
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {lists.length} {lists.length === 1 ? "list" : "lists"} for the
                books you want to keep close.
              </p>
            </div>
            <Button onClick={() => setIsEditing(true)}>
              <PlusIcon aria-hidden="true" />
              Custom Reading List
            </Button>
          </header>
          <div className="reading-list-directory max-w-[920px] divide-y divide-border/60">
            {lists.map((list) => {
              const directoryBooks = books.filter((book) =>
                list.bookIds?.includes(book.id),
              );

              return (
                <Link
                  key={list.id}
                  href={list.url}
                  className="group flex min-h-[88px] items-center gap-4 rounded-2xl px-3 py-3 transition-colors hover:bg-[var(--row-hover)] focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2 max-[600px]:gap-3"
                  aria-label={`${list.name}, ${directoryBooks.length} ${directoryBooks.length === 1 ? "book" : "books"}`}
                >
                  <ListIcon list={list} />
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-[15px] font-medium">
                      {list.name}
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {directoryBooks.length}{" "}
                      {directoryBooks.length === 1 ? "book" : "books"}
                    </p>
                  </div>
                  {directoryBooks.length > 0 && (
                    <span
                      className="flex items-center pr-4 max-[600px]:hidden"
                      aria-hidden="true"
                    >
                      {directoryBooks.slice(0, 3).map((book, index) => (
                        <span
                          key={book.id}
                          className="block w-8 shrink-0 -ml-2.5 first:ml-0 rounded-[4px] ring-2 ring-background [&_.book-cover]:rounded-[3px_5px_5px_3px] [&_.cover-type]:hidden [&_.cover-credit]:hidden"
                          style={{ zIndex: 3 - index }}
                        >
                          <BookCover book={book} />
                        </span>
                      ))}
                    </span>
                  )}
                  <ChevronRightIcon
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </div>
        </>
      )}
      {isEditing && (
        <ReadingListEditor
          list={selectedList}
          onClose={() => setIsEditing(false)}
          onSave={(details) => {
            if (selectedList) updateList(selectedList.id, details);
            else {
              const id = createList(details);
              if (id) router.push(getReadingListUrl(id));
            }
            setIsEditing(false);
          }}
        />
      )}
    </section>
  );
}
