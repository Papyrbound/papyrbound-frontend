import type { Annotation } from "@/features/annotations/model/annotation";

export function readerCollectionItems(items: Annotation[], options: {
  bookId: string; bookmarks: boolean; filter: "all" | "highlights" | "notes" | "chapter";
  path: string; starred: boolean; oldest: boolean;
}) {
  return items.filter((item) => item.bookId === options.bookId && item.location &&
    Boolean(item.bookmark) === options.bookmarks && (!options.starred || item.starred) &&
    (options.filter !== "chapter" || item.location.path === options.path) &&
    (options.filter !== "highlights" || item.kind === "highlight") &&
    (options.filter !== "notes" || item.kind === "note" || Boolean(item.note.trim())))
    .toSorted((a, b) => (Date.parse(a.createdAt) - Date.parse(b.createdAt)) * (options.oldest ? 1 : -1));
}
