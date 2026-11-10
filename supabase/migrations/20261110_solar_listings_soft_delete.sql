alter table public.solar_listings add column if not exists is_deleted boolean not null default false;
alter table public.solar_listings add column if not exists deleted_at timestamptz;
alter table public.solar_listings add column if not exists deleted_by uuid;

update public.solar_listings
set user_id = '14da7000-c6c8-49cd-b942-e8e765c2de71'
where id = 'df16915c-0777-4b89-8caa-67955978d5af'
  and user_id is null
  and seller_phone = '03457649616';
