"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/stores/app-store";

/**
 * Reads the `theme` setting from the Zustand store and applies
 * the appropriate class to <html>. Must be rendered inside the
 * client boundary (shell layout or root layout via a client wrapper).
 */
export function ThemeProvider({ children }: { children?: React.ReactNode }) {
  const theme = useAppStore((s) => s.settings.theme);

  useEffect(() => {
    const root = document.documentElement;

    function applyTheme(t: "light" | "dark" | "system") {
      if (t === "system") {
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;
        root.classList.toggle("dark", prefersDark);
        root.classList.toggle("light", !prefersDark);
      } else {
        root.classList.toggle("dark", t === "dark");
        root.classList.toggle("light", t === "light");
      }
    }

    applyTheme(theme);

    // Re-apply when system preference changes (only relevant in "system" mode)
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") applyTheme("system");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  return <>{children}</>;
}
