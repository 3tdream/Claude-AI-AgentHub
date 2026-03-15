DECISION: Health Endpoint Excluded from Authentication

CONTEXT:
  All API routes in Mission Control follow auth + rate limiting + input validation
  pattern (Architect-Agent Layer 1 rules). Health endpoint is an exception candidate.
  Monitoring tools, load balancers, and the Topbar UI need to check health without
  auth credentials.

OPTIONS:
  A) No auth required (public endpoint)
     — Monitoring tools work without credentials
     — Load balancer health checks work out of the box
     — Topbar can poll before user session is established
     — Exposes: server uptime (low sensitivity)
     — Does NOT expose: agent data, costs, logs, PII

  B) Auth required (JWT)
     — Consistent with all other routes
     — Breaks monitoring tools, load balancer probes
     — Topbar must wait for auth before showing status
     — Adds latency (JWT validation) to a <50ms target endpoint

  C) API key auth (separate monitoring key)
     — Secure but operationally complex
     — Overkill for uptime value (not sensitive)

CHOSEN: Option A — No auth required

RATIONALE:
  1. Data sensitivity: uptime (float seconds) is not sensitive information.
     No business data, no PII, no agent configuration exposed.
  2. Operational requirement: external monitoring tools (UptimeRobot, Betterstack,
     load balancers) require unauthenticated health endpoints.
  3. Performance: auth validation adds 5-15ms overhead. Target is <50ms total.
     Stateless endpoint should be as lightweight as possible.
  4. Industry standard: /health, /ping, /status endpoints are universally public.
     RFC 8615 (.well-known) and Kubernetes liveness probes follow this convention.
  5. PRD explicit requirement: "When called without auth headers, Then it responds
     normally (no auth required)"

IMPACT:
  - Route has no middleware auth check
  - Rate limiting still applies at nginx/infrastructure level (60 req/min per IP)
  - ARCHITECTURE.md "Other Routes" table: note "No auth, uptime in seconds"
  - No JWT validation code in route handler

RISK: MINIMAL — uptime value provides no attack surface.
      DDoS risk mitigated by infrastructure-level rate limiting.