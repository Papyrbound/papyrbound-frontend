"use client";

import { useRef } from "react";
import { DownloadIcon, UploadIcon, ArchiveRestoreIcon, LoaderCircleIcon } from "lucide-react";
import { useLocalUIState } from "@/shared/hooks/use-local-ui-state";
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/shared/ui/alert-dialog";
import type { PreparedBackup } from "../model/library-backup";

export function BackupRestoreDialog({ onClose }: { onClose: () => void }) {
  const ready = useReadingLists((state) => state.importsReady);
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useLocalUIState<"export" | "read" | "restore" | null>(null);
  const [preview, setPreview] = useLocalUIState<PreparedBackup | null>(null);
  const [confirm, setConfirm] = useLocalUIState(false);
  const [message, setMessage] = useLocalUIState("");
  const [error, setError] = useLocalUIState("");

  async function download() {
    setBusy("export"); setError(""); setMessage("");
    try {
      const { backUpDevice } = await import("../model/device-backup");
      const bytes = await backUpDevice();
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/zip" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `papyrbound-${new Date().toISOString().slice(0, 10)}.papyrbound.zip`;
      document.body.append(link);
      link.click(); link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setMessage("Your backup is ready. Check your downloads.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not create the backup. Try again."); }
    finally { setBusy(null); }
  }

  async function choose(file: File) {
    setBusy("read"); setPreview(null); setError(""); setMessage("");
    try {
      const { readBackup } = await import("../model/library-backup");
      setPreview(await readBackup(file));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not open this backup. Choose another file."); }
    finally { setBusy(null); }
  }

  async function restore() {
    if (!preview || busy) return;
    setBusy("restore"); setError(""); setMessage("");
    try {
      const { restoreBackup } = await import("../model/library-backup");
      await restoreBackup(preview);
      window.location.reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not restore the backup. Try again.");
      setConfirm(false); setBusy(null);
    }
  }

  const allBooks = preview ? [...preview.manifest.library.books, ...preview.records.map((record) => record.book)] : [];
  const bookCount = allBooks.filter((book) => book.kind !== "comics").length;
  const comicCount = allBooks.length - bookCount;
  return (
    <Dialog open onOpenChange={(open) => { if (!open && !busy) onClose(); }}>
      <DialogContent className="gap-5 sm:max-w-[480px]" showCloseButton={!busy}>
        <DialogHeader className="pr-8">
          <DialogTitle>Back up &amp; restore</DialogTitle>
          <DialogDescription>Keep a copy of your library, or move it to another device.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Card size="sm" className="rounded-xl border border-border shadow-none ring-0"><CardContent>
            <h2 className="flex items-center gap-2 text-sm font-medium"><DownloadIcon className="size-4 text-muted-foreground" />Back up your library</h2>
            <p className="mb-3 mt-2 text-xs leading-5 text-muted-foreground">Includes books and comics, original files, shelves, collections, annotations, your profile, and preferences.</p>
            <Button size="sm" disabled={!!busy || !ready} onClick={download}>
              {busy === "export" ? <LoaderCircleIcon className="animate-spin" /> : <DownloadIcon />}
              {busy === "export" ? "Creating backup…" : "Download backup"}
            </Button>
          </CardContent></Card>
          <Card size="sm" className="rounded-xl border border-border shadow-none ring-0"><CardContent>
            <h2 className="flex items-center gap-2 text-sm font-medium"><ArchiveRestoreIcon className="size-4 text-muted-foreground" />Restore a backup</h2>
            <p className="mb-3 mt-2 text-xs leading-5 text-muted-foreground">Choose a Papyrbound backup to review before restoring.</p>
            <input ref={input} type="file" accept=".zip,application/zip" className="hidden" aria-label="Choose a Papyrbound backup" onChange={(event) => {
              const file = event.target.files?.[0]; event.target.value = "";
              if (file) void choose(file);
            }} />
            <Button variant="outline" size="sm" disabled={!!busy || !ready} onClick={() => input.current?.click()}>
              {busy === "read" ? <LoaderCircleIcon className="animate-spin" /> : <UploadIcon />}
              {busy === "read" ? "Checking backup…" : preview ? "Choose another backup" : "Choose backup"}
            </Button>
            {preview && <div className="mt-4 border-t border-border pt-3">
              <p className="text-xs text-muted-foreground">{preview.manifest.account.profile.name} · {new Date(preview.manifest.exportedAt).toLocaleDateString()}</p>
              <p className="mt-1 text-xs leading-5">{bookCount} books · {comicCount} comics · {preview.manifest.collections.length} collections · {preview.manifest.annotations.length} annotations</p>
              <Button variant="destructive" size="sm" className="mt-3" disabled={!!busy} onClick={() => setConfirm(true)}>Restore this backup</Button>
            </div>}
          </CardContent></Card>
        </div>
        <div aria-live="polite" className="text-xs leading-5">
          {!ready && <p className="text-muted-foreground">Your library is loading…</p>}
          {message && <p role="status" className="text-muted-foreground">{message}</p>}
          {error && <p role="alert" className="text-destructive">{error}</p>}
          {!message && !error && ready && <p className="text-muted-foreground">Your backup includes both Books and Comics, whichever view is selected.</p>}
        </div>
        <AlertDialog open={confirm} onOpenChange={(open) => { if (busy !== "restore") setConfirm(open); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Replace your local library?</AlertDialogTitle>
              <AlertDialogDescription>This replaces the books, comics, collections, annotations, profile, and preferences on this device with the selected backup. Download a backup of your current library first if you want to keep it. Papyrbound will reload when finished.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={busy === "restore"}>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" disabled={!!busy} onClick={restore}>
                {busy === "restore" && <LoaderCircleIcon className="animate-spin" />}
                {busy === "restore" ? "Restoring…" : "Replace and restore"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
