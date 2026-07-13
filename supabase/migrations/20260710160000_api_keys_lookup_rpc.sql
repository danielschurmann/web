-- API key auth without requiring service_role on the app server.
-- lookup/touch are security definer; grants limited to execute.

create or replace function public.lookup_api_key_by_hash(p_hash text)
returns table (
  id uuid,
  user_id uuid,
  scopes text[],
  revoked_at timestamptz,
  profile_id uuid,
  email text,
  full_name text,
  role public.user_role,
  slug text
)
language sql
security definer
set search_path = public
as $$
  select
    k.id,
    k.user_id,
    k.scopes,
    k.revoked_at,
    p.id as profile_id,
    p.email,
    p.full_name,
    p.role,
    p.slug
  from public.api_keys k
  join public.profiles p on p.id = k.user_id
  where k.key_hash = p_hash
  limit 1;
$$;

create or replace function public.touch_api_key_last_used(p_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.api_keys
  set last_used_at = now()
  where id = p_id;
$$;

revoke all on function public.lookup_api_key_by_hash(text) from public;
revoke all on function public.touch_api_key_last_used(uuid) from public;
grant execute on function public.lookup_api_key_by_hash(text) to anon, authenticated, service_role;
grant execute on function public.touch_api_key_last_used(uuid) to anon, authenticated, service_role;
