import { strToU8, zipSync } from "fflate";

const pixel = Uint8Array.from(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6nGAAAAAASUVORK5CYII=", "base64"));

/** Original, deliberately small reading fixtures; no third-party book content. */
export function readerEpubFixture() {
  const paragraph = "The paper boat drifted past the old library. Mira followed it along the river, carrying a notebook full of questions and a story she had yet to finish. ";
  const entries = {
    mimetype: strToU8("application/epub+zip"),
    "META-INF/container.xml": strToU8('<container><rootfiles><rootfile full-path="OPS/package.opf"/></rootfiles></container>'),
    "OPS/package.opf": strToU8('<package xmlns:dc="http://purl.org/dc/elements/1.1/"><metadata><dc:title>Reader verification</dc:title><dc:creator>Papyrbound</dc:creator></metadata><manifest><item id="two" href="chapters/two.xhtml" media-type="application/xhtml+xml"/><item id="one" href="chapters/one.xhtml" media-type="application/xhtml+xml"/><item id="nav" properties="nav" href="nav.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="one"/><itemref idref="two"/></spine></package>'),
    "OPS/nav.xhtml": strToU8('<html><body><nav><a href="chapters/one.xhtml">The paper boat</a><a href="chapters/two.xhtml">Home again</a></nav></body></html>'),
    "OPS/chapters/one.xhtml": strToU8(`<html xmlns="http://www.w3.org/1999/xhtml"><head><title>The paper boat</title><link rel="stylesheet" href="../styles/book.css"/></head><body><h1>The paper boat</h1><img src="../images/cover.png" alt="A small local illustration"/><p>${paragraph.repeat(15)}</p><p id="middle">${paragraph.repeat(15)}</p><a href="two.xhtml#ending">Continue to the ending</a><script>window.parent.document.title='UNSAFE';</script><img src="https://example.invalid/tracker.png" onerror="alert('unsafe')"/><iframe src="https://example.invalid"></iframe><form action="https://example.invalid"><input name="hidden"/></form></body></html>`),
    "OPS/chapters/two.xhtml": strToU8(`<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Home again</title></head><body><h1>Home again</h1><p>${paragraph.repeat(8)}</p><p id="ending">At sunset, she opened her notebook and wrote the first sentence.</p><a href="one.xhtml#middle">Return to the river</a></body></html>`),
    "OPS/styles/book.css": strToU8('p{margin-bottom:1.4em}h1{letter-spacing:-.03em;background-image:url("../images/cover.png")}@import "https://example.invalid/remote.css";'),
    "OPS/images/cover.png": pixel,
  };
  return new File([zipSync(entries)], "reader-verification.epub", { type: "application/epub+zip" });
}

export function readerComicFixture() {
  return new File([zipSync({ "pages/10.png": pixel, "pages/2.png": pixel, "pages/1.png": pixel, "__MACOSX/._junk.png": pixel, "notes.txt": strToU8("Not a page") })], "reader-verification.cbz", { type: "application/vnd.comicbook+zip" });
}
