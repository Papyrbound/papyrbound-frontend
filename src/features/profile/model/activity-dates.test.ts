import assert from "node:assert/strict";
import { test } from "node:test";
import { activityBounds, activityDateKey, activityDay, clampActivityDate, startOfActivityWeek } from "./activity-dates";
import { createHeatmapDays } from "./activity-preview";

test("account dates bound the calendar, including partial first and last weeks", () => {
  const created = new Date(2026, 5, 17, 16);
  const { earliest, latest } = activityBounds(created.toISOString(), new Date(2026, 10, 12, 20));
  assert.equal(activityDateKey(earliest), "2026-06-17");
  assert.equal(activityDateKey(clampActivityDate(startOfActivityWeek(earliest), earliest, latest)), "2026-06-17");
  assert.equal(activityDateKey(clampActivityDate(new Date("2027-01-01"), earliest, latest)), "2026-11-12");
  for (const day of createHeatmapDays(earliest, latest)) {
    if (day.date < "2026-06-17" || day.date > "2026-11-12") assert.equal(day.minutes, null);
  }
});

test("local date conversion preserves account day and week arithmetic across DST and New Year", () => {
  for (const [date, monday] of [
    [new Date(2026, 2, 8, 23), "2026-03-02"],
    [new Date(2026, 0, 1, 1), "2025-12-29"],
  ] as const) assert.equal(activityDateKey(startOfActivityWeek(activityDay(date))), monday);
  const now = new Date(2026, 10, 12);
  for (const createdAt of [null, "invalid", "2099-01-01T12:00:00Z"]) {
    const bounds = activityBounds(createdAt, now);
    assert.equal(bounds.earliest.getTime(), bounds.latest.getTime());
  }
});
