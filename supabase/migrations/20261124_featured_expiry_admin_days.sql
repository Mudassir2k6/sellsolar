-- Featured duration is chosen by the admin (dashboard sends featured_until explicitly).
-- The trigger fallback no longer hardcodes 14 days: it uses the admin setting
-- advertisementSettings.featuredDefaultDays from site_settings (14 only if that is missing).

create or replace function public.set_featured_until()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  days integer := 14;
begin
  if coalesce(new.featured, false) is not true then
    new.featured_until := null;
    return new;
  end if;

  if tg_op = 'INSERT' or coalesce(old.featured, false) is not true or new.featured_until is null then
    if new.featured_until is null then
      begin
        select coalesce(
                 nullif(((s.value #>> '{}')::jsonb -> 'advertisementSettings' ->> 'featuredDefaultDays'), '')::integer,
                 14)
          into days
          from public.site_settings s
         where s.key = 'sellsolar_site_settings';
      exception when others then
        days := 14;
      end;
      days := greatest(1, least(coalesce(days, 14), 3650));
      new.featured_until := now() + make_interval(days => days);
    end if;
  end if;
  return new;
end;
$$;
