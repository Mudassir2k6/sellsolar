-- Migration: Add registration_source to public.profiles table
-- Distinguishes between AI curated dealers, self-registered users, and manual admin entries

alter table if exists public.profiles
  add column if not exists registration_source text not null default 'self_registered';

-- Create an index for high-speed filtering by account_type and registration_source
create index if not exists idx_profiles_dealer_source
  on public.profiles (account_type, registration_source, is_verified_dealer);

-- Comment on column for developer clarity
comment on column public.profiles.registration_source is 
  'Registration source tracking: "ai_curated" (verified by AI directory curation), "self_registered" (registered by dealer on website), or "manual_admin" (manually verified/added by admin).';
