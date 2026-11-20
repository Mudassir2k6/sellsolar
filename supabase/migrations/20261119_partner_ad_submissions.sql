-- "Advertise here" partner banner submissions.
-- Visitors submit (always 'pending'); admins approve / hide / delete; only 'approved' rows are public.
-- Contact details (name/phone/email) are never readable by anon/authenticated clients: column-level
-- SELECT grants exclude them, and admins read everything through admin_list_partner_ads().

create table if not exists public.partner_ad_submissions (
  id text primary key,
  title text not null check (char_length(title) between 1 and 80),
  subtitle text not null default '' check (char_length(subtitle) <= 100),
  advertiser text not null default '' check (char_length(advertiser) <= 60),
  link_url text not null default '' check (link_url = '' or (link_url ~* '^(https?://|/)' and char_length(link_url) <= 300)),
  image_url text not null default '' check (char_length(image_url) <= 600000),
  contact_name text not null default '' check (char_length(contact_name) <= 120),
  contact_phone text not null default '' check (char_length(contact_phone) <= 30),
  contact_email text not null default '' check (char_length(contact_email) <= 160),
  status text not null default 'pending' check (status in ('pending', 'approved', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists partner_ad_submissions_status_idx
  on public.partner_ad_submissions (status, created_at desc);

alter table public.partner_ad_submissions enable row level security;

drop policy if exists "partner ads insert pending" on public.partner_ad_submissions;
create policy "partner ads insert pending" on public.partner_ad_submissions
  for insert to anon, authenticated
  with check (status = 'pending');

drop policy if exists "partner ads read approved" on public.partner_ad_submissions;
create policy "partner ads read approved" on public.partner_ad_submissions
  for select to anon, authenticated
  using (status = 'approved');

drop policy if exists "partner ads admin write" on public.partner_ad_submissions;
create policy "partner ads admin write" on public.partner_ad_submissions
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

revoke all on public.partner_ad_submissions from anon, authenticated;
grant insert on public.partner_ad_submissions to anon, authenticated;
grant select (id, title, subtitle, advertiser, link_url, image_url, status, created_at, updated_at)
  on public.partner_ad_submissions to anon, authenticated;
grant update, delete on public.partner_ad_submissions to authenticated;

create or replace function public.admin_list_partner_ads()
returns setof public.partner_ad_submissions
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  return query select * from public.partner_ad_submissions order by created_at desc;
end;
$$;

revoke all on function public.admin_list_partner_ads() from public, anon;
grant execute on function public.admin_list_partner_ads() to authenticated;
