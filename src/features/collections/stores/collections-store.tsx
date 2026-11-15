"use client";
import { create } from "zustand";
import { useEffect, type Dispatch, type SetStateAction, type ReactNode } from "react";
import { isRecord, readDeviceValue, subscribeDeviceState } from "@/shared/lib/device-storage";
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";
export type Collection = {
  kind?: "books" | "comics";
  id: string;
  name: string;
  color: string;
  bookIds: string[];
  pinned: boolean;
  lastBookAddedAt?: string;
  createdAt?: string;
};
const initialCollections: Collection[] = [
  {
    id: "quiet-afternoons",
    name: "Evening reads",
    color: "#d9cae9",
    bookIds: ["quiet", "sun", "wild"],
    pinned: false,
    createdAt: "2026-10-14T12:00:00-07:00",
    lastBookAddedAt: "2026-10-28T12:00:00-07:00",
  },
  {
    id: "far-from-home",
    name: "Stories to escape into",
    color: "#d6dfbd",
    bookIds: ["wild", "sun", "atlas", "night"],
    pinned: false,
    createdAt: "2026-10-14T12:00:00-07:00",
    lastBookAddedAt: "2026-10-27T12:00:00-07:00",
  },
  {
    id: "after-hours",
    name: "Quiet discoveries",
    color: "#f0c6ac",
    bookIds: ["sun", "atlas", "night", "quiet", "wild"],
    pinned: false,
    createdAt: "2026-10-03T12:00:00-07:00",
    lastBookAddedAt: "2026-10-25T12:00:00-07:00",
  },
  {
    id: "weekend-shelf",
    name: "Weekend shelf",
    color: "#aac7d0",
    bookIds: ["atlas", "night", "quiet", "sun", "wild"],
    pinned: false,
    createdAt: "2026-10-03T12:00:00-07:00",
    lastBookAddedAt: "2026-10-22T12:00:00-07:00",
  },
];

export const useCollections = create<{
  collections: Collection[];
  setCollections: Dispatch<SetStateAction<Collection[]>>;
}>((set) => ({
  collections: initialCollections,
  setCollections: (update) =>
    set((s) => ({
      collections:
        typeof update === "function" ? update(s.collections) : update,
    })),
}));
export function CollectionsProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const report = (storageError: string) => useReadingLists.setState({ storageError });
    const saved = readDeviceValue("papyrbound-collections-v1", (value): value is Collection[] => Array.isArray(value) && value.every((item) =>
      isRecord(item) && typeof item.id === "string" && typeof item.name === "string" && typeof item.color === "string" &&
      typeof item.pinned === "boolean" && Array.isArray(item.bookIds) && item.bookIds.every((id) => typeof id === "string")), report);
    if (saved) useCollections.setState({ collections: saved });
    return subscribeDeviceState(useCollections, "papyrbound-collections-v1", (state) => state.collections, report);
  }, []);
  return children;
}
