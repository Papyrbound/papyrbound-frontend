import type { SampleBook } from "@/features/home/model/sample-books";

export type LibraryKind = "books" | "comics";

export const libraryCopy = {
  books: { noun: "book", plural: "books", label: "Books", accept: ".epub,application/epub+zip" },
  comics: { noun: "comic", plural: "comics", label: "Comics", accept: ".cbz,application/vnd.comicbook+zip" },
} as const;

export function belongsToLibrary(book: SampleBook, kind: LibraryKind) {
  return (book.kind ?? "books") === kind;
}
