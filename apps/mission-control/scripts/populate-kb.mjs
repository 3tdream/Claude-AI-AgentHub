/**
 * Populate KB with entries extracted from 114 pipeline runs analysis.
 * Run: node scripts/populate-kb.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { createHash } from "crypto";
import { join } from "path";

const KB_DIR = join(process.cwd(), "data", "knowledge-base");

function loadKB(category) {
  const p = join(KB_DIR, `${category}.json`);
  return JSON.parse(readFileSync(p, "utf-8"));
}

function saveKB(category, data) {
  data.contentHash = createHash("sha256").update(JSON.stringify(data.entries)).digest("hex");
  data.lastUpdated = new Date().toISOString();
  writeFileSync(join(KB_DIR, `${category}.json`), JSON.stringify(data, null, 2), "utf-8");
}

const now = new Date().toISOString();
let added = 0;

// ═══ FAILURE PATTERNS (new entries) ═══
const fp = loadKB("failure-patterns");
const newFP = [
  {
    id: "kb-fp-009", title: "QA score inflation — 10/10 despite FAIL verdict",
    content: "QA-Agent (s8) scored 9.3/10 but verdict was FAIL with 5 P0 issues. Score (quality of analysis) != verdict (pass/fail gate). Downstream gates cannot rely on score thresholds alone — FAIL verdict must be explicit enum. Fix: separate score from verdict in QA output contract.",
    source: "s8-technical-qa", agentId: "qa-agent", severity: "high",
    tags: ["qa", "scoring", "verdict-system", "gate-logic"],
    createdAt: now, updatedAt: now, pipelineRunId: "analytics-review", version: 1
  },
  {
    id: "kb-fp-010", title: "Orchestrator zero-score on Agent Hub timeout",
    content: "Orchestrator stages show 0 score when Agent Hub returns no response or timeout. 20% fail rate across 69 runs. No graceful degradation. Fix: add timeout handler with cached fallback + explicit error in structured output.",
    source: "pipeline-analytics", agentId: "orchestrator", severity: "high",
    tags: ["agent-hub", "timeout", "fallback", "connection-failure"],
    createdAt: now, updatedAt: now, pipelineRunId: "analytics-review", version: 1
  },
  {
    id: "kb-fp-011", title: "PM-Agent fails on ambiguous scope — needs explicit pre-flight decisions",
    content: "PM-Agent (s2-pm) 38% success rate across 79 runs. When user input lacks architectural decisions, PM enters clarification loop instead of writing stories. Fix: Orchestrator pre-flight must provide explicit decisions (data storage, API endpoints, auth scope) before PM handoff.",
    source: "s2-pm", agentId: "pm-agent", severity: "high",
    tags: ["ambiguity", "pre-flight", "scope-creep", "pm-agent"],
    createdAt: now, updatedAt: now, pipelineRunId: "analytics-review", version: 1
  },
  {
    id: "kb-fp-012", title: "Research-Agent processes then rejects technical tasks — wasted latency",
    content: "Research-Agent correctly identifies backend-only tasks and rejects them, but still processes 18-71s before rejection. Fix: Orchestrator pre-flight must classify task type (market/research vs technical) before S0, skip Research for technical-only tasks.",
    source: "pipeline-analytics", agentId: "research-agent", severity: "medium",
    tags: ["task-classification", "research-routing", "latency", "pre-flight"],
    createdAt: now, updatedAt: now, pipelineRunId: "analytics-review", version: 1
  },
  {
    id: "kb-fp-013", title: "Architect 39% success rate — context-dependent failures",
    content: "Architect: 69 runs, 6.83 avg score, 39.1% success. When context is vague, architect over-generalizes. Compare: fileplan (100%), prd-gate (100%). Fix: inject existing schema files and type definitions into architect prompt before architecture phase.",
    source: "pipeline-analytics", agentId: "architect-agent", severity: "high",
    tags: ["architect", "context-dependency", "schema-awareness", "39pct-success"],
    createdAt: now, updatedAt: now, pipelineRunId: "analytics-review", version: 1
  },
  {
    id: "kb-fp-014", title: "Designer output scope creep — delivers API client instead of components",
    content: "Designer (S6) scored 8.4 but output was truncated at 156K chars. Delivered token system + API wrapper but actual React components (cards, badges, tier displays) were missing. Root cause: designer allocated tokens to API client (frontend responsibility). Fix: designer prompt now prioritizes component JSX in Chunk A.",
    source: "s6-designer", agentId: "designer-agent", severity: "high",
    tags: ["designer", "scope-creep", "component-delivery", "token-management"],
    createdAt: now, updatedAt: now, pipelineRunId: "pipeline-v3-test", version: 1
  },
  {
    id: "kb-fp-015", title: "QA duration anomaly — 444K ms avg (7+ min) in full mode",
    content: "QA-Agent: 18 runs, 67.7K avg tokens, 444K ms avg duration — 10x longer than other agents at similar token count. Likely: sequential AC evaluation + timeout hanging. Fix: QA output contract should chunk ACs into P0→P2 batches with 30s per-batch timeout.",
    source: "pipeline-analytics", agentId: "qa-agent", severity: "high",
    tags: ["qa", "timeout", "duration-anomaly", "full-mode"],
    createdAt: now, updatedAt: now, pipelineRunId: "analytics-review", version: 1
  },
  {
    id: "kb-fp-016", title: "Quick mode single-agent pattern — task mislabeling causes failures",
    content: "26 quick runs often become single-agent tasks (frontend-only or architect-only). When genuinely small task → correct. When mislabeled → single agent fails on multi-stage work. Fix: Orchestrator pre-flight should validate task complexity; reject genuinely-quick classification for multi-concern tasks.",
    source: "pipeline-analytics", agentId: "orchestrator", severity: "medium",
    tags: ["mode-classification", "quick-mode", "single-agent", "over-scoping"],
    createdAt: now, updatedAt: now, pipelineRunId: "analytics-review", version: 1
  },
];
fp.entries.push(...newFP);
saveKB("failure-patterns", fp);
added += newFP.length;
console.log(`failure-patterns: +${newFP.length} (total: ${fp.entries.length})`);

// ═══ SUCCESS PATTERNS (new entries) ═══
const sp = loadKB("success-patterns");
const newSP = [
  {
    id: "kb-su-006", title: "Designer + Frontend paired delivery achieves 10/10 consistency",
    content: "When Designer (S6) and Frontend (S7) run as tight pair on same PRD, both score 10/10. Example: run 165aef87 — Designer 5.3K tokens/78s, Frontend 1.1K tokens/22s. Lesson: spatial proximity in PRD + tight handoff ceremony between design and frontend improves both outputs.",
    source: "pipeline-analytics", severity: "medium",
    tags: ["designer-frontend-pairing", "coordinated-output", "token-efficiency"],
    createdAt: now, updatedAt: now, pipelineRunId: "analytics-review", version: 1
  },
  {
    id: "kb-su-007", title: "ADR with concrete technology names scores 1.0+ points higher",
    content: "S3.1 ADR: 8.8 score. Every choice includes exact tech (AWS SQS FIFO, PostgreSQL 15, Redis/Upstash, NestJS, ECS Fargate) + specific queue name + migration details. Generic ADRs ('use relational DB') fail because downstream agents can't implement. Lesson: vendor, version, and tier specificity drives quality.",
    source: "s3.1-adr", agentId: "architect-agent", severity: "medium",
    tags: ["adr", "technology-specificity", "concrete-choices", "implementability"],
    createdAt: now, updatedAt: now, pipelineRunId: "pipeline-v3-test", version: 1
  },
  {
    id: "kb-su-008", title: "Cyber audit value comes from deep domain knowledge + exact code references",
    content: "S10 Cyber Audit: 9.4 score, 19 findings. Standout: exact file paths (src/auth/hmac.guard.ts), code evidence, working fix with corrected code. Finding 3 (Roles decorator bypass) is non-trivial NestJS internals — missed in manual review. Lesson: cyber value = deep domain + exact references, not generic OWASP checklists.",
    source: "s10-cyber-audit", agentId: "cyber-agent", severity: "medium",
    tags: ["cyber", "specificity", "exact-paths", "code-evidence", "non-obvious-findings"],
    createdAt: now, updatedAt: now, pipelineRunId: "pipeline-v3-test", version: 1
  },
  {
    id: "kb-su-009", title: "Fileplan with numbered migrations + full file enumeration scores 9.4",
    content: "S3.4 Fileplan: 9.4 score. Success: migrations numbered sequentially (001, 002...) with exact table names, NestJS module lists every file (module/controller/service/repository/dto). Generic file plans score 7-8. Lesson: numbered sequences + exhaustive enumeration > high-level summaries.",
    source: "s3.4-fileplan", agentId: "architect-agent", severity: "medium",
    tags: ["fileplan", "numbered-sequences", "concrete-paths", "completeness"],
    createdAt: now, updatedAt: now, pipelineRunId: "pipeline-v3-test", version: 1
  },
  {
    id: "kb-su-010", title: "DevOps breadth across all infra layers = 9.4 score",
    content: "S12A DevOps: 9.4 score. Coverage: .env.example (40+ vars), multi-stage Dockerfiles, CI/CD pipelines, Terraform (SQS/RDS/ElastiCache/IAM), ECS task definition, JWT rotation script. Success = covering ALL infrastructure layers in one coherent output.",
    source: "s12a-devops", agentId: "devops-agent", severity: "medium",
    tags: ["devops", "infrastructure-completeness", "multi-stage", "terraform", "cicd"],
    createdAt: now, updatedAt: now, pipelineRunId: "pipeline-v3-test", version: 1
  },
  {
    id: "kb-su-011", title: "Token/duration ratio reveals agent efficiency — monitor for anomalies",
    content: "Token efficiency: Frontend 0.64 tok/s (high), Backend 2.4 tok/s (cache hits), QA 0.15 tok/s (pathological — timeouts). High tokens + short duration = cache hit. Low throughput = stalled process. Monitor this ratio per agent; anomalies indicate issues.",
    source: "pipeline-analytics", severity: "medium",
    tags: ["token-efficiency", "duration-anomaly", "throughput", "performance"],
    createdAt: now, updatedAt: now, pipelineRunId: "analytics-review", version: 1
  },
];
sp.entries.push(...newSP);
saveKB("success-patterns", sp);
added += newSP.length;
console.log(`success-patterns: +${newSP.length} (total: ${sp.entries.length})`);

// ═══ ARCHITECTURE PATTERNS (new entries) ═══
const ap = loadKB("architecture-patterns");
const newAP = [
  {
    id: "kb-ap-006", title: "Fire-and-forget side-effect pattern — established across modules",
    content: "Pattern: recordAgentActivity(agentId).catch(() => {}) — error swallowed, promise not awaited. Used in: logs-storage, jira-sync, pipeline-executor. Critical ops (logging, sync, timestamps) never block main request. Risk: silent failure. Mitigation: console.error in catch.",
    source: "lib/logs-storage.ts", severity: "medium",
    tags: ["fire-and-forget", "non-blocking", "established-pattern"],
    createdAt: now, updatedAt: now, pipelineRunId: "code-review", version: 1
  },
  {
    id: "kb-ap-007", title: "File-based storage pattern — ensureDataDir + fs/promises + graceful fallback",
    content: "Module pattern in lib/*-storage.ts: (1) ensureDataDir(), (2) readFile+parseJSON with try/catch→default, (3) writeFile atomic, (4) MAX_ENTRIES cap. Consensus: JSON files sufficient for <1MB non-relational data. No DB needed for config/logs/analytics.",
    source: "lib/logs-storage.ts", severity: "medium",
    tags: ["file-based-storage", "atomic-writes", "json-storage"],
    createdAt: now, updatedAt: now, pipelineRunId: "code-review", version: 1
  },
  {
    id: "kb-ap-008", title: "Hydration-safe date formatting — useEffect guard for SSR",
    content: "Dates in Server Components vary by timezone. Pattern: format date only in useEffect after mount, show skeleton until ready. No suppressHydrationWarning. Prevents React hydration mismatch. Proven in footer component and activity timestamps.",
    source: "s7-frontend", agentId: "frontend-agent", severity: "high",
    tags: ["hydration", "ssr", "date-formatting", "useEffect-guard"],
    createdAt: now, updatedAt: now, pipelineRunId: "code-review", version: 1
  },
  {
    id: "kb-ap-009", title: "SWR with revalidateOnFocus:false for file-based APIs",
    content: "When frontend reads from file-based APIs (/api/system/config, /api/agent-activity), use SWR with revalidateOnFocus: false. File data doesn't change on window focus. Saves unnecessary reads. Established pattern across multiple components.",
    source: "s7-frontend", agentId: "frontend-agent", severity: "low",
    tags: ["swr", "data-fetching", "file-based-api"],
    createdAt: now, updatedAt: now, pipelineRunId: "code-review", version: 1
  },
];
ap.entries.push(...newAP);
saveKB("architecture-patterns", ap);
added += newAP.length;
console.log(`architecture-patterns: +${newAP.length} (total: ${ap.entries.length})`);

// ═══ TECH DECISIONS (new entries) ═══
const td = loadKB("tech-decisions");
const newTD = [
  {
    id: "kb-td-006", title: "Zod validation mandatory for all API route inputs",
    content: "Every new API route must validate with Zod schema. Pattern: const InputSchema = z.object({...}), parse with .safeParse(), return 400 on invalid. Not optional. Rationale: type safety, clear error messages, consistent DX across codebase.",
    source: "code-review", agentId: "backend-agent", severity: "high",
    tags: ["zod", "validation", "api-routes", "type-safety"],
    createdAt: now, updatedAt: now, pipelineRunId: "code-review", version: 1
  },
  {
    id: "kb-td-007", title: "Agent Hub proxy + cached fallback pattern for all external calls",
    content: "All Agent Hub calls: (1) try with timeout, (2) on failure use cached fallback from data/ or return null, (3) never block pipeline on external timeout. Applied to: /api/chat, /api/agent-hub/*, KB sync. Decision: mandatory for any new Agent Hub integration.",
    source: "architecture", severity: "high",
    tags: ["agent-hub", "proxy", "fallback", "resilience"],
    createdAt: now, updatedAt: now, pipelineRunId: "code-review", version: 1
  },
  {
    id: "kb-td-008", title: "Tailwind CSS 4 CSS-first config — no tailwind.config.ts",
    content: "All CSS variables and design tokens defined in app/globals.css, not tailwind.config.ts. Tailwind 4 uses CSS-first configuration. All agents must follow this — Designer outputs globals.css, Frontend consumes it.",
    source: "CLAUDE.md", severity: "high",
    tags: ["tailwind-4", "css-first", "design-tokens"],
    createdAt: now, updatedAt: now, pipelineRunId: "code-review", version: 1
  },
  {
    id: "kb-td-009", title: "TypeScript strict mode — noImplicitAny: true mandatory",
    content: "All new tsconfig.json must have noImplicitAny: true. Backend test-steps flagged noImplicitAny: false as code quality concern. Exception: don't change existing mid-sprint. Enforce at merge gate.",
    source: "s5-backend", agentId: "backend-agent", severity: "medium",
    tags: ["typescript", "strict-mode", "noImplicitAny"],
    createdAt: now, updatedAt: now, pipelineRunId: "pipeline-v3-test", version: 1
  },
  {
    id: "kb-td-010", title: "Database migrations must be sequentially numbered with idempotent tracking",
    content: "Pattern: 001_create_xxx.sql, 002_add_yyy.sql. Must track applied migrations in migration_log table. No implicit 'run all SQL'. Always enforce sequence + idempotency. NestJS: TypeORM or custom runner with tracking.",
    source: "s3.4-fileplan", agentId: "architect-agent", severity: "high",
    tags: ["migrations", "idempotency", "sequencing", "database"],
    createdAt: now, updatedAt: now, pipelineRunId: "pipeline-v3-test", version: 1
  },
];
td.entries.push(...newTD);
saveKB("tech-decisions", td);
added += newTD.length;
console.log(`tech-decisions: +${newTD.length} (total: ${td.entries.length})`);

// ═══ SECURITY PLAYBOOK (new entries) ═══
const sec = loadKB("security-playbook");
const newSec = [
  {
    id: "kb-sp-007", title: "Prototype pollution risk in fire-and-forget — validate keys with regex",
    content: "Functions using agentId/keys as JSON properties (e.g., recordAgentActivity) are vulnerable to __proto__ pollution. Fix: regex guard at entry: /^[a-zA-Z0-9_-]{1,64}$/ before using as key. Mandatory for any module accepting user-supplied keys.",
    source: "s4-cyber", agentId: "cyber-agent", severity: "high",
    tags: ["prototype-pollution", "injection", "input-validation"],
    createdAt: now, updatedAt: now, pipelineRunId: "pipeline-runs-analysis", version: 1
  },
  {
    id: "kb-sp-008", title: "Unauthenticated data endpoints leak system topology",
    content: "GET endpoints without auth (e.g., /api/agent-activity, /api/system/config) leak internal agent names, usage patterns, system structure. Not PII, but enables reconnaissance. Fix: add internal header check or localhost-only restriction. All admin endpoints need auth.",
    source: "s4-cyber", agentId: "cyber-agent", severity: "high",
    tags: ["authentication", "topology-leak", "access-control"],
    createdAt: now, updatedAt: now, pipelineRunId: "pipeline-runs-analysis", version: 1
  },
  {
    id: "kb-sp-009", title: "File-based storage without size caps — DoS via unbounded growth",
    content: "Unlike logs-storage (MAX_ENTRIES=200), some stores have no cap. Attacker writes thousands of unique keys, bloating JSON file. Fix: add safety cap (if entries > N return). All file-based stores MUST have max entry count or file size limit.",
    source: "s4-cyber", agentId: "cyber-agent", severity: "medium",
    tags: ["dos-attack", "unbounded-growth", "resource-limits"],
    createdAt: now, updatedAt: now, pipelineRunId: "pipeline-runs-analysis", version: 1
  },
  {
    id: "kb-sp-010", title: "Rate limiting documented but not implemented = false security",
    content: "Endpoints have rate limit comments (60 req/min GET, 10 req/min POST) but zero code enforcement. Attacker floods file I/O. Fix: implement with @upstash/ratelimit sliding window. Return 429 with Retry-After header. Documentation != enforcement.",
    source: "s8-technical-qa", agentId: "qa-agent", severity: "critical",
    tags: ["rate-limiting", "dos-protection", "implementation-gap"],
    createdAt: now, updatedAt: now, pipelineRunId: "pipeline-runs-analysis", version: 1
  },
  {
    id: "kb-sp-011", title: "POST endpoints without authentication = arbitrary data write",
    content: "POST /api/system/config has zero auth — anyone can overwrite config. Fix: validate CRON_SECRET header for backend-to-backend, getServerSession() for user-facing. Rule: ALL POST/PATCH/DELETE must authenticate. GET for non-PII can be public.",
    source: "s8-technical-qa", agentId: "qa-agent", severity: "critical",
    tags: ["authentication", "write-protection", "mutation-security"],
    createdAt: now, updatedAt: now, pipelineRunId: "pipeline-runs-analysis", version: 1
  },
  {
    id: "kb-sp-012", title: "Timestamp + user_id + IP = PII under 152-FZ",
    content: "Timestamp alone: not PII. With user_id + IP address: personal data per 152-FZ Article 3, requires Russian server localization. Store timestamp-only without IP by default. If IP logging added — requires Cyber review + 152-FZ compliance audit.",
    source: "s0-research", agentId: "research-agent", severity: "medium",
    tags: ["152-fz", "pii", "audit-logging", "compliance"],
    createdAt: now, updatedAt: now, pipelineRunId: "pipeline-runs-analysis", version: 1
  },
];
sec.entries.push(...newSec);
saveKB("security-playbook", sec);
added += newSec.length;
console.log(`security-playbook: +${newSec.length} (total: ${sec.entries.length})`);

console.log(`\nTotal: +${added} new entries across all categories`);
