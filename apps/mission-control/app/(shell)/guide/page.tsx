"use client";

import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Home,
  HeartPulse,
  FolderOpen,
  Play,
  DollarSign,
  BarChart3,
  TicketCheck,
  Settings,
  Keyboard,
  Database,
  AlertTriangle,
  Wifi,
  WifiOff,
  BookMarked,
  Brain,
  Moon,
  ScrollText,
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
    id: "home",
    icon: Home,
    title: "Home",
    subtitle: "Command center — agents, pipeline, chat, knowledge, health",
    content: (
      <div className="space-y-4">
        <p className="text-sm text-foreground/80">
          Home is the primary workspace. It combines the agent fleet, pipeline execution, chat, knowledge base, and health monitoring in one unified view.
        </p>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Agent Fleet (left panel)</p>
          <div className="space-y-2">
            <Step n={1}>Browse all 16 agents grouped by team</Step>
            <Step n={2}>Click any agent to open its detail view with tabs: <strong>Chat</strong>, <strong>Config</strong>, <strong>Prompt</strong>, <strong>Sessions</strong></Step>
            <Step n={3}>Chat directly with the selected agent — messages route through Agent Hub with fallback</Step>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pipeline Panel (center, no agent selected)</p>
          <div className="space-y-2">
            <Step n={1}>Type a task into the input field</Step>
            <Step n={2}>Intent classifier routes it: direct response or multi-stage pipeline</Step>
            <Step n={3}>Three tabs below the graph: <strong>Pipeline</strong> (DAG view), <strong>Contracts</strong> (stage I/O specs), <strong>Analytics</strong> (run history)</Step>
            <Step n={4}>Use the <strong>Project selector</strong> in the pipeline header to scope the run to a specific project</Step>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Health Panel</p>
          <p className="text-sm text-foreground/80">
            Click the <strong>Health</strong> metric in the top stats row to open the system health dashboard — agent availability, API latencies, error rates.
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Knowledge Panel</p>
          <p className="text-sm text-foreground/80">
            Click the <strong>KB Entries</strong> metric in the top stats row to open the full Knowledge Base browser with search and category filters.
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Execution History</p>
          <div className="space-y-2">
            <Step n={1}>Toggle between <strong>Input</strong> and <strong>History</strong> views</Step>
            <Step n={2}>History shows clickable execution cards with status, duration, and quality score</Step>
            <Step n={3}>Click a card to expand: <strong>View Stages</strong>, <strong>Deploy</strong>, <strong>Resume</strong> actions</Step>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pipeline Launch Flow</p>
          <div className="space-y-2">
            <Step n={1}>Type your task in the input field</Step>
            <Step n={2}>Review the routing preview (intent + selected agents)</Step>
            <Step n={3}>Click <strong>Confirm &amp; Execute</strong> to start the pipeline</Step>
            <Step n={4}>Watch stages progress in the DAG graph in real time</Step>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stage Detail</p>
          <p className="text-sm text-foreground/80">
            Click any graph node to see: output content, token usage, <strong>Apply to Source</strong> (merge output into project files), and <strong>Deploy to Source</strong> (push to target repo).
          </p>
        </div>

        <Tip>Home replaces the old separate Agents, Orchestration, Chat, and Contracts pages — everything is now in one place.</Tip>
      </div>
    ),
  },
  {
    id: "dashboard",
    icon: LayoutDashboard,
    title: "Dashboard",
    subtitle: "KPI overview — agents, cost, success rate, pipeline runs",
    content: (
      <div className="space-y-4">
        <p className="text-sm text-foreground/80">
          Central analytics view with summary stats, agent performance table, and export tools.
        </p>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Summary Stats Row</p>
          <ul className="text-sm text-foreground/80 space-y-1 ml-4 list-disc">
            <li><strong>Total Agents</strong> — active agent count</li>
            <li><strong>Total Requests</strong> — cumulative API calls</li>
            <li><strong>Total Cost</strong> — combined spend across all providers</li>
            <li><strong>Success Rate</strong> — percentage of non-error responses</li>
            <li><strong>Pipeline Runs</strong> — total pipeline executions</li>
          </ul>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Agent Table</p>
          <div className="space-y-2">
            <Step n={1}>Review agent metrics — cost, requests, tokens, last accessed</Step>
            <Step n={2}>Click any agent row to open it in the Home page</Step>
            <Step n={3}>Use the <strong>time range filter</strong> (7d / 30d / all) to adjust the view</Step>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Export &amp; Refresh</p>
          <div className="space-y-2">
            <Step n={1}>Click <strong>CSV Export</strong> to download data — filename includes the current date dynamically</Step>
            <Step n={2}>Performance matrix includes a <strong>Refresh</strong> button with last-updated timestamp</Step>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "costs",
    icon: DollarSign,
    title: "Costs",
    subtitle: "Spending dashboard — subscriptions, API balances, pipeline spend",
    content: (
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Two Cost Sources</p>
          <ul className="text-sm text-foreground/80 space-y-1 ml-4 list-disc">
            <li><strong>Claude Code Subscription</strong> — fixed $100/month for Claude Code Max</li>
            <li><strong>API Balances</strong> — remaining credits on Anthropic, OpenAI, and Google accounts</li>
          </ul>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pipeline Spend</p>
          <p className="text-sm text-foreground/80">
            Calculated from actual token usage during pipeline runs — input/output tokens multiplied by per-model pricing.
          </p>
        </div>
        <div className="space-y-2">
          <Step n={1}>View summary cards: subscription, balances, pipeline spend</Step>
          <Step n={2}>Check provider breakdown chart (Anthropic, OpenAI, Google)</Step>
          <Step n={3}>Update balances via <strong>Settings</strong> page or through the API</Step>
        </div>
        <Tip>In offline mode, costs show cached data from the last Agent Hub snapshot.</Tip>
      </div>
    ),
  },
  {
    id: "knowledge",
    icon: BookMarked,
    title: "Knowledge Base",
    subtitle: "Persistent learning memory — accessed from Home via KB Entries metric",
    content: (
      <div className="space-y-4">
        <p className="text-sm text-foreground/80">
          The KB stores lessons learned from every pipeline run. Agents read it before acting, and contracts adapt dynamically based on it. Access it by clicking the <strong>KB Entries</strong> metric box on the Home page.
        </p>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Scope Toggle</p>
          <p className="text-sm text-foreground/80">
            Switch between <strong>Global</strong> (shared across all projects) and <strong>Project</strong> (scoped to the selected project). Use <strong>Promote to Global</strong> to elevate a project-level entry.
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">5 Categories</p>
          <ul className="text-sm text-foreground/80 space-y-1 ml-4 list-disc">
            <li><strong>Failure Patterns</strong> — recurring bugs, truncation issues, prompt gaps</li>
            <li><strong>Security Playbook</strong> — JWT rules, auth requirements, OWASP findings</li>
            <li><strong>Success Patterns</strong> — what works: agent pairings, output formats, gate patterns</li>
            <li><strong>Architecture Patterns</strong> — established code patterns: fire-and-forget, SWR hooks, file storage</li>
            <li><strong>Tech Decisions</strong> — technology choices with rationale: PostgreSQL, NestJS, Tailwind 4, Zod</li>
          </ul>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Search &amp; Browse</p>
          <div className="space-y-2">
            <Step n={1}>Full-text search across title, content, and tags</Step>
            <Step n={2}>Filter by category using the tab bar</Step>
            <Step n={3}>Each entry has severity (critical/high/medium/low), version counter, and SHA-256 hash validation</Step>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Feedback Loop</p>
          <p className="text-sm text-foreground/80">
            KB entries are automatically injected into agent prompts before each run. When a pipeline fails, QA writes new failure patterns. When it succeeds, success patterns are auto-captured. Each run makes the next one smarter.
          </p>
        </div>
        <Tip>KB entries with severity &ldquo;critical&rdquo; or &ldquo;high&rdquo; become blocking constraints in stage contracts automatically.</Tip>
      </div>
    ),
  },
  {
    id: "pipeline-intelligence",
    icon: Brain,
    title: "Pipeline Intelligence",
    subtitle: "19-stage pipeline with gates, escalation, confidence scoring, and DAG execution",
    content: (
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pipeline Structure</p>
          <p className="text-sm text-foreground/80">
            19 stages organized with 4 quality gates. Stages execute as a parallel DAG — independent branches run concurrently, dependent stages wait for upstream completion.
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Model Escalation</p>
          <p className="text-sm text-foreground/80">
            Stages start with the cheapest capable model (haiku). On retry, they escalate to sonnet. If that fails, opus is used as the final attempt. This keeps costs low while maintaining quality.
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Confidence Scoring</p>
          <p className="text-sm text-foreground/80">
            Each agent self-reports a confidence score (0.0 to 1.0) with its output. Low-confidence outputs (&lt;0.6) trigger automatic re-evaluation or retry.
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Budget Caps</p>
          <p className="text-sm text-foreground/80">
            Each stage has a budget cap ($1&ndash;$3 depending on complexity). If a stage exceeds its cap, it halts and escalates rather than burning through credits.
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Failure Taxonomy</p>
          <ul className="text-sm text-foreground/80 space-y-1 ml-4 list-disc">
            <li><strong>Truncation</strong> — output cut off mid-sentence</li>
            <li><strong>Hallucination</strong> — references non-existent APIs or libraries</li>
            <li><strong>Off-topic</strong> — output doesn&apos;t address the task</li>
            <li><strong>Incomplete</strong> — missing required sections</li>
            <li><strong>Format violation</strong> — wrong output structure</li>
            <li><strong>Security violation</strong> — fails security contract checks</li>
            <li><strong>Timeout</strong> — exceeded time limit</li>
            <li><strong>Budget exceeded</strong> — exceeded cost cap</li>
          </ul>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Advanced Features</p>
          <ul className="text-sm text-foreground/80 space-y-1 ml-4 list-disc">
            <li><strong>Eval Baselines</strong> — each stage has a quality baseline; regression below baseline triggers alerts</li>
            <li><strong>Design-to-Code Validator</strong> — compares Figma specs to generated UI code for layout accuracy</li>
            <li><strong>Ownership Feedback Loop</strong> — when a stage output is manually edited, the edit is fed back to improve the agent&apos;s next run</li>
          </ul>
        </div>
        <Tip>The pipeline adapts per-run: if prediction is below 30% on quick mode, it auto-upgrades to medium. Security KB patterns force-add the Cyber-Agent.</Tip>
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
        <Tip>Analytics is also accessible via the <strong>Analytics</strong> tab in the Home pipeline panel.</Tip>
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
    id: "jira",
    icon: TicketCheck,
    title: "Jira Integration",
    subtitle: "Search, create, and track Jira issues — global sync",
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
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Global Sync</p>
          <p className="text-sm text-foreground/80">
            Jira issues sync globally across all projects in Mission Control. The Chat panel shows a project context indicator so you always know which project context is active.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "nightly-evolution",
    icon: Moon,
    title: "Nightly Evolution",
    subtitle: "PM2 cron at 03:00 — KB decay, pattern extraction, self-improvement",
    content: (
      <div className="space-y-4">
        <p className="text-sm text-foreground/80">
          Every night at 03:00, a PM2 cron job runs the evolution cycle to keep the system current and prevent knowledge rot.
        </p>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">What Happens</p>
          <ul className="text-sm text-foreground/80 space-y-1 ml-4 list-disc">
            <li><strong>KB Decay</strong> — entries that haven&apos;t been referenced in recent runs have their relevance score reduced; stale entries eventually archive</li>
            <li><strong>Pattern Extraction</strong> — analyzes recent pipeline runs and extracts new success/failure patterns into the Knowledge Base</li>
            <li><strong>Baseline Recalculation</strong> — updates eval baselines for each stage based on latest run data</li>
            <li><strong>Cross-session Sync</strong> — merges project-level KB entries that appear in multiple projects into global scope</li>
          </ul>
        </div>
        <Tip>Check PM2 logs (<Kbd>npm run pm2:logs</Kbd>) to see the nightly evolution output and any entries it created or archived.</Tip>
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
          <div className="mt-2 text-muted-foreground"># Optional — Anthropic direct fallback</div>
          <div>ANTHROPIC_API_KEY=sk-ant-...</div>
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
          <Kbd>Esc</Kbd> <span className="text-foreground/80">Deselect agent / close panel</span>
        </div>
      </div>
    ),
  },
  {
    id: "storage",
    icon: Database,
    title: "Data Storage",
    subtitle: "Local file-based storage in data/",
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
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs">jira-config.json</td>
              <td className="py-2 pr-4">data/</td>
              <td className="py-2">Jira credentials (gitignored)</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs">knowledge-base/_index.json</td>
              <td className="py-2 pr-4">data/</td>
              <td className="py-2">KB master index — global scope</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs">knowledge-base/*.json</td>
              <td className="py-2 pr-4">data/</td>
              <td className="py-2">KB entries (5 categories, SHA-256 hashed, versioned)</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs">knowledge-base/</td>
              <td className="py-2 pr-4">projects/&lt;name&gt;/</td>
              <td className="py-2">Project-scoped KB entries (two-layer architecture)</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs">pipeline-analytics.json</td>
              <td className="py-2 pr-4">data/</td>
              <td className="py-2">Aggregate pipeline stats and per-agent metrics</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs">pipeline-runs/*.json</td>
              <td className="py-2 pr-4">data/</td>
              <td className="py-2">Individual pipeline run records</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-xs">security-playbook.json</td>
              <td className="py-2 pr-4">data/knowledge-base/</td>
              <td className="py-2">Security rules and OWASP patterns</td>
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
    subtitle: "3-tier chat fallback — Hub, Anthropic, OpenAI; MC runs autonomously",
    content: (
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">3-Tier Chat Fallback</p>
          <div className="space-y-2">
            <Step n={1}><strong>Tier 1: Agent Hub</strong> — primary source, routes through the Hub backend</Step>
            <Step n={2}><strong>Tier 2: Anthropic Direct</strong> — if Hub is down, falls back to Anthropic API with cached system prompt</Step>
            <Step n={3}><strong>Tier 3: OpenAI Direct</strong> — if Anthropic is also unavailable, uses OpenAI as last resort</Step>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">MC Autonomous Mode</p>
          <p className="text-sm text-foreground/80">
            When <code className="text-xs bg-muted px-1 rounded">AGENT_HUB_LIVE</code> is not set, Mission Control operates fully offline:
          </p>
          <ul className="text-sm text-foreground/80 space-y-1 ml-4 list-disc">
            <li>All API reads return cached snapshots (agents, teams, costs)</li>
            <li>Pipeline execution still works via the local execute API route</li>
            <li>Knowledge Base reads/writes work locally (file-based)</li>
            <li>Jira integration works independently (uses Jira API directly)</li>
          </ul>
        </div>
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
          ["Chat shows \"openai-fallback\" badge", "Agent Hub and Anthropic both down — chat is using OpenAI as last-resort fallback"],
          ["Jira \"Not configured\"", "Go to /jira/settings, enter credentials, test connection"],
          ["JQL error on Jira search", "Project key must be uppercase letters (e.g., CAI, not cai)"],
          ["Pipeline stuck at checkpoint", "Click Approve or Reject in the Home pipeline panel"],
          ["Stale cost/agent data", "Cache is from last snapshot; set AGENT_HUB_LIVE=1 for fresh data"],
          ["KB entries not showing", "Click the KB Entries metric on Home to open the browser; check scope toggle (Global vs Project)"],
          ["Nightly evolution didn't run", "Check PM2 status — the cron job requires PM2 to be running (npm run pm2:dev)"],
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
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["home"]));

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
            Set up <code className="bg-muted px-1 rounded">.env.local</code> &rarr; run <code className="bg-muted px-1 rounded">npm run dev</code> &rarr; open <code className="bg-muted px-1 rounded">http://localhost:3077</code> &rarr; Home page loads with agent fleet + pipeline
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
