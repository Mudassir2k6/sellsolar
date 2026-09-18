-- Migration: Add registration_source and registered_by to public.profiles
-- Tracks whether a dealer was self-registered or manually enrolled by Administrator.

alter table public.profiles
  add column if not exists registration_source text not null default 'self_registered',
  add column if not exists registered_by text not null default 'dealer_self';

comment on column public.profiles.registration_source is 'Tracks origin: "admin_manual" vs "self_registered"';
comment on column public.profiles.registered_by is 'Tracks registrar identity: "administrator" vs "dealer_self"';
