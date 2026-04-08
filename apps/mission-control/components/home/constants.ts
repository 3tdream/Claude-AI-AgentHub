import type { LLMProvider } from "@/types";

export const fetcher = (url: string) => fetch(url).then((r) => r.json());

// ── Agent icon map ──
export const agentIcons: Record<string, string> = {
  orchestrator: "\u{1F9E0}",
  "pm-agent": "\u{1F4CB}",
  "architect-agent": "\u{1F3D7}\uFE0F",
  "backend-agent": "\u2699\uFE0F",
  "frontend-agent": "\u{1F5A5}\uFE0F",
  "designer-agent": "\u{1F3A8}",
  "qa-agent": "\u{1F50D}",
  "devops-agent": "\u{1F680}",
  "cyber-agent": "\u{1F6E1}\uFE0F",
  "research-agent": "\u{1F52C}",
  "michael-personal-bot": "\u{1F4AC}",
  assistant: "\u{1F916}",
  "email": "\u{1F4E7}",
  "calendar": "\u{1F4E7}",
  "tech-support": "\u{1F527}",
  "herald": "\u{1F5BC}\uFE0F",
  "profile": "\u{1F4DD}",
  "avatar": "\u{1F5BC}\uFE0F",
};

export function getAgentIcon(name: string): string {
  const key = name.toLowerCase().replace(/\s+/g, "-");
  if (agentIcons[key]) return agentIcons[key];
  for (const [k, v] of Object.entries(agentIcons)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return "\u{1F916}";
}

export const PROVIDERS: LLMProvider[] = ["anthropic", "openai", "google", "openrouter"];

// ── Provider badge colors ──
export const providerColors: Record<string, string> = {
  anthropic: "text-orange-700 bg-orange-50 border-orange-200",
  openai: "text-emerald-700 bg-emerald-50 border-emerald-200",
  google: "text-blue-700 bg-blue-50 border-blue-200",
  openrouter: "text-violet-700 bg-violet-50 border-violet-200",
};

// ── Shared status color helpers ──
export function getSuccessRateColor(rate: number): string {
  if (rate >= 70) return "bg-emerald-500";
  if (rate >= 40) return "bg-amber-500";
  if (rate > 0) return "bg-rose-400";
  return "bg-slate-300";
}

export type AgentStatus = "active" | "busy" | "idle";

export function getAgentStatus(successRate: number, hasStats: boolean): AgentStatus {
  if (!hasStats) return "idle";
  if (successRate > 70) return "active";
  if (successRate > 40) return "busy";
  return "idle";
}

export const agentStatusConfig: Record<AgentStatus, { color: string; bg: string }> = {
  active: { color: "text-emerald-700", bg: "bg-emerald-50" },
  busy: { color: "text-amber-700", bg: "bg-amber-50" },
  idle: { color: "text-slate-500", bg: "bg-slate-100" },
};
