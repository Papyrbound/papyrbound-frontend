"use client";
import { useEffect, useRef } from "react";
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";
import { useWorkspace } from "@/app-shell/workspace-store";
import { useLocalUIState } from "@/shared/hooks/use-local-ui-state";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { toast } from "sonner";

export function FileImportHost() {
  const ready = useReadingLists((state) => state.importsReady);
  const [hover, setHover] = useLocalUIState(false);
  const queue = useRef(Promise.resolve());
  useEffect(() => {
    if (!ready) return;
    let active = true;
    const cleanups: (() => void)[] = [];
    const processFiles = (load: () => Promise<File[]>) => {
      queue.current = queue.current.then(async () => {
        if (!active) return;
        const notification = toast.loading("Opening your files…");
        try {
          const files = await load();
          if (!files.length) { toast.dismiss(notification); return; }
          const { parseLibraryFile } = await import("../model/import-file");
          let opened = 0, last: Awaited<ReturnType<typeof parseLibraryFile>> | undefined;
          const errors: string[] = [];
          for (const file of files) {
            if (!active) break;
            try {
              const kind = file.name.toLowerCase().endsWith(".cbz") ? "comics" : "books";
              const book = await parseLibraryFile(file, kind);
              await useReadingLists.getState().importBook(book, file); last = book; opened++;
            } catch (error) { errors.push(`${file.name}: ${error instanceof Error ? error.message : "Could not open file"}`); }
          }
          if (active && last) {
            useWorkspace.getState().setLibraryKind(last.kind ?? "books");
            useWorkspace.getState().openReader(last.id);
          }
          toast.dismiss(notification);
          if (opened) toast.success(`${opened} ${opened === 1 ? "file" : "files"} opened`);
          if (errors.length) toast.error(errors.join("\n"), { duration: 12000 });
        } catch (error) { toast.error(error instanceof Error ? error.message : String(error), { id: notification }); }
      }).catch(() => undefined);
    };
    const drag = (event: DragEvent) => { if (event.dataTransfer?.types.includes("Files")) { event.preventDefault(); setHover(true); } };
    const leave = (event: DragEvent) => { if (!event.relatedTarget) setHover(false); };
    const drop = (event: DragEvent) => {
      if (!event.dataTransfer?.types.includes("Files")) return;
      event.preventDefault(); setHover(false);
      const files = Array.from(event.dataTransfer.files);
      processFiles(async () => files);
    };
    window.addEventListener("dragover", drag); window.addEventListener("dragleave", leave); window.addEventListener("drop", drop);
    void (async () => {
      const { isTauri, invoke } = await import("@tauri-apps/api/core");
      if (!isTauri() || !active) return;
      const { listen } = await import("@tauri-apps/api/event");
      const drain = () => processFiles(async () => {
        const paths = await invoke<string[]>("pending_library_files");
        const files: File[] = [];
        for (const path of paths) {
          try {
            const bytes = await invoke<ArrayBuffer>("read_library_file", { path });
            files.push(new File([bytes], path.split(/[/\\]/).at(-1)!));
          } catch (error) { toast.error(`Could not open file: ${String(error)}`); }
        }
        return files;
      });
      const unlisten = await listen("library-files-available", drain);
      if (!active) { unlisten(); return; }
      cleanups.push(unlisten); drain();
    })().catch((error) => { if (active) toast.error(`File opening is unavailable: ${String(error)}`); });
    return () => { active = false; cleanups.forEach((cleanup) => cleanup()); window.removeEventListener("dragover", drag); window.removeEventListener("dragleave", leave); window.removeEventListener("drop", drop); };
  }, [ready, setHover]);
  return <Dialog open={hover} onOpenChange={setHover}><DialogContent className="pointer-events-none border-dashed text-center" showCloseButton={false}><DialogTitle>Drop EPUB books or CBZ comics</DialogTitle><DialogDescription>Files are copied into your library on this device.</DialogDescription></DialogContent></Dialog>;
}
