"use client";
import { create } from "zustand";
import type { Dispatch, SetStateAction, ReactNode } from "react";
export type Collection = { id: string; name: string; color: string; bookIds: string[]; pinned: boolean; lastBookAddedAt?: string; createdAt?: string };
const initialCollections: Collection[] = [
  { id: "quiet-afternoons", name: "Quiet afternoons", color: "#d9cae9", bookIds: ["quiet", "sun", "wild"], pinned: true, lastBookAddedAt: "2026-10-10T12:00:00-07:00" },
  { id: "far-from-home", name: "Far from home", color: "#d6dfbd", bookIds: ["atlas", "wild", "tidal"], pinned: true, lastBookAddedAt: "2026-10-09T12:00:00-07:00" },
  { id: "after-hours", name: "After hours", color: "#f0c6ac", bookIds: ["night", "quiet", "tidal"], pinned: false, lastBookAddedAt: "2026-10-11T12:00:00-07:00" },
]

export const useCollections = create<{collections: Collection[]; setCollections: Dispatch<SetStateAction<Collection[]>>}>((set) => ({ collections: initialCollections, setCollections: update => set(s => ({collections: typeof update === "function" ? update(s.collections) : update})) }));
export function CollectionsProvider({children}: {children: ReactNode}) { return children; }
