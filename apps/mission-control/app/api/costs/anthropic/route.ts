import { NextRequest, NextResponse } from "next/server";

// 60-second in-memory cache
interface CacheEntry { data: ResponseData; expiresAt: number }
interface ResponseData {
  total_usd: number;
  period: { start: string; end: string };
  cached: boolean;
}
const cache = new Map<string, CacheEntry>();

function toISODate(d: Date): string { return d.toISOString().slice(0, 10); }
function isValidDate(v: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !isNaN(d.getTime()) && toISODate(d) === v;
}

async function fetchCost(start: string, end: string): Promise<number> {
  const key = process.env.ANTHROPIC_ADMIN_KEY ?? process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_ADMIN_KEY is not set");

  let total = 0;
  let nextPage: string | null = null;

  do {
    const url = new URL("https://api.anthropic.com/v1/organizations/costs");
    url.searchParams.set("start_date", start);
    url.searchParams.set("end_date", end);
    url.searchParams.set("limit", "100");
    if (nextPage) url.searchParams.set("starting_after", nextPage);

    const res = await fetch(url.toString(), {
      headers: {
        "anthropic-version": "2023-06-01",
        "x-api-key": key,
        "anthropic-beta": "billing-usage-2025-02-28",
      },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${await res.text()}`);

    const json = await res.json();
    for (const item of (json.data ?? []) as Array<{ cost_usd?: number; total_cost?: number }>) {
      const cost = item.cost_usd ?? item.total_cost;
      if (typeof cost === "number") total += cost;
    }
    nextPage = json.has_more ? ((json.data as Array<{ id?: string }>).at(-1)?.id ?? null) : null;
  } while (nextPage);

  return Math.round(total * 100) / 100;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const sp = req.nextUrl.searchParams;
  const now = new Date();
  const defEnd = toISODate(now);
  const defStartD = new Date(now); defStartD.setUTCDate(defStartD.getUTCDate() - 30);
  const defStart = toISODate(defStartD);

  const rawStart = sp.get("start");
  const rawEnd = sp.get("end");
  const start = rawStart ?? defStart;
  const end = rawEnd ?? defEnd;

  if (rawStart && !isValidDate(rawStart))
    return NextResponse.json({ error: "Invalid query parameters", details: "start must be a valid ISO 8601 date (YYYY-MM-DD)", fallback_usd: null }, { status: 400 });
  if (rawEnd && !isValidDate(rawEnd))
    return NextResponse.json({ error: "Invalid query parameters", details: "end must be a valid ISO 8601 date (YYYY-MM-DD)", fallback_usd: null }, { status: 400 });
  if (rawStart && rawEnd && start > end)
    return NextResponse.json({ error: "Invalid query parameters", details: "start must be less than or equal to end", fallback_usd: null }, { status: 400 });

  const cKey = `${start}__${end}`;
  const hit = cache.get(cKey);
  if (hit && Date.now() < hit.expiresAt)
    return NextResponse.json({ ...hit.data, cached: true }, { status: 200, headers: { "Cache-Control": "private, max-age=60" } });

  try {
    const total_usd = await fetchCost(start, end);
    const data: ResponseData = { total_usd, period: { start, end }, cached: false };
    cache.set(cKey, { data, expiresAt: Date.now() + 60_000 });
    return NextResponse.json(data, { status: 200, headers: { "Cache-Control": "private, max-age=60" } });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch cost data from Anthropic", details: err instanceof Error ? err.message : "Unknown error", fallback_usd: null }, { status: 502 });
  }
}
