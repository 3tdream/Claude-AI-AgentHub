"use client";

import { useState, useEffect } from "react";
import {
  FolderOpen,
  Brain,
  Shield,
  AlertTriangle,
  Lightbulb,
  Ban,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Loader2,
  Server,
  Globe,
  Smartphone,
  Gamepad2,
  Video,
  MessageSquare,
  Bot,
  FileCode,
  Cuboid,
  Siren,
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Project catalog ---

interface Project {
  id: string;
  name: string;
  description: string;
  stack: string;
  status: "production" | "wip" | "skeleton";
  icon: React.ElementType;
  files: number;
  tags: string[];
}

const projects: Project[] = [
  { id: "mission-control", name: "Mission Control", description: "Agent orchestration dashboard with pipeline, Jira sync, analytics", stack: "Next.js 15.5 + SWR + Zustand", status: "production", icon: Bot, files: 110, tags: ["ai", "dashboard", "jira"] },
  { id: "sb", name: "SingularityBridge", description: "AI agent management platform — backend API + chat UI", stack: "Express + MongoDB + React + Vite", status: "production", icon: Server, files: 529, tags: ["ai", "backend", "full-stack"] },
  { id: "echo", name: "Echo", description: "AI video creation platform with character consistency", stack: "Next.js 15.5 + Fal.ai + FFmpeg", status: "production", icon: Video, files: 169, tags: ["ai", "video", "creative"] },
  { id: "concierge-ai", name: "Concierge AI", description: "Voice chat concierge for property management", stack: "Next.js 16 + VAPI + Twilio + Leaflet", status: "production", icon: MessageSquare, files: 216, tags: ["voice", "hospitality"] },
  { id: "telegram-mcp", name: "Telegram MCP", description: "MCP server for Telegram Bot API integration with Claude", stack: "Node.js + MCP SDK + Grammy", status: "production", icon: MessageSquare, files: 38, tags: ["mcp", "telegram", "bot"] },
  { id: "zdorovdv", name: "ZdorovDV", description: "Health/wellness booking platform with ElevenLabs voice", stack: "Next.js 15.1 + ElevenLabs + Framer Motion", status: "production", icon: Globe, files: 54, tags: ["voice", "health", "booking"] },
  { id: "smart-shop", name: "Smart Shop", description: "AI-powered eCommerce platform with JSON-driven content", stack: "Next.js 15 + OpenAI + Zod", status: "production", icon: Globe, files: 44, tags: ["ai", "ecommerce"] },
  { id: "snake-3d", name: "Snake 3D", description: "Retro 3D snake game with cyberpunk aesthetic", stack: "Vite + React + Three.js + Web Audio", status: "production", icon: Gamepad2, files: 10, tags: ["game", "3d"] },
  { id: "briefme-ai", name: "BriefMe AI", description: "AI calendar/email assistant with voice interface", stack: "Next.js 15.5 + ElevenLabs + VAPI + Twilio", status: "wip", icon: Bot, files: 29, tags: ["voice", "ai", "productivity"] },
  { id: "cv-creator", name: "CV Creator", description: "AI resume builder with PDF export", stack: "Next.js 15.3 + Anthropic + jsPDF", status: "wip", icon: FileCode, files: 31, tags: ["ai", "pdf"] },
  { id: "jira-integration", name: "Jira Integration", description: "Jira issue management dashboard with chat", stack: "Next.js 15 + Jira API + React Query", status: "wip", icon: FolderOpen, files: 34, tags: ["jira", "dashboard"] },
  { id: "secretutka", name: "Secretutka", description: "Personal CLI assistant for work session tracking", stack: "Node.js CLI + Next.js + Anthropic + Google AI", status: "wip", icon: Bot, files: 42, tags: ["cli", "ai"] },
  { id: "ai-slide", name: "AI Slide", description: "Voice-controlled presentations with WebRTC", stack: "Next.js 15.1 + WebRTC + OpenAI Realtime", status: "wip", icon: Globe, files: 81, tags: ["voice", "presentation"] },
  { id: "tiltan", name: "Tiltan", description: "Educational platform with i18n and RTL support", stack: "Next.js 15.5 + next-intl + OpenAI", status: "wip", icon: Globe, files: 50, tags: ["education", "i18n"] },
  { id: "uxui-to-dev", name: "UXUI to Dev", description: "UI/UX design to code generator with Monaco editor", stack: "Next.js 16 + Anthropic + Monaco", status: "wip", icon: FileCode, files: 122, tags: ["ai", "design", "codegen"] },
  { id: "dark-web-agent", name: "Dark Web Agent", description: "Defensive cybersecurity analysis CLI", stack: "Python + Rich + cryptography", status: "wip", icon: Shield, files: 7, tags: ["security", "python", "cli"] },
  { id: "sinornis", name: "Sinornis", description: "Poultry farm alert system with sensor integration", stack: "Python + Flask + RPi GPIO", status: "wip", icon: Siren, files: 15, tags: ["iot", "python", "alerts"] },
  { id: "3d-model-render", name: "3D Model Render", description: "Interactive 3D building viewer with heat maps", stack: "React + Vite + Three.js + R3F", status: "wip", icon: Cuboid, files: 23, tags: ["3d", "visualization"] },
  { id: "hso-mobile", name: "HSO Mobile", description: "Hotel system operator mobile interface", stack: "Unknown", status: "skeleton", icon: Smartphone, files: 0, tags: ["mobile", "hospitality"] },
];

// --- Knowledge base types ---

interface TechDecision { id: string; title: string; date: string; status: string; context: string; decision: string; tradeoffs: string; alternatives_rejected: string[]; source_project?: string; }
interface ArchPattern { id: string; name: string; context: string; pattern: string; code_reference: string; when_to_use: string; source_project?: string; }
interface AntiPattern { id: string; name: string; problem: string; solution: string; source_project?: string; }
interface FailurePattern { id: string; category: string; title: string; symptoms: string; root_cause: string; solution: string; date_discovered: string; source_project?: string; }
interface SecurityVuln { id: string; category: string; title: string; severity: string; description: string; mitigation: string; source_project?: string; }

interface KnowledgeBase {
  techDecisions: TechDecision[];
  architecturePatterns: ArchPattern[];
  antiPatterns: AntiPattern[];
  failurePatterns: FailurePattern[];
  securityVulns: SecurityVuln[];
  securityChecklist?: Record<string, string[]>;
  lastUpdated: string | null;
}

// --- Status badge ---

const statusConfig = {
  production: { label: "Production", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  wip: { label: "WIP", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  skeleton: { label: "Skeleton", color: "bg-red-500/10 text-red-400 border-red-500/20" },
};

const severityColors: Record<string, string> = {
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

// --- Tab types ---

type Tab = "projects" | "decisions" | "patterns" | "failures" | "security";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "projects", label: "Projects", icon: FolderOpen },
  { id: "decisions", label: "Tech Decisions", icon: Lightbulb },
  { id: "patterns", label: "Patterns", icon: Brain },
  { id: "failures", label: "Failures", icon: AlertTriangle },
  { id: "security", label: "Security", icon: Shield },
];

// --- Collapsible card ---

function CollapsibleCard({ title, subtitle, badge, badgeColor, children, defaultOpen = false }: {
  title: string; subtitle?: string; badge?: string; badgeColor?: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-lg bg-card">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground truncate">{title}</span>
            {badge && <span className={cn("font-mono text-[10px] px-2 py-0.5 rounded border", badgeColor)}>{badge}</span>}
          </div>
          {subtitle && <p className="text-xs text-muted-foreground truncate mt-0.5">{subtitle}</p>}
        </div>
      </button>
      {open && <div className="px-4 pb-4 border-t border-border/50 pt-3">{children}</div>}
    </div>
  );
}

// --- Main page ---

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("projects");
  const [kb, setKb] = useState<KnowledgeBase | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    fetch("/api/knowledge")
      .then((r) => r.json())
      .then(setKb)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredProjects = statusFilter
    ? projects.filter((p) => p.status === statusFilter)
    : projects;

  const stats = {
    total: projects.length,
    production: projects.filter((p) => p.status === "production").length,
    wip: projects.filter((p) => p.status === "wip").length,
    decisions: kb?.techDecisions.length || 0,
    patterns: (kb?.architecturePatterns.length || 0) + (kb?.antiPatterns.length || 0),
    failures: kb?.failurePatterns.length || 0,
    vulns: kb?.securityVulns.length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <FolderOpen className="w-8 h-8 text-primary" />
          Projects & Knowledge Base
        </h1>
        <p className="font-mono text-xs text-muted-foreground mt-1 tracking-wider uppercase">
          {stats.total} projects &middot; {stats.decisions} decisions &middot; {stats.patterns} patterns &middot; {stats.vulns} vulnerabilities
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: "Projects", value: stats.total, color: "text-primary" },
          { label: "Production", value: stats.production, color: "text-emerald-400" },
          { label: "WIP", value: stats.wip, color: "text-amber-400" },
          { label: "Decisions", value: stats.decisions, color: "text-blue-400" },
          { label: "Patterns", value: stats.patterns, color: "text-violet-400" },
          { label: "Failures", value: stats.failures, color: "text-orange-400" },
          { label: "Vulns", value: stats.vulns, color: "text-red-400" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg px-4 py-3 text-center">
            <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 font-mono text-xs transition-all rounded-t-lg",
              activeTab === tab.id
                ? "bg-primary/10 text-primary border border-primary/20 border-b-transparent -mb-px"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Projects tab */}
          {activeTab === "projects" && (
            <div className="space-y-4">
              <div className="flex gap-1">
                {["", "production", "wip", "skeleton"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg font-mono text-xs transition-all",
                      statusFilter === f
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    {f || "All"} {f ? `(${projects.filter((p) => p.status === f).length})` : `(${projects.length})`}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredProjects.map((p) => {
                  const Icon = p.icon;
                  const sc = statusConfig[p.status];
                  return (
                    <div key={p.id} className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold truncate">{p.name}</h3>
                            <span className={cn("font-mono text-[10px] px-1.5 py-0.5 rounded border flex-shrink-0", sc.color)}>{sc.label}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <p className="font-mono text-[10px] text-muted-foreground">{p.stack}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{p.files} files</p>
                      </div>
                      <div className="mt-2 flex gap-1 flex-wrap">
                        {p.tags.map((t) => (
                          <span key={t} className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{t}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tech Decisions tab */}
          {activeTab === "decisions" && kb && (
            <div className="space-y-2">
              {kb.techDecisions.map((d) => (
                <CollapsibleCard
                  key={d.id}
                  title={d.title}
                  subtitle={`${d.id} &middot; ${d.date} &middot; ${d.status}`}
                  badge={d.source_project || undefined}
                  badgeColor="bg-violet-500/10 text-violet-400 border-violet-500/20"
                >
                  <div className="space-y-3 text-sm">
                    <div><span className="text-xs font-semibold text-muted-foreground uppercase">Context</span><p className="text-foreground/80 mt-1">{d.context}</p></div>
                    <div><span className="text-xs font-semibold text-muted-foreground uppercase">Decision</span><p className="text-foreground/80 mt-1">{d.decision}</p></div>
                    <div><span className="text-xs font-semibold text-muted-foreground uppercase">Tradeoffs</span><p className="text-foreground/80 mt-1">{d.tradeoffs}</p></div>
                    {d.alternatives_rejected.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase">Rejected</span>
                        <ul className="mt-1 space-y-1">
                          {d.alternatives_rejected.map((a, i) => (
                            <li key={i} className="flex items-center gap-2 text-foreground/60">
                              <Ban className="w-3 h-3 text-red-400 flex-shrink-0" />
                              <span>{a}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CollapsibleCard>
              ))}
            </div>
          )}

          {/* Patterns tab */}
          {activeTab === "patterns" && kb && (
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-emerald-400" /> Architecture Patterns ({kb.architecturePatterns.length})
                </h2>
                <div className="space-y-2">
                  {kb.architecturePatterns.map((p) => (
                    <CollapsibleCard
                      key={p.id}
                      title={p.name}
                      subtitle={p.id}
                      badge={p.source_project || undefined}
                      badgeColor="bg-violet-500/10 text-violet-400 border-violet-500/20"
                    >
                      <div className="space-y-2 text-sm">
                        <div><span className="text-xs font-semibold text-muted-foreground uppercase">Context</span><p className="text-foreground/80 mt-1">{p.context}</p></div>
                        <div><span className="text-xs font-semibold text-muted-foreground uppercase">Pattern</span><p className="text-foreground/80 mt-1">{p.pattern}</p></div>
                        {p.code_reference && <div><span className="text-xs font-semibold text-muted-foreground uppercase">Code Ref</span><p className="font-mono text-xs text-primary/70 mt-1">{p.code_reference}</p></div>}
                        <div><span className="text-xs font-semibold text-muted-foreground uppercase">When to Use</span><p className="text-foreground/80 mt-1">{p.when_to_use}</p></div>
                      </div>
                    </CollapsibleCard>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <Ban className="w-4 h-4 text-red-400" /> Anti-Patterns ({kb.antiPatterns.length})
                </h2>
                <div className="space-y-2">
                  {kb.antiPatterns.map((a) => (
                    <CollapsibleCard
                      key={a.id}
                      title={a.name}
                      subtitle={a.id}
                      badge={a.source_project || undefined}
                      badgeColor="bg-violet-500/10 text-violet-400 border-violet-500/20"
                    >
                      <div className="space-y-2 text-sm">
                        <div><span className="text-xs font-semibold text-red-400 uppercase">Problem</span><p className="text-foreground/80 mt-1">{a.problem}</p></div>
                        <div><span className="text-xs font-semibold text-emerald-400 uppercase">Solution</span><p className="text-foreground/80 mt-1">{a.solution}</p></div>
                      </div>
                    </CollapsibleCard>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Failures tab */}
          {activeTab === "failures" && kb && (
            <div className="space-y-2">
              {kb.failurePatterns.map((f) => (
                <CollapsibleCard
                  key={f.id}
                  title={f.title}
                  subtitle={`${f.id} &middot; ${f.category} &middot; ${f.date_discovered}`}
                  badge={f.source_project || undefined}
                  badgeColor="bg-violet-500/10 text-violet-400 border-violet-500/20"
                >
                  <div className="space-y-2 text-sm">
                    <div><span className="text-xs font-semibold text-muted-foreground uppercase">Symptoms</span><p className="text-foreground/80 mt-1">{f.symptoms}</p></div>
                    <div><span className="text-xs font-semibold text-red-400 uppercase">Root Cause</span><p className="text-foreground/80 mt-1">{f.root_cause}</p></div>
                    <div><span className="text-xs font-semibold text-emerald-400 uppercase">Solution</span><p className="text-foreground/80 mt-1">{f.solution}</p></div>
                  </div>
                </CollapsibleCard>
              ))}
            </div>
          )}

          {/* Security tab */}
          {activeTab === "security" && kb && (
            <div className="space-y-6">
              {kb.securityVulns.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" /> Vulnerabilities ({kb.securityVulns.length})
                  </h2>
                  <div className="space-y-2">
                    {kb.securityVulns.map((v) => (
                      <CollapsibleCard
                        key={v.id}
                        title={v.title}
                        subtitle={v.id}
                        badge={v.severity}
                        badgeColor={severityColors[v.severity] || severityColors.medium}
                      >
                        <div className="space-y-2 text-sm">
                          <div><span className="text-xs font-semibold text-muted-foreground uppercase">Description</span><p className="text-foreground/80 mt-1">{v.description}</p></div>
                          <div><span className="text-xs font-semibold text-emerald-400 uppercase">Mitigation</span><p className="text-foreground/80 mt-1">{v.mitigation}</p></div>
                        </div>
                      </CollapsibleCard>
                    ))}
                  </div>
                </div>
              )}
              {kb.securityChecklist && Object.keys(kb.securityChecklist).length > 0 && (
                <div>
                  <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" /> Security Checklist
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(kb.securityChecklist).map(([category, items]) => (
                      <div key={category} className="bg-card border border-border rounded-lg p-4">
                        <h3 className="font-mono text-xs font-bold text-foreground uppercase mb-2">
                          {category.replace(/_/g, " ")}
                        </h3>
                        <ul className="space-y-1.5">
                          {(items as string[]).map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-foreground/70">
                              <span className="text-emerald-400 mt-0.5">&#x2713;</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
