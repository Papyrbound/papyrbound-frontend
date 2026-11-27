import assert from "node:assert/strict";
import { after, test } from "node:test";
import { JSDOM } from "jsdom";
import { strToU8, zipSync } from "fflate";
import { openReaderArchive, resolveReaderPath } from "./reader-archive";
import { readerChapterHtml } from "./reader-document";
import { readerComicFixture, readerEpubFixture } from "./reader-fixtures";
import { searchBook } from "./book-search";
import { textNodes } from "./text-location";

const browser = new JSDOM("<!doctype html><html><body></body></html>");
const oldWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const oldParser = Object.getOwnPropertyDescriptor(globalThis, "DOMParser");
Object.defineProperty(globalThis, "window", { configurable: true, value: browser.window });
Object.defineProperty(globalThis, "DOMParser", { configurable: true, value: browser.window.DOMParser });
after(() => {
  browser.window.close();
  if (oldWindow) Object.defineProperty(globalThis, "window", oldWindow); else Reflect.deleteProperty(globalThis, "window");
  if (oldParser) Object.defineProperty(globalThis, "DOMParser", oldParser); else Reflect.deleteProperty(globalThis, "DOMParser");
});

test("EPUB reader follows the spine and TOC and resolves local chapter resources", async () => {
  const archive = await openReaderArchive(readerEpubFixture(), "books");
  assert.deepEqual(archive.entries.map((entry) => entry.path), ["OPS/chapters/one.xhtml", "OPS/chapters/two.xhtml"]);
  assert.deepEqual(archive.entries.map((entry) => entry.label), ["The paper boat", "Home again"]);
  assert.ok(archive.totalPages > 2);
  assert.match(archive.resource("OPS/images/cover.png")!, /^blob:/);
  assert.equal(archive.resource("missing.png"), undefined);
  archive.destroy();
});

test("book search finds passages across chapters with exact display offsets and cancellation", async () => {
  const archive = await openReaderArchive(readerEpubFixture(), "books");
  const hits = await searchBook({ ...archive, resource: () => { throw new Error("Search must not decode images"); } }, "paper boat");
  assert.ok(hits.some((hit) => hit.index === 0));
  assert.ok(hits.some((hit) => hit.index === 1));
  for (const hit of hits) {
    const doc = new DOMParser().parseFromString(readerChapterHtml(archive, hit.index, { page: "Dark", font: "Literata", spacing: "Spacious", fontSize: 30 }), "text/html");
    assert.equal(textNodes(doc.body).map((node) => node.data).join("").slice(hit.start, hit.end).toLowerCase(), "paper boat");
  }
  assert.deepEqual(await searchBook(archive, "[not a regex].*"), []);
  const job = new AbortController(); job.abort();
  await assert.rejects(searchBook(archive, "paper boat", job.signal), /abort/i);
  archive.destroy();
});

test("EPUB chapter rendering removes active content and remote loads while preserving local reading content", async () => {
  const archive = await openReaderArchive(readerEpubFixture(), "books");
  const html = readerChapterHtml(archive, 0, { page: "Dark", font: "Sans serif", spacing: "Spacious", fontSize: 24 });
  const doc = new browser.window.DOMParser().parseFromString(html, "text/html");
  assert.equal(doc.querySelectorAll("script,iframe,form,input,object,base").length, 0);
  assert.equal(doc.querySelectorAll("[onerror],[onload],[srcdoc]").length, 0);
  assert.match(doc.querySelector('meta[http-equiv="Content-Security-Policy"]')!.getAttribute("content")!, /script-src 'none'/);
  assert.match(doc.querySelector("img")!.getAttribute("src")!, /^blob:/);
  assert.equal(doc.querySelectorAll('img[src^="https:"]').length, 0);
  assert.equal(doc.querySelector("a")!.getAttribute("data-reader-href"), "two.xhtml#ending");
  assert.equal(doc.querySelector("a")!.getAttribute("href"), "#");
  assert.match(doc.body.textContent!, /The paper boat/);
  assert.equal(doc.body.style.fontSize, "24px");
  assert.doesNotMatch(doc.head.textContent!, /@import/);
  archive.destroy();
});

test("CBZ pages use natural order, ignore auxiliary entries and release object URLs", async () => {
  const archive = await openReaderArchive(readerComicFixture(), "comics");
  assert.deepEqual(archive.entries.map((entry) => entry.path), ["pages/1.png", "pages/2.png", "pages/10.png"]);
  const url = archive.resource(archive.entries[0].path)!;
  assert.ok((await fetch(url)).ok);
  archive.destroy();
  await assert.rejects(fetch(url));
});

test("EPUB layout preferences preserve content and remain responsive", async () => {
  const archive = await openReaderArchive(readerEpubFixture(), "books");
  const appearance = { page: "Paper", font: "Georgia", spacing: "Comfortable", fontSize: 20 };
  const render = (measure: "Narrow" | "Wide", margins: "Narrow" | "Wide") =>
    new DOMParser().parseFromString(readerChapterHtml(archive, 0, { ...appearance, measure, margins }), "text/html");
  const narrow = render("Narrow", "Narrow");
  const wide = render("Wide", "Wide");
  assert.equal(narrow.body.style.maxWidth, "592px");
  assert.equal(wide.body.style.maxWidth, "952px");
  assert.match(wide.body.style.padding, /min\(56px, 6vw\)/);
  assert.equal(narrow.body.textContent, wide.body.textContent);
  archive.destroy();
});

test("publisher body layout cannot override the reader column or user typography", async () => {
  const archive = await openReaderArchive(readerEpubFixture(), "books");
  const path = archive.entries[0].path;
  archive.files[path] = strToU8(`<html><head><style>
    body.publisher { margin:8px!important; padding:0!important; width:1200px!important; font-size:36px!important }
    p { text-indent:1em } em { font-style:italic }
  </style></head><body class="publisher" style="margin-inline:0!important;padding:0!important;width:1200px!important;transform:translateX(20px)!important;font-size:36px!important"><h1>Chapter 2</h1><p>A passage with <em>emphasis</em>.</p></body></html>`);
  const doc = new DOMParser().parseFromString(readerChapterHtml(archive, 0, { page: "Dark", font: "Georgia", spacing: "Comfortable", fontSize: 20 }), "text/html");
  for (const property of ["margin", "padding", "width", "max-width", "font-size", "transform"]) assert.equal(doc.body.style.getPropertyPriority(property), "important");
  assert.equal(doc.body.style.margin, "0px auto");
  assert.equal(doc.body.style.width, "100%");
  assert.equal(doc.body.style.maxWidth, "744px");
  assert.equal(doc.body.style.fontSize, "20px");
  assert.equal(doc.body.style.transform, "none");
  assert.equal(doc.body.style.getPropertyValue("margin-inline"), "");
  assert.equal(doc.querySelector("em")?.textContent, "emphasis");
  assert.match(doc.head.textContent!, /text-indent:1em/);
  archive.destroy();
});

test("large comics retain compressed pages and bound the decoded page cache", async () => {
  const fixture = readerComicFixture();
  const { unzipSync } = await import("fflate");
  const image = Object.values(unzipSync(new Uint8Array(await fixture.arrayBuffer())))[0];
  const pages = Object.fromEntries(Array.from({ length: 200 }, (_, index) => [`pages/${index + 1}.png`, image]));
  const archive = await openReaderArchive(new Blob([new Uint8Array(zipSync(pages)).buffer]), "comics");
  assert.equal(archive.entries.length, 200);
  assert.equal(Object.keys(archive.files).length, 0);
  const first = archive.resource(archive.entries[0].path);
  for (let index = 1; index < 20; index++) assert.ok(archive.resource(archive.entries[index].path));
  assert.notEqual(archive.resource(archive.entries[0].path), first);
  archive.destroy();
});

test("reader rejects invalid archives, missing chapters and paths outside the archive", async () => {
  assert.deepEqual(resolveReaderPath("OPS/chapters/one.xhtml", "../images/my%20cover.png#part"), { path: "OPS/images/my cover.png", fragment: "part" });
  for (const href of ["../../../escape.png", "https://example.com/cover.png", "//remote/cover.png", "javascript:alert(1)", "%2Fetc/passwd", "..\\outside", "%invalid"]) assert.equal(resolveReaderPath("OPS/one.xhtml", href), undefined);
  await assert.rejects(openReaderArchive(new Blob(["invalid"]), "books"), /could not be opened/);
  await assert.rejects(openReaderArchive(new Blob([zipSync({ "file.txt": strToU8("no pages") })]), "comics"), /no supported page images/);
  await assert.rejects(openReaderArchive(new Blob([zipSync({ "META-INF/container.xml": strToU8('<container><rootfile full-path="missing.opf"/></container>') })]), "books"), /missing its package document/);
});
