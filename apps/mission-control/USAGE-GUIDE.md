# Mission Control — User Guide

## Quick Start

### 1. Environment Setup

Create `.env.local` in the mission-control root:

```env
# Required — Agent Hub backend
AGENT_HUB_API_URL=http://localhost:3000/assistant
AGENT_HUB_API_KEY=your_agent_hub_key
AGENT_HUB_LIVE=1              # Set to enable live mode (remove for offline/cache mode)

# Required — OpenAI fallback for chat
OPENAI_API_KEY=sk-proj-...

# App URL
NEXT_PUBLIC_BASE_URL=http://localhost:3077

# Optional — Jira (can also be configured via UI at /jira/settings)
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-jira-api-token
```

### 2. Launch

```bash
cd apps/mission-control
npm install --no-workspaces
npm run dev
# Open http://localhost:3077
```

---

## Pages & Workflows

### Dashboard (`/dashboard`)

**What:** KPI overview of all 16 agents — cost, requests, tokens, last accessed.

**How to use:**
1. Open the dashboard — it loads automatically on start
2. Review agent metrics in the table
3. Click any agent name to go to its detail page

---

### Agents (`/agents`)

**What:** Browse, create, and manage AI agents.

**How to use:**
1. Toggle between grid/list view (top right)
2. Click an agent card to open its detail page
3. Click **New Agent** to create a new one

**Agent Detail (`/agents/[id]`):**
- **Config tab** — Edit name, description, LLM model, token limits
- **Prompt tab** — Edit system prompt; version history is tracked automatically
- **Sessions tab** — View past chat sessions for this agent

---

### Teams (`/teams`)

**What:** Organize agents into teams.

**How to use:**
1. View all teams with agent counts
2. Click a team to see its members
3. Click **New Team** to create one

---

### Chat (`/chat`)

**What:** Dual-source chat with any agent. Primary: Agent Hub. Fallback: OpenAI.

**How to use:**
1. Select an agent from the left sidebar
2. Type a message, press **Enter** to send (Shift+Enter for newline)
3. Watch the source badge — `agent-hub` or `openai-fallback`
4. Each agent has separate chat history (in-memory, lost on refresh)
5. Click **Clear Chat** to reset conversation (saves to logs first)

**Architecture note:** If Agent Hub is unreachable (e.g. localhost:3000 is down), chat automatically falls back to OpenAI with the agent's cached system prompt.

---

### Orchestration (`/orchestration`)

**What:** Multi-agent pipeline executor with quality gating and checkpoint approval.

**How to use:**

#### Step 1 — Create or select a workflow
1. Click **CRM Pipeline** to load the 10-stage template, or create a custom workflow
2. Review stages in the visual pipeline graph

#### Step 2 — Execute
1. Enter your task input in the execution panel (e.g., "Build a CRM for a beauty salon")
2. Click **Execute**
3. Watch stages run sequentially — each shows status (running/retrying/completed/failed)

#### Step 3 — Quality evaluation
- Each stage is automatically evaluated by the Orchestrator (scores: completeness, specificity, actionability)
- Score >= 8.0 → PASS
- Score < 8.0 → automatic retry (up to 2 retries)
- Score < 5.0 after max retries → ESCALATION (pipeline halts)

#### Step 4 — Checkpoint
- At the Human Checkpoint stage, the pipeline pauses
- Review all previous outputs
- Click **Approve** to continue or **Reject** (with reason) to stop

#### Step 5 — Review
- Check **Execution History** (bottom panel) for past runs
- View quality scores, retries, and durations per stage

---

### Logs (`/logs`)

**What:** Activity timeline for all system events.

**How to use:**
1. Filter by type: `chat`, `decision`, `manual`, `system`
2. Filter by agent name
3. Search by keyword
4. Add manual log entries via the input at the bottom
5. Logs are capped at 2000 entries (oldest dropped)

---

### Costs (`/costs`)

**What:** Spending dashboard — 30-day daily breakdown.

**How to use:**
1. View summary cards: total cost, requests, tokens
2. Review the daily cost chart
3. Check provider breakdown (Anthropic, OpenAI, Google)
4. Scroll down for the daily costs table

**Note:** In offline mode, costs show cached data from the last Agent Hub snapshot.

---

### Analytics (`/analytics`)

**What:** Pipeline execution analytics — quality trends, retry distribution.

**How to use:**
1. KPI cards: total runs, success rate, avg duration, escalation count
2. **Quality by Stage** — bar chart of average quality scores per pipeline stage
3. **Retries by Agent** — which agents need the most retries
4. **Timeline** — execution count over time
5. **Status Distribution** — pie chart (completed/failed/paused)
6. **Execution History** — table of last 15 runs with details

---

### Jira (`/jira`)

**What:** Search, create, and track Jira issues linked to your agents.

#### Initial Setup
1. Go to `/jira/settings` (gear icon on the Jira page)
2. Enter your Jira credentials:
   - **Base URL**: `https://your-domain.atlassian.net`
   - **Email**: Your Atlassian email
   - **API Token**: Generate at https://id.atlassian.com/manage-profile/security/api-tokens
3. Set a **Default Project Key** (e.g., `CAI`) — required for the PM Agent auto-log feature
4. Click **Test Connection** to verify

#### Searching Issues
1. Select a project from the dropdown
2. Optionally filter by status or search keyword
3. Click an issue key to open it in Jira

#### Creating Issues
1. Click **Create Issue**
2. Fill in: type (Task/Bug/Story), priority, summary, description
3. Submit — the issue is created in the selected project

#### Pipeline ↔ Jira Sync
When Jira is configured with a default project key:
- Pipeline executions auto-create an **Epic** in Jira
- Each stage posts a **comment** with agent name, model, duration, quality score
- Checkpoints add pause/resume comments
- Pipeline completion transitions the Epic to **Done**

---

## Offline Mode

When `AGENT_HUB_LIVE` is **not set** in `.env.local`:
- All API reads return cached snapshots (agents, teams, costs)
- Chat falls back to OpenAI directly
- Pipeline execution still works via the `/api/agent-hub/execute` route
- Jira integration works independently (uses Jira API directly)

---

## Keyboard Shortcuts

- **Enter** — Send chat message
- **Shift+Enter** — New line in chat
- **Cmd/Ctrl+K** — Command palette (quick navigation)

---

## Data Storage

| File | Location | Purpose |
|------|----------|---------|
| `data/logs.json` | Auto-created | Activity logs (max 2000) |
| `data/prompt-overrides.json` | Manual/API | Custom system prompts per agent |
| `data/jira-config.json` | Via /jira/settings | Jira credentials (gitignored) |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Agent Hub unreachable" on every request | Set `AGENT_HUB_LIVE=1` in `.env.local` and ensure Agent Hub runs on :3000 |
| Chat shows "openai-fallback" badge | Agent Hub is down; chat works via OpenAI instead |
| Jira "Not configured" | Go to `/jira/settings`, enter credentials, test connection |
| JQL error on Jira search | Project key must be uppercase letters (e.g., `CAI`, not `cai`) |
| Pipeline stuck at checkpoint | Click Approve or Reject in the Orchestration panel |
| Stale cost/agent data | Cache is from 2026-02-28; set `AGENT_HUB_LIVE=1` for fresh data |
