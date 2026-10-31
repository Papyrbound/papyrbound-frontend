"use client";
import { create } from "zustand";
export const useSettingsUI = create<{
  page: string;
  font: string;
  spacing: string;
  interfaceSize: string;
  labels: boolean;
  resume: boolean;
  editing: boolean;
  patch: (
    v: Partial<{
      page: string;
      font: string;
      spacing: string;
      interfaceSize: string;
      labels: boolean;
      resume: boolean;
      editing: boolean;
    }>,
  ) => void;
}>((set) => ({
  page: "Paper",
  font: "Literata",
  spacing: "Comfortable",
  interfaceSize: "Default",
  labels: true,
  resume: true,
  editing: false,
  patch: (v) => set(v),
}));
