const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidISODate(value: string): boolean {
  if (!ISO_DATE_RE.test(value)) return false;
  const d = new Date(value + "T00:00:00Z");
  return !isNaN(d.getTime());
}

export function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

export function thirtyDaysAgoUTC(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 30);
  return d.toISOString().slice(0, 10);
}

export interface DateValidationResult {
  valid: boolean;
  error?: string;
  resolved_start: string;
  resolved_end: string;
}

export function resolveDates(
  rawStart: string | undefined,
  rawEnd: string | undefined
): DateValidationResult {
  const resolved_start = rawStart ?? thirtyDaysAgoUTC();
  const resolved_end = rawEnd ?? todayUTC();

  if (rawStart !== undefined && !isValidISODate(rawStart)) {
    return { valid: false, error: "start must be a valid ISO 8601 date (YYYY-MM-DD)", resolved_start, resolved_end };
  }
  if (rawEnd !== undefined && !isValidISODate(rawEnd)) {
    return { valid: false, error: "end must be a valid ISO 8601 date (YYYY-MM-DD)", resolved_start, resolved_end };
  }
  if (resolved_start > resolved_end) {
    return { valid: false, error: "start must not be later than end", resolved_start, resolved_end };
  }

  const startMs = new Date(resolved_start + "T00:00:00Z").getTime();
  const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  if (startMs < ninetyDaysAgo) {
    return { valid: false, error: "Date range exceeds maximum supported lookback period", resolved_start, resolved_end };
  }

  return { valid: true, resolved_start, resolved_end };
}
