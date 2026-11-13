export const activityDayMs = 86400000;

// Store calendar dates at UTC noon so week arithmetic is unaffected by DST.
export function activityDay(date: Date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12));
}

export function activityDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function startOfActivityWeek(date: Date) {
  return new Date(date.getTime() - ((date.getUTCDay() + 6) % 7) * activityDayMs);
}

export function activityBounds(createdAt: string | null, now = new Date()) {
  const latest = activityDay(now);
  const created = createdAt ? new Date(createdAt) : now;
  const earliest = Number.isFinite(created.getTime()) ? activityDay(created) : latest;
  return { earliest: earliest > latest ? latest : earliest, latest };
}

export function clampActivityDate(date: Date, earliest: Date, latest: Date) {
  return new Date(Math.max(earliest.getTime(), Math.min(latest.getTime(), date.getTime())));
}
