"use client"

import { useRef, useState } from "react"
import { BookPlusIcon } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/ui/dialog"
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store"

export function AddBookDialog() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const titleRef = useRef<HTMLInputElement>(null)
  const { addBook } = useReadingLists()

  function changeOpen(next: boolean) {
    setOpen(next)
    if (!next) { setTitle(""); setAuthor("") }
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" className="text-muted-foreground" title="Add book" />} aria-label="Add book"><BookPlusIcon aria-hidden="true" /></DialogTrigger>
      <DialogContent initialFocus={titleRef}>
        <DialogHeader>
          <DialogTitle>Add book</DialogTitle>
          <DialogDescription>Add a title to your library.</DialogDescription>
        </DialogHeader>
        <form className="space-y-5" onSubmit={(event) => {
          event.preventDefault()
          if (!title.trim() || !author.trim()) return
          addBook({ title, author })
          changeOpen(false)
        }}>
          <div className="space-y-2"><label htmlFor="add-book-title">Title</label><Input ref={titleRef} id="add-book-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Book title" required maxLength={200} /></div>
          <div className="space-y-2"><label htmlFor="add-book-author">Author</label><Input id="add-book-author" value={author} onChange={(event) => setAuthor(event.target.value)} placeholder="Author name" required maxLength={200} /></div>
          <DialogFooter><DialogClose render={<Button type="button" variant="ghost" />}>Cancel</DialogClose><Button type="submit" disabled={!title.trim() || !author.trim()}>Add book</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
