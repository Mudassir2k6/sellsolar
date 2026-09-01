-- Multi-photo listings: cover stays in image_url, extras in image_urls.
-- Files are stored in the public listing-images bucket under {user_id}/.

alter table public.solar_listings
  add column if not exists image_urls jsonb not null default '[]'::jsonb;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-images',
  'listing-images',
  true,
  2097152,
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "listing_images_insert_own" on storage.objects;
create policy "listing_images_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "listing_images_update_own" on storage.objects;
create policy "listing_images_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "listing_images_delete_own" on storage.objects;
create policy "listing_images_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
