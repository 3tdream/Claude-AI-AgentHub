/**
 * KB Evolution — Confidence scoring + Pattern aging
 *
 * Instinct-inspired system from ECC:
 * - Confidence tiers: 0.3 tentative → 0.5 moderate → 0.7 strong → 0.9 near-certain
 * - Boost on pipeline confirmation (same pattern seen again)
 * - Decay on contradiction (pattern didn't apply)
 * - Age-based staleness after 30 days without confirmation
 */

import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import type { KBCategory, KBEntry, KBFile } from "@/types";

const KB_DIR = path.join(process.cwd(), "data", "knowledge-base");
const INDEX_FILE = path.join(KB_DIR, "_index.json");

// ── Configuration ───────────────────────────────────────────

const CONFIDENCE_TIERS = {
  tentative: 0.3,   // New, unconfirmed pattern
  moderate: 0.5,    // Seen once more
  strong: 0.7,      // Confirmed by 2+ runs
  nearCertain: 0.9, // Core pattern, 4+ confirmations
} as const;

const CONFIDENCE_BOOST = 0.1;      // Per confirmation
const CONFIDENCE_DECAY_RATE = 0.02; // Per day without confirmation
const CONFIDENCE_MIN = 0.1;         // Floor — never drops below
const CONFIDENCE_MAX = 0.95;        // Ceiling
const STALE_THRESHOLD_DAYS = 30;    // Mark stale after this
const STALE_CONFIDENCE_PENALTY = 0.15; // One-time penalty when entering stale

// ── Helpers ─────────────────────────────────────────────────

function computeHash(entries: KBEntry[]): string {
  return crypto.createHash("sha256").update(JSON.stringify(entries)).digest("hex");
}

function categoryPath(category: KBCategory): string {
  return path.join(KB_DIR, `${category}.json`);
}

async function readKBFile(category: KBCategory): Promise<KBFile | null> {
  try {
    const raw = await fs.readFile(categoryPath(category), "utf-8");
    return JSON.parse(raw) as KBFile;
  } catch {
    return null;
  }
}

async function writeKBFile(file: KBFile): Promise<void> {
  file.contentHash = computeHash(file.entries);
  file.lastUpdated = new Date().toISOString();
  await fs.writeFile(categoryPath(file.category), JSON.stringify(file, null, 2), "utf-8");
}

function daysSince(isoDate: string): number {
  return (Date.now() - new Date(isoDate).getTime()) / (24 * 60 * 60 * 1000);
}

// ── Confidence Tier Label ───────────────────────────────────

export function getConfidenceTier(confidence: number): string {
  if (confidence >= CONFIDENCE_TIERS.nearCertain) return "near-certain";
  if (confidence >= CONFIDENCE_TIERS.strong) return "strong";
  if (confidence >= CONFIDENCE_TIERS.moderate) return "moderate";
  return "tentative";
}

// ── Core: Boost Confidence ──────────────────────────────────

/**
 * Called when a pipeline run confirms a pattern.
 * E.g., failure pattern was relevant and the fix worked,
 * or success pattern was followed and the stage passed.
 */
export async function boostConfidence(
  category: KBCategory,
  entryId: string,
  pipelineRunId?: string,
): Promise<KBEntry | null> {
  const file = await readKBFile(category);
  if (!file) return null;

  const idx = file.entries.findIndex((e) => e.id === entryId);
  if (idx === -1) return null;

  const entry = file.entries[idx];
  const now = new Date().toISOString();
  const currentConfidence = entry.confidence ?? CONFIDENCE_TIERS.moderate;

  const updated: KBEntry = {
    ...entry,
    confidence: Math.min(currentConfidence + CONFIDENCE_BOOST, CONFIDENCE_MAX),
    confirmCount: (entry.confirmCount ?? 0) + 1,
    lastConfirmedAt: now,
    updatedAt: now,
    version: entry.version + 1,
    pipelineRunId: pipelineRunId ?? entry.pipelineRunId,
  };

  file.entries[idx] = updated;
  await writeKBFile(file);
  return updated;
}

// ── Core: Decay Confidence ──────────────────────────────────

/**
 * Called when a pattern is contradicted by pipeline results.
 * E.g., failure pattern was injected but the failure didn't occur
 * (possibly because the fix was already applied and the pattern is obsolete).
 */
export async function decayConfidence(
  category: KBCategory,
  entryId: string,
  reason?: string,
): Promise<KBEntry | null> {
  const file = await readKBFile(category);
  if (!file) return null;

  const idx = file.entries.findIndex((e) => e.id === entryId);
  if (idx === -1) return null;

  const entry = file.entries[idx];
  const currentConfidence = entry.confidence ?? CONFIDENCE_TIERS.moderate;

  const updated: KBEntry = {
    ...entry,
    confidence: Math.max(currentConfidence - CONFIDENCE_BOOST, CONFIDENCE_MIN),
    updatedAt: new Date().toISOString(),
    version: entry.version + 1,
  };

  file.entries[idx] = updated;
  await writeKBFile(file);
  return updated;
}

// ── Core: Age-Based Decay (batch) ───────────────────────────

/**
 * Run periodically (e.g., nightly or on pipeline start).
 * Decays confidence of entries not confirmed recently.
 * Returns count of entries affected.
 */
export async function applyAgingDecay(category: KBCategory): Promise<{
  aged: number;
  staled: number;
  entries: Array<{ id: string; title: string; confidence: number; tier: string; stale: boolean }>;
}> {
  const file = await readKBFile(category);
  if (!file) return { aged: 0, staled: 0, entries: [] };

  let aged = 0;
  let staled = 0;
  const affectedEntries: Array<{ id: string; title: string; confidence: number; tier: string; stale: boolean }> = [];

  for (const entry of file.entries) {
    const lastActive = entry.lastConfirmedAt || entry.updatedAt;
    const days = daysSince(lastActive);
    const currentConfidence = entry.confidence ?? CONFIDENCE_TIERS.moderate;

    if (days <= 7) continue; // Grace period — no decay in first week

    let newConfidence = currentConfidence;
    let isStale = false;

    // Gradual decay based on days since last confirmation
    const decayDays = days - 7; // Only count days after grace period
    const decay = decayDays * CONFIDENCE_DECAY_RATE;
    newConfidence = Math.max(currentConfidence - decay, CONFIDENCE_MIN);

    // Stale threshold
    if (days >= STALE_THRESHOLD_DAYS && currentConfidence > CONFIDENCE_MIN) {
      isStale = true;
      staled++;
      // One-time penalty for entering stale zone
      if (!entry.lastConfirmedAt || daysSince(entry.lastConfirmedAt) >= STALE_THRESHOLD_DAYS) {
        newConfidence = Math.max(newConfidence - STALE_CONFIDENCE_PENALTY, CONFIDENCE_MIN);
      }
    }

    if (newConfidence !== currentConfidence) {
      entry.confidence = Math.round(newConfidence * 100) / 100;
      entry.updatedAt = new Date().toISOString();
      aged++;
      affectedEntries.push({
        id: entry.id,
        title: entry.title,
        confidence: entry.confidence,
        tier: getConfidenceTier(entry.confidence),
        stale: isStale,
      });
    }
  }

  if (aged > 0) {
    await writeKBFile(file);
  }

  return { aged, staled, entries: affectedEntries };
}

// ── Batch: Apply aging to all categories ────────────────────

export async function applyAgingDecayAll(): Promise<{
  totalAged: number;
  totalStaled: number;
  byCategory: Record<string, { aged: number; staled: number }>;
}> {
  const categories: KBCategory[] = [
    "failure-patterns",
    "success-patterns",
    "security-playbook",
    "architecture-patterns",
    "tech-decisions",
  ];

  let totalAged = 0;
  let totalStaled = 0;
  const byCategory: Record<string, { aged: number; staled: number }> = {};

  for (const cat of categories) {
    const result = await applyAgingDecay(cat);
    totalAged += result.aged;
    totalStaled += result.staled;
    byCategory[cat] = { aged: result.aged, staled: result.staled };
  }

  return { totalAged, totalStaled, byCategory };
}

// ── Pipeline Integration: Post-Run Evolution ────────────────

/**
 * Called after a pipeline run completes.
 * Matches step results against KB entries to boost/decay confidence.
 */
export async function evolveFromPipelineRun(
  stepResults: Array<{
    stepId: string;
    agentId: string;
    status: "completed" | "failed";
    qualityScore?: number;
  }>,
  pipelineRunId: string,
): Promise<{
  boosted: Array<{ id: string; title: string; newConfidence: number }>;
  decayed: Array<{ id: string; title: string; newConfidence: number }>;
}> {
  const categories: KBCategory[] = [
    "failure-patterns",
    "success-patterns",
    "security-playbook",
    "architecture-patterns",
    "tech-decisions",
  ];

  const boosted: Array<{ id: string; title: string; newConfidence: number }> = [];
  const decayed: Array<{ id: string; title: string; newConfidence: number }> = [];

  for (const cat of categories) {
    const file = await readKBFile(cat);
    if (!file) continue;

    for (const entry of file.entries) {
      // Find matching step results for this entry
      const matchingSteps = stepResults.filter(
        (s) => s.stepId === entry.source || s.agentId === entry.agentId,
      );

      if (matchingSteps.length === 0) continue;

      for (const step of matchingSteps) {
        if (cat === "failure-patterns") {
          // Failure pattern + step succeeded = pattern was useful (boost)
          // Failure pattern + step failed with same issue = still relevant (boost)
          // Failure pattern + step succeeded repeatedly = maybe obsolete (decay after threshold)
          if (step.status === "completed" && (step.qualityScore ?? 7) >= 8.5) {
            const result = await boostConfidence(cat, entry.id, pipelineRunId);
            if (result) boosted.push({ id: result.id, title: result.title, newConfidence: result.confidence ?? 0.5 });
          }
        } else if (cat === "success-patterns") {
          // Success pattern + step succeeded = pattern confirmed (boost)
          if (step.status === "completed" && (step.qualityScore ?? 7) >= 8) {
            const result = await boostConfidence(cat, entry.id, pipelineRunId);
            if (result) boosted.push({ id: result.id, title: result.title, newConfidence: result.confidence ?? 0.5 });
          }
          // Success pattern + step failed = pattern didn't help (decay)
          if (step.status === "failed") {
            const result = await decayConfidence(cat, entry.id, `Step ${step.stepId} failed`);
            if (result) decayed.push({ id: result.id, title: result.title, newConfidence: result.confidence ?? 0.5 });
          }
        }
      }
    }
  }

  return { boosted, decayed };
}

// ── Query: Filter by confidence ─────────────────────────────

/**
 * Filter entries by minimum confidence tier.
 * Used by kb-agent-context to skip low-confidence patterns.
 */
export function filterByConfidence(
  entries: KBEntry[],
  minTier: "tentative" | "moderate" | "strong" | "near-certain" = "tentative",
): KBEntry[] {
  const minConfidence = CONFIDENCE_TIERS[minTier === "near-certain" ? "nearCertain" : minTier];
  return entries.filter((e) => (e.confidence ?? CONFIDENCE_TIERS.moderate) >= minConfidence);
}

/**
 * Get KB health report — confidence distribution across all categories.
 */
export async function getConfidenceReport(): Promise<{
  total: number;
  distribution: Record<string, number>;
  staleCount: number;
  lowConfidenceEntries: Array<{ id: string; title: string; category: string; confidence: number; daysSinceConfirmed: number }>;
}> {
  const categories: KBCategory[] = [
    "failure-patterns",
    "success-patterns",
    "security-playbook",
    "architecture-patterns",
    "tech-decisions",
  ];

  let total = 0;
  const distribution: Record<string, number> = {
    "near-certain": 0,
    strong: 0,
    moderate: 0,
    tentative: 0,
  };
  let staleCount = 0;
  const lowConfidenceEntries: Array<{ id: string; title: string; category: string; confidence: number; daysSinceConfirmed: number }> = [];

  for (const cat of categories) {
    const file = await readKBFile(cat);
    if (!file) continue;

    for (const entry of file.entries) {
      total++;
      const conf = entry.confidence ?? CONFIDENCE_TIERS.moderate;
      const tier = getConfidenceTier(conf);
      distribution[tier]++;

      const lastActive = entry.lastConfirmedAt || entry.updatedAt;
      const days = daysSince(lastActive);

      if (days >= STALE_THRESHOLD_DAYS) staleCount++;

      if (conf < CONFIDENCE_TIERS.moderate) {
        lowConfidenceEntries.push({
          id: entry.id,
          title: entry.title,
          category: cat,
          confidence: conf,
          daysSinceConfirmed: Math.round(days),
        });
      }
    }
  }

  return { total, distribution, staleCount, lowConfidenceEntries };
}
