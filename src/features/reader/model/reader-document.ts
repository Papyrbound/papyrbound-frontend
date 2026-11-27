import { readerSurface, type ReaderPreferences } from "./reader-preferences";
import createDOMPurify from "dompurify";
import { strFromU8 } from "fflate";
import { resolveReaderPath, type ReaderArchive } from "./reader-archive";

export type ReaderAppearance = { page: string; font: string; spacing: string; fontSize: number; measure?: ReaderPreferences["measure"]; margins?: ReaderPreferences["margins"] };

/** Chapters are isolated in a scriptless frame; only local archive assets are allowed. */
export function readerChapterHtml(archive: ReaderArchive, index: number, appearance: ReaderAppearance) {
  const path = archive.entries[index]?.path;
  if (!path || !archive.files[path]) throw new Error("This chapter could not be opened.");
  const raw = strFromU8(archive.files[path]);
  const source = new DOMParser().parseFromString(raw, "text/html");
  const clean = createDOMPurify(window).sanitize(raw, {
    WHOLE_DOCUMENT: true,
    FORBID_TAGS: ["script", "iframe", "frame", "object", "embed", "form", "input", "button", "textarea", "select", "meta", "base", "link", "audio", "video"],
    FORBID_ATTR: ["srcdoc", "srcset", "action", "formaction", "ping", "autofocus"],
  });
  const doc = new DOMParser().parseFromString(clean, "text/html");
  doc.documentElement.setAttribute("data-reader-path", path);
  const resource = (base: string, href: string) => {
    if (/^data:image\/(?:png|jpeg|gif|webp);base64,/i.test(href)) return href;
    const target = resolveReaderPath(base, href);
    return target ? archive.resource(target.path) : undefined;
  };
  const css = (text: string, base: string) => text
    .replace(/@import\s+[^;]+;?/gi, "")
    .replace(/url\(\s*(['"]?)(.*?)\1\s*\)/gi, (_match, _quote, href: string) => `url("${resource(base, href.trim()) ?? "data:,"}")`)
    .replace(/<\/style/gi, "<\\/style");
  for (const node of doc.querySelectorAll("[src], [href], [xlink\\:href]")) {
    if (node.tagName.toLowerCase() === "a") {
      const href = node.getAttribute("href");
      if (href) node.setAttribute("data-reader-href", href);
      node.setAttribute("href", "#");
    } else for (const attribute of ["src", "href", "xlink:href"]) {
      const href = node.getAttribute(attribute);
      if (!href) continue;
      const url = resource(path, href);
      if (url) node.setAttribute(attribute, url); else node.removeAttribute(attribute);
    }
  }
  for (const node of doc.querySelectorAll("style")) node.textContent = css(node.textContent ?? "", path);
  for (const node of doc.querySelectorAll("[style]")) node.setAttribute("style", css(node.getAttribute("style") ?? "", path));
  for (const link of source.querySelectorAll('link[rel="stylesheet"][href]')) {
    const target = resolveReaderPath(path, link.getAttribute("href") ?? "");
    if (!target || !archive.files[target.path]) continue;
    const style = doc.createElement("style");
    style.textContent = css(strFromU8(archive.files[target.path]), target.path);
    doc.head.append(style);
  }
  const csp = doc.createElement("meta");
  csp.httpEquiv = "Content-Security-Policy";
  csp.content = "default-src 'none'; script-src 'none'; img-src blob: data:; style-src 'unsafe-inline'; font-src blob: data:; connect-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none'";
  doc.head.prepend(csp);
  const viewport = doc.createElement("meta");
  viewport.name = "viewport"; viewport.content = "width=device-width, initial-scale=1";
  doc.head.append(viewport);
  const style = doc.createElement("style");
  const dark = appearance.page === "Dark";
  const surface = readerSurface(appearance.page);
  const serif = appearance.font === "Literata" || appearance.font === "Georgia";
  const width = appearance.measure === "Narrow" ? 560 : appearance.measure === "Wide" ? 840 : 680;
  const margin = appearance.margins === "Narrow" ? 16 : appearance.margins === "Wide" ? 56 : 32;
  // Publisher body classes (and inline !important rules) must not displace the
  // reading column. Keep chapter markup and paragraph styling inside this shell.
  const layout: Record<string, string> = {
    "box-sizing": "border-box", display: "block", position: "static", float: "none",
    transform: "none", translate: "none", rotate: "none", scale: "none", inset: "auto",
    width: "100%", "min-width": "0", "max-width": `${width + margin * 2}px`,
    height: "auto", "min-height": "100vh", "max-height": "none",
    margin: "0 auto", padding: `clamp(32px, 5vh, 56px) min(${margin}px, 6vw) 80px`,
    "column-count": "auto", "column-width": "auto", overflow: "visible",
    "font-family": serif ? "Georgia,serif" : "system-ui,sans-serif",
    "font-size": `${Math.max(14, Math.min(32, appearance.fontSize))}px`,
    "line-height": String(appearance.spacing === "Compact" ? 1.5 : appearance.spacing === "Spacious" ? 2 : 1.75),
    background: "transparent", color: "inherit",
  };
  // Clear conflicting logical properties as well as physical publisher offsets.
  for (const property of Array.from(doc.body.style)) {
    if (/^(margin|padding|inset|inline-size|block-size|min-inline-size|max-inline-size|min-block-size|max-block-size|transform|translate|rotate|scale)/.test(property)) doc.body.style.removeProperty(property);
  }
  for (const [property, value] of Object.entries(layout)) doc.body.style.setProperty(property, value, "important");
  style.textContent = `
    html{color-scheme:${dark ? "dark" : "light"};background:${surface.background}!important;color:${surface.foreground}!important;overflow-wrap:anywhere;scrollbar-gutter:stable both-edges}
    html:root{box-sizing:border-box!important;width:100%!important;min-width:0!important;max-width:none!important;margin:0!important;padding:0!important}
    body{inset:auto!important;transform:none!important;translate:none!important;rotate:none!important;scale:none!important}
    p{color:inherit!important}
    img,svg{max-width:100%;height:auto}
    pre{white-space:pre-wrap}
    a{color:inherit;text-decoration:underline}
    table{max-width:100%}
    *{scrollbar-width:thin;scrollbar-color:${dark ? "#666" : "#aaa"} transparent}
  `;
  doc.head.append(style);
  return `<!doctype html>${doc.documentElement.outerHTML}`;
}
