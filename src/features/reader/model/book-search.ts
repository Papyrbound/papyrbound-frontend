import { readerChapterHtml } from "./reader-document";
import type { ReaderArchive } from "./reader-archive";
import { textNodes } from "./text-location";
export type BookSearchHit = { index: number; path: string; start: number; end: number; quote: string; chapter: string };

export async function searchBook(archive: ReaderArchive, query: string, signal?: AbortSignal): Promise<BookSearchHit[]> {
  const term = query.trim();
  if (term.length < 2 || archive.kind !== "books") return [];
  const pattern = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "giu");
  const results: BookSearchHit[] = [];
  // Searching text must not decode every image/font in the book into blob URLs.
  const textOnlyArchive = { ...archive, resource: () => undefined };
  for (let index = 0; index < archive.entries.length; index++) {
    signal?.throwIfAborted();
    const doc = new DOMParser().parseFromString(readerChapterHtml(textOnlyArchive, index, { page: "Paper", font: "Georgia", spacing: "Comfortable", fontSize: 20 }), "text/html");
    const text = textNodes(doc.body).map((node) => node.data).join("");
    for (const match of text.matchAll(pattern)) {
      const start = match.index;
      results.push({ index, path: archive.entries[index].path, start, end: start + match[0].length, quote: text.slice(Math.max(0, start - 45), start + match[0].length + 70), chapter: archive.entries[index].label });
      if (results.length >= 200) return results;
    }
    // Give navigation and cancellation a turn between chapters.
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  return results;
}
