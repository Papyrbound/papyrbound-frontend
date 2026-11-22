import assert from "node:assert/strict";
import { test } from "node:test";
import { activeReadingInterval, splitReadingTime, localReadingDate, readingProgress, isReadingData } from "./reading-state";
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";
import { sampleBooks } from "@/features/home/model/sample-books";
import { isLibrarySnapshot, librarySnapshot } from "@/features/library/model/library-snapshot";
import { createHeatmapDays } from "@/features/profile/model/activity-data";

test("reading time excludes hidden and idle intervals and caps delayed heartbeats", () => {
  const seconds = (parts: { seconds: number }[]) => parts.reduce((sum, part) => sum + part.seconds, 0);
  assert.equal(seconds(activeReadingInterval(0, 5000, 0, true)), 5);
  assert.equal(seconds(activeReadingInterval(0, 5000, 0, false)), 0);
  assert.equal(seconds(activeReadingInterval(119000, 125000, 0, true)), 1);
  assert.equal(seconds(activeReadingInterval(125000, 130000, 0, true)), 0);
  assert.equal(seconds(activeReadingInterval(0, 3_600_000, 3_600_000, true)), 10);
});

test("sessions split across local midnight without attributing time to the wrong day", () => {
  const start = new Date(2026, 10, 16, 23, 59, 58);
  const end = new Date(2026, 10, 17, 0, 0, 3);
  assert.deepEqual(splitReadingTime(start.getTime(), end.getTime()), [{ date: localReadingDate(start), seconds: 2 }, { date: localReadingDate(end), seconds: 3 }]);
  assert.equal(readingProgress([2, 6], 1, 0.5), 63);
  assert.equal(readingProgress([1], 0, 1), 99);
});

test("real positions and sessions persist in snapshots, maintain shelves, and do not count sample titles", () => {
  const book = { ...sampleBooks[0], id: "real-book", sourceId: "real-book", kind: "books" as const, progress: 0 };
  const comic = { ...book, id: "real-comic", sourceId: "real-comic", kind: "comics" as const };
  useReadingLists.setState((state) => ({ books: [...state.books, book, comic], reading: { positions: {}, sessions: [] } }));
  useReadingLists.getState().toggleBook("want-to-read", book.id);
  useReadingLists.getState().savePosition(book.id, { index: 1, total: 3, offset: 0.4, progress: 45 });
  assert.equal(useReadingLists.getState().books.find((item) => item.id === book.id)?.progress, 45);
  assert.equal(useReadingLists.getState().lists.find((list) => list.id === "want-to-read")?.bookIds?.includes(book.id), false);
  useReadingLists.getState().recordReading(book.id, "session", "2026-11-17", 90, 2);
  useReadingLists.getState().recordReading(book.id, "session", "2026-11-17", 30, 1);
  useReadingLists.getState().recordReading(comic.id, "comic-session", "2026-11-17", 60, 1);
  useReadingLists.getState().recordReading("quiet", "sample", "2026-11-17", 600, 50);
  assert.equal(useReadingLists.getState().reading.sessions.length, 2);
  const session = useReadingLists.getState().reading.sessions.find((item) => item.bookId === book.id)!;
  assert.equal(session.seconds, 120); assert.equal(session.pages, 3);
  assert.equal(useReadingLists.getState().reading.sessions.find((item) => item.bookId === comic.id)?.kind, "comics");
  const snapshot = JSON.parse(JSON.stringify(librarySnapshot(useReadingLists.getState())));
  assert.equal(isLibrarySnapshot(snapshot), true);
  assert.deepEqual(snapshot.reading, useReadingLists.getState().reading);
  assert.equal(createHeatmapDays(new Date("2026-11-01T12:00Z"), new Date("2026-11-17T12:00Z"), [session]).find((day) => day.date === "2026-11-17")?.minutes, 2);
  useReadingLists.getState().savePosition(book.id, { index: 2, total: 3, offset: 1, progress: 100 });
  assert.ok(useReadingLists.getState().lists.find((list) => list.id === "completed")?.bookIds?.includes(book.id));
  useReadingLists.getState().markAsUnread(book.id);
  assert.equal(useReadingLists.getState().reading.positions[book.id], undefined);
  assert.equal(isReadingData({ positions: { wrong: { index: 9, total: 2, offset: 0, progress: 0, updatedAt: new Date().toISOString() } }, sessions: [] }), false);
});
