import type { LLMProvider } from "@/types";
import {
  Brain, ClipboardList, Hammer, Server, Monitor, Palette, Search,
  Rocket, Shield, FlaskConical, MessageCircle, Bot, Mail, Wrench,
  Image, FileText,
  type LucideIcon,
} from "lucide-react";

export const fetcher = (url: string) => fetch(url).then((r) => r.json());

// ── Agent Lucide icon map ──
export const agentIconMap: Record<string, LucideIcon> = {
  orchestrator: Brain,
  "pm-agent": ClipboardList,
  "architect-agent": Hammer,
  "backend-agent": Server,
  "frontend-agent": Monitor,
  "designer-agent": Palette,
  "qa-agent": Search,
  "devops-agent": Rocket,
  "cyber-agent": Shield,
  "research-agent": FlaskConical,
  "michael-personal-bot": MessageCircle,
  assistant: Bot,
  email: Mail,
  calendar: Mail,
  "tech-support": Wrench,
  herald: Image,
  profile: FileText,
  avatar: Image,
};

export function getAgentLucideIcon(name: string): LucideIcon {
  const key = name.toLowerCase().replace(/\s+/g, "-");
  if (agentIconMap[key]) return agentIconMap[key];
  for (const [k, v] of Object.entries(agentIconMap)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return Bot;
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
