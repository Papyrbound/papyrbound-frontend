"use client"

import { useRef, useState } from "react"
import { CheckIcon, ChevronDownIcon, HighlighterIcon, NotebookPenIcon } from "lucide-react"
import { annotationColors as colors, type Annotation, type AnnotationDetails } from "@/features/annotations/model/annotation"
import { type SampleBook } from "@/features/home/model/sample-books"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Textarea } from "@/shared/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"

export function AnnotationEditor({ annotation, books, defaultBookId, onSave, onClose }: {
  annotation?: Annotation
  books: SampleBook[]
  defaultBookId: string
  onSave: (details: AnnotationDetails) => void
  onClose: () => void
}) {
  const [bookId, setBookId] = useState(annotation?.bookId ?? defaultBookId)
  const [kind, setKind] = useState<Annotation["kind"]>(annotation?.kind ?? "highlight")
  const [content, setContent] = useState(annotation?.content ?? "")
  const [note, setNote] = useState(annotation?.note ?? "")
  const [page, setPage] = useState(annotation?.page?.toString() ?? "")
  const [color, setColor] = useState<Annotation["color"]>(annotation?.color ?? "lilac")
  const [open, setOpen] = useState(true)
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const pendingSave = useRef<AnnotationDetails | null>(null)
  const selectedBook = books.find((book) => book.id === bookId)

  return <Dialog open={open} onOpenChange={setOpen} onOpenChangeComplete={(isOpen) => {
    if (!isOpen) { if (pendingSave.current) onSave(pendingSave.current); else onClose() }
  }}>
    <DialogContent initialFocus={contentRef} className="annotation-editor">
      <DialogHeader><DialogTitle>{annotation ? "Edit annotation" : "New annotation"}</DialogTitle><DialogDescription>Keep a passage or a thought close to its book.</DialogDescription></DialogHeader>
      <form className="space-y-5" onSubmit={(event) => {
        event.preventDefault()
        if (!content.trim() || !selectedBook) return
        pendingSave.current = { bookId, kind, content: content.trim(), note: kind === "highlight" ? note.trim() : "", page: page ? Number(page) : undefined, color }
        setOpen(false)
      }}>
        <div className="space-y-2"><span id="annotation-book-label" className="text-sm">Book</span>
          <DropdownMenu><DropdownMenuTrigger render={<Button variant="outline" className="w-full justify-between" />} aria-labelledby="annotation-book-label annotation-book-name"><span id="annotation-book-name" className="truncate">{selectedBook?.title ?? "Choose a book"}</span><ChevronDownIcon /></DropdownMenuTrigger>
            <DropdownMenuContent className="w-72"><DropdownMenuRadioGroup value={bookId} onValueChange={setBookId}>{books.map((book) => <DropdownMenuRadioItem key={book.id} value={book.id}>{book.title}</DropdownMenuRadioItem>)}</DropdownMenuRadioGroup></DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex gap-2" role="group" aria-label="Annotation type">
          <Button type="button" variant={kind === "highlight" ? "secondary" : "ghost"} aria-pressed={kind === "highlight"} onClick={() => setKind("highlight")}><HighlighterIcon />Highlight</Button>
          <Button type="button" variant={kind === "note" ? "secondary" : "ghost"} aria-pressed={kind === "note"} onClick={() => setKind("note")}><NotebookPenIcon />Note</Button>
        </div>
        <div className="space-y-2"><label htmlFor="annotation-content">{kind === "highlight" ? "Passage" : "Your note"}</label><Textarea ref={contentRef} id="annotation-content" rows={4} value={content} onChange={(event) => setContent(event.target.value)} placeholder={kind === "highlight" ? "A few words worth keeping…" : "What are you thinking about?"} required maxLength={5000} /></div>
        {kind === "highlight" && <div className="space-y-2"><label htmlFor="annotation-thought">Your thoughts <span className="text-muted-foreground">(optional)</span></label><Textarea id="annotation-thought" rows={2} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Why did this stand out?" maxLength={5000} /></div>}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="w-28 space-y-2"><label htmlFor="annotation-page">Page <span className="text-muted-foreground">(optional)</span></label><Input id="annotation-page" type="number" min={1} max={selectedBook?.pages || undefined} step={1} placeholder="e.g. 42" value={page} onChange={(event) => setPage(event.target.value)} /></div>
          <fieldset><legend className="mb-2 text-sm">Color</legend><div className="flex gap-2">{(Object.keys(colors) as Annotation["color"][]).map((option) => <Button key={option} type="button" size="icon-sm" variant="outline" aria-label={option} aria-pressed={color === option} style={{ background: colors[option], color: "#34312f" }} onClick={() => setColor(option)}>{color === option && <CheckIcon />}</Button>)}</div></fieldset>
        </div>
        <DialogFooter><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={!content.trim() || !selectedBook}>{annotation ? "Save changes" : "Save annotation"}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
}
