"use client"

import { useRef, useState, type CSSProperties } from "react"
import { CheckIcon, PlusIcon, SearchIcon, XIcon } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/shared/ui/sheet"
import { useReadingLists } from "../stores/reading-lists-store"
import { BookCover } from "@/features/home/ui/book-cover"
import { readingListColors, type ReadingList, type ReadingListDetails } from "../model/reading-list"

// Mounted for each editing session so cancelled drafts never leak into the next one.
export function ReadingListEditor({ list, initialBookIds = [], onClose, onSave }: {
  list?: ReadingList
  initialBookIds?: string[]
  onClose: () => void
  onSave: (details: ReadingListDetails) => void
}) {
  const { books } = useReadingLists()
  const [open, setOpen] = useState(true)
  const pendingSave = useRef<ReadingListDetails | null>(null)
  const [name, setName] = useState(list?.name ?? "")
  const [query, setQuery] = useState("")
  const [color, setColor] = useState(list?.color ?? readingListColors[2].value)
  const [bookIds, setBookIds] = useState(list?.bookIds ?? initialBookIds)
  const nameRef = useRef<HTMLInputElement>(null)
  const normalizedQuery = query.trim().toLowerCase()
  const matchingBooks = books.filter((book) =>
    `${book.title} ${book.author}`.toLowerCase().includes(normalizedQuery)
  )
  const visibleBooks = normalizedQuery ? matchingBooks : matchingBooks.slice(0, 3)
  const selectedBooks = books.filter((book) => bookIds.includes(book.id))

  function addBook(id: string) {
    setBookIds((current) => current.includes(id) ? current : [...current, id])
  }

  return (
    <Sheet open={open} onOpenChange={setOpen} onOpenChangeComplete={(isOpen) => {
      if (isOpen) return
      if (pendingSave.current) onSave(pendingSave.current)
      else onClose()
    }}>
      <SheetContent initialFocus={nameRef} className="reading-list-sheet" style={{ "--list-color": color } as CSSProperties}>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={(event) => {
          event.preventDefault()
          if (name.trim()) {
            pendingSave.current = { name: name.trim(), color, bookIds }
            setOpen(false)
          }
        }}>
          <div className="pr-10">
            <SheetTitle>{list ? "Edit reading list" : "Custom Reading List"}</SheetTitle>
            <SheetDescription className="sr-only">Name your list, choose a color, and search for books to add.</SheetDescription>
          </div>
          <fieldset className="list-color-picker mt-7">
            <legend className="sr-only">List color</legend>
            {readingListColors.map((option) => (
              <label key={option.name} className="list-color-option" style={{ background: option.value }}>
                <input type="radio" name="list-color" value={option.value} checked={color === option.value} onChange={() => setColor(option.value)} aria-label={option.name} />
                {color === option.value && <CheckIcon className="size-3.5" aria-hidden="true" />}
              </label>
            ))}
          </fieldset>
          <div className="list-editor-fields min-h-0 flex-1 overflow-y-auto py-7">
            <label htmlFor="reading-list-name">Name <span aria-hidden="true">*</span></label>
            <Input ref={nameRef} id="reading-list-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Slow Sunday reads" required maxLength={80} className="mt-2 h-11" />
            <fieldset className="mt-6">
              <legend>Books</legend>
              <div className="relative mt-3">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 opacity-60" aria-hidden="true" />
                <Input type="search" aria-label="Search books to add" placeholder="Search by title or author…" value={query} onChange={(event) => setQuery(event.target.value)} className="h-11 pl-9" onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    const nextBook = visibleBooks.find((book) => !bookIds.includes(book.id))
                    if (normalizedQuery && nextBook) addBook(nextBook.id)
                  }
                }} />
              </div>
              <div className="mt-3 space-y-2">
                {visibleBooks.map((book) => (
                  <div key={book.id} className="list-book-option">
                    <BookCover book={book} />
                    <span className="min-w-0"><span className="block truncate">{book.title}</span><span className="block text-xs opacity-60">{book.author}</span></span>
                    <Button type="button" variant="ghost" size="icon-sm" className="ml-auto shrink-0" disabled={bookIds.includes(book.id)} aria-label={bookIds.includes(book.id) ? `${book.title} added` : `Add ${book.title}`} onClick={() => addBook(book.id)}>
                      {bookIds.includes(book.id) ? <CheckIcon /> : <PlusIcon />}
                    </Button>
                  </div>
                ))}
                {visibleBooks.length === 0 && <p className="py-5 text-center text-sm opacity-70">No books found. Try another title or author.</p>}
              </div>
              <p role="status" className="sr-only">{selectedBooks.length} books added. {normalizedQuery ? `${matchingBooks.length} search results.` : ""}</p>
            </fieldset>
            {selectedBooks.length > 0 && <div className="mt-6">
              <p className="text-xs opacity-70">In this list · {selectedBooks.length}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedBooks.map((book) => <Button key={book.id} type="button" variant="secondary" size="sm" className="max-w-full" aria-label={`Remove ${book.title}`} onClick={() => setBookIds((current) => current.filter((id) => id !== book.id))}><span className="truncate">{book.title}</span><XIcon /></Button>)}
              </div>
            </div>}
          </div>
          <div className="flex shrink-0 justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={!name.trim()}>{list ? "Save changes" : "Create list"}</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
