-- Migration to ensure installation_requests has city, system_size, property_type, and notes columns
alter table public.installation_requests 
  add column if not exists city text,
  add column if not exists system_size text,
  add column if not exists property_type text,
  add column if not exists notes text,
  add column if not exists status text default 'pending';

-- Allow anon and authenticated users to insert
grant insert on public.installation_requests to anon, authenticated;
grant select on public.installation_requests to authenticated;
