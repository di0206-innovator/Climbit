import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client safely
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Checks whether Supabase is configured with valid credentials (not placeholders).
 * 
 * @returns boolean true if Supabase URL and key are fully configured, false otherwise
 */
export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && url !== 'https://placeholder.supabase.co' && key && key !== 'placeholder');
}

/**
 * Creates a custom Supabase client authenticated with the current Clerk user's token.
 * This ensures that RLS (Row Level Security) works perfectly with Clerk.
 * 
 * @param clerkToken The JWT token obtained from Clerk session
 * @returns SupabaseClient instance
 */
export const createClerkSupabaseClient = (clerkToken: string) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${clerkToken}`,
      },
    },
  });
};

/**
 * Loads the user profile data from Supabase for the authenticated user.
 * Falls back gracefully to null if Supabase is unconfigured or user has no row.
 * 
 * @param clerkToken The authenticated Clerk session token
 * @param userId The unique user ID from Clerk
 * @returns Promise resolving to the user profile record or null
 */
export async function loadUserProfile(clerkToken: string, userId: string) {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase is not configured. Falling back to local storage.');
    return null;
  }

  const client = createClerkSupabaseClient(clerkToken);
  const { data, error } = await client
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error loading profile from Supabase:', error);
    return null;
  }
  return data || null;
}

/**
 * Saves or updates the user profile data in Supabase for the authenticated user.
 * Performs a secure upsert matching the user's primary key (Clerk ID).
 * 
 * @param clerkToken The authenticated Clerk session token
 * @param userId The unique user ID from Clerk
 * @param payload The fields to save/merge in the profile record
 * @returns Promise resolving when the transaction finishes
 */
export async function saveUserProfile(clerkToken: string, userId: string, payload: Record<string, unknown>) {
  if (!isSupabaseConfigured()) {
    return;
  }

  const client = createClerkSupabaseClient(clerkToken);
  const { error } = await client
    .from('user_profiles')
    .upsert({
      id: userId,
      ...payload,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });

  if (error) {
    console.error('Error saving profile to Supabase:', error);
  }
}
