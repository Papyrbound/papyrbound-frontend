import type { ReadingActivityEvent } from "@/features/reading-lists/stores/reading-lists-store";

// Display-only examples; these do not change books or create real activity events.
export const libraryActivityPreview: ReadingActivityEvent[] = [
  { id: "preview-added-light-door", kind: "added", bookTitle: "Light Door", at: "2026-11-09T18:30:00-08:00" },
  { id: "preview-completed-one-night", kind: "completed", bookTitle: "One Night Only", at: "2026-11-08T21:15:00-08:00" },
  { id: "preview-added-midnight", kind: "added", bookTitle: "The Midnight Labyrinth", at: "2026-11-08T10:20:00-08:00" },
  { id: "preview-unread-crimson", kind: "unread", bookTitle: "Crimson Vow", at: "2026-11-07T16:45:00-08:00" },
  { id: "preview-deleted-paper", kind: "deleted", bookTitle: "The Paper Garden", at: "2026-11-06T12:10:00-08:00" },
  { id: "preview-completed-shadows", kind: "completed", bookTitle: "Where Shadows Bloom", at: "2026-11-05T20:40:00-08:00" },
];
