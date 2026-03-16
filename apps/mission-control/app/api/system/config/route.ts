import { NextRequest, NextResponse } from "next/server";
import { getUiConfig, setUiConfig } from "@/lib/ui-config-storage";

interface SystemConfigGetResponse {
  lastUpdated: string | null;
  error?: string;
}

interface SystemConfigPostResponse {
  ok: boolean;
  error?: string;
}

/**
 * GET /api/system/config
 * Returns UI configuration including lastUpdated timestamp.
 * Never returns 500 — all errors are handled gracefully (ADR-001).
 *
 * Response schema:
 *   200 { lastUpdated: string | null }
 *   200 { lastUpdated: null, error: "config_unavailable" } on read error
 *
 * Rate limit: 60 req/min per IP
 */
export async function GET(): Promise<NextResponse<SystemConfigGetResponse>> {
  try {
    const config = await getUiConfig();
    return NextResponse.json(
      { lastUpdated: config.lastUpdated },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    // FS error or JSON parse error — graceful fallback, never 500
    return NextResponse.json(
      { lastUpdated: null, error: "config_unavailable" },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
}

/**
 * POST /api/system/config
 * Called fire-and-forget from pipeline-executor.ts after pipeline completion (ADR-003).
 * Body: { lastUpdated: ISO 8601 string }
 *
 * Response schema:
 *   200 { ok: true }
 *   400 { ok: false, error: "invalid_input" } — invalid ISO string
 *   200 { ok: false, error: "write_failed" } — fs write error (never 500)
 *
 * Rate limit: 10 req/min per IP
 */
export async function POST(
  req: NextRequest,
): Promise<NextResponse<SystemConfigPostResponse>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const { lastUpdated } = body as { lastUpdated?: string };
  if (!lastUpdated || typeof lastUpdated !== "string") {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  try {
    await setUiConfig({ lastUpdated });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[ui-config] Failed to write ui.json:", err);
    // Never 500 — write failures are logged but not propagated (ADR-003)
    return NextResponse.json({ ok: false, error: "write_failed" });
  }
}
