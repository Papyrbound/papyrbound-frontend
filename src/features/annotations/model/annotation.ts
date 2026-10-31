export const annotationColors = {
  lilac: "#d9cae9",
  sage: "#d6dfbd",
  peach: "#f0c6ac",
  butter: "#eee0a6",
  rose: "#e7bdcc",
  sky: "#b8d7ed",
  mint: "#bde0d0",
  sand: "#ded1bd",
};

export type Annotation = {
  id: string;
  bookId: string;
  kind: "highlight" | "note";
  content: string;
  note: string;
  page?: number;
  color: keyof typeof annotationColors;
  starred: boolean;
  createdLabel?: string;
  chapter?: string;
  createdAt: string;
};

export type AnnotationDetails = Omit<
  Annotation,
  "id" | "createdAt" | "starred"
>;

// Original preview entries for the app's fictional sample books.
export const sampleAnnotations: Annotation[] = [
  {
    id: "quiet-1",
    bookId: "quiet",
    kind: "highlight",
    content:
      "Some promises are kept in silence, long after the words are gone.",
    note: "A small moment that changes how I see the character.",
    page: 72,
    chapter: "Chapter 4",
    color: "sand",
    starred: true,
    createdLabel: "Today, 9:28 AM",
    createdAt: "2026-10-31T16:28:00Z",
  },
  {
    id: "quiet-2",
    bookId: "quiet",
    kind: "highlight",
    content: "She opened the door, and the room seemed to remember her.",
    note: "",
    page: 118,
    chapter: "Chapter 7",
    color: "sage",
    starred: false,
    createdLabel: "Yesterday, 8:14 PM",
    createdAt: "2026-10-31T03:14:00Z",
  },
  {
    id: "sun-1",
    bookId: "sun",
    kind: "note",
    content:
      "I like how this chapter makes ordinary places feel unfamiliar again. Read it outside next time.",
    note: "",
    page: 64,
    color: "peach",
    starred: false,
    createdAt: "2026-10-29T12:00:00Z",
  },
  {
    id: "sun-2",
    bookId: "sun",
    kind: "highlight",
    content:
      "We carry a little of every place that has ever made us feel at home.",
    note: "This would be a lovely starting point for a reading list.",
    page: 39,
    color: "peach",
    starred: true,
    createdAt: "2026-10-28T12:00:00Z",
  },
];
