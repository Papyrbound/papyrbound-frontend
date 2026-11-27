import type { Annotation } from "./annotation";

/** The same word elsewhere in a book is a different passage. */
function passageKey(item: Annotation) {
  const location = item.location;
  if (item.kind !== "highlight" || item.bookmark || location?.start === undefined || location.end === undefined) return;
  const quote = location.quote ?? item.content;
  const left = quote.length - quote.trimStart().length;
  const right = quote.length - quote.trimEnd().length;
  const matchesRange = quote.length === location.end - location.start;
  return JSON.stringify([item.bookId, location.path, location.start + (matchesRange ? left : 0), location.end - (matchesRange ? right : 0)]);
}

/** Attach notes to their highlight, including older duplicate records, without
 * discarding distinct note text or resetting the original identity and colour. */
export function mergePassageAnnotations(items: Annotation[]) {
  const seen = new Map<string, number>();
  const result: Annotation[] = [];
  let changed = false;
  for (const item of items) {
    const key = passageKey(item);
    const index = key === undefined ? undefined : seen.get(key);
    if (index === undefined) {
      if (key !== undefined) seen.set(key, result.length);
      result.push(item);
      continue;
    }
    const previous = result[index];
    const notes = [...new Set([previous.note.trim(), item.note.trim()].filter(Boolean))];
    result[index] = { ...previous, note: notes.join("\n\n"), starred: previous.starred || item.starred };
    changed = true;
  }
  return changed ? result : items;
}
