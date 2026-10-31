import Image from "next/image";
import type { CSSProperties } from "react";
import type { SampleBook } from "../model/sample-books";

export function BookCover({ book }: { book: SampleBook }) {
  if (book.cover) {
    return (
      <div
        aria-hidden="true"
        className="book-cover relative aspect-[2/3] w-full overflow-hidden rounded-xl shadow-[0_8px_16px_-4px_rgb(32_32_32_/_20%)] after:hidden"
      >
        <Image
          src={book.cover}
          alt=""
          fill
          sizes="(max-width: 767px) 45vw, (max-width: 1279px) 25vw, 196px"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`book-cover cover-${book.art}`}
      style={
        {
          "--cover-paper": book.paper,
          "--cover-ink": book.ink,
        } as CSSProperties
      }
    >
      <span className="cover-type">{book.title}</span>
      <span className="cover-art" />
      <span className="cover-credit">{book.author}</span>
    </div>
  );
}
