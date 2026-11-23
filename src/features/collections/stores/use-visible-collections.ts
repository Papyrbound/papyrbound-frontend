"use client";
import { useCollections } from "./collections-store";
import { useSettingsUI } from "@/features/profile/stores/settings-ui-store";
import { isDemoCollection } from "@/features/library/model/demo-data";
export function useVisibleCollections() {
  const state = useCollections();
  const showDemo = useSettingsUI((state) => state.showDemo);
  return { ...state, collections: state.collections.filter((item) => showDemo || !isDemoCollection(item)) };
}
