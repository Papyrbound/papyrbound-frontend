"use client"

import { useSearchParams } from "next/navigation"
import { useState } from "react"
import Link from "next/link"

import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store"
import { BookGallery } from "@/features/library/ui/book-gallery"
import { ReadingListEditor } from "./reading-list-editor"

export function ReadingListsPage() {
  const { books, lists, updateList } = useReadingLists()
  const [isEditing, setIsEditing] = useState(false)
  const searchParams = useSearchParams()
  const selectedListId = searchParams.get("list")
  const selectedList = lists.find((list) => list.id === selectedListId)
  const listBooks = books.filter((book) => selectedList?.bookIds?.includes(book.id))

  return (
    <section className="library-gallery w-full p-[24px_40px_48px]" aria-label={selectedList?.name ?? "Reading lists"}>
      <div className="gallery-heading flex items-baseline gap-[12px] mb-[32px] [&_h1]:text-[20px] [&_h1]:font-medium [&>span]:text-[12px] [&>span]:text-muted-foreground">
        <h1>{selectedList?.name ?? "Reading lists"}</h1>
        {selectedList && <span>{listBooks.length} {listBooks.length === 1 ? "book" : "books"}</span>}
      </div>
      {selectedList ? <BookGallery books={listBooks} emptyMessage={selectedList.id === "completed" ? "Books you mark as read will appear here." : selectedList.isDefault ? "Add books to this list from the book menus in your library." : "No books here yet. Choose Add books to build your list."} listId={selectedList.id} onAddBooks={selectedList.isDefault ? undefined : () => setIsEditing(true)} /> : <div className="reading-list-directory max-w-[560px] flex flex-col gap-[8px]">{lists.map((list) => <Link key={list.id} href={list.url} className="reading-list-directory-item flex items-center gap-[12px] rounded-[12px] p-[12px] text-[14px] hover:bg-[var(--row-hover)]"><span className="size-6 rounded-lg" style={{ background: list.color ?? "var(--muted)" }} aria-hidden="true" /><span>{list.name}</span><span className="ml-auto text-xs text-muted-foreground">{list.bookIds?.length ?? 0} {list.bookIds?.length === 1 ? "book" : "books"}</span></Link>)}</div>}
      {isEditing && selectedList && <ReadingListEditor list={selectedList} onClose={() => setIsEditing(false)} onSave={(details) => { updateList(selectedList.id, details); setIsEditing(false) }} />}
    </section>
  )
}
