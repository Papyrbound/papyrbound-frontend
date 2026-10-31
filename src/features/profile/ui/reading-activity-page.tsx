"use client";

import { create } from "zustand";

import { CircleCheck } from "lucide-react";

import { activityPreview, heatmapDays } from "../model/activity-preview";

import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";

import { BookCover } from "@/features/home/ui/book-cover";

const useActivityUI = create<{ day: string; setDay: (day: string) => void }>(
  (set) => ({ day: activityPreview.end, setDay: (day) => set({ day }) }),
);

export function ReadingActivityPage() {
  const { books } = useReadingLists();
  const { day, setDay } = useActivityUI();
  const selected = heatmapDays.find((d) => d.date === day);
  const total = activityPreview.sessions.reduce((sum, s) => sum + s.minutes, 0);
  const finished = books.filter((b) => b.progress >= 100);
  return (
    <main className="p-5 lg:p-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          Reading activity
        </h1>
        <p className="mt-3 text-xs text-muted-foreground">
          Sample activity · Reading sessions are not tracked yet.
        </p>
      </header>
      <div className="my-10 grid grid-cols-2 gap-7 lg:grid-cols-4">
        {[
          [`${Math.floor(total / 60)}h ${total % 60}m`, "Time read this week"],
          [
            String(activityPreview.sessions.reduce((n, s) => n + s.pages, 0)),
            "Pages read this week",
          ],
          ["4 days", "Preview reading streak"],
          [String(finished.length), "Books finished in your library"],
        ].map(([n, l]) => (
          <div
            key={l}
            className="border-l border-border pl-5 first:border-0 first:pl-0"
          >
            <p className="text-3xl font-medium tracking-tight">{n}</p>
            <p className="mt-3 text-xs text-muted-foreground">{l}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <section className="min-w-0 rounded-2xl bg-card p-6">
          <h2 className="text-base font-semibold">Reading consistency</h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Last 12 months · Preview through 31 Oct 2026
          </p>
          <div className="mt-6 overflow-x-auto pb-3">
            <div className="min-w-[690px]">
              <div className="mb-2 flex justify-between pl-8 text-[10px] text-muted-foreground">
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
              <div className="flex gap-3">
                <div className="flex flex-col justify-around text-[10px] text-muted-foreground">
                  <span>Mon</span>
                  <span>Wed</span>
                  <span>Fri</span>
                </div>
                <div className="grid flex-1 grid-flow-col grid-rows-7 gap-[3px]">
                  {heatmapDays.map((d) => (
                    <button
                      key={d.date}
                      className={`aspect-square rounded-[3px] outline-none focus-visible:ring-2 focus-visible:ring-ring ${day === d.date ? "ring-1 ring-foreground ring-offset-1 ring-offset-card" : ""} ${d.minutes === null ? "invisible" : d.minutes === 0 ? "bg-border" : d.minutes < 20 ? "bg-neutral-300 dark:bg-neutral-600" : d.minutes < 35 ? "bg-neutral-400" : d.minutes < 50 ? "bg-neutral-500" : "bg-neutral-700 dark:bg-neutral-200"}`}
                      aria-label={`${d.date}: ${d.minutes ?? 0} minutes read`}
                      aria-pressed={day === d.date}
                      disabled={d.minutes === null}
                      title={`${d.date}: ${d.minutes ?? 0} minutes`}
                      onClick={() => setDay(d.date)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
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
            className="mt-5 border-t border-border pt-4 text-xs"
            aria-live="polite"
          >
            {day} · {selected?.minutes ?? 0} minutes read
          </p>
        </section>
        <section className="rounded-2xl bg-card p-6">
          <h2 className="flex items-center justify-between text-base font-semibold">
            Daily reading goal
            <CircleCheck className="size-4 text-muted-foreground" />
          </h2>
          <p className="mt-7 text-4xl font-medium">
            {selected?.minutes ?? 0}{" "}
            <span className="text-base font-normal text-muted-foreground">
              / {activityPreview.goal} min
            </span>
          </p>
          <p className="mt-4 text-xs">
            {(selected?.minutes ?? 0) >= activityPreview.goal
              ? "Goal reached on this preview day"
              : "Keep reading to reach your goal"}
          </p>
          <div className="mt-5 h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${Math.min(100, ((selected?.minutes ?? 0) / activityPreview.goal) * 100)}%`,
              }}
            />
          </div>
          <div className="mt-6 flex justify-between">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <span
                key={i}
                className={`flex size-8 items-center justify-center rounded-full text-xs ${i >= 2 && i <= 5 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                {d}
              </span>
            ))}
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            4-day streak · Personal best: 9 days
          </p>
        </section>
      </div>
      <div className="mt-9 grid gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <section>
          <h2 className="mb-5 text-xl font-semibold tracking-tight">
            Recent sessions
          </h2>
          <div className="divide-y divide-border">
            {activityPreview.sessions.map((s) => {
              const book = books.find((b) => b.id === s.bookId);
              if (!book) return null;
              return (
                <div key={s.date} className="flex items-center gap-4 py-3">
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
          <h2 className="mb-5 text-xl font-semibold tracking-tight">
            Recently finished
          </h2>
          {finished.length ? (
            <div className="flex gap-6">
              {finished.slice(0, 2).map((b) => (
                <div key={b.id} className="w-36">
                  <div className="w-20">
                    <BookCover book={b} />
                  </div>
                  <h3 className="mt-4 text-sm font-medium">{b.title}</h3>
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
    </main>
  );
}
