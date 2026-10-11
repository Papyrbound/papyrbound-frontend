"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowUpRightIcon, BookOpenIcon, ChevronRightIcon, HeartIcon, LayoutGridIcon, ListIcon, SearchIcon, SparklesIcon } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/shared/ui/sheet"
import { sampleBooks, type SampleBook } from "../model/sample-books"
import { BookCover } from "./book-cover"

export function LibraryOverview() {
  const [view, setView] = useState<"grid" | "list">("grid")
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<SampleBook | null>(null)
  const normalizedQuery = query.trim().toLowerCase()
  const visibleBooks = sampleBooks.filter((book) =>
    `${book.title} ${book.author} ${book.genre}`.toLowerCase().includes(normalizedQuery)
  )
  const readingBooks = sampleBooks.filter((book) => book.progress > 0)

  return (
    <div className="overview">
      <div className="overview-heading">
        <div>
          <p className="eyebrow">Your reading space</p>
          <h1>A little time for a good book.</h1>
          <p className="mt-3 text-muted-foreground">Pick up where you left off, or find your next escape.</p>
        </div>
        <Button nativeButton={false} role="link" variant="ghost" render={<Link href="/library" />} className="hidden shrink-0 sm:inline-flex">
          Open library <ArrowUpRightIcon />
        </Button>
      </div>

      <section aria-labelledby="reading-heading">
        <div className="section-heading">
          <h2 id="reading-heading">On your bookmark</h2>
          <span className="eyebrow">Design preview · sample books</span>
        </div>
        <div className="reading-grid">
          {readingBooks.map((book) => (
            <button type="button" key={book.id} className="reading-card" style={{ background: book.tone }} onClick={() => setSelected(book)} aria-label={`View ${book.title}, ${book.progress}% read`}>
              <BookCover book={book} />
              <div className="reading-meta">
                <h3>{book.title}</h3>
                <p>{book.author}</p>
                <div className="reading-progress" role="progressbar" aria-label={`${book.title} reading progress`} aria-valuenow={book.progress} aria-valuemin={0} aria-valuemax={100}>
                  <span style={{ width: `${book.progress}%` }} />
                </div>
                <p>{book.progress}% read</p>
              </div>
              <ChevronRightIcon className="size-4 shrink-0 opacity-60" aria-hidden="true" />
            </button>
          ))}
        </div>
      </section>

      <section className="shelf-panel" aria-labelledby="shelf-heading">
        <div className="shelf-toolbar">
          <div>
            <h2 id="shelf-heading" className="text-lg font-semibold">A shelf to explore</h2>
            <p className="eyebrow mt-1">Six stories, a few different worlds.</p>
          </div>
          <div className="shelf-controls">
            <div className="relative w-full max-w-60">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input type="search" aria-label="Search sample books" placeholder="Find a book…" value={query} onChange={(event) => setQuery(event.target.value)} className="h-9 pl-9" />
            </div>
            <div className="view-switch" role="group" aria-label="Shelf layout">
              <Button variant="ghost" size="icon-sm" aria-label="Grid view" aria-pressed={view === "grid"} onClick={() => setView("grid")}><LayoutGridIcon /></Button>
              <Button variant="ghost" size="icon-sm" aria-label="List view" aria-pressed={view === "list"} onClick={() => setView("list")}><ListIcon /></Button>
            </div>
          </div>
        </div>
        <div className={view === "grid" ? "book-grid" : "book-list"}>
          {visibleBooks.map((book) => (
            <button type="button" className="book-item" key={book.id} onClick={() => setSelected(book)} aria-label={`View ${book.title} by ${book.author}`}>
              <BookCover book={book} />
              <span className="book-caption">
                <span className="book-title">{book.title}</span>
                <span className="book-author">{book.author}</span>
              </span>
              {view === "list" && <span className="eyebrow">{book.genre}</span>}
            </button>
          ))}
        </div>
        <p role="status" className={visibleBooks.length ? "sr-only" : "py-12 text-center text-muted-foreground"}>
          {visibleBooks.length ? `${visibleBooks.length} sample books shown` : "No books match. Try another title, author, or genre."}
        </p>
      </section>

      <nav aria-label="Reading shortcuts" className="collection-grid">
        <Link className="collection-tile" href="/reading-lists?list=favourites" style={{ background: "var(--content-lilac)" }}>
          <HeartIcon className="size-5" aria-hidden="true" /><div className="flex-1"><h3 className="text-sm font-medium">The ones you love</h3><p className="text-xs opacity-75">Your favourites</p></div><ChevronRightIcon className="size-4" />
        </Link>
        <Link className="collection-tile" href="/reading-lists?list=want-to-read" style={{ background: "var(--content-sage)" }}>
          <BookOpenIcon className="size-5" aria-hidden="true" /><div className="flex-1"><h3 className="text-sm font-medium">For another day</h3><p className="text-xs opacity-75">Your reading wishlist</p></div><ChevronRightIcon className="size-4" />
        </Link>
        <Link className="collection-tile" href="/collections" style={{ background: "var(--content-peach)" }}>
          <SparklesIcon className="size-5" aria-hidden="true" /><div className="flex-1"><h3 className="text-sm font-medium">Make room for a new world</h3><p className="text-xs opacity-75">Your collections</p></div><ChevronRightIcon className="size-4" />
        </Link>
      </nav>

      <Sheet open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null) }}>
        <SheetContent>
          <SheetHeader className="pr-16">
            <SheetTitle>Book details</SheetTitle>
            <SheetDescription>This is a sample book for the design preview.</SheetDescription>
          </SheetHeader>
          {selected && <div className="px-6 pb-6">
            <div className="book-detail-cover"><BookCover book={selected} /></div>
            <h2 className="text-2xl">{selected.title}</h2>
            <p className="mt-2 text-muted-foreground">{selected.author}</p>
            <dl className="mt-8 divide-y divide-border">
              {[["Genre", selected.genre], ["Length", `${selected.pages} pages`], ["Progress", selected.progress ? `${selected.progress}% read` : "Not started"]].map(([label, value]) =>
                <div key={label} className="flex justify-between gap-4 py-4"><dt className="text-muted-foreground">{label}</dt><dd>{value}</dd></div>
              )}
            </dl>
            <p className="mt-6 text-xs text-muted-foreground">Illustrative content only. Imported books and reader integration can use these same components.</p>
          </div>}
        </SheetContent>
      </Sheet>
    </div>
  )
}
