# Migration Guide: AI Agent Hub to Claude Code Subagents

## What Moved (10 Project Agents)
All development agents are now Claude Code subagents in .claude/agents/:
- orchestrator (opus) - central coordinator
- pm-agent (sonnet) - product management, sole Jira owner
- architect-agent (opus) - system design, API contracts
- backend-agent (sonnet) - Node.js implementation
- frontend-agent (sonnet) - Next.js/React UI
- designer-agent (sonnet) - Aura design system
- qa-agent (sonnet) - testing, security review
- devops-agent (haiku) - infrastructure, CI/CD
- cyber-agent (sonnet) - 152-FZ compliance, OWASP
- research-agent (haiku) - market analysis

## What Stays in AI Agent Hub
These agents remain in AI Agent Hub (not code-related):
- Bilingual Telegram Assistant (@MichaelClaudeBot)
- Email and Calendar Manager (Composio)
- Tech-Support-Agent (laser equipment)
- Herald sub-agents (avatar generation)

## Key Differences

### Before (AI Agent Hub)
- Agents via Hub API (executeAssistantQuery)
- Workspace storage for documents
- PM-Agent created Jira via Atlassian MCP in Hub
- Separate LLM model per agent in Hub config
- maxToolSteps: 15 for coordinators, 10 for specialists

### Now (Claude Code)
- Subagents with independent context windows
- File system IS the workspace (docs/, src/)
- Jira via Atlassian MCP server in Claude Code
- Model per agent in YAML frontmatter
- Agent Teams for parallel execution (experimental)

## MCP Servers to Add
Configure in Claude Code settings:
- Atlassian: https://mcp.atlassian.com/v1/mcp
- Figma: https://mcp.figma.com/mcp
- Gmail: https://gmail.mcp.claude.com/mcp
- Google Calendar: https://gcal.mcp.claude.com/mcp

## Setup Steps
1. Clone repo with .claude/agents/ directory
2. Install Claude Code CLI
3. Configure MCP servers in settings
4. Run /agents to verify all 10 agents loaded
5. Test: "Use orchestrator to plan next sprint"

## Hybrid Architecture
```
Claude Code (development)          AI Agent Hub (operations)
+---------------------------+     +---------------------------+
| orchestrator              |     | Telegram Bot              |
| pm-agent (Jira owner)     |     | Email/Calendar Manager    |
| architect-agent           |     | Tech Support Agent        |
| backend-agent             |     | Herald Avatars            |
| frontend-agent            |     +---------------------------+
| designer-agent            |
| qa-agent                  |
| devops-agent              |
| cyber-agent               |
| research-agent            |
+---------------------------+
```
