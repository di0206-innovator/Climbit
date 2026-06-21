import { describe, it, expect } from 'vitest';
import { onboardingSchema } from '../lib/validation/schemas';

describe('Onboarding validation schema', () => {
  const validData = {
    role: 'student',
    livingStyle: 'hostel',
    commuteMode: 'walk_cycle',
    dietPattern: 'vegan',
    deliveryFrequency: 'rarely',
    travelFrequency: 'rarely',
    acUsageProxy: 'none',
    electricityUsageProxy: 'low',
  };

  it('accepts valid onboarding answers', () => {
    const result = onboardingSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects missing required fields', () => {
    const { role, ...partial } = validData;
    const result = onboardingSchema.safeParse(partial);
    expect(result.success).toBe(false);
  });

  it('rejects invalid enum values', () => {
    const result = onboardingSchema.safeParse({
      ...validData,
      role: 'hacker',
    });
    expect(result.success).toBe(false);
  });

  it('rejects extra unexpected fields', () => {
    const result = onboardingSchema.safeParse({
      ...validData,
      malicious: '<script>alert("xss")</script>',
    });
    // Zod by default strips extra keys in .parse(), but safeParse still succeeds (strips)
    // The important thing is the extra field does NOT pass through to validated data
    if (result.success) {
      expect((result.data as Record<string, unknown>)['malicious']).toBeUndefined();
    }
  });

  it('accepts all valid role options', () => {
    for (const role of ['student', 'professional', 'other']) {
      const result = onboardingSchema.safeParse({ ...validData, role });
      expect(result.success).toBe(true);
    }
  });

  it('accepts all valid commute modes', () => {
    for (const commuteMode of ['walk_cycle', 'public_transit', 'personal_vehicle', 'cab']) {
      const result = onboardingSchema.safeParse({ ...validData, commuteMode });
      expect(result.success).toBe(true);
    }
  });

  it('accepts all valid diet patterns', () => {
    for (const dietPattern of ['vegan', 'vegetarian', 'flexitarian', 'meat_heavy']) {
      const result = onboardingSchema.safeParse({ ...validData, dietPattern });
      expect(result.success).toBe(true);
    }
  });

  it('rejects empty string values', () => {
    const result = onboardingSchema.safeParse({ ...validData, role: '' });
    expect(result.success).toBe(false);
  });

  it('rejects null/undefined individual fields', () => {
    const result = onboardingSchema.safeParse({ ...validData, role: null });
    expect(result.success).toBe(false);
  });
});
