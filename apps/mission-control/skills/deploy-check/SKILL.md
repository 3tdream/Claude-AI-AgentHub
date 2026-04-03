---
name: deploy-check
description: Pre-deploy verification — type check, page health, system status
disable-model-invocation: true
---

Run a comprehensive pre-deployment verification checklist.

Steps:
1. **Type Check**: Run `node_modules/.bin/next build` dry-run or `node_modules/.bin/tsc --noEmit` from the Mission Control project root
   - IMPORTANT: Use node_modules/.bin/next, NOT npx next (npx resolves to root's next@16.1.1)
   - Collect all TypeScript errors if any
2. **Page Health Check**: Test all 13 Mission Control pages by curling each for HTTP 200:
   - http://localhost:3077/ (home)
   - http://localhost:3077/agents (agents list)
   - http://localhost:3077/agents/revenue
   - http://localhost:3077/agents/concierge
   - http://localhost:3077/chat
   - http://localhost:3077/pipeline
   - http://localhost:3077/knowledge-base
   - http://localhost:3077/costs
   - http://localhost:3077/settings
   - http://localhost:3077/projects
   - http://localhost:3077/logs
   - http://localhost:3077/monitoring
   - http://localhost:3077/security
3. **System Health**: GET http://localhost:3077/api/system/health
4. **Report**: Output a verdict:
   - **READY TO DEPLOY** — all checks pass
   - **BLOCKED** — list specific failures with file paths and error messages
   - Show summary: N/N type checks passed, N/13 pages healthy, health score
