create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null default 'Buying Guides',
  summary text not null default '',
  content text not null default '',
  author text not null default 'SellSolar Team',
  cover_image_url text,
  read_time text not null default '5 min read',
  is_published boolean not null default true,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_published_idx on public.blog_posts (is_published, published_at desc);
create index if not exists blog_posts_category_idx on public.blog_posts (category);

alter table public.blog_posts enable row level security;

drop policy if exists "blog posts public read" on public.blog_posts;
create policy "blog posts public read" on public.blog_posts
  for select using (is_published = true or public.is_admin());

drop policy if exists "blog posts admin write" on public.blog_posts;
create policy "blog posts admin write" on public.blog_posts
  for all using (public.is_admin()) with check (public.is_admin());

grant select on public.blog_posts to anon, authenticated;
grant insert, update, delete on public.blog_posts to authenticated;
