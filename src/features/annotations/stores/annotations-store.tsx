"use client";
import { create } from "zustand";
import { useEffect, type Dispatch, type SetStateAction, type PropsWithChildren } from "react";
import { isRecord, readDeviceValue, subscribeDeviceState } from "@/shared/lib/device-storage";
import { useReadingLists } from "@/features/reading-lists/stores/reading-lists-store";
import {
  sampleAnnotations,
  annotationColors,
  type Annotation,
} from "@/features/annotations/model/annotation";
export const useAnnotations = create<{
  annotations: Annotation[];
  setAnnotations: Dispatch<SetStateAction<Annotation[]>>;
}>((set) => ({
  annotations: sampleAnnotations,
  setAnnotations: (update) =>
    set((s) => ({
      annotations:
        typeof update === "function" ? update(s.annotations) : update,
    })),
}));
export function AnnotationsProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    const report = (storageError: string) => useReadingLists.setState({ storageError });
    const saved = readDeviceValue("papyrbound-annotations-v1", (value): value is Annotation[] => Array.isArray(value) && value.every((item) =>
      isRecord(item) && typeof item.id === "string" && typeof item.bookId === "string" && typeof item.content === "string" &&
      typeof item.note === "string" && (item.kind === "note" || item.kind === "highlight") &&
      typeof item.color === "string" && Object.hasOwn(annotationColors, item.color) && typeof item.createdAt === "string" && typeof item.starred === "boolean"), report);
    if (saved) useAnnotations.setState({ annotations: saved });
    return subscribeDeviceState(useAnnotations, "papyrbound-annotations-v1", (state) => state.annotations, report);
  }, []);
  return children;
}
