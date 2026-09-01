create table if not exists public.installation_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  full_name text not null,
  address text not null,
  contact_phone text not null,
  created_at timestamptz not null default now()
);

alter table public.installation_requests enable row level security;

drop policy if exists "installation_requests insert public" on public.installation_requests;
create policy "installation_requests insert public"
  on public.installation_requests
  for insert
  with check (true);

drop policy if exists "installation_requests read own or admin" on public.installation_requests;
create policy "installation_requests read own or admin"
  on public.installation_requests
  for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

grant insert on public.installation_requests to anon, authenticated;
grant select on public.installation_requests to authenticated;
