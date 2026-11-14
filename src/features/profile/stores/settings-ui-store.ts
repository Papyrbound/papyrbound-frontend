"use client";
import { create } from "zustand";
import { isRecord, readDeviceValue, subscribeDeviceState } from "@/shared/lib/device-storage";
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";
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

export function startSettingsPersistence() {
  const select = ({ page, font, spacing, interfaceSize, labels, resume }: ReturnType<typeof useSettingsUI.getState>) => ({ page, font, spacing, interfaceSize, labels, resume });
  const report = (storageError: string) => useReadingLists.setState({ storageError });
  const saved = readDeviceValue("papyrbound-reading-settings-v1", (value): value is ReturnType<typeof select> =>
    isRecord(value) && ["White", "Paper", "Dark"].includes(String(value.page)) &&
    ["Literata", "Sans serif"].includes(String(value.font)) && ["Compact", "Comfortable", "Spacious"].includes(String(value.spacing)) &&
    ["Small", "Default", "Large"].includes(String(value.interfaceSize)) && typeof value.labels === "boolean" && typeof value.resume === "boolean", report);
  if (saved) useSettingsUI.setState(saved);
  return subscribeDeviceState(useSettingsUI, "papyrbound-reading-settings-v1", select, report);
}
