import "fake-indexeddb/auto";
import assert from "node:assert/strict";
import { test } from "node:test";
import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import { sampleBooks } from "@/features/home/model/sample-books";
import { sampleAnnotations } from "@/features/annotations/model/annotation";
import { localProfile } from "./profile";
import { defaultReadingLists } from "@/features/reading-lists/model/reading-list";
import { getImportedFile, loadStoredImports, replaceImportedFiles } from "@/features/library/model/import-storage";
import { createBackup, readBackup, restoreBackup, type BackupData } from "./library-backup";

const data: BackupData = {
  account: { version: 1, createdAt: "2026-01-01T12:00:00Z", profile: { ...localProfile, avatarUrl: "data:image/jpeg;base64,cGhvdG8=", banner: "data:image/jpeg;base64,YmFubmVy" }, preferences: { theme: "dark", reduceMotion: true, showDots: true, readingGoal: 30 } },
  library: { books: sampleBooks.slice(0, 2), lists: defaultReadingLists.map((list) => ({ ...list, bookIds: ["epub", "comic"] })), activity: [], order: ["comic", "quiet", "epub", "wild"] },
  collections: [{ id: "collection", name: "My collection", color: "#abcdef", pinned: true, bookIds: ["epub"] }],
  annotations: [sampleAnnotations[0]],
  settings: { page: "Dark", font: "Literata", spacing: "Spacious", interfaceSize: "Default", labels: true, resume: true },
  workspace: { libraryKind: "comics", view: "list", panelOpen: false },
};
const records = [
  { id: "epub", book: { ...sampleBooks[0], id: "epub", sourceId: "epub", kind: "books" as const, format: "EPUB" as const, sourceName: "book.epub", cover: "data:image/png;base64,Y292ZXI=" }, file: new File([new Uint8Array([0, 1, 255, 42])], "book.epub", { type: "application/epub+zip" }) },
  { id: "comic", book: { ...sampleBooks[1], id: "comic", sourceId: "comic", kind: "comics" as const, format: "CBZ" as const, sourceName: "comic.cbz" }, file: new File(["comic file bytes"], "comic.cbz", { type: "application/vnd.comicbook+zip" }) },
];
const archive = async (value = data) => new Blob([await createBackup(value, records)]);

function storage() {
  const values = new Map<string, string>([["unrelated-key", "leave alone"], ["papyrbound-account-v1", "old account"], ["papyrbound-library-v1", "old library"]]);
  let failAt: string | null = null;
  return {
    values,
    failOnceAt(key: string) { failAt = key; },
    getItem: (key: string) => values.get(key) ?? null,
    setItem(key: string, value: string) { if (key === failAt) { failAt = null; throw new Error("QuotaExceededError"); } values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
}

test("backups round-trip both libraries, binary files, profile images, preferences and order", async () => {
  const prepared = await readBackup(await archive());
  for (const key of Object.keys(data) as (keyof BackupData)[]) assert.deepEqual(prepared.manifest[key], data[key]);
  for (const [index, record] of prepared.records.entries()) {
    assert.deepEqual(new Uint8Array(await record.file.arrayBuffer()), new Uint8Array(await records[index].file.arrayBuffer()));
    assert.equal(record.file.type, records[index].file.type);
    assert.deepEqual(record.book, records[index].book);
  }
});

test("backup validation rejects invalid versions, metadata, missing files and damaged bytes", async () => {
  const original = unzipSync(new Uint8Array(await (await archive()).arrayBuffer()));
  const manifest = JSON.parse(strFromU8(original["manifest.json"]));
  for (const change of [
    { ...manifest, version: 99 },
    { ...manifest, account: { ...manifest.account, createdAt: "invalid" } },
    { ...manifest, settings: { ...manifest.settings, font: "Unknown" } },
    { ...manifest, library: { ...manifest.library, books: [{ ...sampleBooks[0], title: [] }] } },
  ]) {
    const bytes = zipSync({ ...original, "manifest.json": strToU8(JSON.stringify(change)) });
    await assert.rejects(readBackup(new Blob([bytes])), /valid Papyrbound backup/);
  }
  const missing = { ...original }; delete missing["files/0"];
  await assert.rejects(readBackup(new Blob([zipSync(missing)])), /missing or damaged/);
  const damaged = { ...original, "files/0": new Uint8Array([9, 9, 9, 9]) };
  await assert.rejects(readBackup(new Blob([zipSync(damaged)])), /missing or damaged/);
  await assert.rejects(readBackup(new Blob(["not a zip"])), /valid Papyrbound backup/);
});

test("restore replaces files and known app keys while preserving empty data and unrelated storage", async () => {
  const previous = { ...records[0], id: "previous", book: { ...records[0].book, id: "previous", sourceId: "previous" } };
  await replaceImportedFiles([previous], () => {});
  const prepared = await readBackup(await archive({ ...data, collections: [], annotations: [] }));
  const device = storage();
  await restoreBackup(prepared, device);
  assert.equal(await getImportedFile("previous"), undefined);
  assert.deepEqual((await loadStoredImports()).map((record) => record.id).sort(), ["comic", "epub"]);
  assert.equal(JSON.parse(device.getItem("papyrbound-account-v1")!).createdAt, data.account.createdAt);
  assert.deepEqual(JSON.parse(device.getItem("papyrbound-collections-v1")!).data, []);
  assert.deepEqual(JSON.parse(device.getItem("papyrbound-annotations-v1")!).data, []);
  assert.equal(JSON.parse(device.getItem("papyrbound-workspace-v1")!).data.libraryKind, "comics");
  assert.equal(device.getItem("unrelated-key"), "leave alone");
});

test("a restore storage failure rolls back metadata and aborts file replacement", async () => {
  const previous = { ...records[0], id: "previous", book: { ...records[0].book, id: "previous", sourceId: "previous" } };
  await replaceImportedFiles([previous], () => {});
  const prepared = await readBackup(await archive());
  const device = storage();
  const before = new Map(device.values);
  device.failOnceAt("papyrbound-annotations-v1");
  await assert.rejects(restoreBackup(prepared, device), /current library has been kept/);
  assert.deepEqual(device.values, before);
  assert.deepEqual((await loadStoredImports()).map((record) => record.id), ["previous"]);
  assert.deepEqual(new Uint8Array(await (await getImportedFile("previous"))!.arrayBuffer()), new Uint8Array(await records[0].file.arrayBuffer()));
});

test("a synchronous file transaction failure never commits its preceding clear", async () => {
  const previous = { ...records[0], id: "previous", book: { ...records[0].book, id: "previous", sourceId: "previous" } };
  await replaceImportedFiles([previous], () => {});
  const broken = { ...records[0], book: { ...records[0].book, uncloneable: () => {} } };
  await assert.rejects(replaceImportedFiles([broken], () => assert.fail("metadata must not commit")));
  assert.deepEqual((await loadStoredImports()).map((record) => record.id), ["previous"]);
});

test("restore ignores transient fields and action names supplied by an archive", async () => {
  const files = unzipSync(new Uint8Array(await (await archive()).arrayBuffer()));
  const manifest = JSON.parse(strFromU8(files["manifest.json"]));
  manifest.settings.editing = true;
  manifest.settings.patch = "invalid action";
  manifest.workspace.setView = "invalid action";
  manifest.workspace.dialog = "delete";
  files["manifest.json"] = strToU8(JSON.stringify(manifest));
  const prepared = await readBackup(new Blob([zipSync(files)]));
  const device = storage();
  await restoreBackup(prepared, device);
  assert.deepEqual(JSON.parse(device.getItem("papyrbound-reading-settings-v1")!).data, data.settings);
  assert.deepEqual(JSON.parse(device.getItem("papyrbound-workspace-v1")!).data, data.workspace);
});
