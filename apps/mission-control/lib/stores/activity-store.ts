"use client";

import { create } from "zustand";

export type ActivityType =
  | "kb_read"
  | "kb_write"
  | "kb_search"
  | "contract_load"
  | "contract_validate"
  | "simulation"
  | "replan"
  | "skill"
  | "agent"
  | "routing"
  | "system";

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  icon: string;
  label: string;
  detail?: string;
  timestamp: string;
}

interface ActivityState {
  events: ActivityEvent[];
  visible: boolean;
  addEvent: (type: ActivityType, label: string, detail?: string) => void;
  toggleVisible: () => void;
  clear: () => void;
}

const ICONS: Record<ActivityType, string> = {
  kb_read: "\u{1F9E0}",      // 🧠
  kb_write: "\u{1F4DD}",     // 📝
  kb_search: "\u{1F50D}",    // 🔍
  contract_load: "\u{1F4CB}", // 📋
  contract_validate: "\u{2705}", // ✅
  simulation: "\u{1F52E}",   // 🔮
  replan: "\u{1F504}",       // 🔄
  skill: "\u{26A1}",         // ⚡
  agent: "\u{1F916}",        // 🤖
  routing: "\u{1F6E4}",      // 🛤️
  system: "\u{2699}",        // ⚙️
};

const MAX_EVENTS = 100;

export const useActivityStore = create<ActivityState>()((set) => ({
  events: [],
  visible: false,

  addEvent: (type, label, detail) =>
    set((s) => ({
      events: [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type,
          icon: ICONS[type],
          label,
          detail,
          timestamp: new Date().toISOString(),
        },
        ...s.events,
      ].slice(0, MAX_EVENTS),
    })),

  toggleVisible: () => set((s) => ({ visible: !s.visible })),
  clear: () => set({ events: [] }),
}));

/**
 * Global helper — call from anywhere (client-side) to log an activity event.
 * Non-reactive, fire-and-forget.
 */
export function logActivity(type: ActivityType, label: string, detail?: string) {
  useActivityStore.getState().addEvent(type, label, detail);
}
