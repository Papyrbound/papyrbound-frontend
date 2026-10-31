"use client";

import { create } from "zustand";

import { CircleCheck, ChevronLeft, ChevronRight } from "lucide-react";

import { activityPreview, heatmapDays } from "../model/activity-preview";

import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";

import { BookCover } from "@/features/home/ui/book-cover";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
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
  goal: number;
  editing: boolean;
  patch: (
    value: Partial<{
      day: string;
      week: number;
      goal: number;
      editing: boolean;
    }>,
  ) => void;
}>((set) => ({
  day: activityPreview.end,
  week: 0,
  goal: activityPreview.goal,
  editing: false,
  patch: (value) => set(value),
}));

export function ReadingActivityPage() {
  const { books } = useReadingLists();
  const ui = useActivityUI();
  const { day } = ui;
  const anchor = new Date(`${activityPreview.end}T12:00:00Z`);
  const start = new Date(
    anchor.getTime() -
      ((anchor.getUTCDay() + 6) % 7) * 86400000 +
      ui.week * 7 * 86400000,
  );
  const end = new Date(start.getTime() + 6 * 86400000);
  const sessions = activityPreview.sessions.filter(
    (session) =>
      session.date >= start.toISOString().slice(0, 10) &&
      session.date <= end.toISOString().slice(0, 10),
  );
  const weekLabel = `${start.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" })} – ${end.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}`;
  const selected = heatmapDays.find((d) => d.date === day);
  const total = sessions.reduce((sum, s) => sum + s.minutes, 0);
  const finished = books.filter((b) => b.progress >= 100);
  return (
    <main className="p-5 lg:px-12 lg:py-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold leading-[42px]">
            Reading activity
          </h1>
          <p className="mt-3 text-[13px] leading-6 text-muted-foreground">
            A little reading, a little more often.
          </p>
        </div>
        <div className="flex h-10 w-80 items-center justify-between rounded-xl border border-soft-border bg-secondary px-1 shadow-soft">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Previous preview week"
            onClick={() => ui.patch({ week: ui.week - 1 })}
          >
            <ChevronLeft />
          </Button>
          <span className="text-sm">{weekLabel}</span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Next preview week"
            disabled={ui.week === 0}
            onClick={() => ui.patch({ week: ui.week + 1 })}
          >
            <ChevronRight />
          </Button>
        </div>
      </header>
      <div className="mb-[33px] mt-11 grid grid-cols-2 gap-8 lg:grid-cols-4">
        {[
          [`${Math.floor(total / 60)}h ${total % 60}m`, "Time read this week"],
          [
            String(sessions.reduce((n, s) => n + s.pages, 0)),
            "Pages read this week",
          ],
          ["4 days", "Preview reading streak"],
          [String(finished.length), "Books finished in your library"],
        ].map(([n, l]) => (
          <div key={l} className="border-r border-border pr-8 last:border-0">
            <p className="text-4xl font-medium leading-[49px]">{n}</p>
            <p className="mt-1 text-[13px] leading-6 text-muted-foreground">
              {l}
            </p>
          </div>
        ))}
      </div>
      <div className="grid gap-7 xl:grid-cols-[minmax(0,1.88fr)_minmax(280px,1fr)]">
        <section className="min-w-0 rounded-section bg-card p-6">
          <h2 className="text-base font-semibold leading-[26px]">
            Reading consistency
          </h2>
          <p className="mt-1 text-xs leading-[18px] text-muted-foreground">
            Last 12 months
          </p>
          <div className="mt-[18px] overflow-x-auto">
            <div className="min-w-[920px] pl-4 pr-9">
              <div className="mb-2.5 flex h-[18px] justify-between pl-[72px] text-[10px] text-muted-foreground">
                {[
                  "Nov",
                  "Dec",
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                ].map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
              <div className="flex gap-8">
                <div className="flex w-6 shrink-0 flex-col justify-around text-[10px] text-muted-foreground">
                  <span>Mon</span>
                  <span>Wed</span>
                  <span>Fri</span>
                </div>
                <div className="grid grid-flow-col grid-rows-[repeat(7,12px)] auto-cols-[12px] gap-1">
                  {heatmapDays.map((d) => (
                    <button
                      key={d.date}
                      className={`aspect-square rounded-[3px] outline-none focus-visible:ring-2 focus-visible:ring-ring ${day === d.date ? "ring-1 ring-foreground ring-offset-1 ring-offset-card" : ""} ${d.minutes === null ? "invisible" : d.minutes === 0 ? "bg-border" : d.minutes < 20 ? "bg-neutral-300 dark:bg-neutral-600" : d.minutes < 35 ? "bg-neutral-400" : d.minutes < 50 ? "bg-neutral-500" : "bg-neutral-700 dark:bg-neutral-200"}`}
                      aria-label={`${d.date}: ${d.minutes ?? 0} minutes read`}
                      aria-pressed={day === d.date}
                      disabled={d.minutes === null}
                      title={`${d.date}: ${d.minutes ?? 0} minutes`}
                      onClick={() => ui.patch({ day: d.date })}
                    />
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
        <section className="relative rounded-section bg-card p-6 pb-12">
          <h2 className="flex items-center justify-between text-base font-semibold leading-[26px]">
            Daily reading goal
            <CircleCheck className="size-4 text-muted-foreground" />
          </h2>
          <p className="mt-[26px] text-[44px] font-medium leading-[60px]">
            {selected?.minutes ?? 0}{" "}
            <span className="ml-14 text-lg font-normal text-muted-foreground">
              / {ui.goal} min
            </span>
          </p>
          <p className="mt-1 text-xs leading-[18px]">
            {(selected?.minutes ?? 0) >= ui.goal
              ? "Goal reached on this preview day"
              : "Keep reading to reach your goal"}
          </p>
          <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${Math.min(100, ((selected?.minutes ?? 0) / ui.goal) * 100)}%`,
              }}
            />
          </div>
          <div className="mt-7 flex justify-between">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <span
                key={i}
                className={`flex size-10 items-center justify-center rounded-full text-xs ${i >= 2 && i <= 5 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                {d}
              </span>
            ))}
          </div>
          <p className="mt-[26px] text-xs leading-[18px] text-muted-foreground">
            4-day streak · Personal best: 9 days
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
      <div className="mt-9 grid gap-7 xl:grid-cols-[minmax(0,1.88fr)_minmax(280px,1fr)]">
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
                  <span className="w-7 shrink-0 [&_.cover-type]:hidden [&_.cover-credit]:hidden">
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
        </section>
        <section>
          <h2 className="mb-5 text-xl font-semibold leading-7">
            Recently finished
          </h2>
          {finished.length ? (
            <div className="grid grid-cols-2 gap-4">
              {finished.slice(0, 2).map((b) => (
                <div key={b.id} className="min-w-0">
                  <div className="w-[72px]">
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
              Completed books will appear here.
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
              if (value >= 1 && value <= 300)
                ui.patch({ goal: value, editing: false });
            }}
          >
            <label className="space-y-2 text-sm">
              Minutes per day
              <Input
                name="goal"
                type="number"
                min={1}
                max={300}
                defaultValue={ui.goal}
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
    </main>
  );
}
