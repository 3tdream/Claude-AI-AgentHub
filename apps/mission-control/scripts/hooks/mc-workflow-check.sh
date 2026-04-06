#!/bin/bash
# MC Workflow Check — warns when editing without running through MC system first
# Trigger: PreToolUse (Edit, Write)

TRACKER="/tmp/mc-session-ran-command"

# Check if /api/command was called this session
if [ ! -f "$TRACKER" ]; then
  echo "⚠️  WARNING: You are editing code without running through MC system first."
  echo "   → Use /run <task> or POST /api/command before making direct edits."
  echo "   → If fixing the MC system itself, create tracker: touch $TRACKER"
  echo ""
fi
