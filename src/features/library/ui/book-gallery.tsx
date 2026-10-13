"use client"

import { useRef, useState } from "react"
import { CheckIcon, HeartIcon, ListPlusIcon, MoreHorizontalIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuGroup, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/shared/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/shared/ui/alert-dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/shared/ui/sheet"
import { BookCover } from "@/features/home/ui/book-cover"
import type { SampleBook } from "@/features/home/model/sample-books"
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store"
import { ReadingListEditor } from "@/features/reading-lists/ui/reading-list-editor"
import { useCollections } from "@/features/collections/stores/collections-store"

export function BookGallery({ books, listId, onAddBooks, emptyMessage = "No books here yet. Add a few to start your list." }: {
  books: SampleBook[]
  listId?: string
  onAddBooks?: () => void
  emptyMessage?: string
}) {
  const [selected, setSelected] = useState<SampleBook | null>(null)
  const [newListBook, setNewListBook] = useState<SampleBook | null>(null)
  const [deletingBook, setDeletingBook] = useState<SampleBook | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)
  const confirmedDeletion = useRef(false)
  const { setCollections } = useCollections()
  const { lists, toggleBook, createList, markAsRead, markAsUnread, deleteBook } = useReadingLists()

  return (
    <>
      <div ref={galleryRef} tabIndex={-1} className="library-book-grid outline-none">
        {onAddBooks && <button type="button" className="gallery-add-book" onClick={onAddBooks}><PlusIcon className="size-7" aria-hidden="true" /><span>Add books</span></button>}
        {books.map((book) => (
          <article key={book.id} className="gallery-book">
            <div className="gallery-book-stage">
              <button type="button" className="gallery-cover-button" onClick={() => setSelected(book)} aria-label={`View ${book.title}`}><BookCover book={book} /></button>
              <div className="gallery-cover-actions"><Button type="button" size="sm" onClick={() => setSelected(book)}>View book</Button></div>
            </div>
            <div className="gallery-book-caption">
              <h2 className="sr-only">{book.title}</h2>
              <span className={book.progress <= 0 || book.progress >= 100 ? "gallery-book-status gallery-status-label" : "gallery-book-status"}>
                {book.progress >= 100 ? "Completed" : book.progress > 0 ? `${book.progress}%` : "New"}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" className="gallery-book-menu" />} aria-label={`More options for ${book.title}`}><MoreHorizontalIcon /></DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="end" className="w-64 max-w-[calc(100vw-2rem)]">
                  <DropdownMenuItem onClick={() => setSelected(book)}>View book details</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {lists.filter((list) => list.isDefault && list.id !== "completed" && list.id !== listId).map((list) => <DropdownMenuItem key={list.id} onClick={() => toggleBook(list.id, book.id)}>
                      {list.bookIds?.includes(book.id) ? <CheckIcon /> : list.id === "favourites" ? <HeartIcon /> : <PlusIcon />}
                      {list.bookIds?.includes(book.id) ? `Remove from ${list.name}` : `Add to ${list.name}`}
                    </DropdownMenuItem>)}
                    <DropdownMenuItem onClick={() => book.progress >= 100 ? markAsUnread(book.id) : markAsRead(book.id)}><CheckIcon />{book.progress >= 100 ? "Mark as unread" : "Mark as read"}</DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger><ListPlusIcon />Add to custom list</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="w-64 max-w-[calc(100vw-2rem)]">
                        <DropdownMenuItem onClick={() => setNewListBook(book)}><PlusIcon />Create new list</DropdownMenuItem>
                        {lists.some((list) => !list.isDefault) && <DropdownMenuSeparator />}
                        {lists.filter((list) => !list.isDefault).map((list) => <DropdownMenuItem key={list.id} disabled={list.bookIds?.includes(book.id)} onClick={() => toggleBook(list.id, book.id)}>
                          {list.bookIds?.includes(book.id) ? <CheckIcon /> : <PlusIcon />}<span className="truncate">{list.name}</span>
                        </DropdownMenuItem>)}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </DropdownMenuGroup>
                  {listId && <><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onClick={() => toggleBook(listId, book.id)}><Trash2Icon />Remove from this list</DropdownMenuItem></>}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => {
                    confirmedDeletion.current = false
                    setDeletingBook(book)
                    setDeleteDialogOpen(true)
                  }}><Trash2Icon />Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </article>
        ))}
      </div>
      {books.length === 0 && <p className="gallery-empty" role="status">{emptyMessage}</p>}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onOpenChangeComplete={(open) => { if (!open) setDeletingBook(null) }}>
        <AlertDialogContent initialFocus={cancelRef} finalFocus={() => confirmedDeletion.current ? galleryRef.current : true}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{deletingBook?.title}”?</AlertDialogTitle>
            <AlertDialogDescription>This book will be removed from your library, reading lists, and collections.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel ref={cancelRef}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => {
              if (!deletingBook) return
              confirmedDeletion.current = true
              deleteBook(deletingBook.id)
              setCollections((current) => current.map((collection) => ({ ...collection, bookIds: collection.bookIds.filter((id) => id !== deletingBook.id) })))
              if (selected?.id === deletingBook.id) setSelected(null)
              setDeleteDialogOpen(false)
            }}>Delete book</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {newListBook && <ReadingListEditor initialBookIds={[newListBook.id]} onClose={() => setNewListBook(null)} onSave={(details) => {
        createList({ ...details, bookIds: [...new Set([...details.bookIds, newListBook.id])] })
        setNewListBook(null)
      }} />}
      <Sheet open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null) }}>
        <SheetContent>
          <SheetHeader><SheetTitle>Book details</SheetTitle><SheetDescription>Title, author, and reading progress.</SheetDescription></SheetHeader>
          {selected && <div className="px-6 pb-6"><div className="book-detail-cover"><BookCover book={selected} /></div><h2 className="text-2xl">{selected.title}</h2><p className="mt-2 text-muted-foreground">{selected.author}</p><dl className="mt-6 divide-y divide-border">{[["Genre", selected.genre], ["Length", `${selected.pages} pages`], ["Progress", selected.progress ? `${selected.progress}% read` : "Not started"]].map(([label, value]) => <div key={label} className="flex justify-between py-4"><dt className="text-muted-foreground">{label}</dt><dd>{value}</dd></div>)}</dl></div>}
        </SheetContent>
      </Sheet>
    </>
  )
}
