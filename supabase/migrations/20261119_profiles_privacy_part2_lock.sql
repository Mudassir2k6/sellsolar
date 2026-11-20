-- Profiles privacy, part 2 (BREAKING for old website builds: apply together with the website update).
-- After this, nobody can list other people's profiles (e-mail / phone / CNIC) through the API.
-- The site reads dealers / sellers through public.public_profiles and checks duplicates via RPCs.

drop policy if exists "profiles readable" on public.profiles;
drop policy if exists "profiles read own or admin" on public.profiles;
create policy "profiles read own or admin" on public.profiles
  for select
  using (auth.uid() = id or public.is_admin());
