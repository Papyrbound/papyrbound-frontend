import assert from "node:assert/strict";
import { test } from "node:test";
import { startSettingsPersistence, useSettingsUI } from "./settings-ui-store";
import { defaultReaderPreferences, validReaderPreferences } from "@/features/reader/model/reader-preferences";
test("legacy settings migrate and reader preferences survive reload", () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "window");
  const data = new Map<string, string>();
  Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => data.set(key, value) } } });
  const legacy = { page: "Paper", font: "Literata", spacing: "Comfortable", interfaceSize: "Default", labels: true, resume: true };
  data.set("papyrbound-reading-settings-v1", JSON.stringify({ version: 1, data: legacy }));
  const stop = startSettingsPersistence();
  assert.equal(useSettingsUI.getState().font, "Georgia");
  assert.deepEqual(useSettingsUI.getState().reader, defaultReaderPreferences);
  const reader = { ...defaultReaderPreferences, fontSize: 28, zoom: 1.5, measure: "Wide" as const, margins: "Narrow" as const };
  useSettingsUI.getState().patch({ reader }); stop();
  useSettingsUI.setState({ reader: defaultReaderPreferences });
  const stopAgain = startSettingsPersistence();
  assert.deepEqual(useSettingsUI.getState().reader, reader);
  assert.equal(validReaderPreferences({ ...reader, zoom: 100 }), false);
  assert.equal(validReaderPreferences({ ...reader, fontSize: -1 }), false);
  assert.equal(validReaderPreferences({ ...reader, measure: "Huge" }), false);
  assert.equal(validReaderPreferences({ ...reader, margins: -1 }), false);
  // Backups made before layout preferences were added remain valid.
  assert.equal(validReaderPreferences({ fontSize: 20, zoom: 1, fit: "width", spread: false, direction: "ltr" }), true);
  stopAgain();
  if (previous) Object.defineProperty(globalThis, "window", previous); else Reflect.deleteProperty(globalThis, "window");
});
