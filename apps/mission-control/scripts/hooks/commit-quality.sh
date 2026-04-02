#!/usr/bin/env bash
# Commit Quality Hook — PreToolUse on Bash
# Blocks: secrets in commits, console.log/debugger, bad commit format
# Input: JSON on stdin with tool_name and tool_input.command

set -euo pipefail

# Read hook input from stdin
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | node -e "
  const d = JSON.parse(require('fs').readFileSync(0,'utf8'));
  console.log(d.tool_input?.command || '');
" 2>/dev/null)

# Only check git commit commands
if ! echo "$COMMAND" | grep -qE 'git (commit|add|push)'; then
  exit 0
fi

MC_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

# ── Check 1: Block secrets in staged files ───────────────────
if echo "$COMMAND" | grep -qE 'git (commit|add)'; then
  # Check for sensitive patterns in staged files
  SECRETS_FOUND=$(cd "$MC_DIR" && git diff --cached --diff-filter=ACM 2>/dev/null | \
    grep -iE '(api[_-]?key|secret[_-]?key|password|token|credential|private[_-]?key)\s*[:=]' | \
    grep -v '^\+\+\+' | grep -v 'example\|placeholder\|your-.*-here\|CHANGE_ME' || true)

  if [ -n "$SECRETS_FOUND" ]; then
    echo "[MC BLOCK] Potential secrets detected in staged files:" >&2
    echo "$SECRETS_FOUND" | head -5 >&2
    echo "" >&2
    echo "Remove secrets before committing. Add to .gitignore if needed." >&2
    exit 2  # Exit code 2 = block the tool call
  fi

  # Check for data/*.json with sensitive content
  SENSITIVE_DATA=$(cd "$MC_DIR" && git diff --cached --name-only 2>/dev/null | \
    grep -E '^data/(jira-config|prompt-overrides|\.session-state)' || true)

  if [ -n "$SENSITIVE_DATA" ]; then
    echo "[MC BLOCK] Sensitive data files staged for commit:" >&2
    echo "$SENSITIVE_DATA" >&2
    echo "" >&2
    echo "These files should be in .gitignore." >&2
    exit 2
  fi
fi

# ── Check 2: Warn about console.log/debugger ────────────────
if echo "$COMMAND" | grep -qE 'git commit'; then
  CONSOLE_LOGS=$(cd "$MC_DIR" && git diff --cached --diff-filter=ACM -- '*.ts' '*.tsx' 2>/dev/null | \
    grep -n '^\+.*\(console\.log\|debugger\)' | grep -v '// keep\|eslint-disable' || true)

  if [ -n "$CONSOLE_LOGS" ]; then
    echo "[MC WARN] console.log/debugger found in staged changes:" >&2
    echo "$CONSOLE_LOGS" | head -5 >&2
    echo "" >&2
    echo "Consider removing before commit (not blocking)." >&2
    # Non-blocking warning, exit 0
  fi
fi

# ── Check 3: Validate commit message format ──────────────────
if echo "$COMMAND" | grep -qE 'git commit.*-m'; then
  MSG=$(echo "$COMMAND" | sed -n 's/.*-m ["\x27]\?\([^"\x27]*\).*/\1/p' | head -1)

  if [ -n "$MSG" ] && ! echo "$MSG" | grep -qE '^(feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert)\('; then
    echo "[MC WARN] Commit message doesn't follow conventional format:" >&2
    echo "  Expected: type(scope): description" >&2
    echo "  Got: $MSG" >&2
    # Non-blocking warning
  fi
fi

exit 0
