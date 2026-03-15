/**
 * Centralized configuration constants.
 * All magic numbers and hardcoded IDs live here.
 */

/** Pipeline executor config */
export const PIPELINE = {
  /** Max retry attempts per step before accepting with warning or escalating */
  MAX_RETRIES: 2,
  /** Score below this after max retries → escalation (halt pipeline) */
  ESCALATION_THRESHOLD: 5,
  /** Score at or above this → PASS */
  QUALITY_PASS_THRESHOLD: 8,
  /** Default quality threshold if not specified per-step */
  DEFAULT_QUALITY_THRESHOLD: 8,
  /** Timeout per agent execution step (ms) — 0 = no timeout.
   *  Currently disabled: collecting analytics first.
   *  Plan: auto-calibrate per-step after every 50 executions (median + 30% buffer). */
  STEP_TIMEOUT_MS: 0,
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
  /** Maximum log entries before oldest are dropped */
  MAX_ENTRIES: 2000,
} as const;

/** Cache config */
export const CACHE = {
  /** Date the hardcoded cache was last refreshed */
  SNAPSHOT_DATE: "2026-02-28",
} as const;

/** Agent IDs used internally */
export const AGENT_IDS = {
  /** Orchestrator agent used for quality evaluation and knowledge extraction */
  ORCHESTRATOR: "orchestrator",
} as const;

/** JQL sanitization — only alphanumeric, hyphens, and underscores allowed in project keys */
export const JQL_PROJECT_KEY_PATTERN = /^[A-Z][A-Z0-9_]{1,10}$/;
