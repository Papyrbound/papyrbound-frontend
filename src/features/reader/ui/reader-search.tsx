"use client";
import { useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { useLocalUIState } from "@/shared/hooks/use-local-ui-state";
import { searchBook, type BookSearchHit } from "../model/book-search";
import type { ReaderArchive } from "../model/reader-archive";
export function ReaderSearch({ archive, jump }: { archive: ReaderArchive; jump: (hit: BookSearchHit) => void }) {
  const [query, setQuery] = useLocalUIState("");
  const [hits, setHits] = useLocalUIState<BookSearchHit[]>([]);
  const [status, setStatus] = useLocalUIState("");
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  return <Popover><PopoverTrigger aria-label="Search in book" render={<Button size="icon-sm" variant="ghost" />}><Search /></PopoverTrigger>
    <PopoverContent aria-label="Search in book" align="end" className="w-80 max-w-[calc(100vw-3rem)] space-y-3">
      <form className="flex gap-2" onSubmit={async (event) => {
        event.preventDefault(); request.current?.abort();
        const job = new AbortController(); request.current = job;
        setStatus("Searching…"); setHits([]);
        try {
          const found = await searchBook(archive, query, job.signal);
          if (job.signal.aborted) return;
          setHits(found); setStatus(found.length === 200 ? "Showing the first 200 matches. Refine your search." : `${found.length} matches`);
        } catch { if (!job.signal.aborted) setStatus("Search could not finish. Try again."); }
      }}><Input aria-label="Search book text" placeholder="Find a passage…" value={query} onChange={(event) => { request.current?.abort(); setQuery(event.target.value); setHits([]); setStatus(""); }} maxLength={200} /><Button size="icon-sm" type="submit" aria-label="Find matches" disabled={query.trim().length < 2}><Search /></Button></form>
      <p role="status" className="text-xs text-muted-foreground">{status || "Search all chapters (at least 2 characters)."}</p>
      <div className="max-h-72 space-y-1 overflow-auto">{hits.map((hit) => <Button key={`${hit.index}:${hit.start}`} variant="ghost" className="h-auto w-full justify-start whitespace-normal px-2 py-2 text-left" onClick={() => jump(hit)}><span><span className="block text-xs font-medium">{hit.chapter}</span><span className="line-clamp-3 text-xs text-muted-foreground">{hit.quote}</span></span></Button>)}</div>
    </PopoverContent>
  </Popover>;
}
