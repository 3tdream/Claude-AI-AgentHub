#!/usr/bin/env bash
# Stop: Format + Typecheck Hook
# Runs tsc --noEmit after each response to catch type errors early
# Only runs if .ts/.tsx files were modified in this response

set -euo pipefail

MC_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

# Check if any TS files were modified recently (last 2 minutes)
MODIFIED=$(cd "$MC_DIR" && git diff --name-only -- '*.ts' '*.tsx' 2>/dev/null || true)

if [ -z "$MODIFIED" ]; then
  exit 0
fi

FILE_COUNT=$(echo "$MODIFIED" | wc -l | tr -d ' ')

# Run typecheck
echo "[MC] Typechecking $FILE_COUNT modified files..." >&2

TSC_OUTPUT=$(cd "$MC_DIR" && node_modules/.bin/tsc --noEmit --pretty 2>&1 || true)
TSC_EXIT=$?

if echo "$TSC_OUTPUT" | grep -q "error TS"; then
  ERROR_COUNT=$(echo "$TSC_OUTPUT" | grep -c "error TS" || true)
  echo "" >&2
  echo "[MC TYPE ERRORS] $ERROR_COUNT errors found:" >&2
  # Show first 10 errors
  echo "$TSC_OUTPUT" | grep "error TS" | head -10 >&2
  echo "" >&2
  echo "Run 'node_modules/.bin/tsc --noEmit' for full output." >&2
else
  echo "[MC] Typecheck passed." >&2
fi

exit 0
