"use client"

import { useState, type CSSProperties } from "react"
import Link from "next/link"
import { ArrowRightIcon, ArrowUpRightIcon, BookOpenIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon, FolderIcon, HighlighterIcon, MoreHorizontalIcon, PinIcon } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Card } from "@/shared/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/shared/ui/sheet"
import { type SampleBook } from "../model/sample-books"
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store"
import { useCollections } from "@/features/collections/stores/collections-store"
import { useAnnotations } from "@/features/annotations/stores/annotations-store"
import { annotationColors } from "@/features/annotations/model/annotation"
import { BookCover } from "./book-cover"

export function LibraryOverview() {
  const { books, lists, markAsRead } = useReadingLists()
  const { collections } = useCollections()
  const { annotations } = useAnnotations()
  const [selected, setSelected] = useState<SampleBook | null>(null)
  const readingBooks = books.filter((book) => book.progress > 0 && book.progress < 100)
  const [activeBookId, setActiveBookId] = useState<string | null>(null)
  const readingIndex = Math.max(0, readingBooks.findIndex((book) => book.id === activeBookId))
  const currentBook = readingBooks[readingIndex]
  const recentBooks = books.slice(-4).reverse()
  const completedCount = books.filter((book) => book.progress >= 100).length
  const bookIds = new Set(books.map((book) => book.id))
  const featuredCollections = [...collections].sort((a, b) => Number(b.pinned) - Number(a.pinned)).slice(0, 2)
  const highlights = annotations.filter((annotation) => annotation.kind === "highlight" && bookIds.has(annotation.bookId))
  const featuredHighlight = highlights.find((annotation) => annotation.starred) ?? highlights[0]
  const highlightBook = books.find((book) => book.id === featuredHighlight?.bookId)
  const wishlistCount = lists.find((list) => list.id === "want-to-read")?.bookIds?.filter((id) => bookIds.has(id)).length ?? 0

  return (
    <div className="home-overview">
      <header className="home-heading">
        <div><p className="home-eyebrow">Your reading space</p><h1>Welcome back.</h1><p className="home-intro">A book to return to. A new one to discover.</p></div>
        <div className="home-summary" aria-label="Library summary">
          <span><strong>{books.length}</strong>books</span>
          <span><strong>{readingBooks.length}</strong>in progress</span>
          <span><strong>{completedCount}</strong>completed</span>
        </div>
      </header>

      <div className="home-bento">
      <Card className="home-bento-tile home-bento-reading" aria-labelledby="home-reading-title">
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
        {currentBook && <Card className="home-featured-read" style={{ "--book-color": currentBook.paper } as CSSProperties}>
          <div className="home-featured-art" aria-hidden="true"><BookCover book={currentBook} /></div>
          <Button variant="ghost" className="home-featured-cover" onClick={() => setSelected(currentBook)} aria-label={`View ${currentBook.title}`}><BookCover book={currentBook} /></Button>
          <div className="home-featured-info" aria-live="polite">
            <h3>{currentBook.title}</h3><p>{currentBook.author}</p>
            <span className="home-featured-genre">{currentBook.genre}</span>
            <div className="home-featured-progress"><div className="home-progress" role="progressbar" aria-label={`${currentBook.title} reading progress`} aria-valuenow={currentBook.progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${currentBook.progress}%` }} /></div><span>{currentBook.progress}%</span></div>
            <div className="home-featured-actions">
              <Button size="sm" onClick={() => setSelected(currentBook)}>View book<ArrowRightIcon /></Button>
              <DropdownMenu><DropdownMenuTrigger render={<Button variant="outline" size="icon-sm" />} aria-label={`Options for ${currentBook.title}`}><MoreHorizontalIcon /></DropdownMenuTrigger><DropdownMenuContent align="start" className="w-48"><DropdownMenuItem onClick={() => setSelected(currentBook)}><BookOpenIcon />Book details</DropdownMenuItem><DropdownMenuItem onClick={() => markAsRead(currentBook.id)}><CheckIcon />Mark as read</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
            </div>
          </div>
        </Card>}
        {readingBooks.length === 0 && <Card className="home-empty"><BookOpenIcon /><div><h3>A new chapter is waiting</h3><p>Explore your library to find your next read.</p></div><Button nativeButton={false} role="link" variant="secondary" render={<Link href="/library" />}>Browse books<ChevronRightIcon /></Button></Card>}
      </Card>
        <Button nativeButton={false} role="link" variant="ghost" className="home-notebook home-bento-notebook" render={<Link href="/annotations" />} style={{ "--highlight-color": featuredHighlight ? annotationColors[featuredHighlight.color] : annotationColors.lilac } as CSSProperties}>
          <div className="home-notebook-label"><HighlighterIcon /><span>From your notebook</span><ArrowUpRightIcon /></div>
          {featuredHighlight && highlightBook ? <>
            <blockquote>{featuredHighlight.content}</blockquote>
            <p>{highlightBook.title}{featuredHighlight.page ? ` · Page ${featuredHighlight.page}` : ""}</p>
          </> : <><h2>Keep the words that stay with you.</h2><p>Your highlights and personal thoughts, together in one place.</p></>}
        </Button>
        <Card className="home-bento-tile home-bento-recent" aria-labelledby="home-recent-title">
          <div className="home-section-heading"><h2 id="home-recent-title">Recently added</h2><Button nativeButton={false} role="link" variant="ghost" size="sm" render={<Link href="/library" />}>View all<ChevronRightIcon /></Button></div>
          <div className="home-recent-grid">{recentBooks.map((book) => (
            <Button key={book.id} variant="ghost" className="home-recent-book" onClick={() => setSelected(book)} aria-label={`View ${book.title} by ${book.author}`}>
              <BookCover book={book} />
              <span className="home-book-status">{book.progress >= 100 ? <><CheckIcon />Completed</> : book.progress > 0 ? `${book.progress}% read` : <span className="home-new-label">New</span>}</span>
            </Button>
          ))}</div>
          {recentBooks.length === 0 && <p className="home-section-empty">Books you add will appear here.</p>}


        </Card>
          <Card className="home-bento-tile home-bento-collections" aria-labelledby="home-collections-title">
            <div className="home-section-heading"><h2 id="home-collections-title">Your collections</h2><Button nativeButton={false} role="link" variant="ghost" size="sm" aria-label="View all collections" render={<Link href="/collections" />}><ChevronRightIcon /></Button></div>
            <div className="home-collection-list">{featuredCollections.map((collection) => {
              const collectionBooks = collection.bookIds.map((id) => books.find((book) => book.id === id)).filter((book): book is SampleBook => Boolean(book))
              return <Button nativeButton={false} role="link" variant="ghost" className="home-collection" key={collection.id} render={<Link href={`/collections?collection=${encodeURIComponent(collection.id)}`} />}>
                <span className="home-collection-art" style={{ "--collection-color": collection.color } as CSSProperties} aria-hidden="true">{collectionBooks.length ? collectionBooks.slice(0, 3).map((book) => <span key={book.id}><BookCover book={book} /></span>) : <FolderIcon />}</span>
                <span className="home-collection-info"><span className="home-collection-name">{collection.name}{collection.pinned && <PinIcon aria-label="Pinned" />}</span><span className="home-collection-count">{collectionBooks.length} {collectionBooks.length === 1 ? "book" : "books"}</span></span><ChevronRightIcon />
              </Button>
            })}</div>
            {featuredCollections.length === 0 && <Button nativeButton={false} role="link" variant="outline" render={<Link href="/collections" />}>Create a collection<ChevronRightIcon /></Button>}
          </Card>
        <Button nativeButton={false} role="link" variant="ghost" className="home-wishlist home-bento-wishlist" render={<Link href="/reading-lists?list=want-to-read" />}>
          <span className="home-wishlist-icon"><BookOpenIcon /></span>
          <span className="home-wishlist-total">{wishlistCount}</span>
          <span className="home-wishlist-title">Want to read</span>
          <span className="home-wishlist-description">{wishlistCount ? `${wishlistCount === 1 ? "A book" : "Books"} for your next chapter` : "Make room for your next read"}</span>
          <ArrowUpRightIcon className="home-wishlist-arrow" />
        </Button>
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
