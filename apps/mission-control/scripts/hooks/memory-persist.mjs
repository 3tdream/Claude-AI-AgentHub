#!/usr/bin/env node
/**
 * Memory Persistence Hook — saves/loads session context for MC
 * Used by: SessionStart (load) and Stop (save)
 *
 * Session state file: data/.session-state.json
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MC_DIR = join(__dirname, "..", "..");
const STATE_FILE = join(MC_DIR, "data", ".session-state.json");
const KB_INDEX = join(MC_DIR, "data", "knowledge-base", "_index.json");
const APP_STATE = join(MC_DIR, "data", ".app-state-cache.json");

const event = process.argv[2] || "save";

function ensureDataDir() {
  mkdirSync(join(MC_DIR, "data"), { recursive: true });
}

function saveState() {
  ensureDataDir();

  let activeProjectId = null;
  let kbStats = {};

  // Read app state cache
  if (existsSync(APP_STATE)) {
    try {
      const d = JSON.parse(readFileSync(APP_STATE, "utf8"));
      activeProjectId = d.activeProjectId || null;
    } catch {}
  }

  // Read KB index
  if (existsSync(KB_INDEX)) {
    try {
      const d = JSON.parse(readFileSync(KB_INDEX, "utf8"));
      kbStats = {
        totalEntries: d.totalEntries,
        integrityOk: d.integrityOk,
        staleCategories: d.categories.filter(c => c.stale).map(c => c.category),
      };
    } catch {}
  }

  const state = {
    savedAt: new Date().toISOString(),
    activeProjectId,
    kbStats,
    sessionNote: "Auto-saved by memory-persist hook",
  };

  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  process.stderr.write(`[MC] Session state saved — KB: ${kbStats.totalEntries || 0} entries\n`);
}

function loadState() {
  if (!existsSync(STATE_FILE)) {
    process.stderr.write("[MC] No previous session state found\n");
    return;
  }

  try {
    const s = JSON.parse(readFileSync(STATE_FILE, "utf8"));
    const age = Math.round((Date.now() - new Date(s.savedAt).getTime()) / 60000);
    const parts = [];
    if (s.activeProjectId) parts.push(`Project: ${s.activeProjectId}`);
    if (s.kbStats?.totalEntries) parts.push(`KB: ${s.kbStats.totalEntries} entries`);
    if (s.kbStats?.staleCategories?.length > 0) parts.push(`Stale KB: ${s.kbStats.staleCategories.join(", ")}`);
    process.stderr.write(`[MC] Restored session from ${age}min ago — ${parts.join(" | ")}\n`);
  } catch (err) {
    process.stderr.write(`[MC] Failed to load session state: ${err.message}\n`);
  }
}

if (event === "save") saveState();
else if (event === "load") loadState();
else {
  process.stderr.write(`[MC] Unknown event: ${event}\n`);
  process.exit(1);
}
