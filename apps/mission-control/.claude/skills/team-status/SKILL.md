---
name: team-status
description: Quick agent team status — who's ready, who needs attention, blockers
disable-model-invocation: true
---

Quick team status check.

Read recent data and show:

```
╔══════════════════════════════════════════════════╗
║          MISSION CONTROL — TEAM STATUS           ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  STRATEGY                                        ║
║  ✅ Research     — ready (KB: 3 patterns)        ║
║  ✅ Orchestrator — ready (last gate: PASS)       ║
║  ✅ PM           — ready (5 stories drafted)     ║
║                                                  ║
║  ENGINEERING                                     ║
║  ✅ Architect    — ready (score: 9.3)            ║
║  ⚠️ Backend     — warn (last: max_tokens)       ║
║  ✅ Frontend     — ready (score: 8.5)            ║
║  ✅ Designer     — ready (score: 8.4)            ║
║                                                  ║
║  SECURITY                                        ║
║  ⚠️ Cyber       — warn (KB outdated 14d)        ║
║                                                  ║
║  QUALITY                                         ║
║  ✅ QA           — ready (score: 9.3)            ║
║  ✅ DevOps       — ready (no word limit)         ║
║                                                  ║
║  PROJECT STATE: 5/8 sections filled              ║
║  PIPELINE READY: PARTIAL — run /preflight        ║
║                                                  ║
╚══════════════════════════════════════════════════╝
```

Data sources:
- `data/test-steps/scores.json` — agent scores
- `data/project-state.json` — project readiness
- `agents/agents team/knowledge-base/` — KB freshness
- `lib/config.ts` — agent configuration
