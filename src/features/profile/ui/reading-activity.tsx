"use client";

import { create } from "zustand";
import { cn } from "cn";

import { CircleCheck } from "lucide-react";

import { createHeatmapDays } from "../model/activity-data";
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";
import { activityStreak } from "../model/activity-streak";
import { activityBounds, activityDateKey, activityDayMs, clampActivityDate, startOfActivityWeek } from "../model/activity-dates";
import { useAccount, updatePreferences } from "../stores/account-store";
import { ReadingWeekPicker } from "./reading-week-picker";

import { useActiveLibrary } from "@/features/library/model/use-active-library";
import { isDemoBook } from "@/features/library/model/demo-data";

import { BookCover } from "@/features/home/ui/book-cover";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { TooltipHint } from "@/shared/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/shared/ui/dialog";

const useActivityUI = create<{
  day: string;
  week: number;
  editing: boolean;
  patch: (
    value: Partial<{
      day: string;
      week: number;
      editing: boolean;
    }>,
  ) => void;
}>((set) => ({
  day: "",
  week: 0,
  editing: false,
  patch: (value) => set(value),
}));

export function ReadingActivity({ embedded = false }: { embedded?: boolean }) {
  const { books, label, plural, kind } = useActiveLibrary();
  const recorded = useReadingLists((state) => state.reading.sessions);
  const createdAt = useAccount((state) => state.createdAt);
  const goal = useAccount((state) => state.preferences.readingGoal);
  const ui = useActivityUI();
  if (!createdAt) return <p role="status" className="text-sm text-muted-foreground">Loading reading activity…</p>;
  const { earliest, latest } = activityBounds(createdAt);
  const anchorWeekStart = startOfActivityWeek(latest).getTime();
  const firstWeek = Math.round((startOfActivityWeek(earliest).getTime() - anchorWeekStart) / (7 * activityDayMs));
  const week = Math.max(firstWeek, Math.min(0, ui.week));
  const weekStart = new Date(anchorWeekStart + week * 7 * activityDayMs);
  const start = clampActivityDate(weekStart, earliest, latest);
  const end = clampActivityDate(new Date(weekStart.getTime() + 6 * activityDayMs), earliest, latest);
  const day = activityDateKey(clampActivityDate(new Date(`${ui.day || activityDateKey(latest)}T12:00:00Z`), earliest, latest));
  const activeSessions = recorded.filter((session) => session.kind === kind && books.some((book) => book.id === session.bookId));
  const heatmapDays = createHeatmapDays(earliest, latest, activeSessions);
  const firstAvailableDay = Math.max(0, heatmapDays.findIndex((entry) => entry.minutes !== null));
  const availableDays = heatmapDays.slice(Math.floor(firstAvailableDay / 7) * 7);
  const chartDays = embedded ? availableDays.slice(-182) : availableDays;
  const readingDayCount = chartDays.filter((entry) => !!entry.minutes).length;
  const streak = activityStreak(heatmapDays, day);
  const months = chartDays.filter((_, index) => index % 7 === 0).flatMap((entry, index, weeks) => {
    const date = new Date(`${entry.date}T12:00:00Z`);
    if (index && entry.date.slice(0, 7) === weeks[index - 1].date.slice(0, 7)) return [];
    return [{ date: entry.date, column: index + 1, label: date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }) }];
  });
  function selectDay(date: Date) {
    const bounded = clampActivityDate(date, earliest, latest);
    ui.patch({ week: Math.round((startOfActivityWeek(bounded).getTime() - anchorWeekStart) / (7 * activityDayMs)), day: activityDateKey(bounded) });
  }
  function changeWeek(next: number) {
    selectDay(new Date(anchorWeekStart + Math.max(firstWeek, Math.min(0, next)) * 7 * activityDayMs));
  }
  const sessions = activeSessions.filter(
    (session) =>
      books.some((book) => book.id === session.bookId) && session.date >= start.toISOString().slice(0, 10) &&
      session.date <= end.toISOString().slice(0, 10),
  ).map((session) => ({ ...session, minutes: Math.floor(session.seconds / 60) }));
  const selected = heatmapDays.find((d) => d.date === day);
  const total = Math.floor(sessions.reduce((sum, s) => sum + s.seconds, 0) / 60);
  const finished = books.filter((b) => !isDemoBook(b) && b.progress >= 100);
  return (
    <div>
      <header className="flex flex-wrap items-start justify-between gap-4">
        {!embedded && <div>
          <h1 className="text-ui-title">
            Reading activity
          </h1>
          <p className="mt-3 text-[13px] leading-6 text-muted-foreground">
            A little reading, a little more often.
          </p>
        </div>}
        <ReadingWeekPicker
          start={start}
          end={end}
          earliestDate={earliest}
          latestDate={latest}
          onPrevious={() => changeWeek(week - 1)}
          onNext={() => changeWeek(week + 1)}
          onSelect={selectDay}
        />
      </header>
      <div className={cn("mb-8 grid grid-cols-2 gap-6", embedded ? "mt-6" : "mt-8 lg:grid-cols-4")}>
        {[
          [total === 0 && sessions.some((session) => session.seconds > 0) ? "<1 min" : `${Math.floor(total / 60)}h ${total % 60}m`, "Time read this week"],
          [
            String(sessions.reduce((n, s) => n + s.pages, 0)),
            "Pages read this week",
          ],
          [`${streak.current} ${streak.current === 1 ? "day" : "days"}`, "Reading streak"],
          [String(finished.length), `${label} finished in your library`],
        ].map(([n, l]) => (
          <div key={l} className="min-w-0">
            <p className="text-2xl font-medium leading-9">{n}</p>
            <p className="mt-1 text-[13px] leading-6 text-muted-foreground">
              {l}
            </p>
          </div>
        ))}
      </div>
      <div className={cn("grid min-w-0 gap-7", !embedded && "xl:grid-cols-[minmax(0,1.88fr)_minmax(280px,1fr)]")}>
        <section className={cn("min-w-0", embedded ? "border-b border-border/60 pb-6" : "rounded-section bg-card p-6")}>
          <h2 className="text-base font-semibold leading-[26px]">
            Reading consistency
          </h2>
          <p className="mt-1 text-xs leading-[18px] text-muted-foreground">
            Daily minutes read · since {chartDays.find((entry) => entry.minutes !== null)?.date ?? activityDateKey(earliest)}
          </p>
          <div className="mt-4 overflow-x-auto">
            <div className="w-max min-w-full">
              <div style={{ gridTemplateColumns: `repeat(${chartDays.length / 7}, 12px)` }} className="mb-2 grid h-5 gap-1 pl-8 text-[10px] text-muted-foreground">
                {months.map((month) => (
                  <span key={month.date} className="w-8 whitespace-nowrap" style={{ gridColumn: month.column }}>{month.label}</span>
                ))}
              </div>
              <div className="flex gap-2">
                <div className="flex w-6 shrink-0 flex-col justify-around text-[10px] text-muted-foreground">
                  <span>Mon</span>
                  <span>Wed</span>
                  <span>Fri</span>
                </div>
                <div className="grid grid-flow-col grid-rows-[repeat(7,12px)] auto-cols-[12px] gap-1">
                  {chartDays.map((d) => (
                    <TooltipHint key={d.date} content={`${d.date}: ${d.minutes ?? 0} minutes read`}><button
                      className={`aspect-square rounded-[3px] outline-none focus-visible:ring-2 focus-visible:ring-ring ${day === d.date ? "ring-1 ring-foreground ring-offset-1 ring-offset-card" : ""} ${d.minutes === null ? "invisible" : d.minutes === 0 ? "bg-border" : d.minutes < 20 ? "bg-neutral-300 dark:bg-neutral-600" : d.minutes < 35 ? "bg-neutral-400" : d.minutes < 50 ? "bg-neutral-500" : "bg-neutral-700 dark:bg-neutral-200"}`}
                      aria-label={`${d.date}: ${d.minutes ?? 0} minutes read`}
                      aria-pressed={day === d.date}
                      disabled={d.minutes === null}
                      onClick={() => selectDay(new Date(`${d.date}T12:00:00Z`))}
                    /></TooltipHint>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs leading-[18px]">
            <span>
              {readingDayCount} reading {readingDayCount === 1 ? "day" : "days"}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              Less
              {[
                "bg-border",
                "bg-neutral-300",
                "bg-neutral-400",
                "bg-neutral-500",
                "bg-neutral-700",
              ].map((c) => (
                <span key={c} className={`size-3 rounded-sm ${c}`} />
              ))}
              More
            </span>
          </div>
          <p
            className="mt-4 border-t border-border pt-4 text-xs leading-[18px]"
            aria-live="polite"
          >
            {day} · {selected?.minutes ?? 0} minutes read
          </p>
        </section>
        <section className={cn("relative pb-12", embedded ? "border-b border-border/60" : "rounded-section bg-card p-6 pb-12")}>
          <h2 className="flex items-center justify-between text-base font-semibold leading-[26px]">
            Daily reading goal
            <CircleCheck className="size-4 text-muted-foreground" />
          </h2>
          <p className="mt-6 text-3xl font-medium leading-10">
            {selected?.minutes ?? 0}{" "}
            <span className="ml-2 text-base font-normal text-muted-foreground">
              / {goal} min
            </span>
          </p>
          <p className="mt-1 text-xs leading-[18px]">
            {(selected?.minutes ?? 0) >= goal
              ? "Daily goal reached"
              : "Keep reading to reach your goal"}
          </p>
          <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${Math.min(100, ((selected?.minutes ?? 0) / goal) * 100)}%`,
              }}
            />
          </div>
          <div className="mt-7 flex justify-between">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => {
              const date = new Date(weekStart.getTime() + i * activityDayMs);
              const minutes = heatmapDays.find((entry) => entry.date === activityDateKey(date))?.minutes;
              const reached = (minutes ?? 0) >= goal;
              const available = date >= earliest && date <= latest;
              return (
              <span
                key={i}
                aria-label={`${activityDateKey(date)}: ${available ? `${minutes ?? 0} minutes read` : "Unavailable"}`}
                className={cn("flex size-7 items-center justify-center rounded-full text-xs sm:size-10", reached ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground", !available && "opacity-30")}
              >
                {d}
              </span>
              );
            })}
          </div>
          <p className="mt-6 text-xs leading-[18px] text-muted-foreground">
            {streak.current}-day streak · Personal best: {streak.best} {streak.best === 1 ? "day" : "days"}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="absolute bottom-2 right-4 text-xs text-muted-foreground"
            onClick={() => ui.patch({ editing: true })}
          >
            Edit goal
          </Button>
        </section>
      </div>
      <div className={cn("mt-9 grid min-w-0 gap-7", !embedded && "xl:grid-cols-[minmax(0,1.88fr)_minmax(280px,1fr)]")}>
        <section>
          <h2 className="mb-5 text-ui-section">
            Recent sessions
          </h2>
          <div className="divide-y divide-border">
            {sessions.map((s) => {
              const book = books.find((b) => b.id === s.bookId);
              if (!book) return null;
              return (
                <div key={s.id} className="flex items-center gap-4 py-2">
                  <span className="w-7 shrink-0 [&_.book-cover]:rounded-sm [&_.cover-type]:hidden [&_.cover-credit]:hidden">
                    <BookCover book={book} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-medium">
                      {book.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {s.date}
                    </p>
                  </div>
                  <span className="text-sm">{s.minutes || "<1"} min</span>
                  <span className="text-xs text-muted-foreground">
                    {s.pages} {s.pages === 1 ? "page" : "pages"}
                  </span>
                </div>
              );
            })}
          </div>
          {!sessions.length && <p className="text-sm text-muted-foreground">No reading sessions this week. Open an imported book or comic to start.</p>}
        </section>
        <section>
          <h2 className="mb-5 text-ui-section">
            Recently finished
          </h2>
          {finished.length ? (
            <div className="grid grid-cols-2 gap-4">
              {finished.slice(0, 2).map((b) => (
                <div key={b.id} className="min-w-0">
                  <div className="w-[72px] [&_.book-cover]:rounded-md">
                    <BookCover book={b} />
                  </div>
                  <h3 className="mt-5 text-sm font-medium leading-[22px]">
                    {b.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {b.author}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Completed {plural} will appear here.
            </p>
          )}
        </section>
      </div>
      <p className="mt-8 text-xs text-muted-foreground">
        Time is recorded while the reader is active and pauses after two minutes without interaction. EPUB page counts are estimates.
      </p>
      <Dialog
        open={ui.editing}
        onOpenChange={(editing) => ui.patch({ editing })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Daily reading goal</DialogTitle>
            <DialogDescription>
              Choose how many minutes you want to read each day.
            </DialogDescription>
          </DialogHeader>
          <form
            id="goal-form"
            onSubmit={(event) => {
              event.preventDefault();
              const value = Number(
                new FormData(event.currentTarget).get("goal"),
              );
              if (Number.isInteger(value) && value >= 1 && value <= 300) {
                updatePreferences({ readingGoal: value });
                ui.patch({ editing: false });
              }
            }}
          >
            <label className="space-y-2 text-sm">
              Minutes per day
              <Input
                name="goal"
                type="number"
                min={1}
                max={300}
                defaultValue={goal}
                required
              />
            </label>
          </form>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" form="goal-form">
              Save goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
