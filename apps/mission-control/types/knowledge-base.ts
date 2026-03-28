/** Knowledge Base types — versioned entries with hash-based validation */

export type KBCategory =
  | "failure-patterns"
  | "success-patterns"
  | "security-playbook"
  | "architecture-patterns"
  | "tech-decisions";

export interface KBEntry {
  id: string;
  /** Short title */
  title: string;
  /** Detailed content / lesson learned */
  content: string;
  /** Which pipeline stage or agent produced this */
  source: string;
  /** Agent that discovered / reported this */
  agentId?: string;
  /** Severity: how impactful is this pattern */
  severity: "critical" | "high" | "medium" | "low";
  /** Tags for search */
  tags: string[];
  /** ISO timestamp of creation */
  createdAt: string;
  /** ISO timestamp of last update */
  updatedAt: string;
  /** Pipeline run ID that produced this entry */
  pipelineRunId?: string;
  /** Version counter — incremented on each update */
  version: number;
  /** Confidence weight 0-1 (1 = verified, decays over time if unconfirmed) */
  confidence?: number;
  /** ISO timestamp of last confirmation (pipeline pass that validated this pattern) */
  lastConfirmedAt?: string;
  /** How many times this pattern was confirmed by pipeline runs */
  confirmCount?: number;
}

export interface KBFile {
  category: KBCategory;
  description: string;
  entries: KBEntry[];
  /** SHA-256 hash of JSON.stringify(entries) — for integrity validation */
  contentHash: string;
  /** ISO timestamp */
  lastUpdated: string;
  /** Schema version for future migrations */
  schemaVersion: 1;
}

export interface KBIndex {
  categories: {
    category: KBCategory;
    description: string;
    entryCount: number;
    contentHash: string;
    lastUpdated: string;
    stale: boolean;
  }[];
  totalEntries: number;
  lastValidated: string;
  /** Overall integrity: all hashes match */
  integrityOk: boolean;
}
