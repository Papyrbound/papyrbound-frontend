"use client";

import { useSettingsUI } from "../stores/settings-ui-store";
import { useEffect, type PropsWithChildren } from "react";
import {
  useAccount,
  hydrateAccount,
} from "@/features/profile/stores/account-store";

export function AppearanceProvider({ children }: PropsWithChildren) {
  const { preferences } = useAccount();
  const interfaceSize = useSettingsUI((s) => s.interfaceSize);
  useEffect(() => {
    document.documentElement.style.fontSize =
      interfaceSize === "Large"
        ? "18px"
        : interfaceSize === "Small"
          ? "15px"
          : "16px";
  }, [interfaceSize]);
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
