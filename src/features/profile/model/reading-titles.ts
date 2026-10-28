"use client";

import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";
import { useCollections } from "@/features/collections/stores/collections-store";
import { useAnnotations } from "@/features/annotations/stores/annotations-store";
import { useAccount } from "@/features/profile/stores/account-store";

export function useReadingTitles() {
  const { books } = useReadingLists();
  const { collections } = useCollections();
  const { annotations } = useAnnotations();
  const { profile } = useAccount();
  const completed = books.filter((book) => book.progress >= 100).length;
  const started = books.filter((book) => book.progress > 0).length;
  const bookIds = new Set(books.map((book) => book.id));
  const noteCount = annotations.filter((annotation) =>
    bookIds.has(annotation.bookId),
  ).length;
  const titles = [
    {
      name: "Page Turner",
      description: "Every reader starts somewhere.",
      requirement: "Available to every reader",
      current: 1,
      target: 1,
      color: "#d9cae9",
    },
    {
      name: "First Chapter",
      description: "The start of something good.",
      requirement: "Start reading a book",
      current: started,
      target: 1,
      color: "#f0c6ac",
    },
    {
      name: "Margin Thinker",
      description: "For the thoughts between the lines.",
      requirement: "Save 5 highlights or notes",
      current: noteCount,
      target: 5,
      color: "#b8d7ed",
    },
    {
      name: "Shelf Curator",
      description: "A place for every kind of story.",
      requirement: "Create 3 collections",
      current: collections.length,
      target: 3,
      color: "#d6dfbd",
    },
    {
      name: "Book Finisher",
      description: "One last page. One whole world.",
      requirement: "Complete a book",
      current: completed,
      target: 1,
      color: "#eee0a6",
    },
    {
      name: "Bookworm",
      description: "Always another story to get lost in.",
      requirement: "Complete 5 books",
      current: completed,
      target: 5,
      color: "#e7bdcc",
    },
  ].map((title) => ({ ...title, available: title.current >= title.target }));
  const activeTitle =
    titles.find((title) => title.name === profile.title && title.available)
      ?.name ?? "Page Turner";
  return { titles, activeTitle };
}
