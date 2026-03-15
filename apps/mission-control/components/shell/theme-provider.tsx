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
      const isDark =
        t === "dark" ||
        (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      // Remove both first to prevent double class
      root.classList.remove("dark", "light");
      root.classList.add(isDark ? "dark" : "light");
    }

    applyTheme(theme);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme(theme);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  return <>{children}</>;
}
