import assert from "node:assert/strict";
import { test } from "node:test";
import { fileLocation } from "./file-location";
import { sampleBooks } from "@/features/home/model/sample-books";

test("locations show actual native paths, including Windows drive and network paths", () => {
  const book = sampleBooks[0];
  assert.equal(fileLocation({ ...book, sourcePath: "C:\\Books\\story.epub" }), "C:\\Books\\story.epub");
  assert.equal(fileLocation({ ...book, sourcePath: "\\\\?\\C:\\Books\\story.epub" }), "C:\\Books\\story.epub");
  assert.equal(fileLocation({ ...book, sourcePath: "\\\\?\\UNC\\server\\share\\story.epub" }), "\\\\server\\share\\story.epub");
  assert.equal(fileLocation({ ...book, sourcePath: "/home/reader/story.epub" }), "/home/reader/story.epub");
  assert.equal(fileLocation({ ...book, sourceName: "story.epub" }), "story.epub");
  assert.equal(fileLocation(book), "Original path unavailable");
});
