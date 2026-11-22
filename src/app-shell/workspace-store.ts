"use client";

import { create } from "zustand";
import { isRecord, readDeviceValue, subscribeDeviceState } from "@/shared/lib/device-storage";

type View = "grid" | "list";
type WorkspaceState = {
  libraryKind: "books" | "comics";
  selectedId: string | null;
  readerId: string | null;
  panelOpen: boolean;
  view: View;
  selectionMode: boolean;
  selectedIds: string[];
  query: string;
  filter: string;
  sort: string;
  dialog: "synopsis" | "collections" | "delete" | "edit" | "reader" | null;
  setLibraryKind: (kind: WorkspaceState["libraryKind"]) => void;
  selectBook: (id: string) => void;
  openReader: (id: string) => void;
  revealBook: (id: string) => void;
  setPanelOpen: (open: boolean) => void;
  setView: (view: View) => void;
  setSelectionMode: (enabled: boolean) => void;
  toggleSelection: (id: string) => void;
  setQuery: (query: string) => void;
  setFilter: (filter: string) => void;
  setSort: (sort: string) => void;
  setDialog: (dialog: WorkspaceState["dialog"]) => void;
};

export const useWorkspace = create<WorkspaceState>((set) => ({
  libraryKind: "books",
  selectedId: null,
  readerId: null,
  panelOpen: true,
  view: "grid",
  selectionMode: false,
  selectedIds: [],
  query: "",
  filter: "all",
  sort: "recent",
  dialog: null,
  setLibraryKind: (libraryKind) => set((state) => state.libraryKind === libraryKind ? {} : { libraryKind, selectedId: null, dialog: null, query: "", selectionMode: false, selectedIds: [] }),
  selectBook: (selectedId) => set({ selectedId, panelOpen: true }),
  openReader: (readerId) => set({ readerId, selectedId: readerId, dialog: "reader", selectionMode: false, selectedIds: [] }),
  revealBook: (selectedId) => set({ selectedId, panelOpen: true, filter: "all", query: "", dialog: null, selectionMode: false, selectedIds: [] }),
  setPanelOpen: (panelOpen) => set({ panelOpen }),
  setView: (view) => set({ view }),
  setSelectionMode: (selectionMode) => set({ selectionMode, selectedIds: [] }),
  toggleSelection: (id) => set((state) => ({ selectionMode: true, selectedIds: state.selectedIds.includes(id) ? state.selectedIds.filter((item) => item !== id) : [...state.selectedIds, id] })),
  setQuery: (query) => set({ query }),
  setFilter: (filter) => set({ filter }),
  setSort: (sort) => set({ sort }),
  setDialog: (dialog) => set({ dialog }),
}));

export function startWorkspacePersistence(onError: (message: string) => void) {
  const select = ({ libraryKind, view, panelOpen }: WorkspaceState) => ({ libraryKind, view, panelOpen });
  const saved = readDeviceValue("papyrbound-workspace-v1", (value): value is ReturnType<typeof select> => isRecord(value) &&
    (value.libraryKind === "books" || value.libraryKind === "comics") && (value.view === "grid" || value.view === "list") && typeof value.panelOpen === "boolean", onError);
  if (saved) useWorkspace.setState(saved);
  return subscribeDeviceState(useWorkspace, "papyrbound-workspace-v1", select, onError);
}
