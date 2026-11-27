"use client";

import { useEffect, type RefObject } from "react";
import { BookOpen, ChevronDown, LoaderCircle, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Popover, PopoverContent, PopoverTitle, PopoverDescription } from "@/shared/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/ui/collapsible";
import { useLocalUIState } from "@/shared/hooks/use-local-ui-state";
import { lookupDictionary, type DictionaryEntry, type DictionaryResult } from "../model/dictionary";

function Meanings({ entry }: { entry: DictionaryEntry }) {
  const [expanded, setExpanded] = useLocalUIState(false);
  const render = (senses: DictionaryEntry["senses"], start = 1) => <ol start={start} className="list-decimal space-y-3 pl-4 text-sm leading-6">
    {senses.map((sense, i) => <li key={i} className="pl-1">{sense.definition}
      {sense.examples[0] && <p className="mt-1 text-xs leading-5 text-muted-foreground">“{sense.examples[0]}”</p>}
    </li>)}
  </ol>;
  return <section className="space-y-3">
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <h3 className="text-xs font-medium text-muted-foreground">{entry.partOfSpeech}</h3>
      {entry.pronunciations.length > 0 && <span className="text-xs text-muted-foreground">/{entry.pronunciations.join("/ · /")}/</span>}
    </div>
    {render(entry.senses.slice(0, 3))}
    {entry.senses.length > 3 && <Collapsible open={expanded} onOpenChange={setExpanded}>
      <CollapsibleContent>{render(entry.senses.slice(3), 4)}</CollapsibleContent>
      <CollapsibleTrigger render={<Button variant="ghost" size="sm" className="mt-2 text-xs text-muted-foreground" />}>
        {expanded ? "Fewer meanings" : `${entry.senses.length - 3} more meanings`}<ChevronDown className={expanded ? "rotate-180" : ""} />
      </CollapsibleTrigger>
    </Collapsible>}
  </section>;
}

export function ReaderDictionary({ word, point, returnFocus, onClose }: {
  word: string; point: { x: number; y: number }; returnFocus: RefObject<HTMLDivElement | null>; onClose: () => void;
}) {
  const [result, setResult] = useLocalUIState<DictionaryResult>();
  const [error, setError] = useLocalUIState("");
  const [attempt, setAttempt] = useLocalUIState(0);
  useEffect(() => {
    let active = true;
    setResult(undefined); setError("");
    void lookupDictionary(word).then((value) => { if (active) setResult(value); })
      .catch(() => { if (active) setError("The offline dictionary could not be loaded. Try again."); });
    return () => { active = false; };
  }, [word, attempt, setResult, setError]);
  return <Popover open onOpenChange={(open) => { if (!open) onClose(); }}>
    <PopoverContent anchor={{ getBoundingClientRect: () => new DOMRect(point.x, point.y, 0, 0) }} align="start" sideOffset={8}
      finalFocus={returnFocus} className="max-h-[min(32rem,var(--available-height))] w-88 max-w-[calc(100vw-2rem)] gap-4 overflow-y-auto p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><PopoverDescription className="mb-1 flex items-center gap-1.5 text-xs"><BookOpen className="size-3.5" />English dictionary</PopoverDescription>
          <PopoverTitle className="break-words text-xl font-semibold leading-7">{word}</PopoverTitle>
          {result?.entries.length && result.word !== word ? <p className="mt-1 text-xs text-muted-foreground">Showing meanings for {result.word}</p> : null}
        </div>
        <Button size="icon-sm" variant="ghost" aria-label="Close dictionary" onClick={onClose}><X /></Button>
      </div>
      {!result && !error && <p role="status" className="flex items-center gap-2 py-4 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />Looking up word…</p>}
      {error && <div role="alert"><p className="text-sm text-muted-foreground">{error}</p><Button className="mt-3" variant="secondary" size="sm" onClick={() => setAttempt((value) => value + 1)}>Try again</Button></div>}
      {result && <div role="status" className="space-y-5">
        {result.entries.length ? result.entries.map((entry, index) => <Meanings key={`${result.word}:${index}`} entry={entry} />)
          : <p className="py-2 text-sm leading-6 text-muted-foreground">No English definition found for “{word}”. Try selecting the base form of the word.</p>}
      </div>}
      <p className="border-t border-soft-border pt-3 text-xs leading-5 text-muted-foreground">Available offline · Open English WordNet 2025<br />
        <a className="underline underline-offset-2" href="/dictionary/NOTICE.txt" target="_blank" rel="noreferrer">Source and CC BY 4.0 attribution</a>
      </p>
    </PopoverContent>
  </Popover>;
}
