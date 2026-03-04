import { NextRequest, NextResponse } from "next/server";
import { agentHubFetch } from "@/lib/agent-hub-client";

// GET /api/agent-hub/models — list available LLM models
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get("provider") || "";

    let url = "/models";
    if (provider) url += `?provider=${provider}`;

    const data = await agentHubFetch(url);
    return NextResponse.json({ success: true, data });
  } catch {
    // Fallback: return cached model list
    const cachedModels = [
      { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6", provider: "anthropic" },
      { id: "claude-sonnet-4-5", name: "Claude Sonnet 4.5", provider: "anthropic" },
      { id: "claude-haiku-4-5", name: "Claude Haiku 4.5", provider: "anthropic" },
      { id: "gpt-5.1", name: "GPT-5.1", provider: "openai" },
      { id: "gpt-4.1-mini", name: "GPT-4.1 Mini", provider: "openai" },
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "google" },
    ];
    return NextResponse.json({ success: true, data: cachedModels, cached: true });
  }
}
