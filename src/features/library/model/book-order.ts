import type { SampleBook } from "@/features/home/model/sample-books";

export function orderBooks(books: SampleBook[], sort = "recent") {
  const position = new Map(books.map((book, index) => [book.id, index]));
  if (sort === "recent" && books.some((book) => !Number.isFinite(Date.parse(book.addedAt ?? "")))) return [...books];
  return books.toSorted((a, b) => {
    if (sort !== "recent") return a.title.localeCompare(b.title) * (sort === "za" ? -1 : 1);
    const aTime = Date.parse(a.addedAt ?? "");
    const bTime = Date.parse(b.addedAt ?? "");
    return aTime !== bTime
      ? bTime - aTime
      : position.get(a.id)! - position.get(b.id)!;
  });
}

export function nextUnreadBook(books: SampleBook[], queue: string[] = []) {
  return books.find((book) => book.progress === 0 && queue.includes(book.id)) ?? books.find((book) => book.progress === 0);
}
