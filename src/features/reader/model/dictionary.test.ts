import assert from "node:assert/strict";
import { after, test } from "node:test";
import { readFile } from "node:fs/promises";
import { dictionaryWord, dictionaryCandidates, lookupDictionary } from "./dictionary";

const originalFetch = globalThis.fetch;
globalThis.fetch = async (url) => {
  assert.match(String(url), /^\/dictionary\/[a-z_]\.json$/);
  return new Response(await readFile(new URL(`../../../../public${url}`, import.meta.url)), { status: 200 });
};
after(() => { globalThis.fetch = originalFetch; });

test("dictionary selection accepts a single word and rejects passages and unsafe input", () => {
  assert.equal(dictionaryWord(' “Walking,” '), "walking");
  assert.equal(dictionaryWord("reader’s"), "reader's");
  assert.equal(dictionaryWord("well-known"), "well-known");
  for (const input of ["", "two words", "<script>alert(1)</script>", "x".repeat(81), "1234"]) assert.equal(dictionaryWord(input), "");
  assert.ok(dictionaryCandidates("running").includes("run"));
  assert.ok(dictionaryCandidates("stories").includes("story"));
  assert.ok(dictionaryCandidates("reader's").includes("reader"));
});

test("bundled dictionary resolves definitions, examples, pronunciation and irregular forms", async () => {
  const paper = await lookupDictionary("paper");
  assert.equal(paper.word, "paper");
  assert.ok(paper.entries.length);
  assert.ok(paper.entries.some((entry) => entry.pronunciations.length));
  assert.ok(paper.entries.some((entry) => entry.senses.some((sense) => sense.examples.length)));
  assert.equal((await lookupDictionary("went")).word, "go");
  assert.equal((await lookupDictionary("running")).entries.length > 0, true);
  assert.equal((await lookupDictionary("zznotawordzz")).entries.length, 0);
  assert.equal((await lookupDictionary("two words")).entries.length, 0);
});

