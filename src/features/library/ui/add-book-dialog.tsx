"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, LoaderCircle, UploadIcon } from "lucide-react";
import { useLocalUIState } from "@/shared/hooks/use-local-ui-state";
import { useIsCompactWindow } from "@/shared/hooks/use-mobile";
import { useWorkspace } from "@/app-shell/workspace-store";
import { Button } from "@/shared/ui/button";
import { TooltipHint } from "@/shared/ui/tooltip";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { useActiveLibrary } from "../model/use-active-library";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/shared/ui/popover";
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";

export function AddBookDialog({ compact = false }: { compact?: boolean }) {
  const { kind, plural, accept, importBook, importsReady, storageError } = useActiveLibrary();
  const [busy, setBusy] = useLocalUIState(false);
  const [result, setResult] = useLocalUIState<{ added: number; duplicates: number; errors: string[] } | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const importing = useRef(false);
  const compactWindow = useIsCompactWindow();
  const router = useRouter();
  const label = `Import ${plural}`;

  async function importFiles(files: File[], paths: string[] = []) {
    if (!files.length || importing.current) return;
    importing.current = true;
    setBusy(true);
    const outcome = { added: 0, duplicates: 0, errors: [] as string[] };
    let lastId: string | undefined;
    try {
      const { parseLibraryFile } = await import("../model/import-file");
      for (const [index, file] of files.entries()) {
        try {
          const book = await parseLibraryFile(file, kind, paths[index]);
          if (await importBook(book, file)) { outcome.added++; lastId = book.id; }
          else outcome.duplicates++;
        } catch (error) {
          outcome.errors.push(`${file.name}: ${error instanceof Error ? error.message : "Could not import this file."}`);
        }
      }
      if (lastId && useWorkspace.getState().libraryKind === kind) {
        useWorkspace.setState((state) => ({ selectedId: lastId, filter: "all", sort: "recent", panelOpen: compactWindow ? false : state.panelOpen }));
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

  async function chooseFiles() {
    const { isTauri, invoke } = await import("@tauri-apps/api/core");
    if (!isTauri()) { input.current?.click(); return; }
    setBusy(true);
    try {
      const paths = await invoke<string[]>("pick_library_files", { kind });
      const files: File[] = [];
      for (const path of paths) {
        const bytes = await invoke<ArrayBuffer>("read_library_file", { path });
        files.push(new File([bytes], path.split(/[/\\]/).at(-1)!));
      }
      await importFiles(files, paths);
    } catch (error) {
      setResult({ added: 0, duplicates: 0, errors: [error instanceof Error ? error.message : String(error)] });
    } finally { setBusy(false); }
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
        className={`gap-2 ${compact ? "w-8 p-0" : "px-3"}`}
        aria-label={busy ? "Importing files" : label}
        aria-busy={busy}
        disabled={busy || !importsReady}
        onClick={() => void chooseFiles()}
      >
        <span className="flex size-4 items-center justify-center" aria-hidden="true">
          {busy ? <LoaderCircle className="size-3.5 animate-spin" /> : <UploadIcon className="size-3.5" />}
        </span>
        {!compact && <span>{busy ? "Importing…" : label}</span>}
      </Button>
      </span>
      </TooltipHint>
      {storageError && <Popover>
        <span role="alert" className="sr-only">{storageError}</span>
        <TooltipHint content="Changes could not be saved on this device">
          <PopoverTrigger aria-label="Device storage problem" render={<Button variant="destructive" size="icon-sm" />}><AlertCircle /></PopoverTrigger>
        </TooltipHint>
        <PopoverContent align="end" className="w-72">
          <PopoverTitle>Device storage</PopoverTitle>
          <p className="text-sm leading-6 text-muted-foreground">{storageError}</p>
          <Button variant="secondary" onClick={() => useReadingLists.setState({ storageError: "" })}>Dismiss</Button>
        </PopoverContent>
      </Popover>}
      <Dialog open={result !== null} onOpenChange={(open) => { if (!open) setResult(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{result && result.added === 0 && result.errors.length > 0 ? "Import needs attention" : "Import complete"}</DialogTitle>
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
