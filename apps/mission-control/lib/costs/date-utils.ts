const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidISODate(value: string): boolean {
  if (!ISO_DATE_RE.test(value)) return false;
  const d = new Date(value);
  return !isNaN(d.getTime());
}

export function getDefaultStartDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

export function getDefaultEndDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface DateRangeValidation {
  valid: boolean;
  start: string;
  end: string;
  error?: string;
}

export function validateDateRange(
  rawStart: string | null,
  rawEnd: string | null
): DateRangeValidation {
  const start = rawStart ?? getDefaultStartDate();
  const end = rawEnd ?? getDefaultEndDate();

  if (!isValidISODate(start) || !isValidISODate(end)) {
    return { valid: false, start, end, error: "Invalid ISO date format" };
  }

  const today = getDefaultEndDate();
  if (end > today) {
    return { valid: false, start, end, error: "end date must not be in the future" };
  }

  if (start > end) {
    return { valid: false, start, end, error: "start must be <= end" };
  }

  return { valid: true, start, end };
}
