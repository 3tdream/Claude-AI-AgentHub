interface CacheEntry {
  total_usd: number;
  period_start: string;
  period_end: string;
  fetched_at: number;
  expires_at: number;
}

const CACHE_TTL_MS = 300_000; // 5 minutes

const store = new Map<string, CacheEntry>();

export function buildCacheKey(start: string, end: string): string {
  return `anthropic_costs::${start}::${end}`;
}

export function getCacheEntry(key: string): CacheEntry | null {
  const entry = store.get(key);
  if (!entry) return null;
  return entry;
}

export function isStale(entry: CacheEntry): boolean {
  return Date.now() > entry.expires_at;
}

export function setCacheEntry(
  key: string,
  total_usd: number,
  period_start: string,
  period_end: string
): CacheEntry {
  const now = Date.now();
  const entry: CacheEntry = {
    total_usd,
    period_start,
    period_end,
    fetched_at: now,
    expires_at: now + CACHE_TTL_MS,
  };
  store.set(key, entry);
  return entry;
}

export function getValidCacheEntry(key: string): CacheEntry | null {
  const entry = getCacheEntry(key);
  if (!entry) return null;
  if (isStale(entry)) return null;
  return entry;
}

export function getStaleCacheEntry(key: string): CacheEntry | null {
  return getCacheEntry(key);
}
