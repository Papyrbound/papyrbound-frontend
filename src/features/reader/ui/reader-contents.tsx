"use client";

import { List, Check } from "lucide-react";
import { useLocalUIState } from "@/shared/hooks/use-local-ui-state";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/shared/ui/popover";
import { TooltipHint } from "@/shared/ui/tooltip";
import type { ReaderEntry } from "../model/reader-archive";

export function ReaderContents({ entries, index, navigate }: { entries: ReaderEntry[]; index: number; navigate: (index: number) => void }) {
  const [open, setOpen] = useLocalUIState(false);
  const [query, setQuery] = useLocalUIState("");
  const items = entries.map((entry, i) => ({ ...entry, index: i })).filter((entry) => entry.label.toLowerCase().includes(query.trim().toLowerCase()));
  return <Popover open={open} onOpenChange={setOpen}>
    <TooltipHint content="Table of contents"><PopoverTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Table of contents" />}><List /></PopoverTrigger></TooltipHint>
    <PopoverContent align="start" className="w-80 max-w-[calc(100vw-2rem)] gap-3 p-3">
      <PopoverTitle>Contents</PopoverTitle>
      <Input aria-label="Find a chapter" placeholder="Find a chapter…" value={query} onChange={(event) => setQuery(event.target.value)} />
      <nav aria-label="Book contents" className="max-h-[min(26rem,50dvh)] space-y-1 overflow-y-auto">
        {items.map((item) => <Button key={item.path} variant="ghost" aria-current={index === item.index ? "page" : undefined}
          className={`h-auto min-h-9 w-full justify-start gap-3 rounded-selection px-3 py-2 text-left ${index === item.index ? "bg-selected" : ""}`}
          onClick={() => { navigate(item.index); setOpen(false); }}>
          <span className="w-5 shrink-0 text-xs tabular-nums text-muted-foreground">{item.index + 1}</span>
          <span className="min-w-0 flex-1 whitespace-normal">{item.label}</span>{index === item.index && <Check className="size-3.5" />}
        </Button>)}
        {!items.length && <p className="p-3 text-sm text-muted-foreground">No matching chapters.</p>}
      </nav>
    </PopoverContent>
  </Popover>;
}
