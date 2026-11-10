-- Roles on profiles
alter table public.profiles add column if not exists role text;
alter table public.profiles add column if not exists is_super_admin boolean not null default false;
update public.profiles set role = case
  when lower(email) = 'mudassir2k6@gmail.com' then 'super_admin'
  when is_admin then 'admin'
  when is_verified_dealer or account_type = 'dealer' then 'dealer'
  else 'customer' end
where role is null;
update public.profiles set is_super_admin = true where lower(email) = 'mudassir2k6@gmail.com';

-- Block self privilege escalation: only admins may change privilege columns
create or replace function public.protect_profile_privileges()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.is_admin := old.is_admin;
    new.is_super_admin := old.is_super_admin;
    new.is_verified_dealer := old.is_verified_dealer;
    new.role := old.role;
  end if;
  return new;
end $$;
drop trigger if exists protect_profile_privileges on public.profiles;
create trigger protect_profile_privileges before update on public.profiles
  for each row execute function public.protect_profile_privileges();

drop policy if exists "profiles update admin" on public.profiles;
create policy "profiles update admin" on public.profiles for update using (public.is_admin()) with check (public.is_admin());

-- Listings: admin update/delete, owner delete
drop policy if exists "listings update admin" on public.solar_listings;
create policy "listings update admin" on public.solar_listings for update using (public.is_admin());
drop policy if exists "listings delete own or admin" on public.solar_listings;
create policy "listings delete own or admin" on public.solar_listings for delete using (auth.uid() = user_id or public.is_admin());

-- Advertisements: admin write
drop policy if exists "ads admin write" on public.advertisements;
create policy "ads admin write" on public.advertisements for all using (public.is_admin()) with check (public.is_admin());

-- Enquiries: admin delete
drop policy if exists "enquiries delete admin" on public.enquiries;
create policy "enquiries delete admin" on public.enquiries for delete using (public.is_admin());

-- Installation leads: persistent status
alter table public.installation_requests add column if not exists status text not null default 'pending';
alter table public.installation_requests add column if not exists city text;
alter table public.installation_requests add column if not exists system_size text;
alter table public.installation_requests add column if not exists property_type text;
alter table public.installation_requests add column if not exists notes text;
drop policy if exists "installation_requests update admin" on public.installation_requests;
create policy "installation_requests update admin" on public.installation_requests for update using (public.is_admin());
drop policy if exists "installation_requests delete admin" on public.installation_requests;
create policy "installation_requests delete admin" on public.installation_requests for delete using (public.is_admin());

-- Dealers directory
create table if not exists public.dealers (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.dealers enable row level security;
drop policy if exists "dealers readable" on public.dealers;
create policy "dealers readable" on public.dealers for select using (true);
drop policy if exists "dealers admin write" on public.dealers;
create policy "dealers admin write" on public.dealers for all using (public.is_admin()) with check (public.is_admin());
grant select on public.dealers to anon, authenticated;
grant insert, update, delete on public.dealers to authenticated;

-- Site settings (CMS, homepage ads, packages)
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
drop policy if exists "site_settings readable" on public.site_settings;
create policy "site_settings readable" on public.site_settings for select using (true);
drop policy if exists "site_settings admin write" on public.site_settings;
create policy "site_settings admin write" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());
grant select on public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_settings to authenticated;
