-- Unique email + phone on marketplace accounts.
-- Run this in the Supabase SQL editor (Dashboard → SQL) if it has not been applied yet.

alter table public.profiles
  add column if not exists email text,
  add column if not exists phone text;

-- Drop leftover duplicate values before unique indexes can be created.
update public.profiles p
set email = au.email
from auth.users au
where p.id = au.id
  and (p.email is null or length(trim(p.email)) = 0)
  and au.email is not null;

create unique index if not exists profiles_email_unique
  on public.profiles (lower(trim(email)))
  where email is not null and length(trim(email)) > 0;

create unique index if not exists profiles_phone_unique
  on public.profiles (regexp_replace(phone, '\D', '', 'g'))
  where phone is not null and length(regexp_replace(phone, '\D', '', 'g')) >= 10;

-- Public check that does not leak other users' contact details.
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
        select 1
        from public.profiles
        where email is not null
          and lower(trim(email)) = normalized_email
      )
    ) as email_exists,
    (
      length(normalized_phone) >= 10
      and exists (
        select 1
        from public.profiles
        where phone is not null
          and regexp_replace(phone, '\D', '', 'g') = normalized_phone
      )
    ) as phone_exists;
end;
$$;

revoke all on function public.contact_already_exists(text, text) from public;
grant execute on function public.contact_already_exists(text, text) to anon, authenticated;
