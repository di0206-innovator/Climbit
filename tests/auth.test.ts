import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserId } from '../lib/auth';
import { auth } from '@clerk/nextjs/server';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn()
}));

describe('auth utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.CLERK_SECRET_KEY;
  });

  it('should return mock user when CLERK_SECRET_KEY is not set', async () => {
    const userId = await getUserId();
    expect(userId).toBe('mock-user-123');
    expect(auth).not.toHaveBeenCalled();
  });

  it('should return clerk userId when CLERK_SECRET_KEY is set', async () => {
    process.env.CLERK_SECRET_KEY = 'test_secret_key';
    vi.mocked(auth).mockResolvedValue({ userId: 'user_xyz' } as any);

    const userId = await getUserId();
    expect(userId).toBe('user_xyz');
    expect(auth).toHaveBeenCalledOnce();
  });

  it('should return empty string if clerk auth returns null userId', async () => {
    process.env.CLERK_SECRET_KEY = 'test_secret_key';
    vi.mocked(auth).mockResolvedValue({ userId: null } as any);

    const userId = await getUserId();
    expect(userId).toBe('');
  });
});
