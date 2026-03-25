import NodeCache from "node-cache";
import type { CostApiResponse } from "../../types/costs";

const CACHE_TTL_SECONDS = 60;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Singleton — survives across requests in the same Node.js process
const cache = new NodeCache({ stdTTL: CACHE_TTL_SECONDS, checkperiod: 30 });

export function buildCacheKey(start: string, end: string): string {
  // Strict guard against prototype-pollution via crafted date strings
  if (!ISO_DATE_RE.test(start) || !ISO_DATE_RE.test(end)) {
    throw new Error("Invalid date format for cache key construction");
  }
  return `anthropic_costs__${start}__${end}`;
}

export function getCached(key: string): CostApiResponse | undefined {
  return cache.get<CostApiResponse>(key);
}

export function setCached(key: string, value: CostApiResponse): void {
  cache.set(key, value, CACHE_TTL_SECONDS);
}
