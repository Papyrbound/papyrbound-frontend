"use client";

import { create } from "zustand";
import { isRecord, readDeviceValue, subscribeDeviceState } from "@/shared/lib/device-storage";

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
  setLibraryKind: (libraryKind) => set((state) => state.libraryKind === libraryKind ? {} : { libraryKind, selectedId: null, dialog: null, query: "" }),
  selectBook: (selectedId) => set({ selectedId, panelOpen: true }),
  setPanelOpen: (panelOpen) => set({ panelOpen }),
  setView: (view) => set({ view }),
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
