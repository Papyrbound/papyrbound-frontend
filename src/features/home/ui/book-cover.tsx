import type { CSSProperties } from "react"
import type { SampleBook } from "../model/sample-books"

export function BookCover({ book }: { book: SampleBook }) {
  return (
    <div
      aria-hidden="true"
      className={`book-cover cover-${book.art}`}
      style={{ "--cover-paper": book.paper, "--cover-ink": book.ink } as CSSProperties}
    >
      <span className="cover-type">{book.title}</span>
      <span className="cover-art" />
      <span className="cover-credit">{book.author}</span>
    </div>
  )
}
