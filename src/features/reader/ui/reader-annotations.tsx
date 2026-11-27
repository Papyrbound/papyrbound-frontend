"use client";
import { readerAnnotation } from "../model/reader-annotation";
import { BookmarkPlus, Highlighter, NotebookPen, Trash2 } from "lucide-react";
import type { Annotation } from "@/features/annotations/model/annotation";
import { useAnnotations } from "@/features/annotations/stores/annotations-store";
import { useLocalUIState } from "@/shared/hooks/use-local-ui-state";
import { TooltipHint } from "@/shared/ui/tooltip";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { Popover, PopoverTrigger, PopoverTitle, PopoverContent } from "@/shared/ui/popover";
import { offerUndo } from "@/shared/lib/undo-toast";
import { removeAnnotation } from "@/features/library/model/undo-actions";

export function ReaderAnnotations({ bookId, chapter, location, selection, jump }: {
  bookId: string; chapter: string; location: NonNullable<Annotation["location"]>;
  selection?: { start: number; end: number; quote: string }; jump: (location: NonNullable<Annotation["location"]>) => void;
}) {
  const annotations = useAnnotations((state) => state.annotations).filter((item) => item.bookId === bookId && item.location);
  const [note, setNote] = useLocalUIState("");
  const [message, setMessage] = useLocalUIState("");
  function save(bookmark = false) {
    useAnnotations.getState().setAnnotations((items) => [...items, readerAnnotation({ bookId, chapter, location, selection, note, bookmark })]);
    setNote(""); setMessage(bookmark ? "Bookmark saved" : "Annotation saved");
  }
  return <Popover><TooltipHint content="Notes and bookmarks"><PopoverTrigger aria-label="Notes and bookmarks" render={<Button size="icon-sm" variant="ghost" />}><NotebookPen /></PopoverTrigger></TooltipHint>
    <PopoverContent align="end" className="w-80 max-w-[calc(100vw-3rem)] space-y-3">
      <PopoverTitle>Notes and bookmarks</PopoverTitle>
      {selection ? <p className="max-h-24 overflow-auto text-xs text-muted-foreground">“{selection.quote}”</p> : <p className="text-xs text-muted-foreground">Select text in the book to highlight it, or save a note at your current position.</p>}
      <Textarea aria-label="Reader note" placeholder="Add your thoughts…" value={note} onChange={(event) => setNote(event.target.value)} maxLength={5000} />
      <div className="flex flex-wrap gap-2"><Button size="sm" disabled={!selection && !note.trim()} onClick={() => save()}><Highlighter />{selection ? "Save highlight" : "Save note"}</Button><Button size="sm" variant="outline" onClick={() => save(true)}><BookmarkPlus />Bookmark</Button></div>
      <p role="status" className="text-xs text-muted-foreground">{message}</p>
      <div className="max-h-56 space-y-1 overflow-auto">
        {!annotations.length && <p className="text-xs text-muted-foreground">No saved passages yet.</p>}
        {annotations.map((item) => <div key={item.id} className="flex items-center rounded-lg hover:bg-hover"><Button variant="ghost" className="h-auto min-w-0 flex-1 justify-start whitespace-normal px-2 py-2 text-left text-xs" onClick={() => jump(item.location!)}><span className="min-w-0"><span className="line-clamp-2">{item.content}</span>{item.note && <span className="mt-1 line-clamp-2 block text-muted-foreground">{item.note}</span>}</span></Button><Button size="icon-sm" variant="ghost" aria-label={`Delete ${item.bookmark ? "bookmark" : "annotation"}`} onClick={() => offerUndo(removeAnnotation(item.id))}><Trash2 /></Button></div>)}
      </div>
    </PopoverContent>
  </Popover>;
}
