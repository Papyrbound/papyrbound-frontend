// Fixed, explicitly labelled preview data. Real session tracking will replace this module.
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
export const heatmapDays = Array.from({ length: 371 }, (_, i) => {
  const date = new Date(Date.UTC(2025, 10, 2) + i * 86400000)
    .toISOString()
    .slice(0, 10);
  const session = activityPreview.sessions.find((s) => s.date === date);
  const minutes =
    date > activityPreview.end
      ? null
      : (session?.minutes ??
        (date >= "2026-10-25"
          ? 0
          : (i * 17) % 13 < 5
            ? [10, 20, 35, 45, 60][i % 5]
            : 0));
  return { date, minutes };
});
