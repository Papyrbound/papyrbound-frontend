import type { SampleBook } from "@/features/home/model/sample-books";

export function fileLocation(book: SampleBook) {
  if (book.sourcePath) return book.sourcePath.replace(/^\\\\\?\\UNC\\/, "\\\\").replace(/^\\\\\?\\/, "");
  return book.sourceName ?? "Original path unavailable";
}
