"use client";

import { Toaster } from "sonner";
import { useAppStore } from "@/lib/stores/app-store";
import type { ToastPosition } from "@/lib/stores/app-store";

// Sonner accepts the same position strings we use in the store
type SonnerPosition = ToastPosition;

/**
 * A Toaster that reads its position from the Zustand app settings,
 * so the user's toast-position preference is respected at runtime.
 */
export function DynamicToaster() {
  const toastPosition = useAppStore(
    (s) => s.settings.toastPosition,
  ) as SonnerPosition;

  return (
    <Toaster
      theme="dark"
      position={toastPosition}
      toastOptions={{
        style: {
          background: "#11111a",
          border: "1px solid #1e1e2e",
          color: "#e2e8f0",
        },
      }}
    />
  );
}
