"use client";

import { useEffect, type PropsWithChildren } from "react";
import {
  useAccount,
  hydrateAccount,
} from "@/features/profile/stores/account-store";

export function AppearanceProvider({ children }: PropsWithChildren) {
  const { preferences } = useAccount();
  useEffect(() => {
    hydrateAccount();
    window.addEventListener("storage", hydrateAccount);
    return () => window.removeEventListener("storage", hydrateAccount);
  }, []);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    function applyTheme() {
      document.documentElement.classList.toggle(
        "dark",
        preferences.theme === "dark" ||
          (preferences.theme === "system" && media.matches),
      );
    }
    applyTheme();
    document.documentElement.dataset.showDots = String(preferences.showDots);
    document.documentElement.dataset.reduceMotion = String(
      preferences.reduceMotion,
    );
    media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, [preferences]);
  return children;
}
