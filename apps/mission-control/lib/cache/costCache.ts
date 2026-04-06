import type { CostApiResponse } from "../../types/costs";

const CACHE_TTL_MS = 60_000;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

interface CacheEntry {
  value: CostApiResponse;
  expiry: number;
}

// Singleton Map — survives across requests in the same Node.js process
const cache = new Map<string, CacheEntry>();

export function buildCacheKey(start: string, end: string): string {
  if (!ISO_DATE_RE.test(start) || !ISO_DATE_RE.test(end)) {
    throw new Error("Invalid date format for cache key construction");
  }
  return `anthropic_costs__${start}__${end}`;
}

export function getCached(key: string): CostApiResponse | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return undefined;
  }
  return entry.value;
}

export function setCached(key: string, value: CostApiResponse): void {
  cache.set(key, { value, expiry: Date.now() + CACHE_TTL_MS });
}
