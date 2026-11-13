"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

// The activity preview uses UTC dates; the calendar displays local date-only values.
function calendarDate(date: Date) {
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

type ReadingWeekPickerProps = {
  start: Date;
  end: Date;
  latestDate: Date;
  onPrevious: () => void;
  onNext: () => void;
  onSelect: (date: Date) => void;
};

export function ReadingWeekPicker({
  start,
  end,
  latestDate,
  onPrevious,
  onNext,
  onSelect,
}: ReadingWeekPickerProps) {
  const [open, setOpen] = useState(false);
  const from = calendarDate(start);
  const to = calendarDate(end);
  const latest = calendarDate(latestDate);
  const label = `${start.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" })} – ${end.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}`;

  return (
    <div role="group" aria-label="Reading activity week" className="flex max-w-full items-center gap-1.5">
      <Button variant="secondary" size="icon-sm" aria-label="Previous preview week" onClick={onPrevious}>
        <ChevronLeft />
      </Button>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={<Button variant="secondary" className="min-w-0 px-3 text-xs sm:text-[13px]" />}
          aria-label={`Choose reading week, ${label}`}
        >
          {label}
        </PopoverTrigger>
        <PopoverContent className="w-auto gap-0 p-0" align="center" aria-label="Choose reading week">
          <Calendar
            mode="range"
            autoFocus
            selected={{ from, to }}
            defaultMonth={from}
            weekStartsOn={1}
            captionLayout="dropdown"
            endMonth={latest}
            disabled={{ after: latest }}
            onSelect={(_range, date, modifiers) => {
              if (modifiers.disabled) return;
              onSelect(new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12)));
              setOpen(false);
            }}
          />
          <p className="border-t px-3 py-2 text-xs text-muted-foreground">Choose a day to view its week.</p>
        </PopoverContent>
      </Popover>
      <Button
        variant="secondary"
        size="icon-sm"
        aria-label="Next preview week"
        disabled={end >= latestDate}
        onClick={onNext}
      >
        <ChevronRight />
      </Button>
    </div>
  );
}
