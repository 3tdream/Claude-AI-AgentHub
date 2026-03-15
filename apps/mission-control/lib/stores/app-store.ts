"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ExecutionMode } from "@/types";

export type Theme = "light" | "dark" | "system";
export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface AppSettings {
  theme: Theme;
  toastPosition: ToastPosition;
  soundEnabled: boolean;
  defaultExecutionMode: ExecutionMode;
  defaultProjectContext: string;
}

interface AppState {
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  settings: AppSettings;
  toggleSidebar: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
}

const defaultSettings: AppSettings = {
  theme: "system",
  toastPosition: "bottom-right",
  soundEnabled: false,
  defaultExecutionMode: "medium",
  defaultProjectContext: "",
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      settings: defaultSettings,
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),
    }),
    {
      name: "mission-control-app",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        settings: state.settings,
      }),
    },
  ),
);
