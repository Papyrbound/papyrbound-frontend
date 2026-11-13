"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, UploadIcon } from "lucide-react";
import { useLocalUIState } from "@/shared/hooks/use-local-ui-state";
import { useIsCompactWindow } from "@/shared/hooks/use-mobile";
import { useWorkspace } from "@/app-shell/workspace-store";
import { Button } from "@/shared/ui/button";
import { TooltipHint } from "@/shared/ui/tooltip";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { useActiveLibrary } from "../model/use-active-library";

export function AddBookDialog() {
  const { kind, plural, accept, importBook, importsReady, storageError } = useActiveLibrary();
  const [busy, setBusy] = useLocalUIState(false);
  const [result, setResult] = useLocalUIState<{ added: number; duplicates: number; errors: string[] } | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const importing = useRef(false);
  const compact = useIsCompactWindow();
  const router = useRouter();
  const label = `Import ${plural}`;

  async function importFiles(files: File[]) {
    if (!files.length || importing.current) return;
    importing.current = true;
    setBusy(true);
    const outcome = { added: 0, duplicates: 0, errors: [] as string[] };
    let lastId: string | undefined;
    try {
      const { parseLibraryFile } = await import("../model/import-file");
      for (const file of files) {
        try {
          const book = await parseLibraryFile(file, kind);
          if (await importBook(book, file)) { outcome.added++; lastId = book.id; }
          else outcome.duplicates++;
        } catch (error) {
          outcome.errors.push(`${file.name}: ${error instanceof Error ? error.message : "Could not import this file."}`);
        }
      }
      if (lastId && useWorkspace.getState().libraryKind === kind) {
        useWorkspace.setState((state) => ({ selectedId: lastId, filter: "all", sort: "recent", panelOpen: compact ? false : state.panelOpen }));
        router.push("/library");
      }
    } catch {
      outcome.errors.push("Could not start the importer. Please try again.");
    } finally {
      importing.current = false;
      setBusy(false);
      setResult(outcome);
    }
  }

  return (
    <>
      <input
        ref={input}
        type="file"
        multiple
        accept={accept}
        className="hidden"
        aria-label={label}
        onChange={(event) => {
          const files = Array.from(event.currentTarget.files ?? []);
          event.currentTarget.value = "";
          void importFiles(files);
        }}
      />
      <TooltipHint content={busy ? "Importing files…" : label}>
      <span className="inline-flex" tabIndex={busy || !importsReady ? 0 : undefined} aria-label={busy || !importsReady ? label : undefined}>
      <Button
        size="sm"
        className="w-8 gap-2 rounded-[10px] border-primary-foreground/10 p-0 text-[13px] font-medium shadow-[0_1px_2px_rgb(0_0_0/12%),inset_0_1px_0_rgb(255_255_255/16%)] transition-[background-color,box-shadow] duration-150 hover:bg-primary/90 hover:shadow-[0_2px_5px_rgb(0_0_0/16%)] sm:w-auto sm:pl-1.5 sm:pr-3"
        aria-label={busy ? "Importing files" : label}
        aria-busy={busy}
        disabled={busy || !importsReady}
        onClick={() => input.current?.click()}
      >
        <span className="flex size-5 items-center justify-center rounded-md bg-primary-foreground/10" aria-hidden="true">
          {busy ? <LoaderCircle className="size-3.5 animate-spin" /> : <UploadIcon className="size-3.5" />}
        </span>
        <span className="hidden sm:inline">{busy ? "Importing…" : label}</span>
      </Button>
      </span>
      </TooltipHint>
      {storageError && <span role="alert" className="max-w-48 text-xs text-destructive">{storageError}</span>}
      <Dialog open={result !== null} onOpenChange={(open) => { if (!open) setResult(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import complete</DialogTitle>
            <DialogDescription>
              {result?.added ?? 0} {result?.added === 1 ? "file" : "files"} added to your library on this device.
              {!!result?.duplicates && ` ${result.duplicates} already in your library.`}
            </DialogDescription>
          </DialogHeader>
          {!!result?.errors.length && <ul className="max-h-56 space-y-2 overflow-y-auto text-sm text-destructive">{result.errors.map((error, index) => <li key={index}>{error}</li>)}</ul>}
          <DialogFooter><DialogClose render={<Button />}>Done</DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
