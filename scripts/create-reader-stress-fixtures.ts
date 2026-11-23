import { mkdir, readFile, writeFile } from "node:fs/promises";
import { strToU8, unzipSync, zipSync } from "fflate";
import { readerEpubFixture } from "../src/features/reader/model/reader-fixtures";

async function main() {
const output = "docs/reader-verification/generated";
await mkdir(output, { recursive: true });
const comic = unzipSync(new Uint8Array(await readFile("docs/reader-verification/reader-verification.cbz")));
const originals = Object.entries(comic).filter(([name]) => /\.png$/i.test(name)).map(([, bytes]) => bytes);
const comicEntries = Object.fromEntries(Array.from({ length: 200 }, (_, index) => [`pages/${index + 1}.png`, originals[index % originals.length]]));
comicEntries["ComicInfo.xml"] = strToU8("<ComicInfo><Title>Original 200-page stress comic</Title><Writer>Papyrbound</Writer></ComicInfo>");
const cbz = zipSync(comicEntries);
await writeFile(`${output}/stress-200-pages.cbz`, cbz);

const epub = unzipSync(new Uint8Array(await readerEpubFixture().arrayBuffer()));
const items: string[] = [], spine: string[] = [], links: string[] = [];
for (let index = 1; index <= 100; index++) {
  const name = `chapter-${index}.xhtml`;
  epub[`OPS/${name}`] = strToU8(`<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Milestone ${index}</title></head><body><h1>Milestone ${index}</h1><p>${"A paper boat crossed the river while Mira wrote an original story in her notebook. ".repeat(400)}</p><p id="ending">End of milestone ${index}.</p></body></html>`);
  items.push(`<item id="c${index}" href="${name}" media-type="application/xhtml+xml"/>`);
  spine.push(`<itemref idref="c${index}"/>`); links.push(`<li><a href="${name}">Milestone ${index}</a></li>`);
}
epub["META-INF/container.xml"] = strToU8('<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OPS/book.opf" media-type="application/oebps-package+xml"/></rootfiles></container>');
epub["OPS/book.opf"] = strToU8(`<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">papyrbound-stress-100</dc:identifier><dc:title>Original 100-chapter stress book</dc:title><dc:creator>Papyrbound</dc:creator><dc:language>en</dc:language></metadata><manifest><item id="nav" href="nav.xhtml" properties="nav" media-type="application/xhtml+xml"/>${items.join("")}</manifest><spine>${spine.join("")}</spine></package>`);
epub["OPS/nav.xhtml"] = strToU8(`<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>Contents</title></head><body><nav epub:type="toc"><ol>${links.join("")}</ol></nav></body></html>`);
const book = zipSync(epub);
await writeFile(`${output}/stress-100-chapters.epub`, book);
console.log(`Created original fixtures: EPUB ${book.length} bytes, 100 chapters; CBZ ${cbz.length} bytes, 200 pages (repeated original illustrations).`);
}
void main().catch((error) => { console.error(error); process.exitCode = 1; });
