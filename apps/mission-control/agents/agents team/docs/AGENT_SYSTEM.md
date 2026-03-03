# Beauty CRM — Agent System Guide

## Architecture: 3-Layer Dynamic Agents

Each agent operates with three layers of context:

```
┌─────────────────────────────────────────────┐
│ Layer 3: TASK BRIEF (per task)              │
│ Exact input, expected output, constraints   │
│ Provided by Orchestrator at runtime         │
├─────────────────────────────────────────────┤
│ Layer 2: PHASE CONTEXT (per week)           │
│ What to build NOW, active/idle status,      │
│ model recommendation, parallel tracks       │
│ File: docs/phases/phase-N-name.md           │
├─────────────────────────────────────────────┤
│ Layer 1: BASE ROLE (permanent)              │
│ Identity, rules, tech stack, output format  │
│ File: .claude/agents/agent-name.md          │
└─────────────────────────────────────────────┘
```

### Why 3 Layers?
- **Layer 1** is WHO you are (never changes)
- **Layer 2** is WHAT you're working on this week (changes per phase)
- **Layer 3** is the SPECIFIC task right now (changes per task)

This means agents stay focused, use appropriate models per phase, and don't waste tokens on irrelevant context.

---

## How to Switch Phases

### Step 1: Update the pointer
Edit `docs/phases/ACTIVE_PHASE.md`:
```
CURRENT_PHASE: 2
CURRENT_FILE: phase-2-crm-auth.md
SPRINT_START: 2026-03-18
SPRINT_END: 2026-03-22
```

### Step 2: Run Orchestrator
The Orchestrator reads ACTIVE_PHASE.md and announces the phase change. It knows:
- Which agents are ACTIVE vs IDLE
- What model each agent should use
- What the done criteria are

### Step 3: Agents self-configure
Every agent reads `docs/phases/ACTIVE_PHASE.md` before any task. They automatically:
- Skip if marked IDLE
- Adjust their focus to phase-specific tasks
- Use the recommended model tier

---

## Model Optimization Guide

### Cost per model (approx.)
| Model | Input/1M tokens | Output/1M tokens | Best for |
|-------|----------------|-------------------|----------|
| Opus | $15 | $75 | Architecture decisions, complex reasoning |
| Sonnet | $3 | $15 | Code generation, reviews, testing |
| Haiku | $0.25 | $1.25 | CRUD, boilerplate, simple tasks |

### Model assignments per phase

| Agent | Ph.1 | Ph.2 | Ph.3 | Ph.4 | Ph.5 | Ph.6 |
|-------|------|------|------|------|------|------|
| Orchestrator | sonnet | sonnet | sonnet | sonnet | sonnet | sonnet |
| PM-Agent | haiku | haiku | haiku | haiku | haiku | sonnet |
| Architect | **opus** | sonnet | haiku | IDLE | IDLE | IDLE |
| Backend | sonnet | sonnet | sonnet | sonnet | sonnet | haiku |
| Frontend | sonnet | sonnet | sonnet | haiku | sonnet | haiku |
| Designer | sonnet | haiku | IDLE | IDLE | IDLE | haiku |
| QA | haiku | sonnet | sonnet | sonnet | sonnet | sonnet |
| DevOps | IDLE | IDLE | IDLE | haiku | haiku | **sonnet** |
| Cyber | haiku | haiku | haiku | **sonnet** | haiku | sonnet |
| Research | IDLE | IDLE | IDLE | IDLE | IDLE | IDLE |

**Bold** = agent leads the phase. IDLE = don't run this agent.

### Cost savings
- Original (all agents on default models, 28 weeks): ~$1,344
- Optimized (right model per phase, 7 weeks): ~$235
- **Savings: 82%**

---

## Agent Lifecycle Per Phase

```
Phase Start
  │
  ├─ Orchestrator reads ACTIVE_PHASE.md
  ├─ Orchestrator reads phase-N-[name].md
  ├─ Orchestrator creates TASK BRIEFs for active agents
  │
  ├─ Day 1: Architecture/Design agents produce specs
  ├─ Day 2-N: Implementation agents build (parallel tracks)
  ├─ Day N-1: QA tests everything
  ├─ Day N: Orchestrator runs quality gate
  │
  ├─ All done criteria checked?
  │   ├─ YES → Update ACTIVE_PHASE.md to next phase
  │   └─ NO → Fix issues, re-run quality gate
  │
Phase End
```

---

## Running an Agent

### From Claude Code CLI:
```bash
# Navigate to the agents team directory
cd "apps/mission-control/agents/agents team"

# Run an agent (Claude Code picks up .claude/agents/)
/agents

# Select the agent from the list
# Give it a task — it will auto-read ACTIVE_PHASE.md
```

### From Mission Control (Agent Hub API):
```
POST /api/agent-hub/execute
{
  "assistantId": "architect-agent",
  "userInput": "Design the booking DB schema. Read docs/phases/ACTIVE_PHASE.md first."
}
```

---

## File Structure

```
agents team/
├── .claude/
│   └── agents/              # Layer 1: Agent base roles (10 files)
│       ├── orchestrator.md
│       ├── pm-agent.md
│       ├── architect-agent.md
│       ├── backend-agent.md
│       ├── frontend-agent.md
│       ├── designer-agent.md
│       ├── qa-agent.md
│       ├── devops-agent.md
│       ├── cyber-agent.md
│       └── research-agent.md
├── docs/
│   ├── phases/              # Layer 2: Phase contexts (updated per week)
│   │   ├── ACTIVE_PHASE.md  # Pointer to current phase
│   │   ├── phase-1-booking.md
│   │   ├── phase-2-crm-auth.md
│   │   ├── phase-3-multitenant.md
│   │   ├── phase-4-security.md
│   │   ├── phase-5-payments.md
│   │   └── phase-6-launch.md
│   ├── architecture/        # Architect-Agent outputs
│   ├── design-system/       # Designer-Agent outputs
│   ├── compliance/          # Cyber-Agent outputs
│   ├── research/            # Research-Agent outputs
│   ├── sprints/             # PM-Agent sprint records
│   ├── AGENT_SYSTEM.md      # This file
│   ├── MIGRATION.md         # Hub → Claude Code migration guide
│   ├── PROJECT_PLAN_AND_COSTS.md      # Original plan (v1)
│   └── PROJECT_PLAN_OPTIMIZED.md      # Optimized plan (v2)
├── src/
│   ├── backend/             # Backend-Agent outputs
│   ├── frontend/            # Frontend-Agent outputs
│   └── shared/              # Shared types, utils
├── tests/                   # QA-Agent test scripts
├── CLAUDE.md                # Project-level instructions
└── README.md                # Project overview
```

---

## Quick Reference: Agent Responsibilities

| Agent | Creates | Consumes | Hands off to |
|-------|---------|----------|-------------|
| Orchestrator | Task briefs | Phase files, agent outputs | All agents |
| PM-Agent | Jira tickets, stories | Handoffs from all agents | Orchestrator |
| Architect | Schema, API specs, ADRs | PM stories | Backend, Frontend |
| Backend | API code, tests | Architect specs | QA, Frontend |
| Frontend | Pages, components | Designer specs, Backend APIs | QA |
| Designer | Design tokens, specs | PM stories | Frontend |
| QA | Test reports, findings | Backend + Frontend code | PM-Agent |
| DevOps | CI/CD, deploy scripts | QA reports | — |
| Cyber | Security reports | All code | PM-Agent, QA |
| Research | Market reports | — | PM-Agent, Orchestrator |
