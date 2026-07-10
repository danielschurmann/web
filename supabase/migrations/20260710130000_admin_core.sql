-- Admin core: profiles, api_keys, posts, RLS
-- Applied remotely via MCP; kept here as source of truth.

create type public.user_role as enum ('admin', 'editor', 'client');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role public.user_role not null default 'client',
  slug text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  key_prefix text not null,
  key_hash text not null unique,
  scopes text[] not null default array['notes:write']::text[],
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create type public.post_status as enum ('draft', 'published', 'archived');

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id),
  title text not null,
  slug text not null unique,
  excerpt text,
  body_md text not null default '',
  source_url text,
  status public.post_status not null default 'draft',
  created_via text not null default 'backoffice',
  seo_title text,
  seo_description text,
  tags text[] not null default '{}',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_status_published_idx on public.posts (status, published_at desc);
create index if not exists posts_author_idx on public.posts (author_id);
create index if not exists api_keys_user_idx on public.api_keys (user_id);

alter table public.profiles enable row level security;
alter table public.api_keys enable row level security;
alter table public.posts enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create policy "Users read own profile" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());

create policy "Admins update profiles" on public.profiles
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Users update own name" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "Manage own api keys" on public.api_keys
  for all to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy "Public read published posts" on public.posts
  for select to anon, authenticated
  using (status = 'published' or public.is_admin() or author_id = auth.uid());

create policy "Admins write posts" on public.posts
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, slug)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'client'),
    lower(regexp_replace(coalesce(new.raw_user_meta_data->>'slug', split_part(new.email, '@', 1)), '[^a-z0-9]+', '-', 'g'))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

grant select on table public.leads to authenticated;
create policy "Admins read leads" on public.leads
  for select to authenticated using (public.is_admin());
