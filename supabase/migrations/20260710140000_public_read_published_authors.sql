-- Allow anon/authenticated to read author display fields for published posts.
-- Public pages embed profiles!posts_author_id_fkey(full_name, slug).

create policy "Public read authors of published posts" on public.profiles
  for select to anon, authenticated
  using (
    exists (
      select 1
      from public.posts p
      where p.author_id = profiles.id
        and p.status = 'published'
    )
  );

-- Split posts SELECT so public reads do not depend on is_admin()
-- (EXECUTE on is_admin() is only granted to authenticated).
drop policy if exists "Public read published posts" on public.posts;

create policy "Public read published posts" on public.posts
  for select to anon, authenticated
  using (status = 'published');

create policy "Authors and admins read drafts" on public.posts
  for select to authenticated
  using (public.is_admin() or author_id = auth.uid());
