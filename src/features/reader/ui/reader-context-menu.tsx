"use client";

import type { ReactNode, RefObject } from "react";
import { BookOpen, BookmarkPlus, Copy, Highlighter, NotebookPen } from "lucide-react";
import { toast } from "sonner";
import type { Annotation } from "@/features/annotations/model/annotation";
import { useAnnotations } from "@/features/annotations/stores/annotations-store";
import { useLocalUIState } from "@/shared/hooks/use-local-ui-state";
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator } from "@/shared/ui/context-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { readerAnnotation, type ReaderSelection } from "../model/reader-annotation";
import { dictionaryWord } from "../model/dictionary";
import { ReaderDictionary } from "./reader-dictionary";

export function ReaderContextMenu({ children, triggerRef, bookId, chapter, location, selection }: {
  children: ReactNode; triggerRef: RefObject<HTMLDivElement | null>;
  bookId: string; chapter: string; location: NonNullable<Annotation["location"]>; selection?: ReaderSelection;
}) {
  const [noteOpen, setNoteOpen] = useLocalUIState(false);
  const [note, setNote] = useLocalUIState("");
  const [passage, setPassage] = useLocalUIState<ReaderSelection>();
  const [point, setPoint] = useLocalUIState({ x: 0, y: 0 });
  const [lookup, setLookup] = useLocalUIState("");
  const word = dictionaryWord(selection?.quote ?? "");
  function save(bookmark = false, selected = selection, text = "") {
    useAnnotations.getState().setAnnotations((items) => [...items, readerAnnotation({ bookId, chapter, location, selection: selected, note: text, bookmark })]);
    toast.success(bookmark ? "Bookmark saved" : selected ? "Highlight saved" : "Note saved");
  }
  return <>
    <ContextMenu>
      <ContextMenuTrigger ref={triggerRef} tabIndex={-1} onContextMenuCapture={(event) => setPoint({ x: event.clientX, y: event.clientY })} className="flex min-h-0 min-w-0 flex-1 flex-col outline-none">
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent aria-label="Reading actions" className="w-56">
        <ContextMenuItem disabled={!word} onClick={() => setLookup(word)}><BookOpen />Look up</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem disabled={!selection} onClick={() => save()}><Highlighter />Highlight</ContextMenuItem>
        <ContextMenuItem onClick={() => { setPassage(selection); setNote(""); setNoteOpen(true); }}><NotebookPen />Add note</ContextMenuItem>
        <ContextMenuItem onClick={() => save(true)}><BookmarkPlus />Bookmark this position</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem disabled={!selection} onClick={async () => {
          if (!selection) return;
          try { await navigator.clipboard.writeText(selection.quote); toast.success("Text copied"); }
          catch { toast.error("Text could not be copied. Select it and press Ctrl+C."); }
        }}><Copy />Copy selected text</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
    {lookup && <ReaderDictionary word={lookup} point={point} returnFocus={triggerRef} onClose={() => setLookup("")} />}
    <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogHeader><DialogTitle>Add note</DialogTitle><DialogDescription>{chapter}</DialogDescription></DialogHeader>
        {passage && <blockquote className="max-h-32 overflow-auto border-l-2 border-primary/30 pl-3 text-sm text-muted-foreground">{passage.quote}</blockquote>}
        <Textarea aria-label="Note" placeholder="Add your thoughts…" value={note} onChange={(event) => setNote(event.target.value)} maxLength={5000} autoFocus />
        <DialogFooter>
          <Button variant="ghost" onClick={() => setNoteOpen(false)}>Cancel</Button>
          <Button disabled={!note.trim()} onClick={() => { save(false, passage, note); setNoteOpen(false); }}>Save note</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>;
}
