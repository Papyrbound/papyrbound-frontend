import type { SampleBook } from "@/features/home/model/sample-books";
import type { Annotation } from "./annotation";

export function visibleAnnotations(annotations: Annotation[], books: SampleBook[], bookId: string, query: string, sort = "newest") {
  const ids = new Set(books.map((book) => book.id));
  const selected = ids.has(bookId) ? bookId : "all";
  const search = query.trim().toLocaleLowerCase();
  return annotations.filter((item) => ids.has(item.bookId) && (selected === "all" || item.bookId === selected) &&
    `${item.content} ${item.note}`.toLocaleLowerCase().includes(search))
    .toSorted((a, b) => (Date.parse(b.createdAt) - Date.parse(a.createdAt)) * (sort === "newest" ? 1 : -1));
}

export function annotationDate(value: string, now = new Date()) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Unknown date";
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const clock = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (date.toDateString() === now.toDateString()) return `Today, ${clock}`;
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday, ${clock}`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", ...(date.getFullYear() !== now.getFullYear() ? { year: "numeric" } : {}) });
}

export function annotationsMarkdown(annotations: Annotation[], books: SampleBook[]) {
  return ["# Papyrbound annotations", ...books.flatMap((book) => {
    const notes = annotations.filter((item) => item.bookId === book.id);
    if (!notes.length) return [];
    return [`## ${book.title.replaceAll("\n", " ")}\n\n${book.author}`, ...notes.map((item) => [
      item.page ? `### Page ${item.page}` : `### ${item.kind === "highlight" ? "Highlight" : "Note"}`,
      item.kind === "highlight" ? item.content.split("\n").map((line) => `> ${line}`).join("\n") : item.content,
      item.note ? `**Your thoughts**\n\n${item.note}` : "",
    ].filter(Boolean).join("\n\n"))];
  })].join("\n\n") + "\n";
}

export function downloadAnnotations(content: string, kind: "books" | "comics") {
  const url = URL.createObjectURL(new Blob([content], { type: "text/markdown;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `papyrbound-${kind}-annotations.md`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
