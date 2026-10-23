"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckIcon,
  ChevronRightIcon,
  SlidersHorizontalIcon,
} from "lucide-react";
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";
import { Button } from "@/shared/ui/button";
import { ChartContainer, type ChartConfig } from "@/shared/ui/chart";
import { Input } from "@/shared/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { RevealCard, useReadingMotion } from "@/shared/ui/reading-motion";
import {
  dayKey,
  saveReadingGoal,
  useReadingGoals,
} from "../model/reading-goals";
import { type SampleBook } from "../model/sample-books";
import { BookCover } from "./book-cover";

const goalChartConfig = {
  reading: { label: "Today's reading", color: "var(--primary)" },
} satisfies ChartConfig;
const continueButtonClass =
  "home-goal-continue h-auto min-h-11 w-full min-w-0 justify-between gap-2 px-3 py-2 text-left whitespace-normal [&>span]:flex [&>span]:min-w-0 [&>span]:flex-1 [&>span]:flex-col [&>span]:items-start [&>span>strong]:text-[11px] [&>span>span]:block [&>span>span]:max-w-full [&>span>span]:truncate [&>span>span]:text-[10px] [&>span>span]:opacity-70 [&>svg]:size-4 [&>svg]:shrink-0";

function dayOrdinal(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / 86_400_000;
}

export function ReadingGoalsCard({
  books,
  onSelect,
}: {
  books: SampleBook[];
  onSelect: (book: SampleBook) => void;
}) {
  const reducedMotion = useReadingMotion();
  const goals = useReadingGoals();
  const [now, setNow] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);
  const [goalDraft, setGoalDraft] = useState("20");
  const [minutesDraft, setMinutesDraft] = useState("0");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const refresh = () => setNow(new Date());
    refresh();
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  const today = now ? dayKey(now) : "";
  const minutes = goals.days[today]?.minutes ?? 0;
  const percent = Math.min(100, (minutes / goals.goal) * 100);
  const currentBook = books.find(
    (book) => book.progress > 0 && book.progress < 100,
  );
  const completed = books.filter((book) => book.progress >= 100);
  const week = Array.from({ length: 7 }, (_, index) => {
    if (!now) return null;
    const date = new Date(now);
    date.setDate(date.getDate() - date.getDay() + index);
    return date;
  });
  let streak = 0;
  if (now) {
    const cursor = new Date(now);
    if (minutes < goals.goal) cursor.setDate(cursor.getDate() - 1);
    while (
      goals.days[dayKey(cursor)]?.minutes >= goals.days[dayKey(cursor)]?.goal
    ) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
  }
  const completedDays = Object.entries(goals.days)
    .filter(([, day]) => day.minutes >= day.goal)
    .map(([key]) => key)
    .sort();
  let record = 0;
  let run = 0;
  let previousDay: number | null = null;
  completedDays.forEach((key) => {
    const currentDay = dayOrdinal(key);
    run = previousDay !== null && currentDay - previousDay === 1 ? run + 1 : 1;
    record = Math.max(record, run);
    previousDay = currentDay;
  });
  function editGoal() {
    setGoalDraft(String(goals.goal));
    setMinutesDraft(String(goals.days[dayKey(new Date())]?.minutes ?? 0));
    setOpen(true);
  }

  return (
    <>
      <RevealCard
        index={4}
        className="home-bento-tile min-w-0 gap-0 rounded-3xl border border-[color-mix(in_srgb,var(--foreground)_5%,transparent)] bg-card p-[22px] shadow-none ring-0 max-[600px]:rounded-[20px] max-[600px]:p-[18px] home-reading-goals [grid-area:wishlist]"
        aria-labelledby="home-goals-title"
      >
        <div className="home-goals-heading flex items-center justify-between gap-[8px] [&_h2]:text-[14px] [&_h2]:font-medium">
          <h2 id="home-goals-title">Reading goals</h2>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Edit reading goal"
            onClick={editGoal}
          >
            <SlidersHorizontalIcon />
          </Button>
        </div>
        <p className="home-goals-intro">
          Read every day, keep your streak going, and finish more books.
        </p>
        <div
          className="home-goal-meter relative w-full max-w-[160px] m-[10px_auto_8px]"
          role="progressbar"
          aria-label="Today's reading goal"
          aria-valuemin={0}
          aria-valuemax={goals.goal}
          aria-valuenow={Math.min(minutes, goals.goal)}
          aria-valuetext={`${minutes} of ${goals.goal} minutes read today`}
        >
          <ChartContainer
            config={goalChartConfig}
            className="home-goal-chart h-[86px]! w-full! aspect-auto!"
            aria-hidden="true"
          >
            <RadialBarChart
              data={[{ reading: percent }]}
              startAngle={180}
              endAngle={0}
              cx="50%"
              cy="96%"
              innerRadius={72}
              outerRadius={80}
              barSize={7}
              margin={{ top: 3, right: 3, bottom: 3, left: 3 }}
              accessibilityLayer={false}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar
                dataKey="reading"
                fill="var(--color-reading)"
                background={{ fill: "var(--muted)" }}
                cornerRadius={99}
                isAnimationActive={!reducedMotion}
                animationDuration={600}
              />
            </RadialBarChart>
          </ChartContainer>
          <div className="home-goal-value [&>span:first-child]:text-foreground [&>span:first-child]:font-medium absolute [inset:24%_0_0] flex flex-col [justify-content:end] items-center gap-[1px] [&>span]:text-[9px] [&>span]:text-muted-foreground [&_strong]:text-[30px] [&_strong]:font-normal [&_strong]:tracking-[-1px] [&_strong]:[line-height:1.1] [&_strong]:[font-variant-numeric:tabular-nums] [&_small]:ml-[4px] [&_small]:text-[10px] [&_small]:tracking-[0] [&_small]:text-muted-foreground">
            <span>Today’s reading</span>
            <strong>
              {minutes}
              <small>min</small>
            </strong>
            <span>of your {goals.goal}-minute goal</span>
          </div>
        </div>
        {currentBook ? (
          <Button
            className={continueButtonClass}
            onClick={() => onSelect(currentBook)}
          >
            <span>
              <strong>Keep reading</strong>
              <span>{currentBook.title}</span>
            </span>
            <ChevronRightIcon />
          </Button>
        ) : (
          <Button className={continueButtonClass} onClick={editGoal}>
            <span>
              <strong>Log today’s reading</strong>
              <span>Build your next streak</span>
            </span>
            <ChevronRightIcon />
          </Button>
        )}
        <div
          className="home-goal-week flex justify-between gap-[4px] max-w-[210px] w-full m-[0_auto]"
          aria-label="Reading goals this week"
        >
          {week.map((date, index) => {
            const key = date ? dayKey(date) : String(index);
            const day = goals.days[key];
            const achieved = !!day && day.minutes >= day.goal;
            const dayProgress = day
              ? Math.min(100, (day.minutes / day.goal) * 100)
              : 0;
            const label = date
              ? date.toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })
              : [
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ][index];
            return (
              <span
                key={key}
                className={`home-goal-day grid size-5 flex-[0_1_20px] place-items-center rounded-full border border-border text-[9px] text-muted-foreground [&_svg]:size-[11px]${key === today ? " is-today border-primary text-foreground" : ""}${achieved ? " is-complete border-transparent text-primary-foreground" : ""}`}
                style={{
                  background: `conic-gradient(var(--primary) ${dayProgress}%, var(--muted) 0)`,
                }}
                aria-label={`${label}: ${achieved ? "goal reached" : `${day?.minutes ?? 0} minutes logged`}`}
                aria-current={key === today ? "date" : undefined}
                title={`${label} · ${day?.minutes ?? 0} min`}
              >
                <span>{achieved ? <CheckIcon /> : "SMTWTFS"[index]}</span>
              </span>
            );
          })}
        </div>
        <div className="home-goal-streak m-[6px_0_10px] text-center text-[10px] text-muted-foreground">
          <strong>
            {streak ? `${streak}-day streak` : "Start a new streak"}
          </strong>
          <span>
            {record
              ? `Your record is ${record} ${record === 1 ? "day" : "days"}.`
              : "Today is a good day to begin."}
          </span>
        </div>
        <div className="home-goal-books [&>div:first-child]:mr-auto [&>div:first-child]:flex [&>div:first-child]:items-center [&>div:first-child]:gap-[6px] [&>div:first-child>span]:text-[10px] [&>div:first-child>span]:text-muted-foreground flex items-center gap-[8px] min-h-[34px] mt-auto pt-[8px] [border-top:1px_solid_var(--border)] [&_h3]:text-[10px] [&_h3]:font-medium">
          <div>
            <h3>Books finished</h3>
            <span>{completed.length}</span>
          </div>
          {completed.length ? (
            <div className="home-goal-covers [&_[data-slot=button]]:block [&_[data-slot=button]]:h-auto [&_[data-slot=button]]:w-4 [&_[data-slot=button]]:rounded-sm [&_[data-slot=button]]:p-0 flex gap-[4px] [&_.cover-type]:text-[2px] [&_.cover-credit]:hidden">
              {completed.slice(-2).map((book) => (
                <Button
                  variant="ghost"
                  key={book.id}
                  onClick={() => onSelect(book)}
                  aria-label={`View ${book.title}`}
                >
                  <BookCover book={book} />
                </Button>
              ))}
            </div>
          ) : null}
          <Button
            nativeButton={false}
            role="link"
            variant="ghost"
            size="icon-xs"
            aria-label="View reading activity"
            render={<Link href="/reading-activity" />}
          >
            <ChevronRightIcon />
          </Button>
        </div>
        <p className="sr-only" role="status">
          {notice}
        </p>
      </RevealCard>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your daily reading</DialogTitle>
            <DialogDescription>
              Log time you’ve spent reading today. Your goal and history are
              saved on this device.
            </DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-5"
            onSubmit={(event) => {
              event.preventDefault();
              const saved = saveReadingGoal(
                Number(goalDraft),
                Number(minutesDraft),
              );
              setNow(new Date());
              setNotice(
                saved
                  ? "Reading goal and today's minutes saved."
                  : "Saved for this session. Device storage is unavailable.",
              );
              setOpen(false);
            }}
          >
            <label className="grid gap-2">
              Daily goal (minutes)
              <Input
                type="number"
                min={1}
                max={240}
                step={1}
                required
                value={goalDraft}
                onChange={(event) => setGoalDraft(event.target.value)}
              />
            </label>
            <label className="grid gap-2">
              Total minutes read today
              <Input
                type="number"
                min={0}
                max={1440}
                step={1}
                required
                value={minutesDraft}
                onChange={(event) => setMinutesDraft(event.target.value)}
              />
            </label>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save reading</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
