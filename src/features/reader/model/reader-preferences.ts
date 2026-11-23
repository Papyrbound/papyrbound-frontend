export type ReaderPreferences = { fontSize: number; zoom: number; fit: "width" | "page"; spread: boolean; direction: "ltr" | "rtl" };
export const defaultReaderPreferences: ReaderPreferences = { fontSize: 20, zoom: 1, fit: "width", spread: false, direction: "ltr" };
export function validReaderPreferences(value: unknown): value is ReaderPreferences {
  if (!value || typeof value !== "object") return false;
  const item = value as ReaderPreferences;
  return Number.isInteger(item.fontSize) && item.fontSize >= 14 && item.fontSize <= 32 &&
    Number.isFinite(item.zoom) && item.zoom >= 0.5 && item.zoom <= 2 && (item.fit === "width" || item.fit === "page") &&
    typeof item.spread === "boolean" && (item.direction === "ltr" || item.direction === "rtl");
}
