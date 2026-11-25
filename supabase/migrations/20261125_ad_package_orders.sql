-- Homepage advertisement package orders (Easypaisa payment + screenshot proof).
-- Visitors submit (always 'pending'); only admins can read / verify / reject / delete.
-- Nothing in this table (phone, email, payment screenshot) is readable by anon/authenticated clients:
-- no SELECT grant at all, admins read through admin_list_ad_package_orders().

create table if not exists public.ad_package_orders (
  id text primary key,
  package_id text not null default '' check (char_length(package_id) <= 40),
  package_name text not null check (char_length(package_name) between 1 and 120),
  price_label text not null default '' check (char_length(price_label) <= 40),
  period text not null default '' check (char_length(period) <= 40),
  amount numeric not null default 0 check (amount >= 0 and amount < 10000000),
  contact_name text not null default '' check (char_length(contact_name) <= 120),
  contact_phone text not null default '' check (char_length(contact_phone) between 7 and 30),
  contact_email text not null default '' check (char_length(contact_email) <= 160),
  business_name text not null default '' check (char_length(business_name) <= 120),
  transaction_id text not null default '' check (char_length(transaction_id) <= 60),
  note text not null default '' check (char_length(note) <= 500),
  payment_screenshot text not null default '' check (char_length(payment_screenshot) <= 700000),
  status text not null default 'pending' check (status in ('pending', 'verified', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ad_package_orders_status_idx
  on public.ad_package_orders (status, created_at desc);

alter table public.ad_package_orders enable row level security;

drop policy if exists "ad orders insert pending" on public.ad_package_orders;
create policy "ad orders insert pending" on public.ad_package_orders
  for insert to anon, authenticated
  with check (status = 'pending');

drop policy if exists "ad orders admin all" on public.ad_package_orders;
create policy "ad orders admin all" on public.ad_package_orders
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

revoke all on public.ad_package_orders from anon, authenticated;
grant insert on public.ad_package_orders to anon, authenticated;
grant update, delete on public.ad_package_orders to authenticated;

create or replace function public.admin_list_ad_package_orders()
returns setof public.ad_package_orders
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  return query select * from public.ad_package_orders order by created_at desc;
end;
$$;

revoke all on function public.admin_list_ad_package_orders() from public, anon;
grant execute on function public.admin_list_ad_package_orders() to authenticated;
