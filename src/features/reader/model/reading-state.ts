import { isRecord } from "@/shared/lib/device-storage";

export type ReadingPosition = { index: number; total: number; offset: number; progress: number; updatedAt: string };
export type ReadingSession = { id: string; bookId: string; kind: "books" | "comics"; date: string; seconds: number; pages: number; updatedAt: string };
export type ReadingData = { positions: Record<string, ReadingPosition>; sessions: ReadingSession[] };
const date = (value: unknown): value is string => typeof value === "string" && Number.isFinite(Date.parse(value));

export function isReadingData(value: unknown): value is ReadingData {
  return isRecord(value) && isRecord(value.positions) && Object.values(value.positions).every((position) =>
    isRecord(position) && Number.isInteger(position.index) && Number(position.index) >= 0 && Number.isInteger(position.total) && Number(position.total) > Number(position.index) &&
    typeof position.offset === "number" && position.offset >= 0 && position.offset <= 1 &&
    typeof position.progress === "number" && position.progress >= 0 && position.progress <= 100 && date(position.updatedAt)) &&
    Array.isArray(value.sessions) && value.sessions.every((session) => isRecord(session) && typeof session.id === "string" && typeof session.bookId === "string" &&
      (session.kind === "books" || session.kind === "comics") && typeof session.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(session.date) && date(session.date) &&
      typeof session.seconds === "number" && Number.isFinite(session.seconds) && session.seconds >= 0 && Number.isInteger(session.pages) && Number(session.pages) >= 0 && date(session.updatedAt));
}

export function localReadingDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Split foreground reading at local midnight, including DST transitions. */
export function splitReadingTime(start: number, end: number): { date: string; seconds: number }[] {
  const result: { date: string; seconds: number }[] = [];
  while (start < end) {
    const day = new Date(start);
    const midnight = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1).getTime();
    const until = Math.min(end, midnight);
    result.push({ date: localReadingDate(day), seconds: (until - start) / 1000 });
    start = until;
  }
  return result;
}

/** Cap delayed heartbeats so sleep/background timers cannot inflate reading time. */
export function activeReadingInterval(previous: number, now: number, lastInteraction: number, active: boolean) {
  if (!active || now <= previous) return [];
  return splitReadingTime(Math.max(previous, now - 10_000), Math.min(now, lastInteraction + 120_000));
}

export function readingProgress(weights: number[], index: number, offset: number) {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  if (!total) return 0;
  return Math.max(1, Math.min(99, Math.round((weights.slice(0, index).reduce((sum, weight) => sum + weight, 0) + weights[index] * Math.max(0, Math.min(1, offset))) / total * 100)));
}
