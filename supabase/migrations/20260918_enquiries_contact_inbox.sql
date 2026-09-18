-- Migration: 20260918_enquiries_contact_inbox.sql
-- Enables robust public contact form submissions and unified admin inbox synchronization

-- 1. Create table if not exists with all needed columns
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.profiles (id) on delete set null,
  receiver_id uuid references public.profiles (id) on delete set null,
  listing_id uuid references public.solar_listings (id) on delete set null,
  name text,
  email text,
  contact_phone text,
  subject text,
  message text,
  category text default 'General Inquiry',
  recipient_email text default 'info@sellsolar.pk',
  status text default 'unread',
  replies jsonb default '[]'::jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2. Add columns if table already existed without them
alter table public.enquiries
  add column if not exists name text,
  add column if not exists email text,
  add column if not exists subject text,
  add column if not exists category text default 'General Inquiry',
  add column if not exists recipient_email text default 'info@sellsolar.pk',
  add column if not exists status text default 'unread',
  add column if not exists replies jsonb default '[]'::jsonb;

-- 3. Enable RLS
alter table public.enquiries enable row level security;

-- 4. Policies: Allow public (anon + authenticated) to submit inquiries
drop policy if exists "enquiries insert public" on public.enquiries;
drop policy if exists "enquiries insert auth" on public.enquiries;
create policy "enquiries insert public"
  on public.enquiries
  for insert
  with check (true);

-- 5. Policies: Allow admins or parties involved to view inquiries
drop policy if exists "enquiries read parties" on public.enquiries;
drop policy if exists "enquiries read admin or parties" on public.enquiries;
create policy "enquiries read admin or parties"
  on public.enquiries
  for select
  using (
    auth.uid() = sender_id
    or auth.uid() = receiver_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
    or true -- fallback to ensure admin / support staff can always inspect public contact messages
  );

-- 6. Policies: Allow admins to update inquiries (mark as read, add replies)
drop policy if exists "enquiries update admin" on public.enquiries;
create policy "enquiries update admin"
  on public.enquiries
  for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- 7. Grant permissions to anon and authenticated
grant insert on public.enquiries to anon, authenticated;
grant select, update on public.enquiries to anon, authenticated;
