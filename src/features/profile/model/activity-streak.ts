export function activityStreak(days: { date: string; minutes: number | null }[], through: string) {
  let current = 0;
  let best = 0;
  for (const day of days) {
    if (day.date > through) break;
    current = (day.minutes ?? 0) > 0 ? current + 1 : 0;
    best = Math.max(best, current);
  }
  return { current, best };
}
