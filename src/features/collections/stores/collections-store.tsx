"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from "react";

export type Collection = {
  id: string;
  name: string;
  color: string;
  bookIds: string[];
  pinned: boolean;
  lastBookAddedAt?: string;
};

const initialCollections: Collection[] = [
  {
    id: "quiet-afternoons",
    name: "Quiet afternoons",
    color: "#d9cae9",
    bookIds: ["quiet", "sun", "wild"],
    pinned: true,
    lastBookAddedAt: "2026-10-10T12:00:00-07:00",
  },
  {
    id: "far-from-home",
    name: "Far from home",
    color: "#d6dfbd",
    bookIds: ["atlas", "wild", "tidal"],
    pinned: true,
    lastBookAddedAt: "2026-10-09T12:00:00-07:00",
  },
  {
    id: "after-hours",
    name: "After hours",
    color: "#f0c6ac",
    bookIds: ["night", "quiet", "tidal"],
    pinned: false,
    lastBookAddedAt: "2026-10-11T12:00:00-07:00",
  },
];

const CollectionsContext = createContext<{
  collections: Collection[];
  setCollections: Dispatch<SetStateAction<Collection[]>>;
} | null>(null);

export function CollectionsProvider({ children }: { children: ReactNode }) {
  const [collections, setCollections] = useState(initialCollections);
  const value = useMemo(() => ({ collections, setCollections }), [collections]);
  return (
    <CollectionsContext.Provider value={value}>
      {children}
    </CollectionsContext.Provider>
  );
}

export function useCollections() {
  const context = useContext(CollectionsContext);
  if (!context)
    throw new Error("useCollections must be used inside CollectionsProvider");
  return context;
}
