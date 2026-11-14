import type { StoreApi } from "zustand/vanilla";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function readDeviceValue<T>(key: string, validate: (value: unknown) => value is T, onError: (message: string) => void): T | undefined {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return;
    const saved: unknown = JSON.parse(raw);
    if (!isRecord(saved) || saved.version !== 1 || !validate(saved.data)) {
      onError("Some saved app data could not be restored. Your original imported files are unchanged.");
      return;
    }
    return saved.data;
  } catch {
    onError("Device storage is unavailable. Changes will only last for this session.");
  }
}

export function subscribeDeviceState<S, D>(store: StoreApi<S>, key: string, select: (state: S) => D, onError: (message: string) => void) {
  let previous = JSON.stringify(select(store.getState()));
  return store.subscribe((state) => {
    const next = JSON.stringify(select(state));
    if (next === previous) return;
    // Update before reporting an error, since the error handler can update a store too.
    previous = next;
    try {
      window.localStorage.setItem(key, JSON.stringify({ version: 1, data: JSON.parse(next) }));
    } catch {
      onError("Could not save changes on this device. Free some storage before closing the app.");
    }
  });
}
