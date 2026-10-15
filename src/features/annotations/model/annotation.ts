export const annotationColors = {
  lilac: "#d9cae9",
  sage: "#d6dfbd",
  peach: "#f0c6ac",
  butter: "#eee0a6",
  rose: "#e7bdcc",
  sky: "#b8d7ed",
  mint: "#bde0d0",
  sand: "#ded1bd",
}

export type Annotation = {
  id: string
  bookId: string
  kind: "highlight" | "note"
  content: string
  note: string
  page?: number
  color: keyof typeof annotationColors
  starred: boolean
  createdAt: string
}

export type AnnotationDetails = Omit<Annotation, "id" | "createdAt" | "starred">

// Original preview entries for the app's fictional sample books.
export const sampleAnnotations: Annotation[] = [
  { id: "quiet-1", bookId: "quiet", kind: "highlight", content: "Some days, the smallest things are the ones that ask us to pay the most attention.", note: "A reminder to slow down and notice what's already here.", page: 42, color: "lilac", starred: true, createdAt: "2026-10-13T12:00:00Z" },
  { id: "wild-1", bookId: "wild", kind: "highlight", content: "A garden is never finished. It is simply a conversation you keep returning to.", note: "", page: 28, color: "sage", starred: false, createdAt: "2026-10-12T12:00:00Z" },
  { id: "sun-1", bookId: "sun", kind: "note", content: "I like how this chapter makes ordinary places feel unfamiliar again. Read it outside next time.", note: "", page: 64, color: "peach", starred: false, createdAt: "2026-10-11T12:00:00Z" },
  { id: "sun-2", bookId: "sun", kind: "highlight", content: "We carry a little of every place that has ever made us feel at home.", note: "This would be a lovely starting point for a reading list.", page: 39, color: "peach", starred: true, createdAt: "2026-10-10T12:00:00Z" },
  { id: "quiet-2", bookId: "quiet", kind: "note", content: "The silences between the characters say as much as their conversations. Watch for this in the next chapter.", note: "", page: 76, color: "lilac", starred: false, createdAt: "2026-10-09T12:00:00Z" },
]
