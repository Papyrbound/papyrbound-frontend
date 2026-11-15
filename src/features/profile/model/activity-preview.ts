import { activityDateKey, activityDayMs, startOfActivityWeek } from "./activity-dates";

// Explicitly labelled preview data. Real session tracking will replace this module.
export const activityPreview = {
  end: "2026-10-31",
  goal: 20,
  sessions: [
    { date: "2026-10-31", bookId: "quiet", minutes: 60, pages: 52 },
    { date: "2026-10-30", bookId: "sun", minutes: 45, pages: 40 },
    { date: "2026-10-29", bookId: "quiet", minutes: 35, pages: 31 },
    { date: "2026-10-28", bookId: "wild", minutes: 25, pages: 23 },
  ],
};
export function createHeatmapDays(earliest: Date, latest: Date) {
  const end = startOfActivityWeek(latest).getTime() + 6 * activityDayMs;
  const first = end - 370 * activityDayMs;
  const earliestKey = activityDateKey(earliest);
  const latestKey = activityDateKey(latest);
  return Array.from({ length: 371 }, (_, i) => {
    const date = activityDateKey(new Date(first + i * activityDayMs));
    const session = activityPreview.sessions.find((s) => s.date === date);
    const minutes = date < earliestKey || date > latestKey
      ? null
      : (session?.minutes ?? (date >= "2026-10-25" ? 0 : (i * 17) % 13 < 5 ? [10, 20, 35, 45, 60][i % 5] : 0));
    return { date, minutes };
  });
}
