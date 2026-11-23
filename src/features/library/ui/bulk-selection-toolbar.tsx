"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { CheckSquare2, Heart, Check, Bookmark, FolderPlus, Trash2, X, MoreHorizontal } from "lucide-react";
import { useWorkspace } from "@/app-shell/workspace-store";
import { useVisibleCollections as useCollections } from "@/features/collections/stores/use-visible-collections";
import { useActiveLibrary } from "../model/use-active-library";
import { applyBulkAction, type BulkAction } from "../model/bulk-actions";
import { removeBooks } from "../model/undo-actions";
import { offerUndo, reportActionError } from "@/shared/lib/undo-toast";
import { useLocalUIState } from "@/shared/hooks/use-local-ui-state";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { TooltipHint } from "@/shared/ui/tooltip";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuGroup } from "@/shared/ui/dropdown-menu";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/shared/ui/alert-dialog";
import type { SampleBook } from "@/features/home/model/sample-books";

export function SelectionToggle() {
  const path = usePathname();
  const params = useSearchParams();
  const mode = useWorkspace((state) => state.selectionMode);
  const setMode = useWorkspace((state) => state.setSelectionMode);
  const search = params.toString();
  useEffect(() => { setMode(false); }, [path, search, setMode]);
  if (!(path === "/library" || (path === "/reading-lists" && params.has("list")) || (path === "/collections" && params.has("collection")))) return null;
  return <TooltipHint content={mode ? "Exit selection" : "Select items"}><Button size="icon-sm" variant={mode ? "secondary" : "ghost"} aria-label={mode ? "Exit selection" : "Select items"} aria-pressed={mode} onClick={() => setMode(!mode)}><CheckSquare2 /></Button></TooltipHint>;
}

export function BulkSelectionToolbar({ books }: { books: SampleBook[] }) {
  const { selectedIds, setSelectionMode } = useWorkspace();
  const { kind, lists, plural } = useActiveLibrary();
  const { collections } = useCollections();
  const [confirm, setConfirm] = useLocalUIState(false);
  const [busy, setBusy] = useLocalUIState(false);
  const selected = books.filter((book) => selectedIds.includes(book.id));
  const ids = selected.map((book) => book.id);
  const favourites = lists.find((list) => list.id === "favourites")?.bookIds ?? [];
  const allFavourite = selected.length > 0 && selected.every((book) => favourites.includes(book.id));
  function apply(action: BulkAction) {
    try { offerUndo(applyBulkAction(ids, action)); }
    catch (error) { reportActionError(error); }
  }
  return <>
    <div role="toolbar" aria-label="Selected items" className="sticky top-0 z-20 mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-soft">
      <Checkbox aria-label={`Select all visible ${plural}`} disabled={!books.length || busy} checked={selected.length > 0 && selected.length === books.length} indeterminate={selected.length > 0 && selected.length < books.length} onCheckedChange={(checked) => useWorkspace.setState({ selectedIds: checked ? books.map((book) => book.id) : [] })} />
      <span role="status" className="mr-auto text-xs text-muted-foreground">{ids.length} selected</span>
      <TooltipHint content={allFavourite ? "Remove from favourites" : "Add to favourites"}><Button size="icon-sm" variant="ghost" disabled={!ids.length || busy} aria-label={allFavourite ? "Remove selected from favourites" : "Favourite selected"} onClick={() => apply({ kind: "favourite", value: !allFavourite })}><Heart className={allFavourite ? "fill-current" : ""} /></Button></TooltipHint>
      <DropdownMenu><DropdownMenuTrigger aria-label="Add selected to collection" render={<Button size="sm" variant="ghost" disabled={!ids.length || busy} />}><FolderPlus /><span className="hidden sm:inline">Collection</span></DropdownMenuTrigger>
        <DropdownMenuContent className="w-56"><DropdownMenuGroup><DropdownMenuLabel>Add to collection</DropdownMenuLabel>{collections.filter((item) => (item.kind ?? "books") === kind).map((item) => <DropdownMenuItem key={item.id} onClick={() => apply({ kind: "collection", id: item.id })}><span className="truncate">{item.name}</span></DropdownMenuItem>)}{!collections.some((item) => (item.kind ?? "books") === kind) && <DropdownMenuItem disabled>Create a collection first</DropdownMenuItem>}</DropdownMenuGroup></DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu><DropdownMenuTrigger aria-label="Change selected reading status" render={<Button size="icon-sm" variant="ghost" disabled={!ids.length || busy} />}><MoreHorizontal /></DropdownMenuTrigger><DropdownMenuContent className="w-48">
        <DropdownMenuItem onClick={() => apply({ kind: "want-to-read" })}><Bookmark />Want to Read</DropdownMenuItem>
        <DropdownMenuItem onClick={() => apply({ kind: "finished" })}><Check />Mark as finished</DropdownMenuItem>
        <DropdownMenuItem onClick={() => apply({ kind: "unread" })}><Bookmark />Mark as unread</DropdownMenuItem>
      </DropdownMenuContent></DropdownMenu>
      <TooltipHint content="Delete selected"><Button variant="ghost" size="icon-sm" aria-label="Delete selected" className="text-destructive" disabled={!ids.length || busy} onClick={() => setConfirm(true)}><Trash2 /></Button></TooltipHint>
      <TooltipHint content="Exit selection"><Button variant="ghost" size="icon-sm" aria-label="Exit selection" disabled={busy} onClick={() => setSelectionMode(false)}><X /></Button></TooltipHint>
    </div>
    <AlertDialog open={confirm} onOpenChange={(open) => { if (!busy) setConfirm(open); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete {ids.length} {plural}?</AlertDialogTitle><AlertDialogDescription>The selected items and their annotations will be removed. You can undo this for 15 seconds.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel><AlertDialogAction variant="destructive" disabled={busy || !ids.length} onClick={async () => {
      setBusy(true);
      try { offerUndo(await removeBooks(ids)); setConfirm(false); useWorkspace.setState({ selectedIds: [], selectedId: null, dialog: null }); }
      catch (error) { reportActionError(error); }
      finally { setBusy(false); }
    }}>{busy ? "Deleting…" : "Delete selected"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </>;
}
