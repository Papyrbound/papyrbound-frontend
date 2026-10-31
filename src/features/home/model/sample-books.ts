// Original fixtures for the visual preview, separate from future imported books.
export type SampleBook = {
  synopsis?: string;
  cover?: string;
  addedLabel?: string;
  lastOpenedLabel?: string;
  completedLabel?: string;
  id: string;
  title: string;
  author: string;
  genre: string;
  progress: number;
  pages: number;
  paper: string;
  ink: string;
  tone: string;
  art: "orbit" | "lines" | "wave";
};

export const sampleBooks: SampleBook[] = [
  {
    id: "quiet",
    addedLabel: "Added 3 days ago",
    cover: "/covers/crimson-vow.png",
    synopsis:
      "In a seaside town where every day seems the same, a young woman discovers a collection of letters tucked inside a borrowed book. Following their trail becomes an invitation to notice the small things she has spent a lifetime overlooking.",
    title: "Crimson Vow",
    author: "Elena Vale",
    genre: "Fiction",
    progress: 45,
    pages: 328,
    paper: "#d9cae9",
    ink: "#494059",
    tone: "var(--content-lilac)",
    art: "orbit",
  },
  {
    id: "wild",
    cover: "/covers/one-night-only.png",
    title: "One Night Only",
    author: "Jenna Jinks",
    genre: "Romance",
    progress: 100,
    completedLabel: "3 days ago",
    pages: 192,
    paper: "#d6dfbd",
    ink: "#3f513c",
    tone: "var(--content-sage)",
    art: "wave",
  },
  {
    id: "sun",
    addedLabel: "Added yesterday",
    cover: "/covers/the-midnight-labyrinth.png",
    synopsis:
      "A mysterious key leads a young archivist into a labyrinth of hidden rooms, where every door reveals a secret someone has tried to forget.",
    title: "The Midnight Labyrinth",
    author: "Taylor Wilson",
    genre: "Fantasy",
    progress: 67,
    pages: 144,
    paper: "#f0c6ac",
    ink: "#6b3d30",
    tone: "var(--content-peach)",
    art: "lines",
  },
  {
    id: "atlas",
    cover: "/covers/where-shadows-bloom.png",
    title: "Where Shadows Bloom",
    completedLabel: "3 days ago",
    author: "Mara Ellis",
    genre: "Fantasy",
    progress: 100,
    pages: 224,
    paper: "#aac7d0",
    ink: "#263f53",
    tone: "var(--content-lilac)",
    art: "lines",
  },
  {
    id: "night",
    addedLabel: "Added today",
    cover: "/covers/light-door.png",
    title: "Light Door",
    author: "Clara Hart",
    genre: "Fantasy",
    progress: 0,
    pages: 208,
    paper: "#383d52",
    ink: "#e4d8b4",
    tone: "var(--content-sage)",
    art: "orbit",
  },
];
