export type ReaderPreferences = { fontSize: number; zoom: number; fit: "width" | "page"; spread: boolean; direction: "ltr" | "rtl"; measure?: "Narrow" | "Comfortable" | "Wide"; margins?: "Narrow" | "Comfortable" | "Wide" };
export const defaultReaderPreferences: ReaderPreferences = { fontSize: 20, zoom: 1, fit: "width", spread: false, direction: "ltr", measure: "Comfortable", margins: "Comfortable" };

/** Reading surfaces are independent of the surrounding application's theme. */
export function readerSurface(page: string) {
  if (page === "Dark") return { background: "#242424", foreground: "#e5e5e5", muted: "#aaaaaa" };
  if (page === "White") return { background: "#ffffff", foreground: "#343434", muted: "#6b6b6b" };
  return { background: "#f3f0e7", foreground: "#343434", muted: "#69665f" };
}
export function validReaderPreferences(value: unknown): value is ReaderPreferences {
  if (!value || typeof value !== "object") return false;
  const item = value as ReaderPreferences;
  return Number.isInteger(item.fontSize) && item.fontSize >= 14 && item.fontSize <= 32 &&
    Number.isFinite(item.zoom) && item.zoom >= 0.5 && item.zoom <= 2 && (item.fit === "width" || item.fit === "page") &&
    typeof item.spread === "boolean" && (item.direction === "ltr" || item.direction === "rtl") &&
    (item.measure === undefined || ["Narrow", "Comfortable", "Wide"].includes(item.measure)) &&
    (item.margins === undefined || ["Narrow", "Comfortable", "Wide"].includes(item.margins));
}
