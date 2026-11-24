-- Featured Ad expiry (14 days).
-- * featured_until is set automatically when a listing becomes featured and cleared when it stops being featured.
-- * The storefront ignores a featured flag once featured_until has passed.
-- * An hourly job switches expired listings back to normal.

alter table public.solar_listings
  add column if not exists featured_until timestamptz;

create or replace function public.set_featured_until()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if coalesce(new.featured, false) is not true then
    new.featured_until := null;
  elsif tg_op = 'INSERT' or coalesce(old.featured, false) is not true or new.featured_until is null then
    new.featured_until := coalesce(new.featured_until, now() + interval '14 days');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_featured_until on public.solar_listings;
create trigger trg_set_featured_until
  before insert or update of featured, featured_until on public.solar_listings
  for each row execute function public.set_featured_until();

-- Existing featured listings start their 14-day window now.
update public.solar_listings
   set featured_until = now() + interval '14 days'
 where featured is true and featured_until is null;

create or replace function public.expire_featured_listings()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare n integer;
begin
  update public.solar_listings
     set featured = false
   where featured is true and featured_until is not null and featured_until < now();
  get diagnostics n = row_count;
  return n;
end;
$$;

revoke execute on function public.expire_featured_listings() from public, anon, authenticated;

create extension if not exists pg_cron;
select cron.unschedule('expire-featured-listings')
 where exists (select 1 from cron.job where jobname = 'expire-featured-listings');
select cron.schedule('expire-featured-listings', '7 * * * *', $cron$select public.expire_featured_listings();$cron$);
