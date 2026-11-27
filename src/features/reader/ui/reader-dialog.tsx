"use client";

import { useCallback, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, Check, Minus, Plus, Settings2, LoaderCircle, Maximize2, Minimize2 } from "lucide-react";
import type { SampleBook } from "@/features/home/model/sample-books";
import { getImportedFile } from "@/features/library/model/import-storage";
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";
import { useSettingsUI } from "@/features/profile/stores/settings-ui-store";
import { useLocalUIState } from "@/shared/hooks/use-local-ui-state";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/shared/ui/popover";
import { TooltipHint } from "@/shared/ui/tooltip";
import { Progress } from "@/shared/ui/progress";
import { readerChapterHtml } from "../model/reader-document";
import { openReaderArchive, resolveReaderPath, type ReaderArchive } from "../model/reader-archive";
import { activeReadingInterval, readingProgress, type ReadingPosition } from "../model/reading-state";
import { markPassage, selectionLocation } from "../model/text-location";
import { ReaderAnnotations } from "./reader-annotations";
import { ReaderSearch } from "./reader-search";
import { ComicCanvas } from "./comic-canvas";
import { comicPages } from "../model/comic-pages";
import { useAnnotations } from "@/features/annotations/stores/annotations-store";
import { annotationColors, type Annotation } from "@/features/annotations/model/annotation";
import { useWorkspace } from "@/app-shell/workspace-store";

export function ReaderDialog({ book, onClose }: { book: SampleBook; onClose: () => void }) {
  const [archive, setArchive] = useLocalUIState<ReaderArchive | null>(null);
  const [error, setError] = useLocalUIState("");
  const [controlsHidden, setControlsHidden] = useLocalUIState(false);
  const toggleControls = useCallback(() => setControlsHidden((hidden) => !hidden), [setControlsHidden]);
  const kind = book.kind ?? "books";
  const id = book.id;
  const imported = !!book.sourceId;
  useEffect(() => {
    if (!imported) return;
    let active = true;
    let owned: ReaderArchive | undefined;
    void (async () => {
      const file = await getImportedFile(id);
      if (!file) throw new Error("The original file is unavailable on this device. Restore a backup containing this title to read it again.");
      owned = await openReaderArchive(file, kind);
      if (active) setArchive(owned); else owned.destroy();
    })().catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "This file could not be opened."); });
    return () => { active = false; owned?.destroy(); };
  }, [id, imported, kind, setArchive, setError]);
  return <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
    <DialogContent className={`grid gap-0 overflow-hidden p-0 ${controlsHidden ? "grid-rows-1 h-dvh w-dvw rounded-none border-0 sm:max-w-none" : "grid-rows-[auto_minmax(0,1fr)] h-[calc(100dvh-2rem)] w-[calc(100dvw-2rem)] sm:max-w-[1200px]"}`} data-reader-open="true">
      {archive && <TooltipHint content={`${controlsHidden ? "Show" : "Hide"} controls (Ctrl+Shift+F)`}><Button className="absolute top-4 right-14 z-10 bg-secondary" size="icon-sm" variant="ghost" aria-label={controlsHidden ? "Show reading controls" : "Hide reading controls"} aria-pressed={controlsHidden} onClick={toggleControls}>{controlsHidden ? <Minimize2 /> : <Maximize2 />}</Button></TooltipHint>}
      <DialogHeader className={controlsHidden ? "sr-only" : "border-b border-border/60 px-5 py-4 pr-24"}>
        <DialogTitle className="truncate leading-5">{book.title}</DialogTitle>
        <DialogDescription className="truncate text-xs">{book.author} · {kind === "comics" ? "Comic reader" : "Book reader"}</DialogDescription>
      </DialogHeader>
      {!imported ? <div className="flex flex-col items-center justify-center gap-4 p-8 text-center"><h2 className="font-medium">Import a file to start reading</h2><p className="max-w-sm text-sm text-muted-foreground">This sample title has no reading file. Import your own EPUB books or CBZ comics from the library.</p><Button variant="outline" onClick={onClose}>Back to library</Button></div>
        : error ? <div role="alert" className="flex flex-col items-center justify-center gap-4 p-8 text-center"><p className="max-w-md text-sm text-muted-foreground">{error}</p><Button variant="outline" onClick={onClose}>Close reader</Button></div>
          : archive ? <ReaderView book={book} archive={archive} onClose={onClose} controlsHidden={controlsHidden} toggleControls={toggleControls} />
            : <p role="status" className="flex items-center justify-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />Opening your file…</p>}
    </DialogContent>
  </Dialog>;
}

function ReaderView({ book, archive, onClose, controlsHidden, toggleControls }: { book: SampleBook; archive: ReaderArchive; onClose: () => void; controlsHidden: boolean; toggleControls: () => void }) {
  const ui = useSettingsUI();
  const annotations = useAnnotations((state) => state.annotations);
  const [initialLocation] = useLocalUIState(() => useWorkspace.getState().readerLocation);
  const pendingPassage = useRef(initialLocation);
  const [selection, setSelection] = useLocalUIState<{ start: number; end: number; quote: string }>();
  const storageError = useReadingLists((state) => state.storageError);
  const [saved] = useLocalUIState(() => ui.resume ? useReadingLists.getState().reading.positions[book.id] : undefined);
  const [index, setIndex] = useLocalUIState(Math.min(initialLocation?.index ?? saved?.index ?? 0, archive.entries.length - 1));
  const { fontSize, zoom } = ui.reader;
  const setFontSize = (fontSize: number) => ui.patch({ reader: { ...ui.reader, fontSize } });
  const setZoom = (zoom: number) => ui.patch({ reader: { ...ui.reader, zoom } });
  const [source, setSource] = useLocalUIState("");
  const [error, setError] = useLocalUIState("");
  const [ready, setReady] = useLocalUIState(false);
  const [progress, setProgress] = useLocalUIState(saved?.progress ?? 0);
  const [offset, setOffset] = useLocalUIState(initialLocation?.offset ?? saved?.offset ?? 0);
  const frame = useRef<HTMLIFrameElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const restoreOffset = useRef(initialLocation?.offset ?? saved?.offset ?? 0);
  const pendingFragment = useRef("");
  const current = useRef<Omit<ReadingPosition, "updatedAt"> | null>(null);
  const pendingSave = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cleanFrame = useRef<(() => void) | null>(null);
  const lastInteraction = useRef(0);
  const sessionId = useRef<string | null>(null);
  const visited = useRef(new Set<string>());
  const pendingPages = useRef(0);
  const touch = useCallback(() => { lastInteraction.current = Date.now(); }, []);
  const entry = archive.entries[index];
  const spread = archive.kind === "comics" && ui.reader.spread;
  const group = comicPages(index, archive.entries.length, spread);
  const previousIndex = archive.kind === "comics" ? group.previous : index - 1;
  const nextIndex = archive.kind === "comics" ? group.next : index + 1 < archive.entries.length ? index + 1 : -1;
  const persist = useCallback(() => {
    if (pendingSave.current) clearTimeout(pendingSave.current);
    pendingSave.current = null;
    if (current.current) useReadingLists.getState().savePosition(book.id, current.current);
  }, [book.id]);
  const observe = useCallback((position: number, offset: number) => {
    const bounded = Math.max(0, Math.min(1, offset));
    setOffset(bounded);
    restoreOffset.current = bounded;
    const page = `${position}:${Math.floor(bounded * Math.max(0, archive.entries[position].pages - 1))}`;
    if (!visited.current.has(page)) { visited.current.add(page); pendingPages.current += 1; }
    const visiblePages = comicPages(position, archive.entries.length, spread).pages;
    if (archive.kind === "comics") for (const visible of visiblePages) {
      const key = `${visible}:0`;
      if (!visited.current.has(key)) { visited.current.add(key); pendingPages.current++; }
    }
    const nextProgress = readingProgress(archive.entries.map((item) => item.pages), archive.kind === "comics" ? visiblePages.at(-1)! : position, archive.kind === "comics" ? 1 : bounded);
    if (current.current?.progress !== nextProgress) setProgress(nextProgress);
    current.current = { index: position, total: archive.entries.length, offset: bounded, progress: nextProgress };
    if (pendingSave.current) clearTimeout(pendingSave.current);
    pendingSave.current = setTimeout(persist, 500);
  }, [archive, persist, setProgress, setOffset, spread]);
  const navigate = useCallback((position: number, offset = 0, fragment = "") => {
    if (position < 0 || position >= archive.entries.length) return;
    persist(); touch(); setReady(false); setError(""); setSelection(undefined); setOffset(offset); pendingFragment.current = fragment; restoreOffset.current = offset; setIndex(position);
  }, [archive.entries.length, persist, setIndex, setReady, setError, setSelection, setOffset, touch]);
  useEffect(() => () => { cleanFrame.current?.(); persist(); }, [persist]);
  useEffect(() => {
    if (archive.kind === "comics") return;
    setReady(false); setError("");
    try { setSource(readerChapterHtml(archive, index, { page: ui.page, font: ui.font, spacing: ui.spacing, fontSize, measure: ui.reader.measure, margins: ui.reader.margins })); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "This chapter could not be displayed."); }
  }, [archive, index, ui.page, ui.font, ui.spacing, fontSize, ui.reader.measure, ui.reader.margins, annotations, setReady, setSource, setError]);

  // Flush on close, blur, backgrounding, and before the next local day begins.
  useEffect(() => {
    if (!ready) return;
    sessionId.current ??= crypto.randomUUID();
    let previous = Date.now();
    const foreground = () => document.visibilityState === "visible" && document.hasFocus() && !!root.current?.closest('[role="dialog"]')?.contains(document.activeElement);
    let active = foreground();
    const sample = (flush = false) => {
      const now = Date.now();
      const parts = activeReadingInterval(previous, now, lastInteraction.current, active && (flush || foreground()));
      previous = now;
      for (const [partIndex, part] of parts.entries()) {
        const pages = partIndex === parts.length - 1 ? pendingPages.current : 0;
        if (part.seconds >= 0.25) {
          useReadingLists.getState().recordReading(book.id, sessionId.current!, part.date, part.seconds, pages);
          if (pages) pendingPages.current = 0;
        }
      }
    };
    const focusChanged = () => { sample(true); active = foreground(); };
    const leave = () => sample(true);
    const timer = window.setInterval(sample, 5000);
    window.addEventListener("focus", focusChanged); window.addEventListener("blur", focusChanged);
    document.addEventListener("focusin", focusChanged); document.addEventListener("visibilitychange", focusChanged);
    window.addEventListener("pagehide", leave);
    return () => {
      sample(true); window.clearInterval(timer);
      window.removeEventListener("focus", focusChanged); window.removeEventListener("blur", focusChanged);
      document.removeEventListener("focusin", focusChanged); document.removeEventListener("visibilitychange", focusChanged);
      window.removeEventListener("pagehide", leave);
    };
  }, [ready, book.id]);

  const keyboard = useCallback((event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "f") { event.preventDefault(); toggleControls(); return; }
    if (event.key === "Escape") {
      if (event.currentTarget === window) return; // Let shadcn dismiss the topmost parent popover/dialog.
      event.preventDefault(); persist(); onClose(); return;
    }
    if (event.ctrlKey || event.metaKey || event.altKey || (event.target as Element)?.closest?.('input,textarea,select,button,[role="listbox"],[role="combobox"]')) return;
    const forward = archive.kind === "comics" && ui.reader.direction === "rtl" ? "ArrowLeft" : "ArrowRight";
    const pages = comicPages(index, archive.entries.length, spread);
    const next = archive.kind === "comics" ? pages.next : index + 1 < archive.entries.length ? index + 1 : -1;
    const previous = archive.kind === "comics" ? pages.previous : index - 1;
    if (event.key === forward && next >= 0) { event.preventDefault(); navigate(next); }
    if (event.key === (forward === "ArrowRight" ? "ArrowLeft" : "ArrowRight") && previous >= 0) { event.preventDefault(); navigate(previous); }
  }, [archive, index, spread, ui.reader.direction, navigate, onClose, persist, toggleControls]);
  useEffect(() => { window.addEventListener("keydown", keyboard); return () => window.removeEventListener("keydown", keyboard); }, [keyboard]);

  function loadFrame() {
    cleanFrame.current?.();
    const document = frame.current?.contentDocument;
    const window = frame.current?.contentWindow;
    if (!document || !window) { setError("This chapter could not be displayed."); return; }
    if (document.documentElement.getAttribute("data-reader-path") !== entry.path) return;
    for (const item of annotations) {
      const location = item.location;
      if (item.bookId === book.id && location?.path === entry.path && location.start !== undefined && location.end !== undefined) {
        markPassage(document.body, location.start, location.end, annotationColors[item.color], item.id);
      }
    }
    const captureSelection = () => setSelection(selectionLocation(document.body, window.getSelection()));
    const offset = restoreOffset.current;
    const scroll = () => {
      touch();
      const range = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      observe(index, range ? window.scrollY / range : 0);
    };
    const click = (event: MouseEvent) => {
      touch();
      const anchor = (event.target as Element)?.closest?.("a");
      if (!anchor) return;
      event.preventDefault();
      const href = anchor.getAttribute("data-reader-href");
      const target = href && resolveReaderPath(entry.path, href);
      if (!target) return;
      const next = archive.entries.findIndex((item) => item.path === target.path);
      if (next !== index) { if (next >= 0) navigate(next, 0, target.fragment); return; }
      let fragment = target.fragment;
      try { fragment = decodeURIComponent(fragment); } catch { /* Keep the original ID. */ }
      document.getElementById(fragment)?.scrollIntoView();
    };
    window.scrollTo(0, Math.max(0, document.documentElement.scrollHeight - window.innerHeight) * offset);
    const passage = pendingPassage.current;
    if (passage?.path === entry.path) {
      pendingPassage.current = undefined;
      if (passage.start !== undefined && passage.end !== undefined) markPassage(document.body, passage.start, passage.end, "#eee0a6")?.scrollIntoView({ block: "center" });
    }
    if (pendingFragment.current) {
      let fragment = pendingFragment.current;
      pendingFragment.current = "";
      try { fragment = decodeURIComponent(fragment); } catch { /* Keep the original ID. */ }
      document.getElementById(fragment)?.scrollIntoView();
    }
    const range = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    observe(index, range ? window.scrollY / range : 0); touch(); setReady(true);
    window.addEventListener("scroll", scroll, { passive: true });
    document.addEventListener("click", click); document.addEventListener("keydown", keyboard);
    document.addEventListener("mouseup", captureSelection); document.addEventListener("keyup", captureSelection);
    for (const event of ["pointerdown", "pointermove", "wheel", "touchstart"] as const) document.addEventListener(event, touch, { passive: true });
    cleanFrame.current = () => {
      window.removeEventListener("scroll", scroll); document.removeEventListener("click", click); document.removeEventListener("keydown", keyboard);
      document.removeEventListener("mouseup", captureSelection); document.removeEventListener("keyup", captureSelection);
      for (const event of ["pointerdown", "pointermove", "wheel", "touchstart"] as const) document.removeEventListener(event, touch);
    };
  }

  function jump(location: NonNullable<Annotation["location"]>) {
    const target = archive.entries.findIndex((item) => item.path === location.path);
    if (target < 0) return;
    if (target === index) {
      const doc = frame.current?.contentDocument;
      if (doc && location.start !== undefined && location.end !== undefined) markPassage(doc.body, location.start, location.end, "#eee0a6")?.scrollIntoView({ block: "center" });
      else {
        if (doc) frame.current?.contentWindow?.scrollTo(0, (doc.documentElement.scrollHeight - (frame.current?.clientHeight ?? 0)) * (location.offset ?? 0));
        const node = scroller.current;
        if (node) node.scrollTop = (node.scrollHeight - node.clientHeight) * (location.offset ?? 0);
      }
    } else { pendingPassage.current = location; navigate(target, location.offset ?? 0); }
  }
  return <div ref={root} className="flex min-h-0 flex-col" onPointerMove={touch} onPointerDown={touch} onKeyDown={touch}>
    <div className={controlsHidden ? "hidden" : "flex flex-wrap items-center gap-2 border-b border-border/60 px-4 py-2"}>
      <Select items={archive.entries.map((item, i) => ({ label: item.label, value: String(i) }))} value={String(index)} onValueChange={(value) => { if (value !== null && Number(value) !== index) navigate(Number(value)); }}>
        <SelectTrigger aria-label={archive.kind === "comics" ? "Go to page" : "Go to chapter"} className="w-full max-w-[min(55vw,320px)] rounded-lg"><SelectValue /></SelectTrigger>
        <SelectContent alignItemWithTrigger={false}><SelectGroup>{archive.entries.map((item, i) => <SelectItem key={item.path} value={String(i)}>{item.label}</SelectItem>)}</SelectGroup></SelectContent>
      </Select>
      <span className="mr-auto text-xs text-muted-foreground">{index + 1} / {archive.entries.length}</span>
      <ReaderAnnotations bookId={book.id} chapter={entry.label} location={{ index, path: entry.path, offset }} selection={selection} jump={jump} />
      {archive.kind === "books" && <ReaderSearch archive={archive} jump={jump} />}
      {archive.kind === "comics" && <Popover><PopoverTrigger aria-label="Comic reading options" render={<Button size="icon-sm" variant="ghost" />}><Settings2 /></PopoverTrigger><PopoverContent align="end" className="w-64 space-y-3">
        <PopoverTitle>Comic reading options</PopoverTitle>
        <div className="flex gap-2"><Button size="sm" variant={ui.reader.fit === "width" ? "secondary" : "ghost"} aria-pressed={ui.reader.fit === "width"} onClick={() => ui.patch({ reader: { ...ui.reader, fit: "width" } })}>Fit width</Button><Button size="sm" variant={ui.reader.fit === "page" ? "secondary" : "ghost"} aria-pressed={ui.reader.fit === "page"} onClick={() => ui.patch({ reader: { ...ui.reader, fit: "page" } })}>Fit page</Button></div>
        <Button className="w-full" size="sm" variant="outline" aria-pressed={ui.reader.spread} onClick={() => ui.patch({ reader: { ...ui.reader, spread: !ui.reader.spread } })}>Two-page spreads: {ui.reader.spread ? "On" : "Off"}</Button>
        <Button className="w-full" size="sm" variant="outline" aria-pressed={ui.reader.direction === "rtl"} onClick={() => ui.patch({ reader: { ...ui.reader, direction: ui.reader.direction === "ltr" ? "rtl" : "ltr" } })}>Right to left: {ui.reader.direction === "rtl" ? "On" : "Off"}</Button>
      </PopoverContent></Popover>}
      {archive.kind === "comics" ? <div className="flex items-center gap-1"><TooltipHint content="Zoom out"><Button size="icon-sm" variant="ghost" aria-label="Zoom out" disabled={zoom <= 0.5} onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}><Minus /></Button></TooltipHint><span className="w-10 text-center text-xs">{Math.round(zoom * 100)}%</span><TooltipHint content="Zoom in"><Button size="icon-sm" variant="ghost" aria-label="Zoom in" disabled={zoom >= 2} onClick={() => setZoom(Math.min(2, zoom + 0.25))}><Plus /></Button></TooltipHint></div>
        : <Popover><PopoverTrigger aria-label="Reading appearance" render={<Button size="icon-sm" variant="ghost" />}><Settings2 /></PopoverTrigger><PopoverContent align="end" className="w-64 space-y-3">
          <PopoverTitle>Reading appearance</PopoverTitle>
          {[{ label: "Page colour", value: ui.page, options: ["White", "Paper", "Dark"], change: (page: string) => ui.patch({ page }) }, { label: "Reading font", value: ui.font, options: ["Georgia", "Sans serif"], change: (font: string) => ui.patch({ font }) }, { label: "Line spacing", value: ui.spacing, options: ["Compact", "Comfortable", "Spacious"], change: (spacing: string) => ui.patch({ spacing }) }, { label: "Text width", value: ui.reader.measure ?? "Comfortable", options: ["Narrow", "Comfortable", "Wide"], change: (measure: string) => ui.patch({ reader: { ...ui.reader, measure: measure as NonNullable<typeof ui.reader.measure> } }) }, { label: "Margins", value: ui.reader.margins ?? "Comfortable", options: ["Narrow", "Comfortable", "Wide"], change: (margins: string) => ui.patch({ reader: { ...ui.reader, margins: margins as NonNullable<typeof ui.reader.margins> } }) }].map((choice) => <label key={choice.label} className="flex items-center justify-between gap-3 text-xs">{choice.label}<Select items={choice.options.map((option) => ({ label: option, value: option }))} value={choice.value} onValueChange={(value) => { if (value) choice.change(value); }}><SelectTrigger aria-label={choice.label} size="sm" className="w-32 rounded-lg"><SelectValue /></SelectTrigger><SelectContent alignItemWithTrigger={false}><SelectGroup>{choice.options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectGroup></SelectContent></Select></label>)}
          <div className="flex items-center justify-between text-xs"><span>Text size</span><div className="flex items-center gap-2"><Button size="icon-sm" variant="outline" aria-label="Smaller text" disabled={fontSize <= 14} onClick={() => setFontSize(fontSize - 2)}><Minus /></Button><span>{fontSize}px</span><Button size="icon-sm" variant="outline" aria-label="Larger text" disabled={fontSize >= 32} onClick={() => setFontSize(fontSize + 2)}><Plus /></Button></div></div>
        </PopoverContent></Popover>}
    </div>
    {error ? <p role="alert" className="m-auto p-6 text-sm text-destructive">{error}</p> : archive.kind === "books" ? source ? <iframe ref={frame} title={`${book.title} — ${entry.label}`} sandbox="allow-same-origin" srcDoc={source} className="min-h-0 flex-1 border-0" onLoad={loadFrame} /> : <p role="status" className="m-auto text-sm text-muted-foreground">Loading chapter…</p>
      : <ComicCanvas key={group.pages.join(":")} archive={archive} pages={group.pages} preferences={ui.reader} scroller={scroller} offset={offset} onScroll={() => {
        touch(); const node = scroller.current; if (node && ready) observe(index, node.scrollTop / Math.max(1, node.scrollHeight - node.clientHeight));
      }} onReady={() => {
        observe(index, restoreOffset.current); touch(); setReady(true);
      }} onError={() => { setReady(false); setError("This comic page could not be decoded."); }} />}
    <div className={controlsHidden ? "hidden" : "border-t border-border/60 px-4 py-2"}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" aria-label="Previous chapter or page" disabled={previousIndex < 0} onClick={() => navigate(previousIndex)}><ArrowLeft /><span className="hidden sm:inline">Previous</span></Button>
        <span className="text-center text-xs text-muted-foreground">{archive.kind === "comics" ? `Page ${index + 1}` : `Chapter ${index + 1}`} of {archive.entries.length} · {storageError ? "Position kept for this session" : "Position saved automatically"}</span>
        {nextIndex >= 0 ? <Button variant="ghost" size="sm" aria-label="Next chapter or page" onClick={() => navigate(nextIndex)}><span className="hidden sm:inline">Next</span><ArrowRight /></Button>
          : <Button variant="secondary" size="sm" disabled={!ready} onClick={() => {
            if (pendingSave.current) clearTimeout(pendingSave.current);
            current.current = { index, total: archive.entries.length, offset: restoreOffset.current, progress: 100 };
            persist(); onClose();
          }}><Check />Finish</Button>}
      </div>
      <Progress value={progress} aria-label="Reading progress" className="h-1" />
    </div>
  </div>;
}
