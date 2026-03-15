DECISION: Client-Side Health Polling — setInterval vs SWR vs WebSocket

CONTEXT:
  Topbar needs to poll GET /api/system/health every 30 seconds to display
  real-time system status. Three viable approaches exist in the current stack.
  PAT-004 reserves SWR hooks for Agent Hub proxy routes.

OPTIONS:
  A) setInterval + fetch in useEffect
     — Explicit control over interval, cancellation, and error handling
     — No additional dependencies
     — Requires manual cleanup (clearInterval + cancelled flag)
     — Matches existing topbar.tsx implementation

  B) useSWR with refreshInterval: 30000
     — Less boilerplate
     — Built-in deduplication, error retry
     — PAT-004 reserves SWR for Agent Hub routes — creates pattern ambiguity
     — revalidateOnFocus: false needed to prevent extra polls on tab focus
     — PRD notes this as "допустима если проще"

  C) WebSocket / SSE push from server
     — Server pushes status changes instead of client polling
     — Overkill for a simple liveness check
     — Adds server-side complexity
     — Out of scope per PRD

  D) Zustand store with polling action
     — Would persist health state across navigations
     — Unnecessary persistence (CLAUDE.md: Zustand only when persistence needed)
     — Adds global state for ephemeral UI concern

CHOSEN: Option A — setInterval + fetch in useEffect

RATIONALE:
  1. PAT-004 compliance: SWR hooks reserved for Agent Hub proxy routes.
     Using SWR here creates ambiguity about when SWR is appropriate.
  2. Explicit lifecycle: cancelled flag prevents setState-after-unmount
     (common React bug with async polling).
  3. Already implemented correctly in topbar.tsx — validates the pattern.
  4. Minimal surface: health check is a single endpoint, single consumer.
     SWR's deduplication/caching benefits don't apply here.
  5. Zustand excluded: health status is ephemeral, no cross-navigation
     persistence needed (CLAUDE.md rule confirmed).

IMPACT:
  - No new lib/hooks/ file created for health check
  - useHealthCheck stays as inline hook in topbar.tsx
  - Pattern documented to prevent future agents from "upgrading" to SWR

CAPACITY:
  30s interval × 1 Topbar instance = 2 req/min per browser tab.
  At 50 concurrent operators: 100 req/min to /api/system/health.
  At 10x load (500 operators): 1000 req/min = ~17 req/s.
  Node.js handles >10,000 req/s for this payload. No concern.

RISK: LOW — setInterval cleanup is critical. Missing clearInterval = memory leak
      + continued polling after navigation. Existing implementation handles this
      correctly via useEffect return function.