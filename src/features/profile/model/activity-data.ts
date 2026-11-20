import { activityDateKey, activityDayMs, startOfActivityWeek } from "./activity-dates";
import type { ReadingSession } from "@/features/reader/model/reading-state";

export function createHeatmapDays(earliest: Date, latest: Date, sessions: ReadingSession[] = []) {
  const end = startOfActivityWeek(latest).getTime() + 6 * activityDayMs;
  const first = end - 370 * activityDayMs;
  const earliestKey = activityDateKey(earliest);
  const latestKey = activityDateKey(latest);
  const seconds = new Map<string, number>();
  for (const session of sessions) seconds.set(session.date, (seconds.get(session.date) ?? 0) + session.seconds);
  return Array.from({ length: 371 }, (_, index) => {
    const date = activityDateKey(new Date(first + index * activityDayMs));
    return { date, minutes: date < earliestKey || date > latestKey ? null : Math.floor((seconds.get(date) ?? 0) / 60) };
  });
}
