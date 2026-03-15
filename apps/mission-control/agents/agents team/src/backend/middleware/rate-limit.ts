// ============================================================================
// Beauty CRM — Phase 1 Booking MVP — Rate Limiter
// Simple in-memory sliding-window rate limiter (Phase 1)
// ============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RateLimitEntry {
  count: number;
  resetAt: number; // Unix timestamp in ms
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number; // seconds until the window resets
}

// ---------------------------------------------------------------------------
// In-memory store
// ---------------------------------------------------------------------------

const store = new Map<string, RateLimitEntry>();

/**
 * Periodically clean up expired entries to prevent unbounded memory growth.
 * Runs every 60 seconds.
 */
const CLEANUP_INTERVAL_MS = 60_000;

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanupTimer(): void {
  if (cleanupTimer !== null) return;

  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) {
        store.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);

  // Allow the Node.js process to exit even if the timer is running
  if (typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    cleanupTimer.unref();
  }
}

// ---------------------------------------------------------------------------
// Rate limit check
// ---------------------------------------------------------------------------

/**
 * Check whether the given identifier is within the rate limit.
 *
 * @param identifier  Unique key (e.g. client IP address)
 * @param maxRequests Maximum number of requests allowed in the window
 * @param windowMs    Window duration in milliseconds
 *
 * @returns `{ allowed: true }` if the request is permitted, or
 *          `{ allowed: false, retryAfter }` with seconds until the window resets.
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number,
): RateLimitResult {
  ensureCleanupTimer();

  const now = Date.now();
  const existing = store.get(identifier);

  // No entry or window expired — start a new window
  if (!existing || existing.resetAt <= now) {
    store.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true };
  }

  // Window still open — increment count
  existing.count += 1;

  if (existing.count > maxRequests) {
    const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  return { allowed: true };
}

/**
 * Extract the client IP from common proxy headers.
 * Falls back to "unknown" if no IP can be determined.
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for may contain a comma-separated list; take the first
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return 'unknown';
}

// ---------------------------------------------------------------------------
// Testing helpers
// ---------------------------------------------------------------------------

/**
 * Clear the rate limit store. For use in tests only.
 */
export function resetRateLimitStore(): void {
  store.clear();
}
