-- SellSolar marketplace schema on the project we control.
-- Password rules are Auth settings; this project does not use leaked-password blocking.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  phone text,
  full_name text,
  city text,
  account_type text not null default 'individual',
  cnic text,
  business_name text,
  business_address text,
  visiting_card_url text,
  is_verified_dealer boolean not null default false,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.solar_listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  title text not null,
  brand text,
  category text,
  condition text,
  price numeric,
  city text,
  capacity_kw numeric,
  warranty_years integer,
  image_url text,
  description text,
  seller_name text,
  seller_phone text,
  featured boolean not null default false,
  sponsored boolean not null default false,
  is_sold boolean not null default false,
  views integer not null default 0,
  status text not null default 'pending',
  rejection_reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  is_active boolean not null default true
);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.profiles (id) on delete set null,
  receiver_id uuid references public.profiles (id) on delete set null,
  listing_id uuid references public.solar_listings (id) on delete set null,
  message text,
  contact_phone text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.advertisements (
  id uuid primary key default gen_random_uuid(),
  title text,
  image_url text,
  placement text,
  contact_phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  listing_id uuid references public.solar_listings (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  title text,
  message text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists profiles_email_unique
  on public.profiles (lower(trim(email)))
  where email is not null and length(trim(email)) > 0;

create unique index if not exists profiles_phone_unique
  on public.profiles (regexp_replace(phone, '\D', '', 'g'))
  where phone is not null and length(regexp_replace(phone, '\D', '', 'g')) = 11;

insert into public.categories (name, slug, sort_order)
values
  ('Solar Panels', 'panel', 1),
  ('Inverters', 'inverter', 2),
  ('Batteries', 'battery', 3),
  ('Complete Systems', 'complete_system', 4)
on conflict (slug) do nothing;

insert into public.brands (name, slug)
values
  ('Longi', 'longi'),
  ('Canadian Solar', 'canadian-solar'),
  ('Jinko', 'jinko'),
  ('Trina', 'trina'),
  ('Inverex', 'inverex'),
  ('Tesla', 'tesla'),
  ('Homage', 'homage'),
  ('Phoenix', 'phoenix'),
  ('Osaka', 'osaka'),
  ('AGS', 'ags')
on conflict (slug) do nothing;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id, email, phone, full_name, city, account_type, cnic, business_name, business_address, visiting_card_url
  )
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'city',
    coalesce(new.raw_user_meta_data->>'account_type', 'individual'),
    new.raw_user_meta_data->>'cnic',
    new.raw_user_meta_data->>'business_name',
    new.raw_user_meta_data->>'business_address',
    new.raw_user_meta_data->>'visiting_card_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    phone = coalesce(excluded.phone, public.profiles.phone),
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    city = coalesce(excluded.city, public.profiles.city),
    account_type = coalesce(excluded.account_type, public.profiles.account_type);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.contact_already_exists(p_email text, p_phone text)
returns table(email_exists boolean, phone_exists boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text := lower(trim(coalesce(p_email, '')));
  normalized_phone text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
begin
  return query
  select
    (
      length(normalized_email) > 0
      and exists (
        select 1 from public.profiles
        where email is not null and lower(trim(email)) = normalized_email
      )
    ),
    (
      length(normalized_phone) = 11
      and exists (
        select 1 from public.profiles
        where phone is not null and regexp_replace(phone, '\D', '', 'g') = normalized_phone
      )
    );
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin is true
  );
$$;

create or replace function public.admin_verify_dealer(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed';
  end if;
  update public.profiles set is_verified_dealer = true where id = target_user_id;
end;
$$;

create or replace function public.admin_delete_listing(listing_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed';
  end if;
  delete from public.solar_listings where id = listing_id;
end;
$$;

create or replace function public.admin_delete_profile(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed';
  end if;
  delete from public.profiles where id = target_user_id;
end;
$$;

create or replace function public.admin_update_listing_status(p_listing_id uuid, p_new_status text, p_reason text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed';
  end if;
  update public.solar_listings
  set status = p_new_status,
      rejection_reason = case when p_new_status = 'rejected' then p_reason else null end
  where id = p_listing_id;
end;
$$;

create or replace function public.admin_toggle_featured(p_listing_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed';
  end if;
  update public.solar_listings set featured = not featured where id = p_listing_id;
end;
$$;

create or replace function public.admin_toggle_sponsored(p_listing_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed';
  end if;
  update public.solar_listings set sponsored = not sponsored where id = p_listing_id;
end;
$$;

create or replace function public.admin_toggle_sold(p_listing_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed';
  end if;
  update public.solar_listings set is_sold = not is_sold where id = p_listing_id;
end;
$$;

alter table public.profiles enable row level security;
alter table public.solar_listings enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.enquiries enable row level security;
alter table public.advertisements enable row level security;
alter table public.favorites enable row level security;
alter table public.notifications enable row level security;

create policy "profiles readable" on public.profiles for select using (true);
create policy "profiles insert own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles update own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "listings readable" on public.solar_listings for select using (true);
create policy "listings insert own" on public.solar_listings for insert with check (auth.uid() = user_id);
create policy "listings update own" on public.solar_listings for update using (auth.uid() = user_id);

create policy "categories readable" on public.categories for select using (true);
create policy "brands readable" on public.brands for select using (true);
create policy "ads readable" on public.advertisements for select using (true);

create policy "enquiries insert auth" on public.enquiries for insert with check (auth.uid() = sender_id);
create policy "enquiries read parties" on public.enquiries for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "favorites own" on public.favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notifications own" on public.notifications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant usage on schema public to anon, authenticated;
grant select on public.profiles, public.solar_listings, public.categories, public.brands, public.advertisements to anon, authenticated;
grant insert, update on public.profiles to authenticated;
grant insert, update, delete on public.solar_listings to authenticated;
grant select, insert on public.enquiries to authenticated;
grant all on public.favorites, public.notifications to authenticated;

revoke all on function public.contact_already_exists(text, text) from public;
grant execute on function public.contact_already_exists(text, text) to anon, authenticated;
grant execute on function public.admin_verify_dealer(uuid) to authenticated;
grant execute on function public.admin_delete_listing(uuid) to authenticated;
grant execute on function public.admin_delete_profile(uuid) to authenticated;
grant execute on function public.admin_update_listing_status(uuid, text, text) to authenticated;
grant execute on function public.admin_toggle_featured(uuid) to authenticated;
grant execute on function public.admin_toggle_sponsored(uuid) to authenticated;
grant execute on function public.admin_toggle_sold(uuid) to authenticated;
