import { useWorkspace } from "@/app-shell/workspace-store";
import { useAnnotations } from "@/features/annotations/stores/annotations-store";
import { useCollections } from "@/features/collections/stores/collections-store";
import { loadStoredImports } from "@/features/library/model/import-storage";
import { librarySnapshot } from "@/features/library/model/library-snapshot";
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";
import { useAccount } from "../stores/account-store";
import { useSettingsUI } from "../stores/settings-ui-store";
import { createBackup, type BackupData } from "./library-backup";

export async function backUpDevice() {
  const library = useReadingLists.getState();
  if (!library.importsReady) throw new Error("Your library is still loading. Try again in a moment.");
  const { page, font, spacing, interfaceSize, labels, resume, reader, showDemo } = useSettingsUI.getState();
  const { libraryKind, view, panelOpen } = useWorkspace.getState();
  const data: BackupData = {
    account: useAccount.getState(),
    library: librarySnapshot(library),
    collections: useCollections.getState().collections,
    annotations: useAnnotations.getState().annotations,
    settings: { page, font, spacing, interfaceSize, labels, resume, reader, showDemo },
    workspace: { libraryKind, view, panelOpen },
  };
  const stored = new Map((await loadStoredImports()).map((record) => [record.id, record]));
  const records = library.books.filter((book) => book.sourceId).map((book) => {
    const record = stored.get(book.id);
    if (!record) throw new Error(`Could not find the original file for “${book.title}”. The backup has not been created.`);
    return { ...record, book };
  });
  return createBackup(data, records);
}
