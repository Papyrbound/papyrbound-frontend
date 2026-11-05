"use client";

import { create } from "zustand";
import {
  localProfile,
  type LocalProfile,
} from "@/features/profile/model/profile";

export type Preferences = {
  theme: "system" | "light" | "dark";
  showDots: boolean;
  reduceMotion: boolean;
};
type Account = { version: 1; profile: LocalProfile; preferences: Preferences };
const storageKey = "papyrbound-account-v1";
const changeEvent = "papyrbound-account-change";
const defaults: Account = {
  version: 1,
  profile: localProfile,
  preferences: { theme: "system", showDots: true, reduceMotion: false },
};
let cachedRaw: string | null | undefined;
let cachedAccount = defaults;

function getSnapshot(): Account {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedAccount = defaults;
      if (raw) {
        const data = JSON.parse(raw);
        if (data?.version === 1) {
          const profile = data.profile;
          const preferences = data.preferences;
          cachedAccount = {
            version: 1,
            profile: {
              ...localProfile,
              name:
                typeof profile?.name === "string" && profile.name.trim()
                  ? profile.name.trim().slice(0, 60)
                  : localProfile.name,
              title:
                typeof profile?.title === "string"
                  ? profile.title.slice(0, 60)
                  : localProfile.title,
              bio:
                typeof profile?.bio === "string"
                  ? profile.bio.slice(0, 60)
                  : "",
              avatarSeed:
                typeof profile?.avatarSeed === "string" && profile.avatarSeed
                  ? profile.avatarSeed.slice(0, 100)
                  : localProfile.avatarSeed,
            },
            preferences: {
              theme: ["light", "dark", "system"].includes(preferences?.theme)
                ? preferences.theme
                : "system",
              showDots:
                typeof preferences?.showDots === "boolean"
                  ? preferences.showDots
                  : true,
              reduceMotion: preferences?.reduceMotion === true,
            },
          };
        }
      }
    }
  } catch {
    /* Unavailable or malformed storage falls back to this session. */
  }
  return cachedAccount;
}

export const useAccount = create<Account>(() => defaults);
export function hydrateAccount() {
  useAccount.setState(getSnapshot(), true);
}

export function updateAccount(update: (current: Account) => Account) {
  const next = update(getSnapshot());
  let persisted = false;
  try {
    const raw = JSON.stringify(next);
    window.localStorage.setItem(storageKey, raw);
    cachedRaw = raw;
    persisted = true;
  } catch {
    /* Keep changes usable in memory when storage is blocked. */
  }
  cachedAccount = next;
  useAccount.setState(next, true);
  window.dispatchEvent(new Event(changeEvent));
  return persisted;
}

export function updatePreferences(details: Partial<Preferences>) {
  return updateAccount((current) => ({
    ...current,
    preferences: { ...current.preferences, ...details },
  }));
}
