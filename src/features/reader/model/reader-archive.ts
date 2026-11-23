import { strFromU8, unzip, unzipSync } from "fflate";

export type ReaderEntry = { path: string; label: string; pages: number };
export type ReaderArchive = {
  kind: "books" | "comics";
  entries: ReaderEntry[];
  files: Record<string, Uint8Array>;
  totalPages: number;
  resource: (path: string) => string | undefined;
  destroy: () => void;
};
const image = /\.(?:jpe?g|png|gif|webp)$/i;
const media: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif", webp: "image/webp", svg: "image/svg+xml", woff: "font/woff", woff2: "font/woff2", ttf: "font/ttf", otf: "font/otf" };

export function resolveReaderPath(base: string, href: string): { path: string; fragment: string } | undefined {
  if (!href || /^[a-z][a-z\d+.-]*:|^[/\\]/i.test(href)) return;
  const [relative, fragment = ""] = href.split("#", 2);
  let decoded: string;
  try { decoded = decodeURIComponent(relative.split("?")[0]); } catch { return; }
  if (decoded.startsWith("/") || decoded.includes("\\")) return;
  const parts = base.split("/");
  parts.pop();
  if (!relative) return { path: base, fragment };
  for (const part of decoded.split("/")) {
    if (part === "..") { if (!parts.length) return; parts.pop(); }
    else if (part && part !== ".") parts.push(part);
  }
  return { path: parts.join("/"), fragment };
}

export function readerXml(bytes: Uint8Array | undefined) {
  if (!bytes) throw new Error("This EPUB is missing a required document.");
  const document = new DOMParser().parseFromString(strFromU8(bytes), "application/xml");
  if (document.getElementsByTagName("parsererror").length) throw new Error("This EPUB contains invalid chapter metadata.");
  return document;
}
export const xmlElements = (node: Document | Element, name: string) => Array.from(node.getElementsByTagNameNS("*", name));

export async function openReaderArchive(file: Blob, kind: "books" | "comics"): Promise<ReaderArchive> {
  if (file.size > 250 * 1024 * 1024) throw new Error("Choose a file smaller than 250 MB.");
  const compressed = new Uint8Array(await file.arrayBuffer());
  const assets = new Set<string>();
  let expanded = 0;
  const files = await new Promise<Record<string, Uint8Array>>((resolve, reject) => {
    try { unzip(compressed, { filter: (entry) => {
      if (entry.name.endsWith("/") || entry.name.startsWith("__MACOSX/") || entry.name.split("/").some((part) => part.startsWith("."))) return false;
      if (kind === "comics" && !image.test(entry.name)) return false;
      // Keep archive images compressed until a visible page requests one.
      if (media[entry.name.split(".").pop()?.toLowerCase() ?? ""]) {
        if (entry.originalSize > 64 * 1024 * 1024) throw new Error("An image in this archive is too large to display.");
        assets.add(entry.name);
        if (assets.size > 20000) throw new Error("This archive contains too many resources.");
        return false;
      }
      expanded += entry.originalSize;
      if (entry.originalSize > 64 * 1024 * 1024 || expanded > 512 * 1024 * 1024) throw new Error("This archive is too large to open in the reader.");
      return true;
    } }, (error, result) => error ? reject(new Error("This file could not be opened. It may be damaged or encrypted.")) : resolve(result)); } catch (error) { reject(error); }
  });
  const entries: ReaderEntry[] = [];
  if (kind === "comics") {
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
    [...assets].filter((path) => image.test(path)).sort(collator.compare).forEach((path, index) => entries.push({ path, label: `Page ${index + 1}`, pages: 1 }));
  } else {
    const container = readerXml(files["META-INF/container.xml"]);
    const packagePath = xmlElements(container, "rootfile")[0]?.getAttribute("full-path");
    if (!packagePath || !files[packagePath]) throw new Error("This EPUB is missing its package document.");
    const packageDoc = readerXml(files[packagePath]);
    const manifest = new Map(xmlElements(packageDoc, "item").map((item) => [item.getAttribute("id"), item]));
    const labels = new Map<string, string>();
    const nav = [...manifest.values()].find((item) => item.getAttribute("properties")?.split(/\s+/).includes("nav"));
    const ncx = [...manifest.values()].find((item) => item.getAttribute("media-type") === "application/x-dtbncx+xml");
    for (const item of [nav, ncx]) {
      const path = item && resolveReaderPath(packagePath, item.getAttribute("href") ?? "")?.path;
      if (!path || !files[path]) continue;
      const document = readerXml(files[path]);
      for (const anchor of xmlElements(document, nav === item ? "a" : "navPoint")) {
        const href = nav === item ? anchor.getAttribute("href") : xmlElements(anchor, "content")[0]?.getAttribute("src");
        const target = href && resolveReaderPath(path, href);
        const text = nav === item ? anchor.textContent : xmlElements(anchor, "navLabel")[0]?.textContent;
        if (target && text?.trim() && !labels.has(target.path)) labels.set(target.path, text.trim());
      }
    }
    const encrypted = files["META-INF/encryption.xml"] ? readerXml(files["META-INF/encryption.xml"]) : null;
    const encryptedPaths = new Set(encrypted ? xmlElements(encrypted, "CipherReference").map((item) => item.getAttribute("URI")) : []);
    for (const ref of xmlElements(packageDoc, "itemref")) {
      if (ref.getAttribute("linear") === "no") continue;
      const item = manifest.get(ref.getAttribute("idref"));
      const path = item && resolveReaderPath(packagePath, item.getAttribute("href") ?? "")?.path;
      if (!path || !files[path]) throw new Error("This EPUB is missing a chapter from its reading order.");
      if (encryptedPaths.has(path)) throw new Error("This EPUB is DRM protected. Import a DRM-free EPUB to read it here.");
      const document = readerXml(files[path]);
      const body = xmlElements(document, "body")[0];
      const title = labels.get(path) ?? xmlElements(document, "h1")[0]?.textContent?.trim() ?? xmlElements(document, "title")[0]?.textContent?.trim();
      entries.push({ path, label: title || `Chapter ${entries.length + 1}`, pages: Math.max(1, Math.ceil((body?.textContent?.length ?? 0) / 1600)) });
    }
  }
  if (!entries.length) throw new Error(kind === "comics" ? "This comic contains no supported page images." : "This EPUB has no readable chapters.");
  const urls = new Map<string, string>();
  return {
    kind, entries, files, totalPages: entries.reduce((sum, entry) => sum + entry.pages, 0),
    resource: (path) => {
      const mime = media[path.split(".").pop()?.toLowerCase() ?? ""];
      if (!assets.has(path) || !mime) return;
      if (!urls.has(path)) {
        let bytes: Uint8Array | undefined;
        try { bytes = unzipSync(compressed, { filter: (entry) => entry.name === path })[path]; }
        catch { return "data:,"; } // Let the reader image error state handle damaged page data.
        if (!bytes) return;
        urls.set(path, URL.createObjectURL(new Blob([new Uint8Array(bytes).buffer], { type: mime })));
        // A comic only needs its visible spread and a few recently visited pages.
        if (kind === "comics" && urls.size > 6) {
          const oldest = urls.keys().next().value!;
          URL.revokeObjectURL(urls.get(oldest)!); urls.delete(oldest);
        }
      } else if (kind === "comics") { const value = urls.get(path)!; urls.delete(path); urls.set(path, value); }
      return urls.get(path);
    },
    destroy: () => { for (const url of urls.values()) URL.revokeObjectURL(url); urls.clear(); },
  };
}
