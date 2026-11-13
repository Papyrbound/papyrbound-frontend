"use client";

import { create } from "zustand";
import { isStoredProfileBanner, isStoredProfilePhoto } from "../model/profile-banner";
import {
  localProfile,
  type LocalProfile,
} from "@/features/profile/model/profile";

export type Preferences = {
  theme: "system" | "light" | "dark";
  showDots: boolean;
  reduceMotion: boolean;
};
type Account = { version: 1; createdAt: string | null; profile: LocalProfile; preferences: Preferences };
const storageKey = "papyrbound-account-v1";
const changeEvent = "papyrbound-account-change";
const defaults: Account = {
  version: 1,
  createdAt: null,
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
      cachedAccount = { ...defaults, createdAt: new Date().toISOString() };
      let needsMigration = true;
      if (raw) {
        let data;
        try { data = JSON.parse(raw); } catch { /* Reinitialize malformed storage. */ }
        if (data?.version === 1) {
          const createdAt = typeof data.createdAt === "string" ? Date.parse(data.createdAt) : NaN;
          const validCreatedAt = Number.isFinite(createdAt) && createdAt <= Date.now();
          needsMigration = !validCreatedAt;
          const profile = data.profile;
          const preferences = data.preferences;
          cachedAccount = {
            version: 1,
            createdAt: validCreatedAt ? new Date(createdAt).toISOString() : cachedAccount.createdAt,
            profile: {
              ...localProfile,
              avatarUrl: isStoredProfilePhoto(profile?.avatarUrl) ? profile.avatarUrl : undefined,
              banner: profile?.banner === null
                ? null
                : isStoredProfileBanner(profile?.banner)
                  ? profile.banner
                  : localProfile.banner,
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
      if (needsMigration) {
        const migrated = JSON.stringify(cachedAccount);
        window.localStorage.setItem(storageKey, migrated);
        cachedRaw = migrated;
      }
    }
  } catch {
    /* Unavailable or malformed storage falls back to this session. */
    if (!cachedAccount.createdAt) cachedAccount = { ...cachedAccount, createdAt: new Date().toISOString() };
  }
  return cachedAccount;
}

export const useAccount = create<Account>(() => defaults);
export function hydrateAccount() {
  useAccount.setState(getSnapshot(), true);
}

export function updateAccount(update: (current: Account) => Account) {
  const current = getSnapshot();
  const next = { ...update(current), createdAt: current.createdAt };
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
