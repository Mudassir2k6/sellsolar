alter table public.solar_listings add column if not exists seller_email text;

update public.solar_listings l
set seller_email = lower(trim(p.email))
from public.profiles p
where l.user_id = p.id
  and p.email is not null
  and (l.seller_email is null or l.seller_email = '');
