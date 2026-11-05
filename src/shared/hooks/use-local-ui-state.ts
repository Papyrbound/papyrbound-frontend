"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

type LocalState<T> = { value: T; setValue: Dispatch<SetStateAction<T>> };

// Each mounted dialog owns its store; closing it releases transient form state.
export function useLocalUIState<T>(): [
  T | undefined,
  Dispatch<SetStateAction<T | undefined>>,
];
export function useLocalUIState<T>(
  initial: T | (() => T),
): [T, Dispatch<SetStateAction<T>>];
export function useLocalUIState<T>(initial?: T | (() => T)) {
  const [store] = useState(() =>
    createStore<LocalState<T | undefined>>()((set) => ({
      value: typeof initial === "function" ? (initial as () => T)() : initial,
      setValue: (update) =>
        set((state) => ({
          value:
            typeof update === "function"
              ? (update as (value: T | undefined) => T | undefined)(state.value)
              : update,
        })),
    })),
  );
  const state = useStore(store);
  return [state.value, state.setValue];
}
