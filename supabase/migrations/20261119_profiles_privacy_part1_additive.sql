-- Profiles privacy, part 1 (additive: safe to apply before the website update).

-- 1) Close a privilege-escalation hole: "profiles insert own" lets a signed-in user create THEIR OWN
--    profile row. Accounts whose profile row is missing could therefore insert is_admin = true.
--    Force non-privileged values on INSERT for everyone except admins / service role.
create or replace function public.protect_profile_privileges_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.is_admin := false;
    new.is_super_admin := false;
    new.is_verified_dealer := false;
    new.role := null;
  end if;
  return new;
end;
$$;

revoke execute on function public.protect_profile_privileges_insert() from public, anon, authenticated;

drop trigger if exists protect_profile_privileges_insert on public.profiles;
create trigger protect_profile_privileges_insert
  before insert on public.profiles
  for each row execute function public.protect_profile_privileges_insert();

-- 2) Public, privacy-safe profile view.
--    Only dealers and people who posted an ad; never e-mail; CNIC masked (full e-mail / CNIC for admins only).
--    Runs with the owner's rights (bypasses RLS on purpose) - the column list below is the contract.
create or replace view public.public_profiles as
select
  p.id,
  p.full_name,
  p.city,
  p.account_type,
  p.business_name,
  case when p.account_type = 'dealer' or p.is_verified_dealer is true then p.business_address end as business_address,
  p.phone,
  case when public.is_admin() then p.email end as email,
  case
    when public.is_admin() then p.cnic
    when coalesce(p.cnic, '') <> '' and (p.account_type = 'dealer' or p.is_verified_dealer is true)
      then left(p.cnic, 5) || repeat(chr(8226), 6) || right(p.cnic, 1)
  end as cnic,
  case when p.account_type = 'dealer' or p.is_verified_dealer is true then p.visiting_card_url end as visiting_card_url,
  p.is_verified_dealer,
  case when p.role = 'dealer' then 'dealer' end as role,
  p.created_at
from public.profiles p
where p.account_type = 'dealer'
   or p.is_verified_dealer is true
   or p.role = 'dealer'
   or exists (select 1 from public.solar_listings l where l.user_id = p.id);

revoke all on public.public_profiles from public, anon, authenticated;
grant select on public.public_profiles to anon, authenticated;

-- 3) Duplicate-CNIC check for sign-up without exposing the profiles table.
create or replace function public.cnic_already_exists(p_cnic text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select length(trim(coalesce(p_cnic, ''))) > 0
     and exists (select 1 from public.profiles where lower(trim(cnic)) = lower(trim(p_cnic)));
$$;

revoke all on function public.cnic_already_exists(text) from public;
grant execute on function public.cnic_already_exists(text) to anon, authenticated;
