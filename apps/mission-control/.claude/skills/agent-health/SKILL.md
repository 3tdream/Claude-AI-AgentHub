---
name: agent-health
description: Health check all pipeline agents — prompts, thresholds, models, configuration consistency
disable-model-invocation: true
---

Run a health check on all pipeline agent configurations.

Steps:
1. Read `lib/config.ts` — AGENT_CONFIG, AGENT_SCORING_WEIGHTS
2. Read `lib/agent-prompts-cache.ts` — system prompts
3. Read `lib/pipeline-templates.ts` — stage prompts and metadata
4. Read agent .md files in `agents/agents team/.claude/agents/`
5. Read `data/prompt-overrides.json`
6. Check Knowledge Base files in `agents/agents team/knowledge-base/`

Check for:

**PROMPT CONFLICTS:**
- Old prompts in .md files contradicting pipeline-templates.ts
- Prompt overrides in prompt-overrides.json that shouldn't be there
- System prompts with role-specific instructions that belong in pipeline templates

**CONFIG CONSISTENCY:**
- All agents have qualityThreshold: 7.5
- All agents have escalationThreshold: 5
- Word limits appropriate for agent type
- Scoring weights sum to 1.0

**MODEL ALIGNMENT:**
- Pipeline templates model matches what's expected
- No agents using deprecated model IDs

**KB STATUS:**
- Are knowledge base files populated or empty?
- Any stale patterns (>30 days old)?

Output a health report table:
| Agent | Prompt | Config | Model | KB | Status |
