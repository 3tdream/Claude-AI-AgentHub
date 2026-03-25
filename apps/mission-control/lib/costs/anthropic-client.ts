const ANTHROPIC_USAGE_URL = "https://api.anthropic.com/v1/usage";
const TIMEOUT_MS = 8_000;

export interface AnthropicUsageResult {
  total_usd: number;
  upstream_response_ms: number;
}

export class AnthropicTimeoutError extends Error {
  constructor() {
    super("Anthropic API timeout");
    this.name = "AnthropicTimeoutError";
  }
}

export class AnthropicUpstreamError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "AnthropicUpstreamError";
  }
}

export async function fetchAnthropicUsage(
  start: string,
  end: string
): Promise<AnthropicUsageResult> {
  const adminKey = process.env.ANTHROPIC_ADMIN_API_KEY;
  if (!adminKey) {
    throw new Error("ANTHROPIC_ADMIN_API_KEY is not configured");
  }

  const url = new URL(ANTHROPIC_USAGE_URL);
  url.searchParams.set("start_date", start);
  url.searchParams.set("end_date", end);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const t0 = Date.now();
  try {
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "x-api-key": adminKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      signal: controller.signal,
    });

    const upstream_response_ms = Date.now() - t0;

    if (!res.ok) {
      throw new AnthropicUpstreamError(res.status, `Upstream returned ${res.status}`);
    }

    const data = await res.json();

    // Aggregate total_usd from response — handle both flat and nested shapes
    let total_usd = 0;
    if (typeof data.total_cost === "number") {
      total_usd = data.total_cost;
    } else if (Array.isArray(data.data)) {
      total_usd = (data.data as Array<{ cost?: number; total_cost?: number }>).reduce(
        (sum, item) => sum + (item.cost ?? item.total_cost ?? 0),
        0
      );
    } else if (typeof data.usage?.total_cost === "number") {
      total_usd = data.usage.total_cost;
    }

    return { total_usd: Math.round(total_usd * 100) / 100, upstream_response_ms };
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      throw new AnthropicTimeoutError();
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
