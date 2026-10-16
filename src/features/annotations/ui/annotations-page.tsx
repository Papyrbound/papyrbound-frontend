"use client"

import { useRef, useState, type CSSProperties } from "react"
import { BookOpenIcon, ChevronDownIcon, HighlighterIcon, LayoutGridIcon, ListIcon, MoreHorizontalIcon, NotebookPenIcon, PencilIcon, PlusIcon, SearchIcon, StarIcon, Trash2Icon, XIcon } from "lucide-react"
import { useAnnotations } from "@/features/annotations/stores/annotations-store"
import { annotationColors, type Annotation, type AnnotationDetails } from "@/features/annotations/model/annotation"
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store"
import { BookCover } from "@/features/home/ui/book-cover"
import { AnnotationEditor } from "./annotation-editor"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Card } from "@/shared/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/shared/ui/alert-dialog"

const filters = [
  { id: "all", label: "All annotations" },
  { id: "highlight", label: "Highlights" },
  { id: "note", label: "Notes" },
  { id: "starred", label: "Starred" },
] as const
type Filter = typeof filters[number]["id"]
const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" })

export function AnnotationsPage() {
  const { books } = useReadingLists()
  const { annotations, setAnnotations } = useAnnotations()
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<Filter>("all")
  const [bookFilter, setBookFilter] = useState("all")
  const [sort, setSort] = useState("newest")
  const [layout, setLayout] = useState("grid")
  const [editor, setEditor] = useState<{ annotation?: Annotation } | null>(null)
  const [deleting, setDeleting] = useState<Annotation | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const cancelDeleteRef = useRef<HTMLButtonElement>(null)
  const booksById = new Map(books.map((book) => [book.id, book]))
  // Entries from deleted books are excluded, like the library's other book views.
  const available = annotations.filter((annotation) => booksById.has(annotation.bookId))
  const annotatedBookIds = new Set(available.map((annotation) => annotation.bookId))
  const normalizedQuery = query.trim().toLowerCase()
  const visible = available.filter((annotation) => {
    const book = booksById.get(annotation.bookId)!
    return (filter === "all" || (filter === "starred" ? annotation.starred : annotation.kind === filter))
      && (bookFilter === "all" || annotation.bookId === bookFilter)
      && `${annotation.content} ${annotation.note} ${book.title} ${book.author}`.toLowerCase().includes(normalizedQuery)
  }).sort((a, b) => sort === "oldest" ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt))
  const selectedBook = booksById.get(bookFilter)
  const visibleBookCount = new Set(visible.map((item) => item.bookId)).size
  const hasFilters = query !== "" || filter !== "all" || bookFilter !== "all"

  function saveAnnotation(details: AnnotationDetails) {
    const editingId = editor?.annotation?.id
    setAnnotations((current) => editingId ? current.map((item) => item.id === editingId ? { ...item, ...details, ...(item.kind === "highlight" ? { content: item.content, kind: item.kind, bookId: item.bookId, page: item.page } : {}) } : item) : [{ ...details, id: crypto.randomUUID(), starred: false, createdAt: new Date().toISOString() }, ...current])
    setEditor(null)
    if (!editingId) { setQuery(""); setFilter("all"); setBookFilter("all"); setSort("newest") }
  }

  return <section className="annotations-page" aria-label="Annotations">
    <header className="annotations-heading"><div><h1>Your annotations</h1><p>Highlights and thoughts worth coming back to.</p></div>{available.length > 0 && <Button disabled={books.length === 0} onClick={() => setEditor({})}><PlusIcon />New annotation</Button>}</header>
    <div className="annotations-toolbar">
      <div className="annotation-filters" role="group" aria-label="Filter annotations">{filters.map((item) => <Button key={item.id} size="sm" variant={filter === item.id ? "secondary" : "ghost"} aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>{item.id === "starred" && <StarIcon />}{item.label}<span className="annotation-filter-count">{available.filter((annotation) => item.id === "all" || (item.id === "starred" ? annotation.starred : annotation.kind === item.id)).length}</span></Button>)}</div>
      <div className="annotation-tools">
        <div className="annotation-search"><SearchIcon aria-hidden="true" /><Input type="search" aria-label="Search annotations" placeholder="Search your annotations…" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
        <DropdownMenu><DropdownMenuTrigger render={<Button variant="ghost" size="sm" className="annotation-book-filter" />} aria-label={`Filter by book: ${selectedBook?.title ?? "All books"}`}><BookOpenIcon /><span className="truncate">{selectedBook?.title ?? "All books"}</span><ChevronDownIcon /></DropdownMenuTrigger><DropdownMenuContent className="w-64"><DropdownMenuRadioGroup value={bookFilter} onValueChange={setBookFilter}><DropdownMenuRadioItem value="all">All books</DropdownMenuRadioItem>{books.filter((book) => annotatedBookIds.has(book.id)).map((book) => <DropdownMenuRadioItem key={book.id} value={book.id}>{book.title}</DropdownMenuRadioItem>)}</DropdownMenuRadioGroup></DropdownMenuContent></DropdownMenu>
      </div>
    </div>
    <div className="annotations-results">
      <p aria-live="polite">{visible.length} {visible.length === 1 ? "annotation" : "annotations"}{bookFilter === "all" && ` across ${visibleBookCount} ${visibleBookCount === 1 ? "book" : "books"}`}</p>
      <div className="annotation-layout-controls">
      <DropdownMenu><DropdownMenuTrigger render={<Button variant="ghost" size="sm" />} aria-label="Sort annotations">{sort === "newest" ? "Newest first" : "Oldest first"}<ChevronDownIcon /></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuRadioGroup value={sort} onValueChange={setSort}><DropdownMenuRadioItem value="newest">Newest first</DropdownMenuRadioItem><DropdownMenuRadioItem value="oldest">Oldest first</DropdownMenuRadioItem></DropdownMenuRadioGroup></DropdownMenuContent></DropdownMenu>
      <ToggleGroup value={[layout]} onValueChange={(value) => { if (value[0]) setLayout(value[0]) }} size="sm" spacing={1} aria-label="Annotation layout" className="rounded-full bg-muted/50 p-1">
        <ToggleGroupItem value="grid" aria-label="Grid layout" className="rounded-full"><LayoutGridIcon /></ToggleGroupItem>
        <ToggleGroupItem value="list" aria-label="List layout" className="rounded-full"><ListIcon /></ToggleGroupItem>
      </ToggleGroup>
      </div>
    </div>
    <div className={`annotation-grid${layout === "list" ? " annotation-list" : ""}`}>{visible.map((annotation) => {
      const book = booksById.get(annotation.bookId)!
      return <Card key={annotation.id} className="annotation-card" style={{ "--annotation-color": annotationColors[annotation.color] } as CSSProperties}>
        <div className="annotation-source"><div className="annotation-book-cover" aria-hidden="true"><BookCover book={book} /></div><div className="min-w-0 flex-1"><h2>{book.title}</h2><p>{book.author}{annotation.page ? ` · Page ${annotation.page}` : ""}</p></div><Button variant="ghost" size="icon-sm" className="annotation-star" aria-label={`${annotation.starred ? "Unstar" : "Star"} annotation from ${book.title}${annotation.page ? `, page ${annotation.page}` : ""}`} aria-pressed={annotation.starred} onClick={() => setAnnotations((current) => current.map((item) => item.id === annotation.id ? { ...item, starred: !item.starred } : item))}><StarIcon fill={annotation.starred ? "currentColor" : "none"} /></Button></div>
        <div className="annotation-body">
        {annotation.kind === "highlight" ? <blockquote className="annotation-passage"><p>{annotation.content}</p></blockquote> : <p className="annotation-note-content">{annotation.content}</p>}
        {annotation.note && <p className="annotation-thought">{annotation.note}</p>}
        </div>
        <div className="annotation-footer"><span className="annotation-kind">{annotation.kind === "highlight" ? <HighlighterIcon /> : <NotebookPenIcon />}{annotation.kind === "highlight" ? "Highlight" : "Note"}</span><time dateTime={annotation.createdAt}>{dateFormat.format(new Date(annotation.createdAt))}</time><DropdownMenu><DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />} aria-label={`Options for ${book.title}${annotation.page ? `, page ${annotation.page}` : ""}`}><MoreHorizontalIcon /></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-48"><DropdownMenuItem onClick={() => setEditor({ annotation })}><PencilIcon />{annotation.kind === "highlight" ? "Highlight options" : "Edit note"}</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onClick={() => { setDeleting(annotation); setDeleteOpen(true) }}><Trash2Icon />Delete annotation</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>
      </Card>
    })}</div>
    {visible.length === 0 && <div className="annotations-empty"><NotebookPenIcon /><h2>{hasFilters ? "No matching annotations" : "A place for what stays with you"}</h2><p>{hasFilters ? "Try another book or a different search." : "Save a passage or write your first note about a book."}</p>{hasFilters ? <Button variant="secondary" onClick={() => { setQuery(""); setFilter("all"); setBookFilter("all") }}><XIcon />Clear filters</Button> : <Button disabled={books.length === 0} onClick={() => setEditor({})}><PlusIcon />New annotation</Button>}</div>}
    {editor && <AnnotationEditor annotation={editor.annotation} books={books} defaultBookId={selectedBook?.id ?? books[0]?.id ?? ""} onSave={saveAnnotation} onClose={() => setEditor(null)} />}
    <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen} onOpenChangeComplete={(open) => { if (!open) setDeleting(null) }}><AlertDialogContent initialFocus={cancelDeleteRef}><AlertDialogHeader><AlertDialogTitle>Delete annotation?</AlertDialogTitle><AlertDialogDescription>This annotation and its attached thoughts will be removed. Your book will stay in your library.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel ref={cancelDeleteRef}>Cancel</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={() => { setAnnotations((current) => current.filter((item) => item.id !== deleting?.id)); setDeleteOpen(false) }}>Delete annotation</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </section>
}
