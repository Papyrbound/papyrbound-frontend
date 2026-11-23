"use client";
import { create } from "zustand";
import { isRecord, readDeviceValue, subscribeDeviceState } from "@/shared/lib/device-storage";
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";
import { defaultReaderPreferences, validReaderPreferences, type ReaderPreferences } from "@/features/reader/model/reader-preferences";
export const useSettingsUI = create<{
  reader: ReaderPreferences;
  page: string;
  font: string;
  spacing: string;
  interfaceSize: string;
  labels: boolean;
  resume: boolean;
  editing: boolean;
  patch: (
    v: Partial<{
      reader: ReaderPreferences;
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
  reader: defaultReaderPreferences,
  page: "Paper",
  font: "Georgia",
  spacing: "Comfortable",
  interfaceSize: "Default",
  labels: true,
  resume: true,
  editing: false,
  patch: (v) => set(v),
}));

export function startSettingsPersistence() {
  const select = ({ page, font, spacing, interfaceSize, labels, resume, reader }: ReturnType<typeof useSettingsUI.getState>) => ({ page, font, spacing, interfaceSize, labels, resume, reader });
  const report = (storageError: string) => useReadingLists.setState({ storageError });
  const saved = readDeviceValue("papyrbound-reading-settings-v1", (value): value is ReturnType<typeof select> =>
    isRecord(value) && ["White", "Paper", "Dark"].includes(String(value.page)) &&
    ["Literata", "Georgia", "Sans serif"].includes(String(value.font)) && (value.reader === undefined || validReaderPreferences(value.reader)) && ["Compact", "Comfortable", "Spacious"].includes(String(value.spacing)) &&
    ["Small", "Default", "Large"].includes(String(value.interfaceSize)) && typeof value.labels === "boolean" && typeof value.resume === "boolean", report);
  if (saved) useSettingsUI.setState({ ...saved, font: saved.font === "Literata" ? "Georgia" : saved.font, reader: saved.reader ?? defaultReaderPreferences });
  return subscribeDeviceState(useSettingsUI, "papyrbound-reading-settings-v1", select, report);
}
