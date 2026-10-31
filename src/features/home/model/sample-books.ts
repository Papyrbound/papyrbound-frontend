// Original fixtures for the visual preview, separate from future imported books.
export type SampleBook = {
  synopsis?: string
  id: string
  title: string
  author: string
  genre: string
  progress: number
  pages: number
  paper: string
  ink: string
  tone: string
  art: "orbit" | "lines" | "wave"
}

export const sampleBooks: SampleBook[] = [
  { id: "quiet", synopsis: "In a seaside town where every day seems the same, a young woman discovers a collection of letters tucked inside a borrowed book. Following their trail becomes an invitation to notice the small things she has spent a lifetime overlooking.", title: "The Quiet Between", author: "Mira Ellis", genre: "Fiction", progress: 42, pages: 280, paper: "#d9cae9", ink: "#494059", tone: "var(--content-lilac)", art: "orbit" },
  { id: "wild", title: "A Field of Small Wonders", author: "Leo Arden", genre: "Nature", progress: 18, pages: 192, paper: "#d6dfbd", ink: "#3f513c", tone: "var(--content-sage)", art: "wave" },
  { id: "sun", synopsis: "A collection of poems about the places we leave, the people we carry, and the unexpected ways we find our way home.", title: "Somewhere, the Sun", author: "Nora Vale", genre: "Poetry", progress: 67, pages: 144, paper: "#f0c6ac", ink: "#6b3d30", tone: "var(--content-peach)", art: "lines" },
  { id: "atlas", title: "An Atlas of Elsewhere", author: "June Hart", genre: "Travel", progress: 0, pages: 224, paper: "#aac7d0", ink: "#263f53", tone: "var(--content-lilac)", art: "lines" },
  { id: "night", title: "Notes After Midnight", author: "Eli Rowan", genre: "Essays", progress: 0, pages: 208, paper: "#383d52", ink: "#e4d8b4", tone: "var(--content-sage)", art: "orbit" },
  { id: "tidal", title: "The Tidal Garden", author: "Ada Wren", genre: "Fiction", progress: 0, pages: 316, paper: "#cfaaae", ink: "#563e4e", tone: "var(--content-peach)", art: "wave" },
]
