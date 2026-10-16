"use client"

import { useState, type CSSProperties } from "react"
import { ArrowDownAZIcon, ArrowDownZAIcon, BookOpenIcon, SlidersHorizontalIcon, XIcon } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Slider } from "@/shared/ui/slider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store"
import { BookGallery } from "./book-gallery"
import { NextReadDialog } from "./next-read-dialog"

const coverSizes = [128, 160, 192, 224, 256]
const readingFilters = [
  { value: "all", label: "All books" },
  { value: "new", label: "New" },
  { value: "reading", label: "In progress" },
  { value: "completed", label: "Completed" },
] as const

export function LibraryPage() {
  const { books } = useReadingLists()
  const [sizeStep, setSizeStep] = useState(1)
  const [filter, setFilter] = useState("all")
  const [sort, setSort] = useState("default")
  const visibleBooks = books.filter((book) =>
    filter === "new" ? book.progress <= 0
      : filter === "reading" ? book.progress > 0 && book.progress < 100
        : filter === "completed" ? book.progress >= 100 : true
  )
  if (sort !== "default") {
    visibleBooks.sort((first, second) => first.title.localeCompare(second.title, "en", { sensitivity: "base", numeric: true }) * (sort === "az" ? 1 : -1))
  }

  return (
    <section className="library-gallery" data-resizable="true" aria-label="Your library" style={{ "--gallery-size": `${coverSizes[sizeStep]}px` } as CSSProperties}>
      <div className="gallery-heading library-toolbar">
        <div className="library-title"><h1>Your library</h1><span aria-live="polite">{visibleBooks.length} {visibleBooks.length === 1 ? "book" : "books"}</span></div>
        <div className="library-controls">
          <NextReadDialog />
          <div className="cover-size-control">
            <BookOpenIcon className="size-3.5 text-muted-foreground" aria-hidden="true" />
            <Slider min={0} max={coverSizes.length - 1} step={1} value={[sizeStep]} onValueChange={(value) => setSizeStep(Array.isArray(value) ? value[0] : value)} thumbProps={{ getAriaLabel: () => "Book cover size", getAriaValueText: (_, value) => `${["Small", "Medium", "Large", "Extra large", "Largest"][value]} covers` }} />
            <BookOpenIcon className="size-5 text-muted-foreground" aria-hidden="true" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="secondary" size="sm" />} aria-label="Filter books">
              <SlidersHorizontalIcon /><span>{filter === "all" ? "Filter" : readingFilters.find((option) => option.value === filter)?.label}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-w-[calc(100vw-2rem)]">
              <DropdownMenuRadioGroup aria-label="Filter books" value={filter} onValueChange={setFilter}>
                {readingFilters.map((option) => <DropdownMenuRadioItem key={option.value} value={option.value}>{option.label}</DropdownMenuRadioItem>)}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup><DropdownMenuLabel>Sort by title</DropdownMenuLabel>
                <DropdownMenuRadioGroup aria-label="Sort books" value={sort} onValueChange={setSort}>
                  <DropdownMenuRadioItem value="default">Default order</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="az"><ArrowDownAZIcon />Title: A–Z</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="za"><ArrowDownZAIcon />Title: Z–A</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
              {(filter !== "all" || sort !== "default") && <><DropdownMenuSeparator /><DropdownMenuItem onClick={() => { setFilter("all"); setSort("default") }}><XIcon />Reset filters and sorting</DropdownMenuItem></>}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <BookGallery books={visibleBooks} emptyMessage={books.length === 0 ? "Your library is empty. Add your first book using the Add book button in the header." : "No books match this filter."} />
      {visibleBooks.length === 0 && filter !== "all" && <div className="mt-4 text-center"><Button variant="outline" size="sm" onClick={() => setFilter("all")}><XIcon />Clear filter</Button></div>}
    </section>
  )
}
