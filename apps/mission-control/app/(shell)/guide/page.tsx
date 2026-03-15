"use client";

import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Bot,
  Users,
  GitBranch,
  MessageSquare,
  ScrollText,
  DollarSign,
  BarChart3,
  TicketCheck,
  Settings,
  Keyboard,
  Database,
  AlertTriangle,
  Wifi,
  WifiOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Section data ---

interface GuideSection {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  content: React.ReactNode;
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center px-1.5 py-0.5 rounded border border-border bg-muted font-mono text-[11px] text-muted-foreground">
      {children}
    </kbd>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-start">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-xs font-bold">
        {n}
      </span>
      <div className="text-sm text-foreground/90 leading-relaxed pt-0.5">{children}</div>
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 px-4 py-3 rounded-lg bg-primary/5 border border-primary/10 text-sm text-foreground/80">
      <span className="flex-shrink-0 text-primary font-bold">TIP</span>
      <span>{children}</span>
    </div>
  );
}

const sections: GuideSection[] = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    title: "Dashboard",
    subtitle: "KPI overview of all agents",
    content: (
      <div className="space-y-3">
        <p className="text-sm text-foreground/80">Central overview showing cost, requests, tokens, and last accessed time for all 16 agents.</p>
        <div className="space-y-2">
          <Step n={1}>Open <strong>/dashboard</strong> — it loads automatically on start</Step>
          <Step n={2}>Review agent metrics in the table</Step>
          <Step n={3}>Click any agent name to go to its detail page</Step>
        </div>
      </div>
    ),
  },
  {
    id: "agents",
    icon: Bot,
    title: "Agents",
    subtitle: "Browse, create, and manage AI agents",
    content: (
      <div className="space-y-3">
        <div className="space-y-2">
          <Step n={1}>Toggle between grid/list view (top right)</Step>
          <Step n={2}>Click an agent card to open its detail page</Step>
          <Step n={3}>Click <strong>New Agent</strong> to create a new one</Step>
        </div>
        <div className="mt-4 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Agent Detail Tabs:</p>
          <ul className="text-sm text-foreground/80 space-y-1 ml-4 list-disc">
            <li><strong>Config</strong> — Edit name, description, LLM model, token limits</li>
            <li><strong>Prompt</strong> — Edit system prompt; version history tracked automatically</li>
            <li><strong>Sessions</strong> — View past chat sessions for this agent</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "teams",
    icon: Users,
    title: "Teams",
    subtitle: "Organize agents into teams",
    content: (
      <div className="space-y-2">
        <Step n={1}>View all teams with agent counts</Step>
        <Step n={2}>Click a team to see its members</Step>
        <Step n={3}>Click <strong>New Team</strong> to create one</Step>
      </div>
    ),
  },
  {
    id: "orchestration",
    icon: GitBranch,
    title: "Orchestration",
    subtitle: "Multi-agent pipeline with quality gating",
    content: (
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Step 1 — Create Workflow</p>
          <div className="space-y-2">
            <Step n={1}>Click <strong>CRM Pipeline</strong> to load the 10-stage template, or create a custom workflow</Step>
            <Step n={2}>Review stages in the visual pipeline graph</Step>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Step 2 — Execute</p>
          <div className="space-y-2">
            <Step n={1}>Enter task input (e.g., &quot;Build a CRM for a beauty salon&quot;)</Step>
            <Step n={2}>Click <strong>Execute</strong></Step>
            <Step n={3}>Watch stages run — each shows status (running/retrying/completed/failed)</Step>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quality Evaluation</p>
          <ul className="text-sm text-foreground/80 space-y-1 ml-4 list-disc">
            <li>Each stage is auto-evaluated (completeness, specificity, actionability)</li>
            <li>Score &ge; 8.0 &rarr; PASS</li>
            <li>Score &lt; 8.0 &rarr; automatic retry (up to 2 retries)</li>
            <li>Score &lt; 5.0 after max retries &rarr; ESCALATION (pipeline halts)</li>
          </ul>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Checkpoint</p>
          <p className="text-sm text-foreground/80">At the Human Checkpoint stage, review all previous outputs. Click <strong>Approve</strong> to continue or <strong>Reject</strong> to stop.</p>
        </div>
        <Tip>Check Execution History (bottom panel) for past runs with quality scores and durations.</Tip>
      </div>
    ),
  },
  {
    id: "chat",
    icon: MessageSquare,
    title: "Chat",
    subtitle: "Dual-source chat with any agent",
    content: (
      <div className="space-y-3">
        <div className="space-y-2">
          <Step n={1}>Select an agent from the left sidebar</Step>
          <Step n={2}>Type a message, press <Kbd>Enter</Kbd> to send (<Kbd>Shift+Enter</Kbd> for newline)</Step>
          <Step n={3}>Watch the source badge — <code className="text-xs bg-muted px-1.5 py-0.5 rounded">agent-hub</code> or <code className="text-xs bg-muted px-1.5 py-0.5 rounded">openai-fallback</code></Step>
          <Step n={4}>Click <strong>Clear Chat</strong> to reset conversation (saves to logs first)</Step>
        </div>
        <Tip>If Agent Hub is unreachable, chat automatically falls back to OpenAI with the agent&apos;s cached system prompt.</Tip>
      </div>
    ),
  },
  {
    id: "logs",
    icon: ScrollText,
    title: "Logs",
    subtitle: "Activity timeline for all events",
    content: (
      <div className="space-y-2">
        <Step n={1}>Filter by type: <code className="text-xs bg-muted px-1 rounded">chat</code>, <code className="text-xs bg-muted px-1 rounded">decision</code>, <code className="text-xs bg-muted px-1 rounded">manual</code>, <code className="text-xs bg-muted px-1 rounded">system</code></Step>
        <Step n={2}>Filter by agent name</Step>
        <Step n={3}>Search by keyword</Step>
        <Step n={4}>Add manual log entries via the input at the bottom</Step>
        <Tip>Logs are capped at 2000 entries (oldest dropped automatically).</Tip>
      </div>
    ),
  },
  {
    id: "costs",
    icon: DollarSign,
    title: "Costs",
    subtitle: "Spending dashboard — 30-day breakdown",
    content: (
      <div className="space-y-2">
        <Step n={1}>View summary cards: total cost, requests, tokens</Step>
        <Step n={2}>Review the daily cost chart</Step>
        <Step n={3}>Check provider breakdown (Anthropic, OpenAI, Google)</Step>
        <Step n={4}>Scroll down for the daily costs table</Step>
        <Tip>In offline mode, costs show cached data from the last Agent Hub snapshot.</Tip>
      </div>
    ),
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Analytics",
    subtitle: "Pipeline quality trends and retries",
    content: (
      <div className="space-y-2">
        <ul className="text-sm text-foreground/80 space-y-1.5 ml-4 list-disc">
          <li><strong>KPI Cards</strong> — total runs, success rate, avg duration, escalation count</li>
          <li><strong>Quality by Stage</strong> — bar chart of average scores per pipeline stage</li>
          <li><strong>Retries by Agent</strong> — which agents need the most retries</li>
          <li><strong>Timeline</strong> — execution count over time</li>
          <li><strong>Status Distribution</strong> — pie chart (completed/failed/paused)</li>
          <li><strong>Execution History</strong> — table of last 15 runs with details</li>
        </ul>
      </div>
    ),
  },
  {
    id: "jira",
    icon: TicketCheck,
    title: "Jira Integration",
    subtitle: "Search, create, and track Jira issues",
    content: (
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Initial Setup</p>
          <div className="space-y-2">
            <Step n={1}>Go to <strong>/jira/settings</strong> (gear icon)</Step>
            <Step n={2}>Enter Jira credentials: Base URL, Email, API Token</Step>
            <Step n={3}>Set a Default Project Key (e.g., <code className="text-xs bg-muted px-1 rounded">CAI</code>)</Step>
            <Step n={4}>Click <strong>Test Connection</strong> to verify</Step>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pipeline &harr; Jira Sync</p>
          <ul className="text-sm text-foreground/80 space-y-1 ml-4 list-disc">
            <li>Pipeline executions auto-create an <strong>Epic</strong> in Jira</li>
            <li>Each stage posts a comment with agent name, model, duration, quality score</li>
            <li>Checkpoints add pause/resume comments</li>
            <li>Pipeline completion transitions the Epic to <strong>Done</strong></li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "env-setup",
    icon: Settings,
    title: "Environment Setup",
    subtitle: "Required .env.local variables",
    content: (
      <div className="space-y-3">
        <div className="bg-muted/50 border border-border rounded-lg p-4 font-mono text-xs leading-relaxed overflow-x-auto">
          <div className="text-muted-foreground"># Required — Agent Hub backend</div>
          <div>AGENT_HUB_API_URL=http://localhost:3000/assistant</div>
          <div>AGENT_HUB_API_KEY=your_agent_hub_key</div>
          <div>AGENT_HUB_LIVE=1</div>
          <div className="mt-2 text-muted-foreground"># Required — OpenAI fallback for chat</div>
          <div>OPENAI_API_KEY=sk-proj-...</div>
          <div className="mt-2 text-muted-foreground"># App URL</div>
          <div>NEXT_PUBLIC_BASE_URL=http://localhost:3077</div>
          <div className="mt-2 text-muted-foreground"># Optional — Jira (or configure via UI at /jira/settings)</div>
          <div>JIRA_BASE_URL=https://your-domain.atlassian.net</div>
          <div>JIRA_EMAIL=your-email@example.com</div>
          <div>JIRA_API_TOKEN=your-jira-api-token</div>
        </div>
        <Tip>Set <code className="text-xs bg-muted px-1 rounded">AGENT_HUB_LIVE=1</code> to enable live mode. Remove it for offline/cache mode.</Tip>
      </div>
    ),
  },
  {
    id: "shortcuts",
    icon: Keyboard,
    title: "Keyboard Shortcuts",
    subtitle: "Navigation and chat shortcuts",
    content: (
      <div className="space-y-2">
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <Kbd>Enter</Kbd> <span className="text-foreground/80">Send chat message</span>
          <Kbd>Shift+Enter</Kbd> <span className="text-foreground/80">New line in chat</span>
          <Kbd>Cmd/Ctrl+K</Kbd> <span className="text-foreground/80">Command palette (quick navigation)</span>
        </div>
      </div>
    ),
  },
  {
    id: "storage",
    icon: Database,
    title: "Data Storage",
    subtitle: "Local file-based storage",
    content: (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
              <th className="pb-2 pr-4">File</th>
              <th className="pb-2 pr-4">Location</th>
              <th className="pb-2">Purpose</th>
            </tr>
          </thead>
          <tbody className="text-foreground/80">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs">logs.json</td>
              <td className="py-2 pr-4">data/</td>
              <td className="py-2">Activity logs (max 2000)</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs">prompt-overrides.json</td>
              <td className="py-2 pr-4">data/</td>
              <td className="py-2">Custom system prompts per agent</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-xs">jira-config.json</td>
              <td className="py-2 pr-4">data/</td>
              <td className="py-2">Jira credentials (gitignored)</td>
            </tr>
          </tbody>
        </table>
      </div>
    ),
  },
  {
    id: "offline",
    icon: WifiOff,
    title: "Offline Mode",
    subtitle: "Works without Agent Hub connection",
    content: (
      <div className="space-y-2">
        <p className="text-sm text-foreground/80">When <code className="text-xs bg-muted px-1 rounded">AGENT_HUB_LIVE</code> is <strong>not set</strong>:</p>
        <ul className="text-sm text-foreground/80 space-y-1 ml-4 list-disc">
          <li>All API reads return cached snapshots (agents, teams, costs)</li>
          <li>Chat falls back to OpenAI directly</li>
          <li>Pipeline execution still works via the execute API route</li>
          <li>Jira integration works independently (uses Jira API directly)</li>
        </ul>
      </div>
    ),
  },
  {
    id: "background-mode",
    icon: Settings,
    title: "Background Mode",
    subtitle: "Run Mission Control without a terminal",
    content: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Mission Control can run as a background service using PM2, so you don&apos;t need to keep a terminal window open.
        </p>
        <div className="space-y-3">
          <Step n={1}>Start in background: <Kbd>npm run pm2:dev</Kbd></Step>
          <Step n={2}>Check status on the <strong>Integrations</strong> page — real-time CPU, RAM, uptime</Step>
          <Step n={3}>View logs: <Kbd>npm run pm2:logs</Kbd></Step>
          <Step n={4}>Stop: <Kbd>npm run pm2:stop</Kbd></Step>
        </div>
        <Tip>You can also restart the server from the Integrations page without touching the terminal.</Tip>
      </div>
    ),
  },
  {
    id: "troubleshooting",
    icon: AlertTriangle,
    title: "Troubleshooting",
    subtitle: "Common issues and solutions",
    content: (
      <div className="space-y-2">
        {[
          ["\"Agent Hub unreachable\" on every request", "Set AGENT_HUB_LIVE=1 in .env.local and ensure Agent Hub runs on :3000"],
          ["Chat shows \"openai-fallback\" badge", "Agent Hub is down; chat works via OpenAI instead"],
          ["Jira \"Not configured\"", "Go to /jira/settings, enter credentials, test connection"],
          ["JQL error on Jira search", "Project key must be uppercase letters (e.g., CAI, not cai)"],
          ["Pipeline stuck at checkpoint", "Click Approve or Reject in the Orchestration panel"],
          ["Stale cost/agent data", "Cache is from last snapshot; set AGENT_HUB_LIVE=1 for fresh data"],
        ].map(([issue, solution]) => (
          <div key={issue} className="flex gap-3 px-4 py-3 rounded-lg bg-muted/30 border border-border/50">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground/90">{issue}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{solution}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
];

// --- Collapsible section component ---

function GuideAccordion({ section, isOpen, onToggle }: { section: GuideSection; isOpen: boolean; onToggle: () => void }) {
  const Icon = section.icon;
  return (
    <div className={cn(
      "border border-border rounded-lg transition-colors",
      isOpen ? "bg-card" : "bg-card/50 hover:bg-card/80",
    )}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-4 text-left"
      >
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
          isOpen ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
        )}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
          <p className="text-xs text-muted-foreground truncate">{section.subtitle}</p>
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-5 pb-5 pt-1 border-t border-border/50">
          {section.content}
        </div>
      )}
    </div>
  );
}

// --- Page ---

export default function GuidePage() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["dashboard"]));

  function toggle(id: string) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function expandAll() {
    setOpenSections(new Set(sections.map((s) => s.id)));
  }

  function collapseAll() {
    setOpenSections(new Set());
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            User Guide
          </h1>
          <p className="font-mono text-xs text-muted-foreground mt-1 tracking-wider uppercase">
            Step-by-step instructions for Mission Control
          </p>
        </div>
        <div className="flex gap-2 mt-1">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 rounded-lg font-mono text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 rounded-lg font-mono text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Quick start banner */}
      <div className="flex items-center gap-3 px-5 py-4 rounded-lg bg-primary/5 border border-primary/10 mb-6">
        <Wifi className="w-5 h-5 text-primary flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">Quick Start</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Set up <code className="bg-muted px-1 rounded">.env.local</code> &rarr; run <code className="bg-muted px-1 rounded">npm run dev</code> &rarr; open <code className="bg-muted px-1 rounded">http://localhost:3077</code>
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-2">
        {sections.map((section) => (
          <GuideAccordion
            key={section.id}
            section={section}
            isOpen={openSections.has(section.id)}
            onToggle={() => toggle(section.id)}
          />
        ))}
      </div>
    </div>
  );
}
