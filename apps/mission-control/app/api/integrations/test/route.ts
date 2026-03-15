import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const KEYS_FILE = path.join(process.cwd(), "data", "api-keys.json");

async function getKey(envKey: string, overrides?: Record<string, string>): Promise<string> {
  // 1. Direct override from request (unsaved form values)
  if (overrides?.[envKey]) return overrides[envKey];
  // 2. .env.local
  const envVal = process.env[envKey];
  if (envVal && envVal !== "your-anthropic-api-key" && envVal !== "your-api-token") {
    return envVal;
  }
  // 3. Saved keys file
  try {
    const raw = await fs.readFile(KEYS_FILE, "utf-8");
    const keys = JSON.parse(raw);
    return keys[envKey] || "";
  } catch {
    return "";
  }
}

/**
 * POST /api/integrations/test — test a specific integration connection
 * Accepts optional `keys` object with unsaved form values to test before saving
 */
export async function POST(request: NextRequest) {
  try {
    const { integrationId, keys } = await request.json();

    switch (integrationId) {
      case "anthropic": {
        const key = await getKey("ANTHROPIC_API_KEY", keys);
        if (!key) return NextResponse.json({ success: false, error: "API key not configured" });

        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": key,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 10,
            messages: [{ role: "user", content: "ping" }],
          }),
        });

        if (res.ok) {
          return NextResponse.json({ success: true, message: "Claude API connected" });
        }
        const err = await res.text();
        return NextResponse.json({ success: false, error: `HTTP ${res.status}: ${err.slice(0, 200)}` });
      }

      case "openai": {
        const key = await getKey("OPENAI_API_KEY", keys);
        if (!key) return NextResponse.json({ success: false, error: "API key not configured" });

        const res = await fetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${key}` },
        });

        if (res.ok) {
          return NextResponse.json({ success: true, message: "OpenAI API connected" });
        }
        const err = await res.text();
        return NextResponse.json({ success: false, error: `HTTP ${res.status}: ${err.slice(0, 200)}` });
      }

      case "agent-hub": {
        const url = await getKey("AGENT_HUB_API_URL", keys);
        const key = await getKey("AGENT_HUB_API_KEY", keys);
        if (!url || !key) return NextResponse.json({ success: false, error: "URL or API key not configured" });

        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 5000);
          const res = await fetch(url.replace(/\/assistant\/?$/, "/api/health"), {
            headers: { Authorization: `Bearer ${key}` },
            signal: controller.signal,
          });
          clearTimeout(timer);

          if (res.ok) {
            return NextResponse.json({ success: true, message: "Agent Hub connected" });
          }
          return NextResponse.json({ success: false, error: `HTTP ${res.status}` });
        } catch {
          return NextResponse.json({ success: false, error: "Connection timeout or refused" });
        }
      }

      case "jira": {
        const baseUrl = await getKey("JIRA_BASE_URL", keys);
        const email = await getKey("JIRA_EMAIL", keys);
        const token = await getKey("JIRA_API_TOKEN", keys);
        if (!baseUrl || !email || !token) {
          return NextResponse.json({ success: false, error: "Jira credentials not fully configured" });
        }

        const auth = Buffer.from(`${email}:${token}`).toString("base64");
        try {
          const res = await fetch(`${baseUrl}/rest/api/3/myself`, {
            headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
          });

          if (res.ok) {
            const user = await res.json();
            return NextResponse.json({
              success: true,
              message: `Connected as ${user.displayName || user.emailAddress}`,
            });
          }
          return NextResponse.json({ success: false, error: `HTTP ${res.status}` });
        } catch {
          return NextResponse.json({ success: false, error: "Connection failed" });
        }
      }

      default:
        return NextResponse.json({ success: false, error: "Unknown integration" });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Test failed" },
      { status: 500 },
    );
  }
}
