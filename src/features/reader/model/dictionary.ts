export type DictionaryEntry = {
  word: string; partOfSpeech: string; pronunciations: string[];
  senses: { definition: string; examples: string[] }[];
};
export type DictionaryResult = { word: string; entries: DictionaryEntry[] };
type DictionaryShard = { entries: Record<string, DictionaryEntry[]>; forms: Record<string, string[]> };

/** Accept a single lexical word, preserving internal apostrophes and hyphens. */
export function dictionaryWord(selection: string) {
  const word = selection.normalize("NFC").trim().replace(/[’‘]/g, "'")
    .replace(/^[^\p{L}]+|[^\p{L}]+$/gu, "").toLowerCase();
  return word.length <= 80 && /^[\p{L}]+(?:['-][\p{L}]+)*$/u.test(word) ? word : "";
}
export function dictionaryCandidates(word: string) {
  const values = [word];
  if (word.endsWith("'s")) values.push(word.slice(0, -2));
  for (const [suffix, endings] of [["ies", ["y"]], ["es", ["", "e"]], ["s", [""]], ["ied", ["y"]], ["ed", ["", "e"]], ["ing", ["", "e"]], ["er", ["", "e"]], ["est", ["", "e"]]] as const) {
    if (!word.endsWith(suffix) || word.length <= suffix.length + 1) continue;
    const stem = word.slice(0, -suffix.length);
    values.push(...endings.map((ending) => stem + ending));
    if (["ed", "ing", "er", "est"].includes(suffix) && /([bcdfghjklmnpqrstvwxyz])\1$/.test(stem)) values.push(stem.slice(0, -1));
  }
  return [...new Set(values)];
}

const shards = new Map<string, Promise<DictionaryShard>>();
async function shard(word: string) {
  const key = /^[a-z]/.test(word) ? word[0] : "_";
  if (!shards.has(key)) {
    const request = fetch(`/dictionary/${key}.json`).then(async (response) => {
      if (!response.ok) throw new Error("The offline dictionary could not be loaded.");
      return response.json() as Promise<DictionaryShard>;
    }).catch((error) => { shards.delete(key); throw error; });
    shards.set(key, request);
  }
  return shards.get(key)!;
}

export async function lookupDictionary(selection: string): Promise<DictionaryResult> {
  const word = dictionaryWord(selection);
  if (!word) return { word: "", entries: [] };
  const candidates = dictionaryCandidates(word);
  const { isTauri, invoke } = await import("@tauri-apps/api/core");
  if (isTauri()) return invoke<DictionaryResult>("lookup_dictionary", { candidates });
  // Local bundled assets keep the browser preview equivalent to desktop lookup.
  for (const candidate of candidates) {
    const data = await shard(candidate);
    const direct = Object.hasOwn(data.entries, candidate) ? data.entries[candidate] : undefined;
    if (direct) return { word: candidate, entries: direct };
    for (const lemma of Object.hasOwn(data.forms, candidate) ? data.forms[candidate] : []) {
      const base = await shard(lemma);
      if (Object.hasOwn(base.entries, lemma)) return { word: lemma, entries: base.entries[lemma] };
    }
  }
  return { word, entries: [] };
}
