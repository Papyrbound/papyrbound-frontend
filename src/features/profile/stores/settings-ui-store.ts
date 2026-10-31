"use client";
import { create } from "zustand";
export const useSettingsUI = create<{
  page: string;
  font: string;
  spacing: string;
  resume: boolean;
  editing: boolean;
  patch: (
    v: Partial<{
      page: string;
      font: string;
      spacing: string;
      resume: boolean;
      editing: boolean;
    }>,
  ) => void;
}>((set) => ({
  page: "Paper",
  font: "Literata",
  spacing: "Comfortable",
  resume: true,
  editing: false,
  patch: (v) => set(v),
}));
