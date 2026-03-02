/**
 * Server-side Agent Hub API client
 * All API routes use this client to communicate with the Agent Hub REST API
 * Pattern based on: apps/echo/app/api/agent-hub/execute/route.ts
 */

export class AgentHubError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "AgentHubError";
  }
}

function getConfig() {
  const baseUrl = process.env.AGENT_HUB_API_URL;
  const apiKey = process.env.AGENT_HUB_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new AgentHubError(
      500,
      "Agent Hub configuration missing. Set AGENT_HUB_API_URL and AGENT_HUB_API_KEY in .env.local",
    );
  }

  return { baseUrl, apiKey };
}

// When true, all reads go straight to cache — no network calls
export const OFFLINE_MODE = !process.env.AGENT_HUB_LIVE;

// Circuit breaker: tracks when Agent Hub became unreachable
let hubUnreachableSince = 0;

export async function agentHubFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  if (OFFLINE_MODE) {
    throw new AgentHubError(503, "Offline mode — using cache");
  }

  const { baseUrl, apiKey } = getConfig();

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  console.log(`[Agent Hub] ${options?.method || "GET"} ${url}`);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...options?.headers,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Agent Hub] Error ${response.status}:`, errorText);
      throw new AgentHubError(response.status, errorText);
    }

    // Success — reset circuit breaker
    hubUnreachableSince = 0;
    return response.json();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Execute an agent with the given input
 * Supports both text-only (workspace-execute) and attachment (execute) modes
 */
export async function executeAgent(params: {
  assistantId: string;
  userInput: string;
  attachments?: Array<{
    type: "url" | "base64";
    mimeType: string;
    url?: string;
    data?: string;
  }>;
  responseFormat?: { type: "json_object" };
  systemPromptOverride?: string;
  sessionId?: string;
}) {
  const { baseUrl, apiKey } = getConfig();

  const hasAttachments = params.attachments && params.attachments.length > 0;
  const endpoint = hasAttachments ? "execute" : "workspace-execute";
  const url = `${baseUrl}/${params.assistantId}/${endpoint}`;

  const requestBody = hasAttachments
    ? {
        userInput: params.userInput,
        attachments: params.attachments,
      }
    : {
        query: params.userInput,
        responseFormat: params.responseFormat,
      };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new AgentHubError(response.status, errorText);
  }

  const data = await response.json();

  let textContent: string;

  if (hasAttachments) {
    // /execute returns: {content: [{text: {value: string}}]}
    textContent = data.content?.[0]?.text?.value;
  } else {
    // /workspace-execute returns: {success: true, response: stringified JSON}
    if (data.response) {
      try {
        const parsed = JSON.parse(data.response);
        textContent = parsed.content?.[0]?.text?.value || data.response;
      } catch {
        textContent = data.response;
      }
    } else {
      textContent = JSON.stringify(data);
    }
  }

  // Strip markdown code fences if present
  if (textContent) {
    textContent = textContent
      .replace(/^```json\s*\n?/, "")
      .replace(/\n?```\s*$/, "");
  }

  return {
    success: true,
    content: textContent || "",
    raw: data,
  };
}
