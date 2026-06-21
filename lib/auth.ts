'use server';

import { auth } from '@clerk/nextjs/server';

/**
 * Resolves the authenticated user ID from Clerk.
 * Falls back to a deterministic mock ID when CLERK_SECRET_KEY is not configured
 * (e.g. during local development without Clerk).
 *
 * @returns The authenticated user ID, or a mock fallback for development.
 */
export async function getUserId(): Promise<string> {
  if (!process.env.CLERK_SECRET_KEY) {
    return 'mock-user-123';
  }
  const { userId } = await auth();
  return userId || '';
}
