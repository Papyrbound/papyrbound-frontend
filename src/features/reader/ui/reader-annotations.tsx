"use client";
import { readerAnnotation } from "../model/reader-annotation";
import { readerCollectionItems } from "../model/reader-collections";
import { ArrowDownUp, Bookmark, Highlighter, MessageSquare, NotebookPen, Plus, Star, Trash2 } from "lucide-react";
import { annotationColors, type Annotation } from "@/features/annotations/model/annotation";
import { useAnnotations } from "@/features/annotations/stores/annotations-store";
import { useLocalUIState } from "@/shared/hooks/use-local-ui-state";
import { TooltipHint } from "@/shared/ui/tooltip";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { Popover, PopoverTrigger, PopoverTitle, PopoverContent } from "@/shared/ui/popover";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@/shared/ui/select";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/shared/ui/collapsible";
import { offerUndo } from "@/shared/lib/undo-toast";
import { removeAnnotation } from "@/features/library/model/undo-actions";

export function ReaderAnnotations({ bookId, chapter, location, selection, jump, mode = "annotations" }: {
  bookId: string; chapter: string; location: NonNullable<Annotation["location"]>;
  selection?: { start: number; end: number; quote: string }; jump: (location: NonNullable<Annotation["location"]>) => void;
  mode?: "annotations" | "bookmarks";
}) {
  const all = useAnnotations((state) => state.annotations);
  const [open, setOpen] = useLocalUIState(false);
  const [note, setNote] = useLocalUIState("");
  const [message, setMessage] = useLocalUIState("");
  const [starred, setStarred] = useLocalUIState(false);
  const [oldest, setOldest] = useLocalUIState(false);
  const [filter, setFilter] = useLocalUIState<"all" | "highlights" | "notes" | "chapter">("all");
  const bookmarks = mode === "bookmarks";
  const title = bookmarks ? "Bookmarks" : "Annotations";
  const items = readerCollectionItems(all, { bookId, bookmarks, filter, path: location.path, starred, oldest });
  const options = bookmarks ? [{ value: "all", label: "All bookmarks" }, { value: "chapter", label: "This chapter" }] : [{ value: "all", label: "All annotations" }, { value: "highlights", label: "Highlights" }, { value: "notes", label: "Notes" }, { value: "chapter", label: "This chapter" }];
  function save(bookmark = false) {
    useAnnotations.getState().setAnnotations((items) => [...items, readerAnnotation({ bookId, chapter, location, selection, note, bookmark })]);
    setNote(""); setMessage(bookmark ? "Bookmark saved" : "Annotation saved");
  }
  return <Popover open={open} onOpenChange={setOpen}>
    <TooltipHint content={title}><PopoverTrigger aria-label={title} render={<Button size="icon-sm" variant="ghost" />}>{bookmarks ? <Bookmark /> : <NotebookPen />}</PopoverTrigger></TooltipHint>
    <PopoverContent align="end" className="w-96 max-w-[calc(100vw-2rem)] gap-3 p-3">
      <PopoverTitle>{title}</PopoverTitle>
      <div className="flex items-center gap-1">
        <Select items={options} value={filter} onValueChange={(value) => { if (value) setFilter(value as typeof filter); }}><SelectTrigger aria-label={`Filter ${title.toLowerCase()}`} className="min-w-0 flex-1"><SelectValue /></SelectTrigger><SelectContent alignItemWithTrigger={false}><SelectGroup>{options.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectGroup></SelectContent></Select>
        <TooltipHint content="Starred only"><Button size="icon-sm" variant={starred ? "secondary" : "ghost"} aria-label="Starred only" aria-pressed={starred} onClick={() => setStarred(!starred)}><Star className={starred ? "fill-current" : ""} /></Button></TooltipHint>
        <TooltipHint content={oldest ? "Oldest first" : "Newest first"}><Button size="icon-sm" variant="ghost" aria-label={oldest ? "Sort newest first" : "Sort oldest first"} onClick={() => setOldest(!oldest)}><ArrowDownUp /></Button></TooltipHint>
        {bookmarks && <TooltipHint content="Bookmark this position"><Button size="icon-sm" variant="secondary" aria-label="Add bookmark" onClick={() => save(true)}><Plus /></Button></TooltipHint>}
      </div>
      <div className="max-h-[min(23rem,45dvh)] space-y-1 overflow-auto">
        {!items.length && <div className="flex flex-col items-center gap-3 px-4 py-8 text-center text-muted-foreground">{bookmarks ? <Bookmark className="size-8" /> : <NotebookPen className="size-8" />}<p className="text-sm">{starred || filter !== "all" ? "Nothing matches this filter." : bookmarks ? "Your bookmarks will appear here." : "Your highlights and notes will appear here."}</p></div>}
        {items.map((item) => <div key={item.id} className="flex items-start rounded-selection hover:bg-hover">
          <Button variant="ghost" className="h-auto min-w-0 flex-1 items-start justify-start gap-3 rounded-selection whitespace-normal px-2 py-3 text-left" onClick={() => { jump(item.location!); setOpen(false); }}>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full text-[#242424]" style={{ backgroundColor: annotationColors[item.color] }}>{item.bookmark ? <Bookmark /> : item.note || item.kind === "note" ? <MessageSquare /> : <Highlighter />}</span>
            <span className="min-w-0 flex-1"><span className="line-clamp-2 text-xs font-medium">{item.content}</span>{item.note && <span className="mt-1 line-clamp-2 block text-xs text-muted-foreground">{item.note}</span>}<span className="mt-1 block truncate text-[11px] text-muted-foreground">{item.chapter ?? "Saved passage"} · {new Date(item.createdAt).toLocaleDateString()}</span></span>
          </Button>
          <div className="flex shrink-0 flex-col py-2">
            <Button size="icon-xs" variant="ghost" aria-label={item.starred ? "Unstar saved passage" : "Star saved passage"} aria-pressed={item.starred} onClick={() => useAnnotations.getState().setAnnotations((items) => items.map((entry) => entry.id === item.id ? { ...entry, starred: !entry.starred } : entry))}><Star className={item.starred ? "fill-current" : "text-muted-foreground"} /></Button>
            <Button size="icon-xs" variant="ghost" aria-label={`Delete ${bookmarks ? "bookmark" : "annotation"}`} onClick={() => offerUndo(removeAnnotation(item.id))}><Trash2 className="text-muted-foreground" /></Button>
          </div>
        </div>)}
      </div>
      {!bookmarks && <Collapsible>
        <CollapsibleTrigger render={<Button variant="secondary" size="sm" className="w-full" />}><Plus />Add a note or highlight</CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-3">
          {selection && <p className="max-h-20 overflow-auto text-xs text-muted-foreground">“{selection.quote}”</p>}
          <Textarea aria-label="Reader note" placeholder="Add your thoughts…" value={note} onChange={(event) => setNote(event.target.value)} maxLength={5000} />
          <Button size="sm" disabled={!selection && !note.trim()} onClick={() => save()}><Highlighter />{selection ? "Save highlight" : "Save note"}</Button>
        </CollapsibleContent>
      </Collapsible>}
      <p role="status" className="text-xs text-muted-foreground">{message}</p>
    </PopoverContent>
  </Popover>;
}

