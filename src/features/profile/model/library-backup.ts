import { strFromU8, strToU8, unzip, zip, type AsyncZippable } from "fflate";
import { annotationColors, validAnnotationLocation, type Annotation } from "@/features/annotations/model/annotation";
import type { Collection } from "@/features/collections/stores/collections-store";
import type { SampleBook } from "@/features/home/model/sample-books";
import { replaceImportedFiles, type StoredImport } from "@/features/library/model/import-storage";
import { isLibrarySnapshot, type LibrarySnapshot } from "@/features/library/model/library-snapshot";
import { isRecord } from "@/shared/lib/device-storage";
import type { useAccount } from "../stores/account-store";
import type { useSettingsUI } from "../stores/settings-ui-store";
import type { useWorkspace } from "@/app-shell/workspace-store";
import { isStoredProfileBanner, isStoredProfilePhoto } from "./profile-banner";
import { validReaderPreferences, type ReaderPreferences } from "@/features/reader/model/reader-preferences";

type Settings = Pick<ReturnType<typeof useSettingsUI.getState>, "page" | "font" | "spacing" | "interfaceSize" | "labels" | "resume"> & { reader?: ReaderPreferences; showDemo?: boolean };
type Workspace = Pick<ReturnType<typeof useWorkspace.getState>, "libraryKind" | "view" | "panelOpen">;
export type BackupData = {
  account: ReturnType<typeof useAccount.getState>;
  library: LibrarySnapshot;
  collections: Collection[];
  annotations: Annotation[];
  settings: Settings;
  workspace: Workspace;
};
type BackupImport = { book: SampleBook; path: string; size: number; type: string; sha256: string };
export type BackupManifest = BackupData & { format: "papyrbound-backup"; version: 1; exportedAt: string; imports: BackupImport[] };
export type PreparedBackup = { manifest: BackupManifest; records: StoredImport[] };
const MAX_BACKUP_BYTES = 1024 * 1024 * 1024;
const MAX_MANIFEST_BYTES = 64 * 1024 * 1024;
const MAX_FILE_BYTES = 250 * 1024 * 1024;
const invalid = () => new Error("This is not a valid Papyrbound backup, or it uses an unsupported version.");
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every((item) => typeof item === "string");
const date = (value: unknown): value is string => typeof value === "string" && Number.isFinite(Date.parse(value));
const optionalStrings = (value: Record<string, unknown>, keys: string[]) => keys.every((key) => value[key] === undefined || typeof value[key] === "string");
const libraryKind = (value: unknown) => value === undefined || value === "books" || value === "comics";
const unique = (values: string[]) => new Set(values).size === values.length;

function validBook(value: unknown): value is SampleBook {
  if (!isRecord(value)) return false;
  const book = { ...value };
  delete book.sourceId;
  return isLibrarySnapshot({ books: [book], lists: [], activity: [], order: [] }) &&
    Boolean(book.id) && Number.isInteger(book.pages) && Number(book.pages) >= 0 && libraryKind(book.kind) &&
    (book.format === undefined || book.format === "EPUB" || book.format === "CBZ") &&
    optionalStrings(value, ["sourceId", "sourceName", "synopsis", "cover", "addedLabel", "addedAt", "lastOpenedLabel", "completedLabel", "lastReadAt"]);
}

function validManifest(value: unknown): value is BackupManifest {
  if (!isRecord(value) || value.format !== "papyrbound-backup" || value.version !== 1 || !date(value.exportedAt)) return false;
  const { account, library, collections, annotations, settings, workspace, imports } = value;
  if (!isRecord(account) || account.version !== 1 || !date(account.createdAt) || Date.parse(account.createdAt) > Date.now()) return false;
  const { profile, preferences } = account;
  if (!isRecord(profile) || typeof profile.name !== "string" || !profile.name.trim() || profile.name.length > 60 ||
    typeof profile.title !== "string" || profile.title.length > 60 || typeof profile.bio !== "string" || profile.bio.length > 60 ||
    typeof profile.avatarSeed !== "string" || !profile.avatarSeed || profile.avatarSeed.length > 100 ||
    (profile.avatarUrl !== undefined && !isStoredProfilePhoto(profile.avatarUrl)) ||
    (profile.banner !== null && !isStoredProfileBanner(profile.banner))) return false;
  if (!isRecord(preferences) || !["system", "light", "dark"].includes(String(preferences.theme)) ||
    typeof preferences.showDots !== "boolean" || typeof preferences.reduceMotion !== "boolean" ||
    !Number.isInteger(preferences.readingGoal) || Number(preferences.readingGoal) < 1 || Number(preferences.readingGoal) > 300) return false;
  if (!isLibrarySnapshot(library) || !library.books.every(validBook) || !unique(library.books.map((book) => book.id)) ||
    !library.lists.every((list) => libraryKind(list.kind) && typeof list.url === "string" &&
      ["heart", "book-open", "completed", "tag"].includes(list.icon) && Number.isFinite(list.sortOrder) &&
      (list.color === undefined || typeof list.color === "string") && (list.isDefault === undefined || typeof list.isDefault === "boolean") &&
      (list.isPinned === undefined || typeof list.isPinned === "boolean")) ||
    !unique(library.lists.map((list) => list.id)) || !library.activity.every((event) => date(event.at) && libraryKind(event.libraryKind))) return false;
  if (!Array.isArray(collections) || !collections.every((item) => isRecord(item) && typeof item.id === "string" &&
    typeof item.name === "string" && typeof item.color === "string" && typeof item.pinned === "boolean" && strings(item.bookIds) &&
    libraryKind(item.kind) && optionalStrings(item, ["createdAt", "lastBookAddedAt"])) || !unique(collections.map((item) => item.id))) return false;
  if (!Array.isArray(annotations) || !annotations.every((item) => isRecord(item) && typeof item.id === "string" &&
    typeof item.bookId === "string" && typeof item.content === "string" && typeof item.note === "string" && validAnnotationLocation(item.location) &&
    (item.kind === "note" || item.kind === "highlight") && typeof item.color === "string" && Object.hasOwn(annotationColors, item.color) &&
    typeof item.starred === "boolean" && date(item.createdAt) && optionalStrings(item, ["chapter", "createdLabel"]) &&
    (item.page === undefined || (Number.isInteger(item.page) && Number(item.page) >= 0))) || !unique(annotations.map((item) => item.id))) return false;
  if (!isRecord(settings) || (settings.showDemo !== undefined && typeof settings.showDemo !== "boolean") || !["White", "Paper", "Dark"].includes(String(settings.page)) ||
    !["Literata", "Georgia", "Sans serif"].includes(String(settings.font)) || (settings.reader !== undefined && !validReaderPreferences(settings.reader)) || !["Compact", "Comfortable", "Spacious"].includes(String(settings.spacing)) ||
    !["Small", "Default", "Large"].includes(String(settings.interfaceSize)) || typeof settings.labels !== "boolean" || typeof settings.resume !== "boolean") return false;
  if (!isRecord(workspace) || !["books", "comics"].includes(String(workspace.libraryKind)) ||
    !["grid", "list"].includes(String(workspace.view)) || typeof workspace.panelOpen !== "boolean") return false;
  if (!Array.isArray(imports) || !imports.every((item, index) => isRecord(item) && validBook(item.book) && item.book.sourceId === item.book.id &&
    item.path === `files/${index}` && Number.isInteger(item.size) && Number(item.size) > 0 && Number(item.size) <= MAX_FILE_BYTES &&
    typeof item.type === "string" && typeof item.sha256 === "string" && /^[a-f0-9]{64}$/.test(item.sha256) &&
    (item.book.kind === "comics" ? item.book.format === "CBZ" : item.book.format === "EPUB"))) return false;
  return unique([...library.books.map((book) => book.id), ...imports.map((item) => item.book.id)]);
}

async function checksum(bytes: Uint8Array) {
  const digest = await crypto.subtle.digest("SHA-256", new Uint8Array(bytes).buffer);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function createBackup(data: BackupData, records: StoredImport[]): Promise<Uint8Array<ArrayBuffer>> {
  const entries: AsyncZippable = {};
  let total = 0;
  const imports: BackupImport[] = [];
  for (const [index, record] of records.entries()) {
    total += record.file.size;
    if (total > MAX_BACKUP_BYTES) throw new Error("This library is too large for a single backup (1 GB maximum).");
    const bytes = new Uint8Array(await record.file.arrayBuffer());
    const path = `files/${index}`;
    entries[path] = [bytes, { level: 0 }];
    imports.push({ book: record.book, path, size: bytes.length, type: record.file.type, sha256: await checksum(bytes) });
  }
  const manifest: BackupManifest = { ...data, format: "papyrbound-backup", version: 1, exportedAt: new Date().toISOString(), imports };
  if (!validManifest(manifest)) throw new Error("Some local data could not be backed up. Reload the app and try again.");
  const metadata = strToU8(JSON.stringify(manifest));
  if (metadata.length > MAX_MANIFEST_BYTES || total + metadata.length > MAX_BACKUP_BYTES) throw new Error("This library is too large for a single backup (1 GB maximum).");
  entries["manifest.json"] = [metadata, { level: 6 }];
  return new Promise((resolve, reject) => zip(entries, (error, bytes) => {
    if (error) reject(new Error("Could not create the backup. Try again."));
    else if (bytes.length > MAX_BACKUP_BYTES) reject(new Error("This library is too large for a single backup (1 GB maximum)."));
    else resolve(bytes);
  }));
}

export async function readBackup(file: Blob): Promise<PreparedBackup> {
  if (!file.size || file.size > MAX_BACKUP_BYTES) throw new Error("Choose a Papyrbound backup smaller than 1 GB.");
  let expanded = 0;
  const files = await new Promise<Record<string, Uint8Array>>((resolve, reject) => {
    void file.arrayBuffer().then((buffer) => {
      unzip(new Uint8Array(buffer), { filter: (entry) => {
        if (entry.name !== "manifest.json" && !/^files\/\d+$/.test(entry.name)) return false;
        expanded += entry.originalSize;
        if (entry.originalSize > (entry.name === "manifest.json" ? MAX_MANIFEST_BYTES : MAX_FILE_BYTES) || expanded > MAX_BACKUP_BYTES) throw invalid();
        return true;
      } }, (error, result) => error ? reject(invalid()) : resolve(result));
    }).catch(reject);
  });
  let manifest: unknown;
  try { manifest = JSON.parse(strFromU8(files["manifest.json"])); } catch { throw invalid(); }
  if (!validManifest(manifest)) throw invalid();
  const records: StoredImport[] = [];
  for (const item of manifest.imports) {
    const bytes = files[item.path];
    if (!bytes || bytes.length !== item.size || await checksum(bytes) !== item.sha256) throw new Error("The backup has a missing or damaged file. Your current library has not been changed.");
    records.push({ id: item.book.id, book: item.book, file: new Blob([new Uint8Array(bytes).buffer], { type: item.type }) });
  }
  return { manifest, records };
}

type DeviceStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
function storageEntries(data: BackupData): [string, string][] {
  const envelope = (value: unknown) => JSON.stringify({ version: 1, data: value });
  // Only restore durable preferences; extra archive fields must never replace store actions.
  const { page, font, spacing, interfaceSize, labels, resume, reader, showDemo } = data.settings;
  const { libraryKind, view, panelOpen } = data.workspace;
  return [
    ["papyrbound-account-v1", JSON.stringify(data.account)],
    ["papyrbound-library-v1", envelope(data.library)],
    ["papyrbound-collections-v1", envelope(data.collections)],
    ["papyrbound-annotations-v1", envelope(data.annotations)],
    ["papyrbound-reading-settings-v1", envelope({ page, font, spacing, interfaceSize, labels, resume, reader, showDemo })],
    ["papyrbound-workspace-v1", envelope({ libraryKind, view, panelOpen })],
  ];
}

/** Call only after review and confirmation; reload after success to hydrate all stores. */
export async function restoreBackup(backup: PreparedBackup, storage: DeviceStorage = window.localStorage) {
  const entries = storageEntries(backup.manifest);
  const previous = entries.map(([key]) => [key, storage.getItem(key)] as const);
  let metadataTouched = false;
  let metadataError = false;
  try {
    await replaceImportedFiles(backup.records, () => {
      metadataTouched = true;
      try { for (const [key, value] of entries) storage.setItem(key, value); }
      catch (error) { metadataError = true; throw error; }
    });
  } catch (error) {
    if (metadataTouched) {
      // Remove new values first so rollback never needs more room than the original data.
      for (const [key] of previous) storage.removeItem(key);
      for (const [key, value] of previous) if (value !== null) storage.setItem(key, value);
    }
    if (metadataError) throw new Error("There is not enough device storage to restore this backup. Your current library has been kept.");
    throw error;
  }
}
