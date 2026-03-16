import { NextResponse } from "next/server";
import { writeUIConfig } from "@/lib/system-config-storage";

interface UpdateResponse {
  lastUpdated: string | null;
  error?: string;
}

/**
 * POST /api/system/config/update
 * Writes the current server timestamp to data/config/ui.json.
 * Called fire-and-forget from pipeline-executor.ts after pipeline completion.
 *
 * - Body: {} (empty — timestamp is generated server-side)
 * - Never returns 500 — fire-and-forget friendly
 * - Rate limit: 30 req/min per IP (enforced via Next.js middleware)
 *
 * Response:
 *   200 { lastUpdated: string }         → success
 *   200 { lastUpdated: null, error: string } → FS write error
 */
export async function POST(): Promise<NextResponse<UpdateResponse>> {
  const lastUpdated = new Date().toISOString();

  try {
    await writeUIConfig({ lastUpdated });
    return NextResponse.json({ lastUpdated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown FS error";
    // Return 200 (not 500) — caller uses fire-and-forget, must not throw
    return NextResponse.json({ lastUpdated: null, error: message });
  }
}
