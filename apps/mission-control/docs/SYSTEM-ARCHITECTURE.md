# Mission Control — System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                                │
│                                                                      │
│  ┌──────────┐  ┌─────────────────────────────────────────────────┐   │
│  │ Sidebar  │  │                   Topbar                        │   │
│  │ 18 pages │  │  [Search] [Project Selector] [Tokens $] [Activity]│  │
│  └──────────┘  └─────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │              ORCHESTRATION (Main Hub)                          │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                    │   │
│  │  │ Pipeline │  │Contracts │  │Analytics │  ← 3 Tabs           │   │
│  │  └──────────┘  └──────────┘  └──────────┘                    │   │
│  │                                                               │   │
│  │  [Task Input] → [ROUTE] → Intent Decision → Execute          │   │
│  └───────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Routing Flow — From Input to Execution

```
User Input: "fix button color" / "build auth system"
     │
     ▼
┌─────────────────────┐
│  Intent Classifier   │ ← Decides: DIRECT / PIPELINE / HYBRID
│  (lib/intent-        │
│   classifier.ts)     │    "fix/rename/change" → DIRECT
│                      │    "build/create/add feature" → PIPELINE
└──────┬──────┬────────┘
       │      │
   DIRECT  PIPELINE
       │      │
       ▼      ▼
┌──────────┐  ┌────────────────────────────────────────────┐
│ Claude   │  │            Smart Router                     │
│ + Tools  │  │         (lib/smart-router.ts)               │
│          │  │                                              │
│ read     │  │  AI classifies → quick / medium / full      │
│ edit     │  │         │                                    │
│ create   │  │         ▼                                    │
│ grep     │  │  ┌──────────────┐                           │
│ run_cmd  │  │  │  Simulation  │ ← Predicts success %      │
│          │  │  │  (preflight- │   Uses: 119 KB entries    │
│ KB aware │  │  │   simulation)│   + pipeline analytics    │
│ Logged   │  │  └──────┬───────┘                           │
└──────────┘  │         │                                    │
              │    < 50%│≥ 50%                               │
              │         │                                    │
              │  ┌──────▼───────┐                           │
              │  │  S0.2 Replan │ ← Iterative replanning    │
              │  │  (strategy-  │   44% → 64% in 5 iters   │
              │  │   architect) │   31 actions applied      │
              │  └──────┬───────┘                           │
              │         │                                    │
              │         ▼                                    │
              │  ┌──────────────┐                           │
              │  │ Skill Router │ ← Validates agent selection│
              │  │ (skill-      │   Scoring + Roles          │
              │  │  router.ts)  │   max 6 skills             │
              │  └──────┬───────┘                           │
              │         │                                    │
              │         ▼                                    │
              │  [Routing Panel] → User confirms             │
              │         │                                    │
              │         ▼                                    │
              │  ┌──────────────┐                           │
              │  │  PIPELINE    │                           │
              │  │  EXECUTOR    │ ← 20 stages max           │
              │  │              │                           │
              │  └──────────────┘                           │
              └────────────────────────────────────────────┘
```

## Pipeline Execution — Per Stage

```
For each pipeline stage:

  ┌─────────────────────────────────┐
  │     1. MODEL SELECTION          │
  │  selectModelForStage()          │
  │  Haiku → gates, research       │
  │  Sonnet → backend, frontend    │
  └──────────────┬──────────────────┘
                 │
  ┌──────────────▼──────────────────┐
  │     2. CONTEXT INJECTION        │
  │  • Project context (path, stack)│
  │  • KB self-awareness (failures) │
  │  • Stage contract (I/O rules)   │
  │  • Learning context (analytics) │
  └──────────────┬──────────────────┘
                 │
  ┌──────────────▼──────────────────┐
  │     3. AGENT EXECUTION          │
  │  Claude API + Tools             │
  │  • read_file, edit_file         │
  │  • create_file, list_files      │
  │  • run_command                  │
  │                                 │
  │  Tools execute in PROJECT dir   │
  │  (not MC dir)                   │
  └──────────────┬──────────────────┘
                 │
  ┌──────────────▼──────────────────┐
  │     4. POST-EDIT VALIDATION     │
  │  quickSyntaxCheck()             │
  │  • Unterminated strings         │
  │  • Import-after-code            │
  │  • Brace balance                │
  │  FAIL → auto-revert + retry     │
  └──────────────┬──────────────────┘
                 │
  ┌──────────────▼──────────────────┐
  │     5. CONTRACT VALIDATION      │
  │  validateStageOutput()          │
  │  • Required outputs present?    │
  │  • Constraints satisfied?       │
  │  • KB dynamic rules checked?    │
  │  Score: 0-100                   │
  └──────────────┬──────────────────┘
                 │
  ┌──────────────▼──────────────────┐
  │     6. QUALITY EVALUATION       │
  │  Orchestrator scores:           │
  │  • Completeness                 │
  │  • Specificity                  │
  │  • Actionability                │
  │  ≥ 8.0 → PASS                  │
  │  < 8.0 → RETRY with feedback   │
  │  < 5.0 → INVESTIGATION         │
  └──────────────┬──────────────────┘
                 │
           FAIL? │ PASS ──→ Next Stage
                 │
  ┌──────────────▼──────────────────┐
  │     7. FAILURE INVESTIGATION    │
  │  investigateFailure()           │
  │  Categories:                    │
  │  • wrong_directory              │
  │  • no_edits (read-only loop)    │
  │  • truncation                   │
  │  • tool_error                   │
  │  Fixable → RETRY + correction   │
  │  Not fixable → ESCALATE         │
  └─────────────────────────────────┘
```

## Knowledge Base — Layered Architecture

```
┌─────────────────────────────────────────────┐
│              KNOWLEDGE BASE                  │
│              119 entries                      │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │         GLOBAL LAYER                   │  │
│  │  Security rules, code quality,         │  │
│  │  LLM patterns, cross-project learnings │  │
│  │                                        │  │
│  │  failure-patterns (41)                 │  │
│  │  success-patterns (28)                 │  │
│  │  tech-decisions (22)                   │  │
│  │  architecture-patterns (16)            │  │
│  │  security-playbook (12)                │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │       PROJECT LAYER (per project)      │  │
│  │  Stack-specific patterns,              │  │
│  │  project architecture, project bugs    │  │
│  │                                        │  │
│  │  data/knowledge-base/{projectId}/      │  │
│  │  [Promote to Global] button            │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Features:                                   │
│  • SHA-256 hash integrity validation         │
│  • Versioned entries (v1, v2, v3...)         │
│  • Confidence weighting (0.2 — 1.0)         │
│  • 30-day decay if unconfirmed               │
│  • Cross-project search                      │
│  • Dynamic contract injection                │
│  • Agent KB self-awareness                   │
└─────────────────────────────────────────────┘
```

## Feedback Loops

```
┌──────────────────────────────────────────────────────┐
│                  SELF-LEARNING LOOP                    │
│                                                       │
│  Pipeline Run                                         │
│       │                                               │
│       ▼                                               │
│  Success? ──YES──→ KB: success-pattern (+confidence)  │
│       │                                               │
│       NO                                              │
│       │                                               │
│       ▼                                               │
│  Investigation → KB: failure-pattern                  │
│       │                                               │
│       ▼                                               │
│  Nightly Evolution (03:00)                            │
│  • Extract patterns from runs                         │
│  • Calibrate simulation weights                       │
│  • Decay old KB entries                               │
│  • Detect agent degradation                           │
│  • Sync KB ↔ CLI memory                               │
│       │                                               │
│       ▼                                               │
│  Next Run: KB has new entries                         │
│  → Dynamic contracts updated                          │
│  → Simulation more accurate                           │
│  → Agents see their past failures                     │
│  → Better decisions                                   │
│                                                       │
│  KB → Contracts → Agent → Validation → KB             │
│   └──────────── feedback loop ──────────┘             │
└──────────────────────────────────────────────────────┘
```

## Project System

```
┌──────────────────────────────────────────────┐
│              PROJECT MANAGEMENT               │
│                                               │
│  apps/                                        │
│  ├── mission-control (this)    :3077          │
│  ├── secretutka                :3013          │
│  ├── concierge-ai              :4024          │
│  ├── echo                      :3039          │
│  ├── tiltan                    :3017          │
│  ├── ... (15 total)                           │
│                                               │
│  Discovery: scans apps/, reads package.json   │
│  Manifest: mission-control.json per project   │
│  Dev Server: start/stop via API               │
│  Port: auto-detected from dev script          │
│                                               │
│  Global Project Selector (Topbar)             │
│       │                                       │
│       ├──→ Orchestration (pipeline context)   │
│       ├──→ Knowledge (project KB scope)       │
│       ├──→ Chat (project context indicator)   │
│       ├──→ Costs (project filter)             │
│       └──→ Jira (MC project badge)            │
└──────────────────────────────────────────────┘
```

## Multi-Model Routing

```
┌──────────────────────────────────────┐
│        MODEL SELECTION                │
│                                       │
│  Stage Type          Model    Cost    │
│  ─────────────────────────────────── │
│  Gates/Orchestrator  Haiku    $$$     │
│  Research            Haiku    $$$     │
│  Quick mode          Haiku    $$$     │
│  Backend/Frontend    Sonnet   $$$$    │
│  Architect/Cyber     Sonnet   $$$$    │
│  QA/Designer         Sonnet   $$$$    │
│                                       │
│  Estimated savings: 30-40%            │
└──────────────────────────────────────┘
```

## Pages Map

```
GLOBAL (no project scope):
  /dashboard ── Agent KPI table
  /agents ── Agent registry + detail
  /teams ── Team management
  /health ── System health monitoring
  /logs ── Activity log
  /integrations ── API keys, PM2
  /guide ── Documentation
  /settings ── Preferences

PROJECT-SCOPED (follows project selector):
  /orchestration ── Pipeline + Contracts + Analytics (3 tabs)
  /knowledge ── KB browser (Global + Project scope toggle)
  /chat ── Agent chat with project context
  /costs ── Cost analytics with project filter
  /jira ── Jira integration with MC project badge
  /projects ── Project registry + dev server manager
```
