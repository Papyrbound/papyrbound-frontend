"use client";
/* eslint-disable @next/next/no-img-element -- Local comic images use archive blob URLs. */
import { useRef, type RefObject } from "react";
import type { ReaderArchive } from "../model/reader-archive";
import type { ReaderPreferences } from "../model/reader-preferences";
export function ComicCanvas({ archive, pages, preferences, scroller, offset, onReady, onScroll, onError }: {
  archive: ReaderArchive; pages: number[]; preferences: ReaderPreferences; scroller: RefObject<HTMLDivElement | null>;
  offset: number; onReady: () => void; onScroll: () => void; onError: () => void;
}) {
  const loaded = useRef(new Set<number>());
  const fitPage = preferences.fit === "page";
  return <div ref={scroller} tabIndex={0} aria-label="Comic pages" className="min-h-0 flex-1 overflow-auto bg-[#191919] outline-none focus-visible:ring-2 focus-visible:ring-ring" onScroll={onScroll}>
    <div className={`flex items-start ${preferences.direction === "rtl" ? "flex-row-reverse" : "flex-row"} ${fitPage ? "h-full" : "min-h-full"}`} style={{ width: `${preferences.zoom * 100}%`, height: fitPage ? `${preferences.zoom * 100}%` : undefined }}>
      {pages.map((page) => <div key={page} className={`flex min-w-0 flex-1 justify-center ${fitPage ? "h-full" : ""}`}>
        <img src={archive.resource(archive.entries[page].path)} alt={`Comic page ${page + 1}`} className={fitPage ? "h-full w-full object-contain" : "block h-auto w-full"} onLoad={() => {
          loaded.current.add(page);
          if (loaded.current.size !== pages.length) return;
          const node = scroller.current;
          if (node) node.scrollTop = Math.max(0, node.scrollHeight - node.clientHeight) * offset;
          onReady();
        }} onError={onError} />
      </div>)}
    </div>
  </div>;
}
