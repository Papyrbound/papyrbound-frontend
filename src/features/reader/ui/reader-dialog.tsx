"use client";

/* eslint-disable @next/next/no-img-element -- Comic pages are original local blob images, not web assets. */
import { useCallback, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, Check, Minus, Plus, Settings2, LoaderCircle } from "lucide-react";
import type { SampleBook } from "@/features/home/model/sample-books";
import { getImportedFile } from "@/features/library/model/import-storage";
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";
import { useSettingsUI } from "@/features/profile/stores/settings-ui-store";
import { useLocalUIState } from "@/shared/hooks/use-local-ui-state";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { TooltipHint } from "@/shared/ui/tooltip";
import { Progress } from "@/shared/ui/progress";
import { readerChapterHtml } from "../model/reader-document";
import { openReaderArchive, resolveReaderPath, type ReaderArchive } from "../model/reader-archive";
import { activeReadingInterval, readingProgress, type ReadingPosition } from "../model/reading-state";

export function ReaderDialog({ book, onClose }: { book: SampleBook; onClose: () => void }) {
  const [archive, setArchive] = useLocalUIState<ReaderArchive | null>(null);
  const [error, setError] = useLocalUIState("");
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
    <DialogContent className="grid h-[calc(100dvh-2rem)] w-[calc(100dvw-2rem)] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden p-0 sm:max-w-[1200px]" data-reader-open="true">
      <DialogHeader className="border-b border-border px-5 py-4 pr-16">
        <DialogTitle className="truncate leading-5">{book.title}</DialogTitle>
        <DialogDescription className="truncate text-xs">{book.author} · {kind === "comics" ? "Comic reader" : "Book reader"}</DialogDescription>
      </DialogHeader>
      {!imported ? <div className="flex flex-col items-center justify-center gap-4 p-8 text-center"><h2 className="font-medium">Import a file to start reading</h2><p className="max-w-sm text-sm text-muted-foreground">This sample title has no reading file. Import your own EPUB books or CBZ comics from the library.</p><Button variant="outline" onClick={onClose}>Back to library</Button></div>
        : error ? <div role="alert" className="flex flex-col items-center justify-center gap-4 p-8 text-center"><p className="max-w-md text-sm text-muted-foreground">{error}</p><Button variant="outline" onClick={onClose}>Close reader</Button></div>
          : archive ? <ReaderView book={book} archive={archive} onClose={onClose} />
            : <p role="status" className="flex items-center justify-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />Opening your file…</p>}
    </DialogContent>
  </Dialog>;
}

function ReaderView({ book, archive, onClose }: { book: SampleBook; archive: ReaderArchive; onClose: () => void }) {
  const ui = useSettingsUI();
  const storageError = useReadingLists((state) => state.storageError);
  const [saved] = useLocalUIState(() => ui.resume ? useReadingLists.getState().reading.positions[book.id] : undefined);
  const [index, setIndex] = useLocalUIState(Math.min(saved?.index ?? 0, archive.entries.length - 1));
  const [fontSize, setFontSize] = useLocalUIState(20);
  const [zoom, setZoom] = useLocalUIState(1);
  const [source, setSource] = useLocalUIState("");
  const [error, setError] = useLocalUIState("");
  const [ready, setReady] = useLocalUIState(false);
  const [progress, setProgress] = useLocalUIState(saved?.progress ?? 0);
  const frame = useRef<HTMLIFrameElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const restoreOffset = useRef(saved?.offset ?? 0);
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
  const persist = useCallback(() => {
    if (pendingSave.current) clearTimeout(pendingSave.current);
    pendingSave.current = null;
    if (current.current) useReadingLists.getState().savePosition(book.id, current.current);
  }, [book.id]);
  const observe = useCallback((position: number, offset: number) => {
    const bounded = Math.max(0, Math.min(1, offset));
    restoreOffset.current = bounded;
    const page = `${position}:${Math.floor(bounded * Math.max(0, archive.entries[position].pages - 1))}`;
    if (!visited.current.has(page)) { visited.current.add(page); pendingPages.current += 1; }
    const nextProgress = readingProgress(archive.entries.map((item) => item.pages), position, archive.kind === "comics" ? 1 : bounded);
    if (current.current?.progress !== nextProgress) setProgress(nextProgress);
    current.current = { index: position, total: archive.entries.length, offset: bounded, progress: nextProgress };
    if (pendingSave.current) clearTimeout(pendingSave.current);
    pendingSave.current = setTimeout(persist, 500);
  }, [archive, persist, setProgress]);
  const navigate = useCallback((position: number, offset = 0, fragment = "") => {
    if (position < 0 || position >= archive.entries.length) return;
    persist(); touch(); setReady(false); pendingFragment.current = fragment; restoreOffset.current = offset; setIndex(position);
  }, [archive.entries.length, persist, setIndex, setReady, touch]);
  useEffect(() => () => { cleanFrame.current?.(); persist(); }, [persist]);
  useEffect(() => {
    setReady(false); setError("");
    if (archive.kind === "comics") return;
    try { setSource(readerChapterHtml(archive, index, { page: ui.page, font: ui.font, spacing: ui.spacing, fontSize })); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "This chapter could not be displayed."); }
  }, [archive, index, ui.page, ui.font, ui.spacing, fontSize, setReady, setSource, setError]);

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
    if (event.key === "Escape") { event.preventDefault(); persist(); onClose(); return; }
    if (event.ctrlKey || event.metaKey || event.altKey || (event.target as Element)?.closest?.('input,textarea,select,button,[role="listbox"],[role="combobox"]')) return;
    if (event.key === "ArrowRight" && index < archive.entries.length - 1) { event.preventDefault(); navigate(index + 1); }
    if (event.key === "ArrowLeft" && index > 0) { event.preventDefault(); navigate(index - 1); }
  }, [archive.entries.length, index, navigate, onClose, persist]);
  useEffect(() => { window.addEventListener("keydown", keyboard); return () => window.removeEventListener("keydown", keyboard); }, [keyboard]);

  function loadFrame() {
    cleanFrame.current?.();
    const document = frame.current?.contentDocument;
    const window = frame.current?.contentWindow;
    if (!document || !window) { setError("This chapter could not be displayed."); return; }
    if (document.documentElement.getAttribute("data-reader-path") !== entry.path) return;
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
    for (const event of ["pointerdown", "pointermove", "wheel", "touchstart"] as const) document.addEventListener(event, touch, { passive: true });
    cleanFrame.current = () => {
      window.removeEventListener("scroll", scroll); document.removeEventListener("click", click); document.removeEventListener("keydown", keyboard);
      for (const event of ["pointerdown", "pointermove", "wheel", "touchstart"] as const) document.removeEventListener(event, touch);
    };
  }

  return <div ref={root} className="flex min-h-0 flex-col" onPointerMove={touch} onPointerDown={touch} onKeyDown={touch}>
    <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2">
      <Select items={archive.entries.map((item, i) => ({ label: item.label, value: String(i) }))} value={String(index)} onValueChange={(value) => { if (value !== null && Number(value) !== index) navigate(Number(value)); }}>
        <SelectTrigger aria-label={archive.kind === "comics" ? "Go to page" : "Go to chapter"} className="w-full max-w-[min(70vw,420px)] rounded-lg"><SelectValue /></SelectTrigger>
        <SelectContent alignItemWithTrigger={false}><SelectGroup>{archive.entries.map((item, i) => <SelectItem key={item.path} value={String(i)}>{item.label}</SelectItem>)}</SelectGroup></SelectContent>
      </Select>
      <span className="mr-auto text-xs text-muted-foreground">{index + 1} / {archive.entries.length}</span>
      {archive.kind === "comics" ? <div className="flex items-center gap-1"><TooltipHint content="Zoom out"><Button size="icon-sm" variant="ghost" aria-label="Zoom out" disabled={zoom <= 0.5} onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}><Minus /></Button></TooltipHint><span className="w-10 text-center text-xs">{Math.round(zoom * 100)}%</span><TooltipHint content="Zoom in"><Button size="icon-sm" variant="ghost" aria-label="Zoom in" disabled={zoom >= 2} onClick={() => setZoom(Math.min(2, zoom + 0.25))}><Plus /></Button></TooltipHint></div>
        : <Popover><PopoverTrigger aria-label="Reading appearance" render={<Button size="icon-sm" variant="ghost" />}><Settings2 /></PopoverTrigger><PopoverContent align="end" className="w-64 space-y-3">
          <h2 className="text-sm font-medium">Reading appearance</h2>
          {[{ label: "Page colour", value: ui.page, options: ["White", "Paper", "Dark"], change: (page: string) => ui.patch({ page }) }, { label: "Reading font", value: ui.font, options: ["Literata", "Sans serif"], change: (font: string) => ui.patch({ font }) }, { label: "Line spacing", value: ui.spacing, options: ["Compact", "Comfortable", "Spacious"], change: (spacing: string) => ui.patch({ spacing }) }].map((choice) => <label key={choice.label} className="flex items-center justify-between gap-3 text-xs">{choice.label}<Select items={choice.options.map((option) => ({ label: option, value: option }))} value={choice.value} onValueChange={(value) => { if (value) choice.change(value); }}><SelectTrigger aria-label={choice.label} size="sm" className="w-32 rounded-lg"><SelectValue /></SelectTrigger><SelectContent alignItemWithTrigger={false}><SelectGroup>{choice.options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectGroup></SelectContent></Select></label>)}
          <div className="flex items-center justify-between text-xs"><span>Text size</span><div className="flex items-center gap-2"><Button size="icon-sm" variant="outline" aria-label="Smaller text" disabled={fontSize <= 14} onClick={() => setFontSize(fontSize - 2)}><Minus /></Button><span>{fontSize}px</span><Button size="icon-sm" variant="outline" aria-label="Larger text" disabled={fontSize >= 32} onClick={() => setFontSize(fontSize + 2)}><Plus /></Button></div></div>
        </PopoverContent></Popover>}
    </div>
    {error ? <p role="alert" className="m-auto p-6 text-sm text-destructive">{error}</p> : archive.kind === "books" ? source ? <iframe ref={frame} title={`${book.title} — ${entry.label}`} sandbox="allow-same-origin" srcDoc={source} className="min-h-0 flex-1 border-0" onLoad={loadFrame} /> : <p role="status" className="m-auto text-sm text-muted-foreground">Loading chapter…</p>
      : <div ref={scroller} className="min-h-0 flex-1 overflow-auto bg-[#191919]" onScroll={() => {
        touch(); const node = scroller.current; if (node && ready) observe(index, node.scrollTop / Math.max(1, node.scrollHeight - node.clientHeight));
      }}><div className="flex min-h-full min-w-full items-start justify-center py-3"><img key={entry.path} src={archive.resource(entry.path)} alt={`${book.title}, page ${index + 1}`} className="block h-auto shrink-0" style={{ width: `${zoom * 100}%`, maxWidth: `${zoom * 1000}px` }} onLoad={() => {
        const node = scroller.current;
        if (node) node.scrollTop = Math.max(0, node.scrollHeight - node.clientHeight) * restoreOffset.current;
        observe(index, restoreOffset.current); touch(); setReady(true);
      }} onError={() => { setReady(false); setError("This comic page could not be decoded."); }} /></div></div>}
    <div className="border-t border-border px-4 py-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" disabled={index === 0} onClick={() => navigate(index - 1)}><ArrowLeft /><span className="hidden sm:inline">Previous</span></Button>
        <span className="text-center text-xs text-muted-foreground">{archive.kind === "comics" ? `Page ${index + 1}` : `Chapter ${index + 1}`} of {archive.entries.length} · {storageError ? "Position kept for this session" : "Position saved automatically"}</span>
        {index < archive.entries.length - 1 ? <Button variant="ghost" size="sm" onClick={() => navigate(index + 1)}><span className="hidden sm:inline">Next</span><ArrowRight /></Button>
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
