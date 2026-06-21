import { describe, it, expect, beforeEach } from 'vitest';
import { rateLimit } from '../lib/rate-limit';

describe('Rate limiter', () => {
  // Clear internal state between tests by using unique identifiers
  let userIdCounter = 0;
  const uniqueUser = () => `rate-test-user-${++userIdCounter}`;

  it('allows requests within the token budget', () => {
    const userId = uniqueUser();
    // Should allow at least 10 sequential requests for a fresh user
    for (let i = 0; i < 10; i++) {
      expect(rateLimit(userId)).toBe(true);
    }
  });

  it('blocks requests when tokens are exhausted', () => {
    const userId = uniqueUser();
    // Exhaust all 10 tokens
    for (let i = 0; i < 10; i++) {
      rateLimit(userId);
    }
    // 11th request should be blocked
    expect(rateLimit(userId)).toBe(false);
  });

  it('isolates different users into separate buckets', () => {
    const userA = uniqueUser();
    const userB = uniqueUser();

    // Exhaust userA's tokens
    for (let i = 0; i < 10; i++) {
      rateLimit(userA);
    }
    expect(rateLimit(userA)).toBe(false);

    // userB should still have tokens
    expect(rateLimit(userB)).toBe(true);
  });

  it('returns a boolean value for all inputs', () => {
    const userId = uniqueUser();
    const result = rateLimit(userId);
    expect(typeof result).toBe('boolean');
  });
});
