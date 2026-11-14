"use client";

import { create } from "zustand";
import { cn } from "cn";

import { CircleCheck } from "lucide-react";

import { activityPreview, createHeatmapDays } from "../model/activity-preview";
import { activityStreak } from "../model/activity-streak";
import { activityBounds, activityDateKey, activityDayMs, clampActivityDate, startOfActivityWeek } from "../model/activity-dates";
import { useAccount, updatePreferences } from "../stores/account-store";
import { ReadingWeekPicker } from "./reading-week-picker";

import { useActiveLibrary } from "@/features/library/model/use-active-library";

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
  day: activityPreview.end,
  week: 0,
  editing: false,
  patch: (value) => set(value),
}));

export function ReadingActivity({ embedded = false }: { embedded?: boolean }) {
  const { books, label, plural } = useActiveLibrary();
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
  const day = activityDateKey(clampActivityDate(new Date(`${ui.day}T12:00:00Z`), earliest, latest));
  const heatmapDays = createHeatmapDays(earliest, latest);
  const streak = activityStreak(heatmapDays, day);
  const months = heatmapDays.filter((_, index) => index % 7 === 0).flatMap((entry, index, weeks) => {
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
  const sessions = activityPreview.sessions.filter(
    (session) =>
      books.some((book) => book.id === session.bookId) && session.date >= start.toISOString().slice(0, 10) &&
      session.date <= end.toISOString().slice(0, 10),
  );
  const selected = heatmapDays.find((d) => d.date === day);
  const total = sessions.reduce((sum, s) => sum + s.minutes, 0);
  const finished = books.filter((b) => b.progress >= 100);
  return (
    <div>
      <header className="flex flex-wrap items-start justify-between gap-4">
        {!embedded && <div>
          <h1 className="text-3xl font-semibold leading-[42px]">
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
      <div className={cn("mb-8 grid grid-cols-2 gap-6", embedded ? "mt-6" : "mt-11 lg:grid-cols-4")}>
        {[
          [`${Math.floor(total / 60)}h ${total % 60}m`, "Time read this week"],
          [
            String(sessions.reduce((n, s) => n + s.pages, 0)),
            "Pages read this week",
          ],
          [`${streak.current} ${streak.current === 1 ? "day" : "days"}`, "Preview reading streak"],
          [String(finished.length), `${label} finished in your library`],
        ].map(([n, l]) => (
          <div key={l} className="min-w-0 border-r border-border pr-4 last:border-0">
            <p className={cn("font-medium", embedded ? "text-2xl leading-9" : "text-4xl leading-[49px]")}>{n}</p>
            <p className="mt-1 text-[13px] leading-6 text-muted-foreground">
              {l}
            </p>
          </div>
        ))}
      </div>
      <div className={cn("grid min-w-0 gap-7", !embedded && "xl:grid-cols-[minmax(0,1.88fr)_minmax(280px,1fr)]")}>
        <section className={cn("min-w-0 rounded-section bg-card", embedded ? "border border-border p-4" : "p-6")}>
          <h2 className="text-base font-semibold leading-[26px]">
            Reading consistency
          </h2>
          <p className="mt-1 text-xs leading-[18px] text-muted-foreground">
            Last 12 months
          </p>
          <div className="mt-[18px] overflow-x-auto">
            <div className={embedded ? "min-w-[580px]" : "min-w-[920px] pl-4 pr-9"}>
              <div className={cn("mb-2.5 grid h-[18px] grid-cols-[repeat(53,minmax(0,1fr))] text-[10px] text-muted-foreground", embedded ? "ml-8 gap-0.5" : "ml-14 gap-1")}>
                {months.map((month) => (
                  <span key={month.date} style={{ gridColumn: month.column }}>{month.label}</span>
                ))}
              </div>
              <div className={cn("flex", embedded ? "gap-2" : "gap-8")}>
                <div className="flex w-6 shrink-0 flex-col justify-around text-[10px] text-muted-foreground">
                  <span>Mon</span>
                  <span>Wed</span>
                  <span>Fri</span>
                </div>
                <div className={cn("grid grid-flow-col", embedded ? "flex-1 grid-rows-[repeat(7,8px)] auto-cols-fr gap-0.5" : "grid-rows-[repeat(7,12px)] auto-cols-[12px] gap-1")}>
                  {heatmapDays.map((d) => (
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
          <div className="mt-[26px] flex flex-wrap items-center justify-between gap-3 text-xs leading-[18px]">
            <span>
              {heatmapDays.filter((d) => !!d.minutes).length} reading days
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
            className="mt-[18px] border-t border-border pt-4 text-xs leading-[18px]"
            aria-live="polite"
          >
            {day} · {selected?.minutes ?? 0} minutes read
          </p>
        </section>
        <section className={cn("relative rounded-section bg-card p-6 pb-12", embedded && "border border-border")}>
          <h2 className="flex items-center justify-between text-base font-semibold leading-[26px]">
            Daily reading goal
            <CircleCheck className="size-4 text-muted-foreground" />
          </h2>
          <p className="mt-[26px] text-[44px] font-medium leading-[60px]">
            {selected?.minutes ?? 0}{" "}
            <span className="ml-14 text-lg font-normal text-muted-foreground">
              / {goal} min
            </span>
          </p>
          <p className="mt-1 text-xs leading-[18px]">
            {(selected?.minutes ?? 0) >= goal
              ? "Goal reached on this preview day"
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
          <p className="mt-[26px] text-xs leading-[18px] text-muted-foreground">
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
          <h2 className="mb-5 text-xl font-semibold leading-7">
            Recent sessions
          </h2>
          <div className="divide-y divide-border">
            {sessions.map((s) => {
              const book = books.find((b) => b.id === s.bookId);
              if (!book) return null;
              return (
                <div key={s.date} className="flex items-center gap-4 py-2">
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
                  <span className="text-sm">{s.minutes} min</span>
                  <span className="text-xs text-muted-foreground">
                    {s.pages} pages
                  </span>
                </div>
              );
            })}
          </div>
          {!sessions.length && <p className="text-sm text-muted-foreground">No reading sessions in this preview week.</p>}
        </section>
        <section>
          <h2 className="mb-5 text-xl font-semibold leading-7">
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
        Sample activity · Reading sessions are not tracked yet.
      </p>
      <Dialog
        open={ui.editing}
        onOpenChange={(editing) => ui.patch({ editing })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Daily reading goal</DialogTitle>
            <DialogDescription>
              Set a goal for the visual preview.
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
