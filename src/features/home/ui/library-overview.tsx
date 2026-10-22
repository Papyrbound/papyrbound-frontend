"use client"

import { useState, type CSSProperties } from "react"
import Link from "next/link"
import { ArrowRightIcon, HeartIcon } from "lucide-react"
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store"
import { Button } from "@/shared/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/shared/ui/sheet"
import { type SampleBook } from "../model/sample-books"
import { BookCover } from "./book-cover"

function uniqueBooks(books: SampleBook[]) {
  return books.filter((book, index) => books.findIndex((candidate) => candidate.id === book.id) === index)
}

export function LibraryOverview() {
  const { books, lists } = useReadingLists()
  const [selected, setSelected] = useState<SampleBook | null>(null)
  const readingBooks = books.filter((book) => book.progress > 0 && book.progress < 100)
  const recentReads = uniqueBooks([...readingBooks, ...[...books].reverse()]).slice(0, 4)
  const favouriteIds = lists.find((list) => list.id === "favourites")?.bookIds ?? []
  const favouriteBooks = favouriteIds.map((id) => books.find((book) => book.id === id)).filter((book): book is SampleBook => Boolean(book)).slice(0, 8)

  return (
    <div className="home-discover">
      <h1 className="sr-only">Home</h1>

      <div className="home-discover-section-heading"><h2 id="home-continue-title">Continue reading</h2></div>
      <section aria-labelledby="home-continue-title" className="home-feature-strip">
        {recentReads.slice(0, 3).map((book) => <div className="home-feature-item" key={book.id}>
          <Button variant="ghost" className="home-feature-panel" style={{ "--feature-paper": book.paper, "--feature-ink": book.ink } as CSSProperties} onClick={() => setSelected(book)} aria-label={`Open ${book.title} by ${book.author}`}>
            <span className="home-panel-backdrop" aria-hidden="true"><BookCover book={book} /></span>
            <span className="home-panel-copy"><span>{book.genre}</span><strong>{book.title}</strong><span>{book.progress > 0 ? `${book.progress}% read` : "Start a new chapter"}<ArrowRightIcon /></span></span>
            <span className="home-panel-cover"><BookCover book={book} /></span>
          </Button>
        </div>)}
        {!books.length && <p className="home-discover-empty">Add your first book from the library.</p>}
      </section>

      <section className="home-discover-section" aria-labelledby="home-favourites-title">
        <header className="home-discover-section-heading"><h2 id="home-favourites-title"><HeartIcon />Favourite books</h2><Button nativeButton={false} role="link" variant="ghost" size="sm" render={<Link href="/reading-lists?list=favourites" />}>See all<ArrowRightIcon /></Button></header>
        {favouriteBooks.length ? <div className="home-favourite-rows">{favouriteBooks.map((book) => <Button key={book.id} variant="ghost" className="home-favourite-row" onClick={() => setSelected(book)} aria-label={`Open ${book.title} by ${book.author}`}>
          <span className="home-row-cover"><BookCover book={book} /></span><span className="home-row-copy"><strong>{book.title}</strong><span>{book.author}</span></span><ArrowRightIcon />
        </Button>)}</div> : <p className="home-discover-empty">Books you favourite will appear here.</p>}
      </section>

      <section className="home-discover-section" aria-labelledby="home-added-title">
        <header className="home-discover-section-heading"><h2 id="home-added-title">Recently added</h2><Button nativeButton={false} role="link" variant="ghost" size="sm" render={<Link href="/library" />}>See all<ArrowRightIcon /></Button></header>
        <div className="home-added-strip">{[...books].reverse().slice(0, 8).map((book) => <Button key={book.id} variant="ghost" className="home-added-book" onClick={() => setSelected(book)} aria-label={`Open ${book.title} by ${book.author}`}>
          <BookCover book={book} /><strong>{book.title}</strong><span>{book.author}</span>
        </Button>)}</div>
        {!books.length && <p className="home-discover-empty">Your new books will appear here.</p>}
      </section>

      <Sheet open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null) }}>
        <SheetContent>
          <SheetHeader className="pr-16"><SheetTitle>Book details</SheetTitle><SheetDescription>About this book in your library.</SheetDescription></SheetHeader>
          {selected && <div className="px-6 pb-6">
            <div className="book-detail-cover"><BookCover book={selected} /></div>
            <h2 className="text-2xl">{selected.title}</h2><p className="mt-2 text-muted-foreground">{selected.author}</p>
            <dl className="mt-8 divide-y divide-border">{[["Genre", selected.genre], ["Length", selected.pages ? `${selected.pages} pages` : "Unknown"], ["Progress", selected.progress >= 100 ? "Completed" : selected.progress ? `${selected.progress}% read` : "Not started"]].map(([label, value]) => <div key={label} className="flex justify-between gap-4 py-4"><dt className="text-muted-foreground">{label}</dt><dd>{value}</dd></div>)}</dl>
          </div>}
        </SheetContent>
      </Sheet>
    </div>
  )
}
