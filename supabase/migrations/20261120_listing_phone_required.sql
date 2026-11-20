-- Every new ad must carry a valid Pakistani mobile number (03XXXXXXXXX).
-- Enforced in the database so it cannot be bypassed from the browser.
-- Existing rows are untouched; the check runs on INSERT and whenever seller_phone is changed.

create or replace function public.enforce_listing_phone()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v text;
begin
  if tg_op = 'UPDATE' and new.seller_phone is not distinct from old.seller_phone then
    return new;
  end if;

  v := regexp_replace(coalesce(new.seller_phone, ''), '\D', '', 'g');
  if v ~ '^92[0-9]{10}$' then
    v := '0' || substr(v, 3);
  end if;

  if v !~ '^03[0-9]{9}$' then
    raise exception 'A valid 11-digit mobile number (e.g. 03001234567) is required to post an ad.'
      using errcode = '23514';
  end if;

  new.seller_phone := v;
  return new;
end;
$$;

revoke execute on function public.enforce_listing_phone() from public, anon, authenticated;

drop trigger if exists enforce_listing_phone on public.solar_listings;
create trigger enforce_listing_phone
  before insert or update of seller_phone on public.solar_listings
  for each row execute function public.enforce_listing_phone();

-- Profiles of users who already posted ads but never got the number saved
-- (the old client code wrote non-existent columns, so the whole profile update failed silently).
update public.profiles p
set phone = x.phone
from (
  select user_id, max(seller_phone) as phone
  from public.solar_listings
  where user_id is not null and seller_phone ~ '^03[0-9]{9}$'
  group by user_id
) x
where p.id = x.user_id and coalesce(p.phone, '') = '';
