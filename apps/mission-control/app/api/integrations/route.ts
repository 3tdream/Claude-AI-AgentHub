import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const KEYS_FILE = path.join(DATA_DIR, "api-keys.json");

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {}
}

async function readKeys(): Promise<Record<string, string>> {
  try {
    const raw = await fs.readFile(KEYS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeKeys(keys: Record<string, string>) {
  await ensureDataDir();
  await fs.writeFile(KEYS_FILE, JSON.stringify(keys, null, 2));
}

/**
 * GET /api/integrations — check status of all integrations
 */
export async function GET() {
  const savedKeys = await readKeys();

  // Merge: env vars take priority, then saved keys
  // Resolve key: env var wins unless it's a placeholder, then fall back to saved keys
  const PLACEHOLDERS = new Set([
    "your-anthropic-api-key",
    "your-api-token",
    "your-openai-api-key",
    "https://your-domain.atlassian.net",
  ]);

  function resolve(envKey: string): string {
    const envVal = process.env[envKey] || "";
    if (envVal && !PLACEHOLDERS.has(envVal)) return envVal;
    return savedKeys[envKey] || "";
  }

  const anthropicKey = resolve("ANTHROPIC_API_KEY");
  const openaiKey = resolve("OPENAI_API_KEY");
  const agentHubUrl = resolve("AGENT_HUB_API_URL");
  const agentHubKey = resolve("AGENT_HUB_API_KEY");
  const jiraUrl = resolve("JIRA_BASE_URL");
  const jiraEmail = resolve("JIRA_EMAIL");
  const jiraToken = resolve("JIRA_API_TOKEN");

  return NextResponse.json({
    integrations: [
      {
        id: "anthropic",
        name: "Anthropic (Claude)",
        description: "Smart Router, Orchestrator, quality evaluation, and Claude-based agents",
        category: "ai",
        configured: !!anthropicKey,
        keyPreview: anthropicKey ? `${anthropicKey.slice(0, 10)}...${anthropicKey.slice(-4)}` : "",
        fields: [{ key: "ANTHROPIC_API_KEY", label: "API Key", type: "password", required: true }],
        docs: "https://console.anthropic.com/settings/keys",
        steps: [
          "Go to console.anthropic.com",
          "Navigate to Settings → API Keys",
          "Click 'Create Key'",
          "Copy the key and paste it below",
        ],
      },
      {
        id: "openai",
        name: "OpenAI (GPT)",
        description: "Backend-Agent, Frontend-Agent, and OpenAI-based agents + chat fallback",
        category: "ai",
        configured: !!openaiKey,
        keyPreview: openaiKey ? `${openaiKey.slice(0, 12)}...${openaiKey.slice(-4)}` : "",
        fields: [{ key: "OPENAI_API_KEY", label: "API Key", type: "password", required: true }],
        docs: "https://platform.openai.com/api-keys",
        steps: [
          "Go to platform.openai.com",
          "Navigate to API Keys",
          "Click 'Create new secret key'",
          "Copy and paste below",
        ],
      },
      {
        id: "agent-hub",
        name: "Agent Hub (SB Backend)",
        description: "Optional: proxy agent execution through SingularityBridge backend",
        category: "platform",
        configured: !!agentHubUrl && !!agentHubKey,
        keyPreview: agentHubKey ? `${agentHubKey.slice(0, 12)}...${agentHubKey.slice(-4)}` : "",
        fields: [
          { key: "AGENT_HUB_API_URL", label: "API URL", type: "text", required: true, placeholder: "http://localhost:3000/assistant" },
          { key: "AGENT_HUB_API_KEY", label: "API Key", type: "password", required: true },
        ],
        docs: "",
        steps: [
          "Start SB backend locally: cd apps/sb/sb-api-services-v2 && npm run dev",
          "Default URL: http://localhost:3000/assistant",
          "API key is in SB's MongoDB (companies collection)",
          "Note: Not required if using Direct AI execution",
        ],
      },
      {
        id: "jira",
        name: "Jira",
        description: "Pipeline sync: auto-create epics, track stages, log features",
        category: "project",
        configured: !!jiraUrl && !!jiraToken,
        keyPreview: jiraEmail || "",
        fields: [
          { key: "JIRA_BASE_URL", label: "Jira URL", type: "text", required: true, placeholder: "https://your-domain.atlassian.net" },
          { key: "JIRA_EMAIL", label: "Email", type: "email", required: true },
          { key: "JIRA_API_TOKEN", label: "API Token", type: "password", required: true },
        ],
        docs: "https://id.atlassian.com/manage-profile/security/api-tokens",
        steps: [
          "Go to id.atlassian.com/manage-profile/security/api-tokens",
          "Click 'Create API token'",
          "Enter your Jira site URL (e.g. myteam.atlassian.net)",
          "Enter the email associated with your Atlassian account",
          "Paste the API token below",
        ],
      },
    ],
  });
}

/**
 * POST /api/integrations — save API keys
 */
export async function POST(request: NextRequest) {
  try {
    const { keys } = await request.json();

    if (!keys || typeof keys !== "object") {
      return NextResponse.json({ success: false, error: "keys object required" }, { status: 400 });
    }

    const existing = await readKeys();
    const updated = { ...existing };

    // Only save non-empty values
    for (const [k, v] of Object.entries(keys)) {
      if (typeof v === "string" && v.trim()) {
        updated[k] = v.trim();
      }
    }

    await writeKeys(updated);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Save failed" },
      { status: 500 },
    );
  }
}
