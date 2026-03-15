DECISION: Stateless Health Endpoint — process.uptime() vs Date.now()

CONTEXT:
  Health check endpoint GET /api/system/health needs to report server uptime.
  Two implementation approaches exist. Existing code (route.ts) uses Date.now()
  at module level. PRD specifies process.uptime(). FAIL-002 and ANTI-003 in
  knowledge-base flag Date.now() in SSR/module scope as problematic.

OPTIONS:
  A) const startTime = Date.now() at module level, uptime = (Date.now() - startTime) / 1000
     — Measures time since module was last loaded (cold start / hot reload resets it)
     — Gives "time since last restart" not "process uptime"
     — Technically not SSR hydration issue (route handler ≠ page component)
     — BUT: misleading on hot reload during development, resets on module cache eviction

  B) process.uptime()
     — Node.js built-in, measures actual process lifetime
     — Accurate across hot reloads (process doesn't restart on file change)
     — Not available in Edge Runtime (must use Node.js runtime)
     — Float precision (seconds.milliseconds)
     — Zero additional state, truly stateless

  C) external uptime service (UptimeRobot, Betterstack)
     — Out of scope per PRD

CHOSEN: Option B — process.uptime()

RATIONALE:
  1. Accuracy: process.uptime() reflects actual Node.js process lifetime.
     Date.now()-based calculation resets on every hot reload, giving false
     "0 seconds uptime" after any code change in development.
  2. Stateless: no module-level variable, no side effects on import.
  3. Consistency with PRD AC: "uptime: process.uptime() (секунды, float)"
  4. Runtime constraint: must declare runtime = 'nodejs' in route to ensure
     process.uptime() availability (not available in Edge Runtime).
  5. FAIL-002 alignment: avoids Date.now() at module scope even though
     the hydration risk is technically absent in route handlers.

IMPACT:
  - app/api/system/health/route.ts: replace Date.now() logic with process.uptime()
  - Add: export const runtime = 'nodejs' to route file
  - Uptime value changes from integer (Math.floor) to float — TypeScript type
    { status: "ok"; uptime: number } remains valid (number covers float)
  - Frontend uptime display must handle float: Math.floor() before formatting

RISK: NONE — breaking change only in development behavior (hot reload uptime reset).
      Production behavior improves (accurate uptime).