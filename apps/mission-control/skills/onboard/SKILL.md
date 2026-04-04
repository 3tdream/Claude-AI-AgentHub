---
name: onboard
description: First-time setup wizard — verify environment, configure agents, and validate Mission Control is ready
disable-model-invocation: true
argument-hint: optional user name or team name
---

Run the Mission Control first-time setup wizard.

Steps:
1. Greet the user:
   - If $ARGUMENTS contains a name, address them by name
   - Explain what Mission Control is and what the wizard will verify
2. **Environment Check**:
   - Confirm Node.js version: `node --version` (require ≥18)
   - Confirm the MC server is reachable: GET http://localhost:3077/api/system/health
   - Check that a `.env.local` file exists in the project root
3. **API Keys Audit**:
   - Read `.env.local` and check for the presence (not value) of these keys:
     - ANTHROPIC_API_KEY, OPENAI_API_KEY, GITHUB_TOKEN
   - Report which are present ✅ and which are missing ❌
   - For each missing key, provide the exact URL to obtain it
4. **Agent Roster Check**:
   - GET http://localhost:3077/api/agents
   - Confirm at least one agent is configured and active
   - If none, direct the user to Settings → Agents to add their first agent
5. **Knowledge Base Check**:
   - Verify `data/knowledge-base/` directory exists and contains at least one file
6. **Checklist Summary**:
   - Print a pass/fail table for every check above
   - **READY** — all checks pass, show the 3 most useful skills to try first
   - **ACTION REQUIRED** — list each failing item with a one-line fix instruction
7. Offer to run `deploy-check` next if everything is green
