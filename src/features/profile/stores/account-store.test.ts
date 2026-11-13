import assert from "node:assert/strict";
import { after, test } from "node:test";
import { hydrateAccount, updatePreferences, useAccount } from "./account-store";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const storage = new Map<string, string>();
Object.defineProperty(globalThis, "window", { configurable: true, value: {
  localStorage: { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value) },
  dispatchEvent: () => true,
} });
after(() => {
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else Reflect.deleteProperty(globalThis, "window");
});

test("new accounts persist creation time across hydration and preference changes", () => {
  storage.clear();
  const before = Date.now();
  hydrateAccount();
  const createdAt = useAccount.getState().createdAt;
  assert.ok(createdAt && Date.parse(createdAt) >= before && Date.parse(createdAt) <= Date.now());
  hydrateAccount();
  updatePreferences({ theme: "dark" });
  assert.equal(useAccount.getState().createdAt, createdAt);
  assert.equal(JSON.parse(storage.get("papyrbound-account-v1")!).createdAt, createdAt);
});

test("migration preserves an existing creation date and local profile", () => {
  storage.set("papyrbound-account-v1", JSON.stringify({ version: 1, createdAt: "2020-02-03T05:30:00Z", profile: { name: "Reader", bio: "Hello" }, preferences: { theme: "light" } }));
  hydrateAccount();
  assert.equal(useAccount.getState().createdAt, "2020-02-03T05:30:00.000Z");
  assert.equal(useAccount.getState().profile.name, "Reader");
  storage.set("papyrbound-account-v1", JSON.stringify({ version: 1, profile: { name: "Existing reader" }, preferences: { theme: "dark" } }));
  hydrateAccount();
  const migrated = JSON.parse(storage.get("papyrbound-account-v1")!);
  assert.ok(migrated.createdAt);
  assert.equal(migrated.profile.name, "Existing reader");
  assert.equal(migrated.preferences.theme, "dark");
  hydrateAccount();
  assert.equal(useAccount.getState().createdAt, migrated.createdAt);
});
