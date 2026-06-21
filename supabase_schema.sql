-- supabase_schema.sql
-- Run this script in the Supabase SQL Editor

-- 1. Create a custom function to get the Clerk User ID from the JWT token
create or replace function requesting_user_id()
returns text
language sql stable
as $$
  select nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$;

-- 2. Create the user_profiles table
create table user_profiles (
  id text primary key, -- Clerk User ID
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  answers_json jsonb,
  footprint_json jsonb,
  challenge_json jsonb,
  ranked_actions_json jsonb,
  selected_actions text[] default '{}',
  completed_milestones int[] default '{}'
);

-- 3. Enable RLS
alter table user_profiles enable row level security;

-- 4. Create RLS Policies
create policy "Users can read their own profile."
  on user_profiles for select
  using ( requesting_user_id() = id );

create policy "Users can insert their own profile."
  on user_profiles for insert
  with check ( requesting_user_id() = id );

create policy "Users can update their own profile."
  on user_profiles for update
  using ( requesting_user_id() = id );

create policy "Users can delete their own profile."
  on user_profiles for delete
  using ( requesting_user_id() = id );
