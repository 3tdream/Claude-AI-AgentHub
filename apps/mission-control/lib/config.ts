/**
 * Centralized configuration constants — Pipeline v3.0
 * All magic numbers and hardcoded IDs live here.
 */

/** Pipeline executor config */
export const PIPELINE = {
  /** Max retry attempts per step before accepting with warning or escalating */
  MAX_RETRIES: 3,
  /** Smart retry: stop if score doesn't improve by this much after 2 attempts */
  SMART_RETRY_MIN_IMPROVEMENT: 0.5,
  /** Default escalation threshold (overridden per-agent below) */
  ESCALATION_THRESHOLD: 5,
  /** Default quality pass threshold (overridden per-agent below) */
  QUALITY_PASS_THRESHOLD: 7.5,
  /** Default quality threshold if not specified per-step */
  DEFAULT_QUALITY_THRESHOLD: 7.5,
  /** Timeout per agent execution step (ms) — 0 = no timeout.
   *  Disabled: tool-enabled agents need >120s for multi-turn loops.
   *  Re-enable when per-agent timeouts implemented. */
  STEP_TIMEOUT_MS: 0,
  /** Timeout for run_command tool (ms) */
  COMMAND_TIMEOUT_MS: 20_000,
  /** Max output tokens for LLM calls */
  MAX_OUTPUT_TOKENS: 65_536,
  /** Short output auto-fail threshold (chars) */
  SHORT_OUTPUT_THRESHOLD: 100,
  /** Max QA feedback fix cycles before escalating to user */
  MAX_QA_FIX_CYCLES: 2,
  /** Max Cyber-gated architecture redesign cycles (1 = one chance to fix) */
  MAX_CYBER_REDESIGN_CYCLES: 1,
} as const;

/** Per-agent dynamic configuration */
export const AGENT_CONFIG: Record<string, {
  qualityThreshold: number;
  escalationThreshold: number;
  maxTurns: number;
  maxContextChars: number;
  readBudget: number;
  wordLimit?: number;
  diffSoft?: { edit: number; create: number };
  diffHard?: number;
}> = {
  "research-agent":   { qualityThreshold: 7.5, escalationThreshold: 5, maxTurns: 4,  maxContextChars: 8000,  readBudget: 5,  wordLimit: 4000 },
  "orchestrator":     { qualityThreshold: 7.5, escalationThreshold: 5, maxTurns: 4,  maxContextChars: 8000,  readBudget: 5,  wordLimit: 4000 },
  "pm-agent":         { qualityThreshold: 7.5, escalationThreshold: 5, maxTurns: 5,  maxContextChars: 8000,  readBudget: 8,  wordLimit: 4000 },
  "architect-agent":  { qualityThreshold: 7.5, escalationThreshold: 5, maxTurns: 5,  maxContextChars: 8000,  readBudget: 5,  wordLimit: 4000 },
  "cyber-agent":      { qualityThreshold: 7.5, escalationThreshold: 5, maxTurns: 6,  maxContextChars: 8000,  readBudget: 10, wordLimit: 4000 },
  "backend-agent":    { qualityThreshold: 7.5, escalationThreshold: 5, maxTurns: 5,  maxContextChars: 8000,  readBudget: 5,  diffSoft: { edit: 50, create: 120 }, diffHard: 250 },
  "frontend-agent":   { qualityThreshold: 7.5, escalationThreshold: 5, maxTurns: 5,  maxContextChars: 8000,  readBudget: 5,  diffSoft: { edit: 30, create: 80 }, diffHard: 150 },
  "designer-agent":   { qualityThreshold: 7.5, escalationThreshold: 5, maxTurns: 5,  maxContextChars: 8000,  readBudget: 5,  wordLimit: 4000 },
  "qa-agent":         { qualityThreshold: 7.5, escalationThreshold: 5, maxTurns: 10, maxContextChars: 8000,  readBudget: 15, wordLimit: 4000 },
  "devops-agent":     { qualityThreshold: 7.5, escalationThreshold: 5, maxTurns: 7,  maxContextChars: 8000,  readBudget: 10 },
};

/** Per-agent scoring weights: task(completion), comp(leteness), spec(ificity), act(ionability) */
export const AGENT_SCORING_WEIGHTS: Record<string, { task: number; comp: number; spec: number; act: number }> = {
  "research-agent":   { task: 0.4, comp: 0.3, spec: 0.2, act: 0.1 },
  "orchestrator":     { task: 0.4, comp: 0.2, spec: 0.1, act: 0.3 },
  "pm-agent":         { task: 0.45, comp: 0.35, spec: 0.1, act: 0.1 },
  "architect-agent":  { task: 0.5, comp: 0.1, spec: 0.15, act: 0.25 },
  "cyber-agent":      { task: 0.6, comp: 0.2, spec: 0.1, act: 0.1 },
  "backend-agent":    { task: 0.7, comp: 0.1, spec: 0.1, act: 0.1 },
  "frontend-agent":   { task: 0.7, comp: 0.1, spec: 0.1, act: 0.1 },
  "designer-agent":   { task: 0.5, comp: 0.2, spec: 0.2, act: 0.1 },
  "qa-agent":         { task: 0.6, comp: 0.1, spec: 0.1, act: 0.2 },
  "devops-agent":     { task: 0.7, comp: 0.1, spec: 0.1, act: 0.1 },
  "_default":         { task: 0.4, comp: 0.4, spec: 0.1, act: 0.1 }, // consolidation + unknown
};

/** Tool output limits (chars) */
export const TOOL_OUTPUT_LIMITS = {
  read_file: 12_000,
  run_command: 10_000,
  default: 8_000,
} as const;

/** Per-mode pipeline configuration */
export const MODE_CONFIG = {
  quick: {
    qualityThreshold: 0,
    evalScope: "none" as const,
    resolveDeps: "none" as const,
    includeCheckpoint: false,
    skipAgents: [] as string[],
    estimatedTokens: "~5-10K",
    estimatedTime: "~30-60s",
  },
  medium: {
    qualityThreshold: 7,
    evalScope: "final-only" as const,
    resolveDeps: "architect-only" as const,
    includeCheckpoint: false,
    skipAgents: ["research-agent", "cyber-agent"] as string[],
    estimatedTokens: "~30-50K",
    estimatedTime: "~2-3 min",
  },
  full: {
    qualityThreshold: 8.5,
    evalScope: "all" as const,
    resolveDeps: "full" as const,
    includeCheckpoint: true,
    skipAgents: [] as string[],
    estimatedTokens: "~100K+",
    estimatedTime: "~5-10 min",
  },
} as const;

/** Logs storage config */
export const LOGS = {
  MAX_ENTRIES: 2000,
} as const;

/** Cache config */
export const CACHE = {
  SNAPSHOT_DATE: "2026-02-28",
} as const;

/** Agent IDs used internally */
export const AGENT_IDS = {
  ORCHESTRATOR: "orchestrator",
} as const;

/** JQL sanitization */
export const JQL_PROJECT_KEY_PATTERN = /^[A-Z][A-Z0-9_]{1,10}$/;
