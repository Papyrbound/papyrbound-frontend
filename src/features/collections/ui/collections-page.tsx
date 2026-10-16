"use client"

import { useRef, useState, type CSSProperties } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeftIcon, BookOpenIcon, CheckIcon, FolderPlusIcon, LibraryIcon, MoreVerticalIcon, PencilIcon, PinIcon, PinOffIcon, PlusIcon, RotateCwFadingClockIcon, SearchIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Card } from "@/shared/ui/card"
import { Checkbox } from "@/shared/ui/checkbox"
import { Input } from "@/shared/ui/input"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"
import { BookCover } from "@/features/home/ui/book-cover"
import { BookGallery } from "@/features/library/ui/book-gallery"
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store"
import { useCollections, type Collection } from "@/features/collections/stores/collections-store"

const colors = [{ name: "Neutral", value: "#FAF9F8" }, { name: "Lilac", value: "#d9cae9" }, { name: "Sage", value: "#d6dfbd" }, { name: "Peach", value: "#f0c6ac" }, { name: "Rose", value: "#cfaaae" }]

function lastAddedLabel(lastBookAddedAt: string | undefined, now: number) {
  if (!lastBookAddedAt) return "No books added"
  const days = Math.max(0, Math.floor((now - new Date(lastBookAddedAt).getTime()) / 86400000))
  return days === 0 ? "Today" : new Intl.RelativeTimeFormat("en-US", { numeric: "always" }).format(-days, "day")
}

function CollectionEditor({ collection, onClose, onSave }: {
  collection?: Collection
  onClose: () => void
  onSave: (details: Pick<Collection, "name" | "color" | "bookIds">) => void
}) {
  const { books } = useReadingLists()
  const [name, setName] = useState(collection?.name ?? "")
  const [color, setColor] = useState(collection?.color ?? colors[0].value)
  const [bookIds, setBookIds] = useState(collection?.bookIds ?? [])
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(true)
  const titleRef = useRef<HTMLInputElement>(null)
  const pendingSave = useRef<Pick<Collection, "name" | "color" | "bookIds"> | null>(null)
  const results = books.filter((book) => `${book.title} ${book.author}`.toLowerCase().includes(query.trim().toLowerCase()))
  return <Dialog open={open} onOpenChange={setOpen} onOpenChangeComplete={(isOpen) => {
    if (!isOpen) { if (pendingSave.current) onSave(pendingSave.current); else onClose() }
  }}>
    <DialogContent initialFocus={titleRef} className="collection-editor">
      <DialogHeader><DialogTitle>{collection ? "Edit collection" : "New collection"}</DialogTitle><DialogDescription>Give your books a place together.</DialogDescription></DialogHeader>
      <form className="space-y-5" onSubmit={(event) => {
        event.preventDefault()
        if (!name.trim()) return
        pendingSave.current = { name: name.trim(), color, bookIds }
        setOpen(false)
      }}>
        <div className="space-y-2"><label htmlFor="collection-name">Name</label><Input id="collection-name" ref={titleRef} placeholder="e.g. Weekend escapes" value={name} onChange={(event) => setName(event.target.value)} required maxLength={80} /></div>
        <fieldset><legend className="mb-2 text-sm">Collection color</legend><div className="flex gap-2">{colors.map((option) => <Button key={option.name} type="button" variant="outline" size="icon" aria-label={option.name} aria-pressed={color === option.value} style={{ background: option.value, color: "#36332f" }} onClick={() => setColor(option.value)}>{color === option.value && <CheckIcon />}</Button>)}</div></fieldset>
        <fieldset><legend className="mb-2 text-sm">Books · {bookIds.length} selected</legend>
          <div className="relative"><SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input type="search" aria-label="Search collection books" placeholder="Find a book…" className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") event.preventDefault() }} /></div>
          <div className="collection-book-picker mt-3">{results.map((book) => <label key={book.id} className="collection-book-option"><BookCover book={book} /><span className="min-w-0 flex-1"><span className="block truncate text-sm">{book.title}</span><span className="block truncate text-xs text-muted-foreground">{book.author}</span></span><Checkbox checked={bookIds.includes(book.id)} aria-label={`Include ${book.title}`} onCheckedChange={(checked) => setBookIds((current) => checked ? [...current, book.id] : current.filter((id) => id !== book.id))} /></label>)}
          {results.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No matching books.</p>}</div>
        </fieldset>
        <DialogFooter><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={!name.trim()}>{collection ? "Save changes" : "Create collection"}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
}

export function CollectionsPage() {
  const { books } = useReadingLists()
  const { collections, setCollections } = useCollections()
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedId = searchParams.get("collection")
  function openCollection(id: string) {
    router.push(`/collections?collection=${encodeURIComponent(id)}`)
  }
  const [editor, setEditor] = useState<{ collection?: Collection } | null>(null)
  const [deleting, setDeleting] = useState<Collection | null>(null)
  const [now, setNow] = useState(() => new Date().getTime())
  const selected = collections.find((collection) => collection.id === selectedId)
  const collectionBooks = (collection: Collection) => books.filter((book) => collection.bookIds.includes(book.id))
  function saveCollection(details: Pick<Collection, "name" | "color" | "bookIds">) {
    const id = editor?.collection?.id ?? crypto.randomUUID()
    const lastBookAddedAt = new Date().toISOString()
    setNow(new Date(lastBookAddedAt).getTime())
    setCollections((current) => editor?.collection ? current.map((item) => {
      if (item.id !== id) return item
      const hasNewBook = details.bookIds.some((bookId) => !item.bookIds.includes(bookId))
      return { ...item, ...details, lastBookAddedAt: hasNewBook ? lastBookAddedAt : item.lastBookAddedAt }
    }) : [...current, { ...details, id, pinned: false, lastBookAddedAt: details.bookIds.length > 0 ? lastBookAddedAt : undefined }])
    setEditor(null)
  }
  function togglePinned(collection: Collection) {
    setCollections((current) => current.map((item) => item.id === collection.id ? { ...item, pinned: !item.pinned } : item))
  }

  return <>
    {selected ? <section className="library-gallery collections-detail">
      <div className="mb-6 flex items-center justify-between gap-3"><Button variant="ghost" onClick={() => router.push("/collections")}><ArrowLeftIcon />Collections</Button><Button variant="secondary" onClick={() => setEditor({ collection: selected })}><PencilIcon />Edit collection</Button></div>
      <div className="gallery-heading"><h1>{selected.name}</h1><span>{collectionBooks(selected).length} {collectionBooks(selected).length === 1 ? "book" : "books"}</span></div>
      <BookGallery books={collectionBooks(selected)} onAddBooks={() => setEditor({ collection: selected })} />
    </section> : <section className="collections-page" aria-label="Collections">
      <div className="collections-heading"><div><h1>Your collections</h1><p>{collections.length} {collections.length === 1 ? "collection" : "collections"} · Books brought together by you</p></div>{collections.length > 0 && <Button onClick={() => setEditor({})}><PlusIcon />New collection</Button>}</div>
          <div className="collection-cards">{[...collections].sort((first, second) => Number(second.pinned) - Number(first.pinned)).map((collection) => {
            const previewBooks = collectionBooks(collection)
            return <Card key={collection.id} className="collection-card" style={{ "--collection-color": collection.color } as CSSProperties}>
              <Button variant="ghost" className="collection-open" onClick={() => openCollection(collection.id)} aria-label={`Open ${collection.name}, ${previewBooks.length} ${previewBooks.length === 1 ? "book" : "books"}`}>
                <span className="collection-preview" aria-hidden="true">
                  <span className="collection-cover-stack">{previewBooks.slice(0, 3).map((book) => <span className="collection-preview-cover" key={book.id}><BookCover book={book} /></span>)}</span>
                  {previewBooks.length === 0 && <BookOpenIcon className="collection-preview-empty" />}
                </span>
              </Button>
              <div className="collection-card-footer">
                <div className="collection-card-info">
                  <div className="collection-title-row">
                    <Button variant="ghost" className="collection-card-title" onClick={() => openCollection(collection.id)}>{collection.name}</Button>
                    {collection.pinned && <Button variant="ghost" size="icon-xs" className="collection-pin" aria-label={`Unpin ${collection.name}`} onClick={() => togglePinned(collection)}><PinIcon aria-hidden="true" /></Button>}
                  </div>
                  <div className="collection-card-meta">
                    <span className="collection-book-count" aria-label={`${previewBooks.length} books`}><LibraryIcon aria-hidden="true" />{previewBooks.length}</span>
                    <span aria-hidden="true" className="collection-meta-dot">·</span>
                    <span className="collection-card-updated" aria-label={`Last book added: ${lastAddedLabel(collection.lastBookAddedAt, now)}`}><RotateCwFadingClockIcon aria-hidden="true" />{collection.lastBookAddedAt ? <time dateTime={collection.lastBookAddedAt}>{lastAddedLabel(collection.lastBookAddedAt, now)}</time> : "No books added"}</span>
                  </div>
                </div>
              <DropdownMenu><DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" className="collection-menu" />} aria-label={`Options for ${collection.name}`}><MoreVerticalIcon /></DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56"><DropdownMenuItem onClick={() => setEditor({ collection })}><PencilIcon />Edit collection</DropdownMenuItem><DropdownMenuItem onClick={() => togglePinned(collection)}>{collection.pinned ? <PinOffIcon /> : <PinIcon />}{collection.pinned ? "Unpin collection" : "Pin collection"}</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onClick={() => setDeleting(collection)}><Trash2Icon />Delete collection</DropdownMenuItem></DropdownMenuContent>
              </DropdownMenu>
              </div>
            </Card>
          })}</div>
      {collections.length === 0 && <Card className="collection-empty"><FolderPlusIcon className="size-10 text-muted-foreground" /><h2>Your next chapter starts here.</h2><p>Bring a few books together in your first collection.</p><Button onClick={() => setEditor({})}><PlusIcon />New collection</Button></Card>}
    </section>}
    {editor && <CollectionEditor collection={editor.collection} onClose={() => setEditor(null)} onSave={saveCollection} />}
    <Dialog open={deleting !== null} onOpenChange={(open) => { if (!open) setDeleting(null) }}><DialogContent><DialogHeader><DialogTitle>Delete collection?</DialogTitle><DialogDescription>Delete “{deleting?.name}”? Its books will stay in your library.</DialogDescription></DialogHeader><DialogFooter><DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose><Button variant="destructive" onClick={() => { setCollections((current) => current.filter((item) => item.id !== deleting?.id)); setDeleting(null) }}>Delete collection</Button></DialogFooter></DialogContent></Dialog>
  </>
}
