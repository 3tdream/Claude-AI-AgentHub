#!/usr/bin/env bash
# Memory Persistence Hook — saves/loads session context for MC
# Used by: SessionStart (load) and Stop (save)
#
# Session state file: data/.session-state.json
# Contains: active pipeline, last project, KB query cache, timestamp

set -euo pipefail

MC_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
STATE_FILE="$MC_DIR/data/.session-state.json"
HOOK_EVENT="${1:-save}"

ensure_data_dir() {
  mkdir -p "$MC_DIR/data"
}

# ── SAVE: capture current state on Stop ──────────────────────
save_state() {
  ensure_data_dir

  # Collect state from various sources
  local active_project=""
  local pipeline_status=""
  local kb_stats=""
  local timestamp
  timestamp="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

  # Read app-store state from localStorage proxy (if available)
  if [ -f "$MC_DIR/data/.app-state-cache.json" ]; then
    active_project=$(node -e "
      try {
        const d = JSON.parse(require('fs').readFileSync('$MC_DIR/data/.app-state-cache.json','utf8'));
        console.log(d.activeProjectId || '');
      } catch { console.log(''); }
    " 2>/dev/null || echo "")
  fi

  # Read KB index for stats
  if [ -f "$MC_DIR/data/knowledge-base/_index.json" ]; then
    kb_stats=$(node -e "
      const d = JSON.parse(require('fs').readFileSync('$MC_DIR/data/knowledge-base/_index.json','utf8'));
      console.log(JSON.stringify({
        totalEntries: d.totalEntries,
        integrityOk: d.integrityOk,
        staleCategories: d.categories.filter(c => c.stale).map(c => c.category)
      }));
    " 2>/dev/null || echo '{}')
  fi

  # Write session state
  node -e "
    const state = {
      savedAt: '$timestamp',
      activeProjectId: '$active_project' || null,
      kbStats: $( [ -n "$kb_stats" ] && echo "$kb_stats" || echo '{}'),
      sessionNote: 'Auto-saved by memory-persist hook'
    };
    require('fs').writeFileSync('$STATE_FILE', JSON.stringify(state, null, 2));
  " 2>/dev/null

  echo "[MC] Session state saved at $timestamp" >&2
}

# ── LOAD: restore context on SessionStart ────────────────────
load_state() {
  if [ ! -f "$STATE_FILE" ]; then
    echo "[MC] No previous session state found" >&2
    exit 0
  fi

  # Output state summary to stderr (visible to Claude)
  node -e "
    const s = JSON.parse(require('fs').readFileSync('$STATE_FILE','utf8'));
    const age = Math.round((Date.now() - new Date(s.savedAt).getTime()) / 60000);
    const parts = [];
    if (s.activeProjectId) parts.push('Project: ' + s.activeProjectId);
    if (s.kbStats?.totalEntries) parts.push('KB: ' + s.kbStats.totalEntries + ' entries');
    if (s.kbStats?.staleCategories?.length > 0) parts.push('Stale KB: ' + s.kbStats.staleCategories.join(', '));
    console.error('[MC] Restored session from ' + age + 'min ago — ' + parts.join(' | '));
  " 2>&1
}

case "$HOOK_EVENT" in
  save) save_state ;;
  load) load_state ;;
  *) echo "[MC] Unknown event: $HOOK_EVENT" >&2; exit 1 ;;
esac
