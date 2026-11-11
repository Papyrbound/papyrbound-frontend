import assert from "node:assert/strict";
import { test } from "node:test";
import { DOMParser as XMLParser } from "@xmldom/xmldom";
import { strToU8, zipSync } from "fflate";
import { parseLibraryFile } from "./import-file";
import { belongsToLibrary } from "./library-kind";

Object.defineProperty(globalThis, "DOMParser", { value: class {
  parseFromString(source: string, type: string) {
    const doc = new XMLParser().parseFromString(type === "text/html" ? `<html><body>${source}</body></html>` : source, "application/xml");
    if (type === "text/html") Object.defineProperty(doc, "body", { value: doc.getElementsByTagName("body")[0] });
    return doc;
  }
} });

const image = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]);
function archive(name: string, entries: Record<string, Uint8Array>) {
  return new File([zipSync(entries).buffer as ArrayBuffer], name);
}
function epub(name = "fallback.epub") {
  return archive(name, {
    mimetype: strToU8("application/epub+zip"),
    "META-INF/container.xml": strToU8('<container><rootfiles><rootfile full-path="OPS/package.opf"/></rootfiles></container>'),
    "OPS/package.opf": strToU8('<package xmlns:dc="http://purl.org/dc/elements/1.1/"><metadata><dc:title>A real title</dc:title><dc:creator>Ada Reader</dc:creator><dc:description>A quiet story.</dc:description></metadata><manifest><item id="cover" href="images/cover.png" properties="cover-image"/></manifest><spine><itemref idref="chapter"/></spine></package>'),
    "OPS/images/cover.png": image,
  });
}

test("EPUB imports metadata, cover, kind and a content-based ID", async () => {
  const file = epub();
  const book = await parseLibraryFile(file, "books");
  assert.equal(book.title, "A real title");
  assert.equal(book.author, "Ada Reader");
  assert.equal(book.synopsis, "A quiet story.");
  assert.equal(book.format, "EPUB");
  assert.equal(book.kind, "books");
  assert.match(book.cover!, /^data:image\/png;base64,/);
  assert.equal(book.sourceName, "fallback.epub");
  assert.equal(book.id, (await parseLibraryFile(new File([file], "renamed.epub"), "books")).id);
  assert.equal(belongsToLibrary(book, "comics"), false);
  assert.equal(belongsToLibrary({ ...book, kind: undefined }, "books"), true);
});

test("CBZ counts pages in natural order and reads ComicInfo metadata", async () => {
  const comic = await parseLibraryFile(archive("example.CBZ", {
    "pages/10.png": Uint8Array.from([10]),
    "pages/2.png": Uint8Array.from([2]),
    "pages/1.png": image,
    "__MACOSX/._cover.png": image,
    "ComicInfo.xml": strToU8('<ComicInfo><Title>Moonlight #1</Title><Writer>Sam Artist</Writer><Summary>A comic.</Summary><Pages><Page Image="1" Type="FrontCover"/></Pages></ComicInfo>'),
  }), "comics");
  assert.equal(comic.title, "Moonlight #1");
  assert.equal(comic.author, "Sam Artist");
  assert.equal(comic.pages, 3);
  assert.equal(comic.format, "CBZ");
  assert.equal(comic.cover, "data:image/png;base64,Ag==");
  assert.equal(belongsToLibrary(comic, "comics"), true);
});

test("rejects unsupported formats, wrong modes, damaged archives and missing content", async () => {
  await assert.rejects(parseLibraryFile(epub(), "comics"), /CBZ/);
  await assert.rejects(parseLibraryFile(new File(["RAR"], "comic.cbr"), "comics"), /CBR/);
  await assert.rejects(parseLibraryFile(new File([], "empty.epub"), "books"), /empty/);
  await assert.rejects(parseLibraryFile(new File(["bad archive"], "bad.epub"), "books"));
  await assert.rejects(parseLibraryFile(archive("missing.epub", { "something.txt": image }), "books"), /Missing file resource/);
  await assert.rejects(parseLibraryFile(archive("empty.cbz", { "readme.txt": image }), "comics"), /no supported page images/);
});

test("EPUB 2 cover metadata resolves parent paths and encoded file names", async () => {
  const file = archive("older.epub", {
    "META-INF/container.xml": strToU8('<container><rootfile full-path="OPS/package.opf"/></container>'),
    "OPS/package.opf": strToU8('<package><metadata><meta name="cover" content="cover"/></metadata><manifest><item id="cover" href="../Images/front%20cover.png"/></manifest><spine/></package>'),
    "Images/front cover.png": image,
  });
  const book = await parseLibraryFile(file, "books");
  assert.equal(book.title, "older");
  assert.equal(book.author, "Unknown author");
  assert.match(book.cover!, /^data:image\/png;base64,/);
});
