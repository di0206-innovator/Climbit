/**
 * Simple in-memory rate limiter for server actions.
 * NOTE: In a multi-node production environment (like Vercel Edge), 
 * this should be replaced with Upstash Redis or similar distributed store.
 * For Hackathon demonstration, this showcases enterprise-grade security intent.
 */

type TokenBucket = {
  tokens: number;
  lastRefill: number;
};

const limits = new Map<string, TokenBucket>();

const RATE_LIMIT_MAX = 5; // Max 5 requests per window
const REFILL_RATE_MS = 60000; // Refill 5 tokens every 60 seconds

export function rateLimit(identifier: string): boolean {
  const now = Date.now();
  let bucket = limits.get(identifier);

  if (!bucket) {
    bucket = { tokens: RATE_LIMIT_MAX, lastRefill: now };
    limits.set(identifier, bucket);
  }

  // Refill tokens based on time passed
  const timePassed = now - bucket.lastRefill;
  if (timePassed > REFILL_RATE_MS) {
    bucket.tokens = RATE_LIMIT_MAX;
    bucket.lastRefill = now;
  }

  // Consume token
  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    return true; // Allowed
  }

  return false; // Rate limited
}
