"use client"

import Link from "next/link"
import { BookOpenIcon, CheckIcon, HighlighterIcon, HistoryIcon, PlusIcon, RotateCcwIcon, Trash2Icon } from "lucide-react"
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store"
import { useAnnotations } from "@/features/annotations/stores/annotations-store"
import { BookCover } from "@/features/home/ui/book-cover"
import { Button } from "@/shared/ui/button"
import { Card } from "@/shared/ui/card"
import { Progress } from "@/shared/ui/progress"

const eventDetails = { added: { label: "Added to library", icon: PlusIcon }, completed: { label: "Marked as read", icon: CheckIcon }, unread: { label: "Marked as unread", icon: RotateCcwIcon }, deleted: { label: "Removed from library", icon: Trash2Icon } }
const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" })
const timeFormat = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" })

export function ReadingActivityPage() {
  const { books, activity } = useReadingLists()
  const { annotations } = useAnnotations()
  const currentBooks = books.filter((book) => book.progress > 0 && book.progress < 100)
  const completed = books.filter((book) => book.progress >= 100).length
  const estimatedPages = books.reduce((total, book) => total + Math.round(book.pages * book.progress / 100), 0)
  const bookIds = new Set(books.map((book) => book.id))
  const notes = annotations.filter((annotation) => bookIds.has(annotation.bookId))
  const recentNotes = [...notes].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3)
  return <section className="reader-page" aria-labelledby="activity-heading">
    <header className="reader-page-heading"><div><p className="reader-kicker">One page at a time</p><h1 id="activity-heading">Reading activity</h1><p>A look at the books and thoughts you’re spending time with.</p></div><Button nativeButton={false} role="link" variant="outline" render={<Link href="/library" />}>Open library</Button></header>
    <div className="reader-stats-grid">{[
      { label: "In progress", value: currentBooks.length, icon: BookOpenIcon },
      { label: "Completed", value: completed, icon: CheckIcon },
      { label: "Highlights & notes", value: notes.length, icon: HighlighterIcon },
      { label: "Estimated pages read", value: estimatedPages, icon: HistoryIcon },
    ].map(({ label, value, icon: Icon }) => <Card key={label} className="reader-stat"><Icon /><strong>{value}</strong><span>{label}</span></Card>)}</div>
    <p className="reader-section-caption">Page totals are estimated from each book’s length and current progress. Reading time and streaks aren’t tracked yet.</p>
    <div className="reader-activity-grid">
      <Card className="reader-activity-panel"><h2>On your bookmark</h2><p className="reader-setting-help">Your books in progress.</p><div className="reader-progress-books">{currentBooks.map((book) => <div className="reader-progress-book" key={book.id}><div className="reader-progress-cover"><BookCover book={book} /></div><div className="min-w-0 flex-1"><h3>{book.title}</h3><p>{book.author}</p><Progress value={book.progress} aria-label={`${book.title} progress`} /></div><span>{book.progress}%</span></div>)}</div>{currentBooks.length === 0 && <p className="reader-inline-empty">Your next chapter is waiting in your library.</p>}</Card>
      <Card className="reader-activity-panel"><h2>This session</h2><p className="reader-setting-help">Book additions and status changes while the app is open.</p>{activity.length ? <ol className="reader-event-list">{activity.map((event) => { const { label, icon: Icon } = eventDetails[event.kind]; return <li key={event.id}><span className="reader-event-icon"><Icon /></span><div><p>{label}</p><span>{event.bookTitle}</span></div><time dateTime={event.at}>{timeFormat.format(new Date(event.at))}</time></li> })}</ol> : <div className="reader-activity-empty"><HistoryIcon /><p>No changes this session yet.</p><span>Add a book or mark one as read to see it here.</span></div>}</Card>
    </div>
    <Card className="reader-activity-panel mt-5"><div className="flex items-center justify-between gap-4"><h2>Recent annotations</h2><Button nativeButton={false} role="link" size="sm" variant="ghost" render={<Link href="/annotations" />}>View all</Button></div>{recentNotes.length ? <div className="reader-recent-notes">{recentNotes.map((annotation) => <Link key={annotation.id} href="/annotations"><span className="text-xs text-muted-foreground">{books.find((book) => book.id === annotation.bookId)?.title}{annotation.page ? ` · Page ${annotation.page}` : ""}</span><p>{annotation.content}</p><time dateTime={annotation.createdAt}>{dateFormat.format(new Date(annotation.createdAt))}</time></Link>)}</div> : <p className="reader-inline-empty">Your saved passages and notes will appear here.</p>}</Card>
  </section>
}
