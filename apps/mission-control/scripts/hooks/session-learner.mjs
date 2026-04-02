#!/usr/bin/env node
/**
 * Session Learner — Stop hook that extracts patterns from Claude Code sessions.
 *
 * Bridges Claude Code conversations → MC Knowledge Base.
 *
 * Pattern detection:
 * 1. Error resolutions — "error TS..." followed by a fix
 * 2. User corrections — "no", "don't", "wrong", "not that" → behavioral patterns
 * 3. Workarounds — "instead of X, use Y" patterns
 * 4. Build fixes — compilation error → fix sequences
 * 5. Project-specific — patterns unique to this codebase
 *
 * Runs as a Stop hook (after each Claude response).
 * Accumulates observations in data/.session-observations.jsonl
 * When threshold reached, flushes to KB via API.
 */

import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MC_DIR = join(__dirname, "..", "..");
const OBS_FILE = join(MC_DIR, "data", ".session-observations.jsonl");
const STATE_FILE = join(MC_DIR, "data", ".learner-state.json");
const FLUSH_THRESHOLD = 5; // Flush to KB after this many observations

// ── Ensure data dir ─────────────────────────────────────────

mkdirSync(join(MC_DIR, "data"), { recursive: true });

// ── Read hook input from stdin ──────────────────────────────

let hookInput = {};
try {
  const stdin = readFileSync(0, "utf8");
  if (stdin.trim()) {
    hookInput = JSON.parse(stdin);
  }
} catch {
  // No stdin or invalid JSON — that's OK for Stop hooks
}

// ── Pattern Detectors ───────────────────────────────────────

const PATTERNS = [
  {
    id: "error-resolution",
    category: "failure-patterns",
    detect: (output) => {
      // Detect TypeScript errors that were fixed
      const tsErrors = output.match(/error TS\d{4}/g);
      const fixes = output.match(/(?:Fixed|Resolved|Changed|Updated).*(?:type|import|null|undefined)/gi);
      if (tsErrors && fixes) {
        return {
          title: `TypeScript fix: ${tsErrors[0]} — ${fixes[0].substring(0, 60)}`,
          content: `Session resolved ${tsErrors.length} TypeScript error(s). Key fix: ${fixes[0]}. Errors: ${[...new Set(tsErrors)].join(", ")}`,
          severity: "medium",
          tags: ["typescript", "compilation", "session-learned", ...new Set(tsErrors)],
        };
      }
      return null;
    },
  },
  {
    id: "build-fix",
    category: "failure-patterns",
    detect: (output) => {
      // Detect build failures that were resolved
      const buildFail = output.match(/(?:Build failed|build error|Module not found|Cannot find module)[^.]*\./gi);
      const buildPass = output.match(/(?:Build succeeded|compiled successfully|no errors)/gi);
      if (buildFail && buildPass) {
        return {
          title: `Build fix: ${buildFail[0].substring(0, 60)}`,
          content: `Build failure resolved in session. Error: ${buildFail[0]}. Build subsequently passed.`,
          severity: "medium",
          tags: ["build", "compilation", "session-learned"],
        };
      }
      return null;
    },
  },
  {
    id: "workaround",
    category: "tech-decisions",
    detect: (output) => {
      // Detect "instead of X, use Y" patterns
      const workarounds = output.match(/(?:instead of|rather than|don't use|use .+ instead)[^.]*\./gi);
      if (workarounds && workarounds.length > 0) {
        return {
          title: `Workaround: ${workarounds[0].substring(0, 60)}`,
          content: workarounds.join(" "),
          severity: "low",
          tags: ["workaround", "technique", "session-learned"],
        };
      }
      return null;
    },
  },
  {
    id: "hydration-fix",
    category: "failure-patterns",
    detect: (output) => {
      if (output.includes("hydration") && output.match(/(?:fix|resolve|suppress|mount)/i)) {
        const context = output.match(/hydration[^.]{0,200}\./gi)?.[0] || "";
        return {
          title: "Hydration mismatch fix",
          content: `Session resolved a React hydration mismatch. Context: ${context}`,
          severity: "high",
          tags: ["hydration", "react", "ssr", "session-learned"],
        };
      }
      return null;
    },
  },
  {
    id: "api-pattern",
    category: "architecture-patterns",
    detect: (output) => {
      // Detect new API route creation patterns
      const apiRoutes = output.match(/(?:created|added|new) (?:API |)(?:route|endpoint)[^.]*\./gi);
      if (apiRoutes) {
        return {
          title: `API pattern: ${apiRoutes[0].substring(0, 60)}`,
          content: apiRoutes.join(" "),
          severity: "low",
          tags: ["api", "architecture", "session-learned"],
        };
      }
      return null;
    },
  },
];

// ── Extract observations from hook output ───────────────────

function extractObservations(input) {
  const output = input.tool_output?.output || input.tool_input?.content || "";
  if (!output || output.length < 50) return [];

  const observations = [];
  for (const pattern of PATTERNS) {
    try {
      const match = pattern.detect(output);
      if (match) {
        observations.push({
          ...match,
          patternId: pattern.id,
          category: pattern.category,
          timestamp: new Date().toISOString(),
          confidence: 0.3, // Tentative — will be boosted if confirmed
          source: "session-learner",
        });
      }
    } catch {
      // Pattern detector failed — skip
    }
  }
  return observations;
}

// ── Flush observations to KB via API ────────────────────────

async function flushToKB(observations) {
  const grouped = {};
  for (const obs of observations) {
    if (!grouped[obs.category]) grouped[obs.category] = [];
    grouped[obs.category].push(obs);
  }

  let flushed = 0;
  for (const [category, entries] of Object.entries(grouped)) {
    for (const entry of entries) {
      try {
        // Dedupe: check if similar pattern already exists
        const searchRes = await fetch(
          `http://localhost:3000/api/knowledge/search?q=${encodeURIComponent(entry.title.substring(0, 30))}&category=${category}`
        );
        if (searchRes.ok) {
          const { data } = await searchRes.json();
          if (data && data.length > 0) {
            // Similar pattern exists — boost confidence instead of adding duplicate
            const existing = data[0];
            await fetch("http://localhost:3000/api/knowledge/evolve", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "pipeline",
                stepResults: [{ stepId: existing.source, agentId: "session-learner", status: "completed", qualityScore: 8 }],
                pipelineRunId: `session-${Date.now()}`,
              }),
            });
            flushed++;
            continue;
          }
        }
      } catch {
        // API not running — save locally for later
      }

      // New pattern — add to KB
      try {
        await fetch("http://localhost:3000/api/knowledge/entry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category,
            title: entry.title,
            content: entry.content,
            source: "session-learner",
            agentId: "session-learner",
            severity: entry.severity,
            tags: entry.tags,
            confidence: entry.confidence,
          }),
        });
        flushed++;
      } catch {
        // API not running — observations stay in JSONL for next flush
      }
    }
  }
  return flushed;
}

// ── Main ────────────────────────────────────────────────────

const observations = extractObservations(hookInput);

if (observations.length > 0) {
  // Append to observation log
  for (const obs of observations) {
    appendFileSync(OBS_FILE, JSON.stringify(obs) + "\n");
  }

  // Check if flush threshold reached
  let totalObs = 0;
  if (existsSync(OBS_FILE)) {
    const lines = readFileSync(OBS_FILE, "utf8").trim().split("\n").filter(Boolean);
    totalObs = lines.length;
  }

  if (totalObs >= FLUSH_THRESHOLD) {
    const allObs = readFileSync(OBS_FILE, "utf8")
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((l) => { try { return JSON.parse(l); } catch { return null; } })
      .filter(Boolean);

    const flushed = await flushToKB(allObs);

    if (flushed > 0) {
      // Clear the observation log
      writeFileSync(OBS_FILE, "");
      process.stderr.write(`[MC Learn] Flushed ${flushed} patterns to KB from ${totalObs} observations\n`);
    }
  } else {
    process.stderr.write(`[MC Learn] ${observations.length} observation(s) recorded (${totalObs}/${FLUSH_THRESHOLD} until flush)\n`);
  }
}
