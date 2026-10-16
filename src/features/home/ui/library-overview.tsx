"use client"

import { useState, type CSSProperties } from "react"
import Link from "next/link"
import { ArrowRightIcon, ArrowUpRightIcon, BookOpenIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon, FolderIcon, LibraryIcon, PinIcon } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Card } from "@/shared/ui/card"
import { Progress } from "@/shared/ui/progress"
import { RevealCard, RevealText } from "@/shared/ui/reading-motion"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/shared/ui/sheet"
import { type SampleBook } from "../model/sample-books"
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store"
import { useCollections } from "@/features/collections/stores/collections-store"
import { BookCover } from "./book-cover"

export function LibraryOverview() {
  const { books, lists, markAsRead } = useReadingLists()
  const { collections } = useCollections()
  const [selected, setSelected] = useState<SampleBook | null>(null)
  const readingBooks = books.filter((book) => book.progress > 0 && book.progress < 100)
  const [activeBookId, setActiveBookId] = useState<string | null>(null)
  const readingIndex = Math.max(0, readingBooks.findIndex((book) => book.id === activeBookId))
  const currentBook = readingBooks[readingIndex]
  const recentBooks = books.slice(-4).reverse()
  const completedCount = books.filter((book) => book.progress >= 100).length
  const bookIds = new Set(books.map((book) => book.id))
  const featuredCollections = [...collections].sort((a, b) => Number(b.pinned) - Number(a.pinned)).slice(0, 2)
  const wishlistIds = lists.find((list) => list.id === "want-to-read")?.bookIds ?? []
  const wishlistCount = wishlistIds.filter((id) => bookIds.has(id)).length
  const unreadBooks = books.filter((book) => book.progress <= 0)
  const nextBook = wishlistIds.map((id) => unreadBooks.find((book) => book.id === id)).find(Boolean) ?? unreadBooks[0]
  const nextFromList = nextBook ? wishlistIds.includes(nextBook.id) : false

  return (
    <div className="home-overview">
      <header className="home-heading">
        <div><p className="home-eyebrow">Your reading space</p><h1><RevealText>Welcome back.</RevealText></h1><p className="home-intro">A book to return to. A new one to discover.</p></div>
        <Button nativeButton={false} role="link" variant="ghost" className="home-library-shortcut" render={<Link href="/library" />}>
          <span className="home-library-icon"><LibraryIcon /></span>
          <span><strong>Your library</strong><span>{books.length} {books.length === 1 ? "book" : "books"} on your shelf</span></span>
          <ArrowUpRightIcon className="size-4 text-muted-foreground" />
        </Button>
      </header>

      <div className="home-bento">
      <RevealCard index={0} className="home-bento-tile home-bento-reading" aria-labelledby="home-reading-title">
        <div className="home-section-heading">
          <h2 id="home-reading-title"><BookOpenIcon className="mr-2 inline size-4" />Continue reading</h2>
          <div className="flex items-center gap-2">
            {readingBooks.length > 1 && <div className="flex items-center gap-1" role="group" aria-label="Browse current reads">
              <span className="mr-2 text-xs text-muted-foreground" aria-live="polite">{readingIndex + 1} / {readingBooks.length}</span>
              <Button variant="ghost" size="icon-sm" aria-label="Previous current read" onClick={() => setActiveBookId(readingBooks[(readingIndex - 1 + readingBooks.length) % readingBooks.length].id)}><ChevronLeftIcon /></Button>
              <Button variant="ghost" size="icon-sm" aria-label="Next current read" onClick={() => setActiveBookId(readingBooks[(readingIndex + 1) % readingBooks.length].id)}><ChevronRightIcon /></Button>
            </div>}
            <Button nativeButton={false} role="link" variant="ghost" size="sm" render={<Link href="/library" />}>View all<ArrowRightIcon /></Button>
          </div>
        </div>
        {currentBook && <Card key={currentBook.id} className="home-featured-read" style={{ "--book-color": currentBook.paper } as CSSProperties}>
          <div className="home-featured-art" aria-hidden="true"><BookCover book={currentBook} /></div>
          <Button variant="ghost" className="home-featured-cover" onClick={() => setSelected(currentBook)} aria-label={`View ${currentBook.title}`}><BookCover book={currentBook} /></Button>
          <div className="home-featured-info" aria-live="polite">
            <h3>{currentBook.title}</h3><p>{currentBook.author}</p>
            <span className="home-featured-genre">{currentBook.genre}</span>
            <div className="home-featured-progress"><div className="home-progress" role="progressbar" aria-label={`${currentBook.title} reading progress`} aria-valuenow={currentBook.progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${currentBook.progress}%` }} /></div><span>{currentBook.progress}%</span></div>
            <div className="home-featured-actions">
              <Button size="sm" onClick={() => setSelected(currentBook)}>View book<ArrowRightIcon /></Button>
              <Button variant="outline" size="sm" onClick={() => markAsRead(currentBook.id)}><CheckIcon />Mark as read</Button>
            </div>
          </div>
        </Card>}
        {readingBooks.length === 0 && <Card className="home-empty"><BookOpenIcon /><div><h3>A new chapter is waiting</h3><p>Explore your library to find your next read.</p></div><Button nativeButton={false} role="link" variant="secondary" render={<Link href="/library" />}>Browse books<ChevronRightIcon /></Button></Card>}
      </RevealCard>
        <RevealCard index={1} className="home-bento-tile home-bento-next" aria-labelledby="home-next-title" style={{ "--next-color": nextBook?.paper ?? "var(--content-sage)" } as CSSProperties}>
          <div className="home-next-heading"><h2 id="home-next-title">Up next</h2><span>A fresh chapter</span></div>
          {nextBook ? <>
            <p className="home-next-source">{nextFromList ? "From your Want To Read list" : "Waiting in your library"}</p>
            <div className="home-next-book">
              <div className="home-next-cover" aria-hidden="true"><BookCover book={nextBook} /></div>
              <div className="home-next-info"><h3>{nextBook.title}</h3><p>{nextBook.author}</p><span>{nextBook.genre}{nextBook.pages > 0 ? ` · ${nextBook.pages} pages` : ""}</span></div>
            </div>
            <div className="home-next-action"><Button variant="secondary" size="sm" onClick={() => setSelected(nextBook)}>Explore book<ArrowRightIcon /></Button></div>
          </> : <>
            <div className="home-next-empty"><BookOpenIcon className="size-8" /><h3>Make room for your next story.</h3><p>Add an unread book to your library and it will appear here.</p></div>
            <div className="home-next-action"><Button nativeButton={false} role="link" variant="secondary" size="sm" render={<Link href="/library" />}>Browse library<ArrowRightIcon /></Button></div>
          </>}
        </RevealCard>
        <RevealCard index={2} className="home-bento-tile home-bento-recent" aria-labelledby="home-recent-title">
          <div className="home-section-heading"><h2 id="home-recent-title">Recently added</h2><Button nativeButton={false} role="link" variant="ghost" size="sm" render={<Link href="/library" />}>View all<ChevronRightIcon /></Button></div>
          <div className="home-recent-grid">{recentBooks.map((book) => (
            <Button key={book.id} variant="ghost" className="home-recent-book" onClick={() => setSelected(book)} aria-label={`View ${book.title} by ${book.author}`}>
              <BookCover book={book} />
              <span className="home-book-status">{book.progress >= 100 ? <><CheckIcon />Completed</> : book.progress > 0 ? `${book.progress}% read` : <span className="home-new-label">New</span>}</span>
            </Button>
          ))}</div>
          {recentBooks.length === 0 && <p className="home-section-empty">Books you add will appear here.</p>}


        </RevealCard>
          <RevealCard index={3} className="home-bento-tile home-bento-collections" aria-labelledby="home-collections-title">
            <div className="home-section-heading"><h2 id="home-collections-title">Your collections</h2><Button nativeButton={false} role="link" variant="ghost" size="sm" aria-label="View all collections" render={<Link href="/collections" />}><ChevronRightIcon /></Button></div>
            <div className="home-collection-list">{featuredCollections.map((collection) => {
              const collectionBooks = collection.bookIds.map((id) => books.find((book) => book.id === id)).filter((book): book is SampleBook => Boolean(book))
              return <Button nativeButton={false} role="link" variant="ghost" className="home-collection" key={collection.id} render={<Link href={`/collections?collection=${encodeURIComponent(collection.id)}`} />}>
                <span className="home-collection-art" style={{ "--collection-color": collection.color } as CSSProperties} aria-hidden="true">{collectionBooks.length ? collectionBooks.slice(0, 3).map((book) => <span key={book.id}><BookCover book={book} /></span>) : <FolderIcon />}</span>
                <span className="home-collection-info"><span className="home-collection-name">{collection.name}{collection.pinned && <PinIcon aria-label="Pinned" />}</span><span className="home-collection-count">{collectionBooks.length} {collectionBooks.length === 1 ? "book" : "books"}</span></span><ChevronRightIcon />
              </Button>
            })}</div>
            {featuredCollections.length === 0 && <Button nativeButton={false} role="link" variant="outline" render={<Link href="/collections" />}>Create a collection<ChevronRightIcon /></Button>}
          </RevealCard>
        <RevealCard index={4} className="home-bento-tile home-reading-snapshot" aria-labelledby="home-snapshot-title">
          <div className="home-snapshot-heading"><h2 id="home-snapshot-title">Your reading</h2><Button nativeButton={false} role="link" variant="ghost" size="icon-xs" aria-label="View reading activity" render={<Link href="/reading-activity" />}><ArrowUpRightIcon /></Button></div>
          <div className="home-snapshot-total"><strong>{completedCount}</strong><span>/ {books.length}</span></div>
          <p className="home-snapshot-caption">books finished</p>
          <Progress value={books.length ? completedCount / books.length * 100 : 0} aria-label={`${completedCount} of ${books.length} books completed`} />
          <dl className="home-snapshot-details"><div><dt><span className="home-status-dot home-status-reading" />In progress</dt><dd>{readingBooks.length}</dd></div><div><dt><span className="home-status-dot" />Not started</dt><dd>{unreadBooks.length}</dd></div></dl>
          <Button nativeButton={false} role="link" variant="ghost" size="sm" className="home-snapshot-queue" render={<Link href="/reading-lists?list=want-to-read" />}><span>Want To Read <span className="home-queue-count">{wishlistCount}</span></span><ChevronRightIcon /></Button>
        </RevealCard>
      </div>

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
