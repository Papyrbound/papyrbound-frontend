"use client";

import { create } from "zustand";

type View = "grid" | "list";
type WorkspaceState = {
  libraryKind: "books" | "comics";
  selectedId: string | null;
  panelOpen: boolean;
  view: View;
  query: string;
  filter: string;
  sort: string;
  dialog: "synopsis" | "collections" | "delete" | "edit" | "reader" | null;
  setLibraryKind: (kind: WorkspaceState["libraryKind"]) => void;
  selectBook: (id: string) => void;
  setPanelOpen: (open: boolean) => void;
  setView: (view: View) => void;
  setQuery: (query: string) => void;
  setFilter: (filter: string) => void;
  setSort: (sort: string) => void;
  setDialog: (dialog: WorkspaceState["dialog"]) => void;
};

export const useWorkspace = create<WorkspaceState>((set) => ({
  libraryKind: "books",
  selectedId: null,
  panelOpen: true,
  view: "grid",
  query: "",
  filter: "all",
  sort: "recent",
  dialog: null,
  setLibraryKind: (libraryKind) => set({ libraryKind }),
  selectBook: (selectedId) => set({ selectedId, panelOpen: true }),
  setPanelOpen: (panelOpen) => set({ panelOpen }),
  setView: (view) => set({ view }),
  setQuery: (query) => set({ query }),
  setFilter: (filter) => set({ filter }),
  setSort: (sort) => set({ sort }),
  setDialog: (dialog) => set({ dialog }),
}));
