/**
 * Simple in-memory rate limiter for server actions.
 * Uses a continuous Token Bucket algorithm with fractional refill.
 *
 * NOTE: In a multi-node production environment (like Vercel Edge),
 * this should be replaced with Upstash Redis or similar distributed store.
 * For Hackathon demonstration, this showcases enterprise-grade security intent.
 */

type TokenBucket = {
  tokens: number;
  lastRefill: number;
};

const limits = new Map<string, TokenBucket>();

/** Maximum burst capacity per user per window. */
const RATE_LIMIT_MAX = 10;
/** Refill window in milliseconds (tokens fully replenish over this period). */
const REFILL_RATE_MS = 60_000;

/**
 * Checks if the request should be rate-limited using a continuous Token Bucket algorithm.
 * Refills tokens fractionally based on the exact milliseconds elapsed since the last request.
 *
 * @param identifier Unique identifier for the user (e.g. userId)
 * @returns boolean true if the request is allowed, false if rate limited
 */
export function rateLimit(identifier: string): boolean {
  const now = Date.now();
  let bucket = limits.get(identifier);

  if (!bucket) {
    bucket = { tokens: RATE_LIMIT_MAX, lastRefill: now };
    limits.set(identifier, bucket);
  }

  // Calculate how many tokens should have refilled since the last call
  const elapsedMs = now - bucket.lastRefill;
  const refillTokens = (elapsedMs / REFILL_RATE_MS) * RATE_LIMIT_MAX;

  if (refillTokens > 0) {
    bucket.tokens = Math.min(RATE_LIMIT_MAX, bucket.tokens + refillTokens);
    bucket.lastRefill = now;
  }

  // Consume 1 token if available
  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return true; // Allowed
  }

  return false; // Rate limited
}
