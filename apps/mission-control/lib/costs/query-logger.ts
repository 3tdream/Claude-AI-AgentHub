interface CostQueryLogRow {
  session_id: string;
  requested_at: string;
  start_date: string;
  end_date: string;
  cache_hit: boolean;
  total_usd_returned: number | null;
  response_status: number;
  error_code: string | null;
  upstream_called: boolean;
  upstream_response_ms: number | null;
}

/**
 * Fire-and-forget async insert into CostQueryLog.
 * Uses dynamic DB import to avoid hard coupling — replace with your actual DB client.
 * Errors are swallowed to ensure logging never blocks the response path.
 */
export function logCostQuery(row: CostQueryLogRow): void {
  // Non-blocking: intentionally not awaited
  insertLogRow(row).catch((err) => {
    console.error("[CostQueryLog] Failed to write audit log:", err);
  });
}

async function insertLogRow(row: CostQueryLogRow): Promise<void> {
  // Dynamic import to avoid circular deps and allow tree-shaking
  let db: { query: (sql: string, params: unknown[]) => Promise<unknown> } | null = null;

  try {
    // Attempt to load the project's DB client (adjust path to match your project)
    // @ts-expect-error — DB module does not exist yet; dynamic import is intentional
    const mod = await import("@/lib/db").catch(() => null);
    db = mod?.default ?? mod?.db ?? null;
  } catch {
    // DB module not available — skip logging silently
    return;
  }

  if (!db) return;

  const sql = `
    INSERT INTO cost_query_log (
      session_id, requested_at, start_date, end_date,
      cache_hit, total_usd_returned, response_status,
      error_code, upstream_called, upstream_response_ms, created_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())
  `;

  await db.query(sql, [
    row.session_id,
    row.requested_at,
    row.start_date,
    row.end_date,
    row.cache_hit,
    row.total_usd_returned,
    row.response_status,
    row.error_code,
    row.upstream_called,
    row.upstream_response_ms,
  ]);
}
