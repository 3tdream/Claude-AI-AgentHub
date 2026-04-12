#!/usr/bin/env bash
# Mission Control — Environment Setup
# Creates .env.local from .env.example with user input

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_DIR/.env.local"
EXAMPLE_FILE="$PROJECT_DIR/.env.example"

echo "======================================"
echo "  Mission Control — Environment Setup"
echo "======================================"
echo ""

if [ -f "$ENV_FILE" ]; then
  echo "  .env.local already exists."
  read -rp "  Overwrite? (y/N): " overwrite
  if [[ ! "$overwrite" =~ ^[Yy]$ ]]; then
    echo "  Skipped. Existing .env.local preserved."
    exit 0
  fi
fi

if [ ! -f "$EXAMPLE_FILE" ]; then
  echo "  ERROR: .env.example not found at $EXAMPLE_FILE"
  exit 1
fi

echo "  Enter your API keys (press Enter to skip optional ones)."
echo ""

# Base URL
read -rp "  Base URL [http://localhost:3077]: " base_url
base_url="${base_url:-http://localhost:3077}"

# Anthropic
read -rp "  Anthropic API Key (required): " anthropic_key
if [ -z "$anthropic_key" ]; then
  echo "  WARNING: Anthropic key is required for pipeline execution."
fi

# OpenAI
read -rp "  OpenAI API Key (optional): " openai_key

# Jira
echo ""
echo "  Jira Integration (optional — skip all 3 to disable):"
read -rp "  Jira Base URL (e.g. https://yourorg.atlassian.net): " jira_url
read -rp "  Jira Email: " jira_email
read -rp "  Jira API Token: " jira_token

# Write file
cat > "$ENV_FILE" <<EOF
NEXT_PUBLIC_BASE_URL=$base_url

# Direct LLM keys (Smart Router + Direct AI execution)
ANTHROPIC_API_KEY=$anthropic_key
OPENAI_API_KEY=$openai_key

# Jira Integration
JIRA_BASE_URL=$jira_url
JIRA_EMAIL=$jira_email
JIRA_API_TOKEN=$jira_token

# Agent Hub — disabled by default (MC is source of truth)
# AGENT_HUB_API_URL=http://localhost:3000/assistant
# AGENT_HUB_API_KEY=disabled
# AGENT_HUB_LIVE=disabled
EOF

echo ""
echo "  .env.local created at $ENV_FILE"
echo ""
echo "  Next steps:"
echo "    npm install"
echo "    npm run dev"
echo "    Open http://localhost:3077"
echo ""
