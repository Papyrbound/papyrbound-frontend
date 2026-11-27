import type { Annotation } from "@/features/annotations/model/annotation";

export type ReaderSelection = { start: number; end: number; quote: string };
export function readerAnnotation({ bookId, chapter, location, selection, note = "", bookmark = false }: {
  bookId: string; chapter: string; location: NonNullable<Annotation["location"]>;
  selection?: ReaderSelection; note?: string; bookmark?: boolean;
}): Annotation {
  const passage = bookmark ? undefined : selection;
  return {
    id: crypto.randomUUID(), bookId, chapter, kind: passage ? "highlight" : "note", color: "butter", starred: false,
    content: passage?.quote ?? (bookmark ? `Bookmark: ${chapter}` : note.trim()), note: passage ? note.trim() : "",
    location: { ...location, ...passage }, bookmark, createdAt: new Date().toISOString(),
  };
}
