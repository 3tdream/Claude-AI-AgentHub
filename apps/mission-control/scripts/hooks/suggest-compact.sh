#!/usr/bin/env bash
# Strategic Compaction Hook — PreToolUse
# Counts tool calls and suggests /compact every ~50 invocations
# State tracked in: data/.tool-call-count

set -euo pipefail

MC_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
COUNT_FILE="$MC_DIR/data/.tool-call-count"

mkdir -p "$MC_DIR/data"

# Read current count
COUNT=0
if [ -f "$COUNT_FILE" ]; then
  COUNT=$(cat "$COUNT_FILE" 2>/dev/null || echo "0")
fi

# Increment
COUNT=$((COUNT + 1))
echo "$COUNT" > "$COUNT_FILE"

# Suggest compaction at thresholds
if [ "$COUNT" -eq 50 ]; then
  echo "" >&2
  echo "[MC] 50 tool calls in this session. Consider running /compact if context is getting heavy." >&2
  echo "     This preserves important context before auto-compaction drops it." >&2
  echo "" >&2
elif [ "$COUNT" -eq 80 ]; then
  echo "" >&2
  echo "[MC] 80 tool calls — compaction recommended. Run /compact to save context." >&2
  echo "" >&2
elif [ "$COUNT" -eq 100 ]; then
  echo "" >&2
  echo "[MC] 100 tool calls — high risk of auto-compaction. Please /compact now." >&2
  echo "" >&2
fi

exit 0
