"""Build the bundled offline index from the official OEWN 2025 JSON export.

Usage: python scripts/build-dictionary.py [path/to/english-wordnet-2025-json.zip]
Data license: CC BY 4.0. See public/dictionary/NOTICE.txt.
"""
import hashlib
import io
import json
from pathlib import Path
import string
import sys
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parents[1]
URL = "https://en-word.net/downloads/english-wordnet-2025-json.zip"
data = Path(sys.argv[1]).read_bytes() if len(sys.argv) > 1 else urllib.request.urlopen(URL).read()
archive = zipfile.ZipFile(io.BytesIO(data))
synsets = {}
for name in archive.namelist():
    if name.endswith(".json") and not name.startswith("entries-"):
        synsets.update(json.loads(archive.read(name)))
keys = string.ascii_lowercase + "_"
shards = {key: {"entries": {}, "forms": {}} for key in keys}
def shard(word):
    return shards[word[0] if word[0] in string.ascii_lowercase else "_"]
parts = {"n": "noun", "v": "verb", "a": "adjective", "s": "adjective", "r": "adverb"}
for name in archive.namelist():
    if not name.startswith("entries-") or not name.endswith(".json"):
        continue
    for word, entries in json.loads(archive.read(name)).items():
        key = word.lower()
        for pos, entry in entries.items():
            senses = []
            for sense in entry.get("sense", []):
                synset = synsets[sense["synset"]]
                examples = synset.get("example", []) or sense.get("sent", [])
                examples = [example if isinstance(example, str) else example["text"] for example in examples]
                for definition in synset.get("definition", []):
                    senses.append({"definition": definition, "examples": examples[:2]})
            if senses:
                shard(key)["entries"].setdefault(key, []).append({
                    "word": word, "partOfSpeech": parts.get(pos, pos),
                    "pronunciations": list(dict.fromkeys(p["value"] for p in entry.get("pronunciation", []))),
                    "senses": senses,
                })
            for form in entry.get("form", []):
                form = form.lower()
                if form:
                    values = shard(form)["forms"].setdefault(form, [])
                    if key not in values:
                        values.append(key)
out = ROOT / "public/dictionary"
out.mkdir(parents=True, exist_ok=True)
for key, value in shards.items():
    (out / f"{key}.json").write_text(json.dumps(value, ensure_ascii=False, separators=(",", ":"), sort_keys=True), encoding="utf-8")
metadata = {"source": URL, "version": "2025", "sha256": hashlib.sha256(data).hexdigest(),
            "entries": sum(len(s["entries"]) for s in shards.values()), "license": "CC BY 4.0"}
(out / "metadata.json").write_text(json.dumps(metadata, indent=2) + "\n", encoding="utf-8")
print(metadata)
