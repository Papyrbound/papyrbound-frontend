import { strFromU8, unzipSync } from "fflate";
import type { SampleBook } from "@/features/home/model/sample-books";
import type { LibraryKind } from "./library-kind";

const MAX_FILE_SIZE = 250 * 1024 * 1024;
const MAX_METADATA_SIZE = 2 * 1024 * 1024;
const MAX_COVER_SIZE = 20 * 1024 * 1024;
const imagePattern = /\.(?:jpe?g|png|webp|gif)$/i;

function xmlDocument(bytes: Uint8Array) {
  const doc = new DOMParser().parseFromString(strFromU8(bytes), "application/xml");
  if (doc.getElementsByTagName("parsererror").length) throw new Error("The file contains invalid metadata.");
  return doc;
}

function elements(node: Document | Element, name: string) {
  return Array.from(node.getElementsByTagNameNS("*", name));
}

function text(node: Document | Element, name: string) {
  return elements(node, name)[0]?.textContent?.trim() ?? "";
}

function resolveEntry(base: string, href: string) {
  const path: string[] = [];
  const decoded = decodeURIComponent(href.split(/[?#]/)[0]);
  if (/^[a-z]+:|^[/\\]/i.test(decoded)) throw new Error("The file contains an invalid resource path.");
  for (const part of `${base.slice(0, base.lastIndexOf("/") + 1)}${decoded}`.split("/")) {
    if (part === "..") {
      if (!path.length) throw new Error("The file contains an invalid resource path.");
      path.pop();
    } else if (part && part !== ".") path.push(part);
  }
  return path.join("/");
}

function readEntry(data: Uint8Array, name: string, limit = MAX_METADATA_SIZE) {
  const files = unzipSync(data, {
    filter: (entry) => {
      if (entry.name !== name) return false;
      if (entry.originalSize > limit) throw new Error("A resource in this file is too large to import.");
      return true;
    },
  });
  if (!files[name]) throw new Error(`Missing file resource: ${name}`);
  return files[name];
}

function coverDataUrl(data: Uint8Array, path: string) {
  const bytes = readEntry(data, path, MAX_COVER_SIZE);
  const extension = path.split(".").pop()?.toLowerCase();
  const mime = extension === "jpg" || extension === "jpeg" ? "image/jpeg" : `image/${extension}`;
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 8192) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
  }
  return `data:${mime};base64,${btoa(binary)}`;
}

/** Reads only metadata and the cover; the original archive is stored separately. */
export async function parseLibraryFile(file: File, kind: LibraryKind): Promise<SampleBook> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension !== (kind === "books" ? "epub" : "cbz")) {
    throw new Error(kind === "books" ? "Choose an EPUB file in Books mode." : "Choose a CBZ comic in Comics mode. CBR and CB7 are not supported yet.");
  }
  if (!file.size) throw new Error("This file is empty.");
  if (file.size > MAX_FILE_SIZE) throw new Error("Choose a file smaller than 250 MB.");
  const buffer = await file.arrayBuffer();
  const data = new Uint8Array(buffer);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", buffer));
  const id = `import-${Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
  const book: SampleBook = {
    id, sourceId: id, sourceName: file.name, kind,
    format: kind === "books" ? "EPUB" : "CBZ",
    title: file.name.replace(/\.[^.]+$/, ""), author: "Unknown author",
    genre: kind === "books" ? "Uncategorized" : "Comics",
    pages: 0, progress: 0, addedLabel: "Added today",
    paper: "#d9cae9", ink: "#494059", tone: "var(--content-lilac)", art: "orbit",
  };

  try {
    if (kind === "books") {
      const container = xmlDocument(readEntry(data, "META-INF/container.xml"));
      const root = elements(container, "rootfile")[0]?.getAttribute("full-path");
      if (!root) throw new Error("This EPUB has no package document.");
      const packagePath = resolveEntry("", root);
      const doc = xmlDocument(readEntry(data, packagePath));
      book.title = text(doc, "title") || book.title;
      book.author = elements(doc, "creator").map((node) => node.textContent?.trim()).filter(Boolean).join(", ") || book.author;
      book.genre = text(doc, "subject") || book.genre;
      const description = text(doc, "description");
      if (description) book.synopsis = new DOMParser().parseFromString(description, "text/html").body.textContent?.trim();
      const manifest = elements(doc, "item");
      if (!elements(doc, "spine").length || !manifest.length) throw new Error("This EPUB has no reading content.");
      const coverId = elements(doc, "meta").find((node) => node.getAttribute("name") === "cover")?.getAttribute("content");
      const cover = manifest.find((node) => node.getAttribute("properties")?.split(/\s+/).includes("cover-image"))
        ?? manifest.find((node) => node.getAttribute("id") === coverId);
      const href = cover?.getAttribute("href");
      if (href && imagePattern.test(href)) book.cover = coverDataUrl(data, resolveEntry(packagePath, href));
    } else {
      const entries: string[] = [];
      unzipSync(data, { filter: (entry) => { entries.push(entry.name); return false; } });
      const images = entries.filter((path) => imagePattern.test(path) && !path.startsWith("__MACOSX/") && !path.split("/").some((part) => part.startsWith(".")))
        .sort((a, b) => a.localeCompare(b, "en", { numeric: true, sensitivity: "base" }));
      if (!images.length) throw new Error("This CBZ contains no supported page images.");
      book.pages = images.length;
      let coverPath = images[0];
      const infoPath = entries.find((name) => /(^|\/)ComicInfo\.xml$/i.test(name));
      if (infoPath) {
        const info = xmlDocument(readEntry(data, infoPath));
        book.title = text(info, "Title") || book.title;
        book.author = text(info, "Writer") || text(info, "Penciller") || book.author;
        book.synopsis = text(info, "Summary") || undefined;
        book.genre = text(info, "Genre") || book.genre;
        const coverIndex = elements(info, "Page").find((page) => page.getAttribute("Type") === "FrontCover")?.getAttribute("Image");
        if (coverIndex !== undefined && coverIndex !== null && images[Number(coverIndex)]) coverPath = images[Number(coverIndex)];
      }
      book.cover = coverDataUrl(data, coverPath);
    }
  } catch (error) {
    if (error instanceof Error && !/invalid zip|unexpected EOF|unknown compression/i.test(error.message)) throw error;
    throw new Error("This archive is damaged or uses unsupported compression.");
  }
  return book;
}
