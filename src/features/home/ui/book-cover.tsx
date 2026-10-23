import type { CSSProperties } from "react"
import type { SampleBook } from "../model/sample-books"

export function BookCover({ book }: { book: SampleBook }) {
  return (
    <div
      aria-hidden="true"
      className={`book-cover cover-${book.art} relative w-full shrink-0 overflow-hidden rounded-[6px_12px_12px_6px] bg-[var(--cover-paper)] text-[var(--cover-ink)] shadow-[inset_4px_0_0_rgb(0_0_0_/_12%),0_4px_10px_rgb(0_0_0_/_8%)] aspect-[2/3] transition-transform duration-200`}
      style={{ "--cover-paper": book.paper, "--cover-ink": book.ink } as CSSProperties}
    >
      <span className="cover-type absolute [inset:12%_10%_auto_14%] z-[1] text-[clamp(13px,_1.4vw,_23px)] font-semibold [line-height:1.1] tracking-[-.035em] max-[1200px]:text-[21px] max-[767px]:text-[20px]">{book.title}</span>
      <span className="cover-art absolute w-[76%] [aspect-ratio:1] left-[16%] top-[35%] [border:1px_solid_currentColor] rounded-full opacity-[.75]" />
      <span className="cover-credit absolute bottom-[8%] left-[14%] right-[8%] text-[8px] tracking-[.08em] [text-transform:uppercase]">{book.author}</span>
    </div>
  )
}
