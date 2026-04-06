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
  /** Nav group keys that are manually collapsed by the user */
  collapsedNavGroups: string[];
  commandPaletteOpen: boolean;
  settings: AppSettings;
  /** Global active project — single source of truth for all pages */
  activeProjectId: string | null;
  toggleSidebar: () => void;
  toggleNavGroup: (group: string) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  setActiveProject: (projectId: string | null) => void;
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
      collapsedNavGroups: [],
      commandPaletteOpen: false,
      settings: defaultSettings,
      activeProjectId: null,
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      toggleNavGroup: (group) =>
        set((s) => ({
          collapsedNavGroups: s.collapsedNavGroups.includes(group)
            ? s.collapsedNavGroups.filter((g) => g !== group)
            : [...s.collapsedNavGroups, group],
        })),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      updateSettings: (patch) =>
        set((s) => {
          const VALID_THEMES: Theme[] = ['light', 'dark', 'system'];
          const safePatch = { ...patch };
          if (safePatch.theme !== undefined && !VALID_THEMES.includes(safePatch.theme)) {
            safePatch.theme = 'dark';
          }
          return { settings: { ...s.settings, ...safePatch } };
        }),
      setActiveProject: (projectId) => set({ activeProjectId: projectId }),
    }),
    {
      name: "mission-control-app",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        collapsedNavGroups: state.collapsedNavGroups,
        settings: state.settings,
        activeProjectId: state.activeProjectId,
      }),
    },
  ),
);
