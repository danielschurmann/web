-- Superadmin role + staff permissions + user management.
-- El valor 'superadmin' del enum public.user_role se agrega en una sentencia
-- aparte (ALTER TYPE ... ADD VALUE no puede usarse en la misma transacción en
-- la que se referencia):
--   alter type public.user_role add value if not exists 'superadmin';
--
-- Modelo de roles:
--   superadmin -> Daniel y Gabriel: administran usuarios + todo el backoffice.
--   editor     -> Alejandra y Sebastián: ven consultas y crean/editan notas.
--   admin      -> se mantiene como acceso total (equivalente operativo a superadmin
--                 salvo la gestión de usuarios).
--   client     -> sin acceso al backoffice.
--
-- Las altas y bajas de usuarios se hacen con la Auth Admin API (service role),
-- que evita RLS; por eso acá solo se define la policy de UPDATE para que un
-- superadmin pueda cambiar el rol de otro usuario desde el backoffice.

-- Helpers de rol ----------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('superadmin', 'admin')
  );
$$;

create or replace function public.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'superadmin'
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('superadmin', 'admin', 'editor')
  );
$$;

revoke all on function public.is_superadmin() from public;
revoke all on function public.is_staff() from public;
grant execute on function public.is_superadmin() to authenticated;
grant execute on function public.is_staff() to authenticated;

-- Posts: el staff crea/edita; solo superadmin borra ----------------------
drop policy if exists "Admins write posts" on public.posts;
drop policy if exists "Public read published posts" on public.posts;

create policy "Read posts" on public.posts
  for select to anon, authenticated
  using (status = 'published' or public.is_staff() or author_id = auth.uid());

create policy "Staff insert posts" on public.posts
  for insert to authenticated
  with check (public.is_staff());

create policy "Staff update posts" on public.posts
  for update to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "Superadmins delete posts" on public.posts
  for delete to authenticated
  using (public.is_superadmin());

-- Leads: el staff puede leer las consultas --------------------------------
drop policy if exists "Admins read leads" on public.leads;
create policy "Staff read leads" on public.leads
  for select to authenticated using (public.is_staff());

-- Profiles: un superadmin puede actualizar (p. ej. cambiar el rol) --------
drop policy if exists "Admins update profiles" on public.profiles;
create policy "Superadmins update profiles" on public.profiles
  for update to authenticated
  using (public.is_superadmin())
  with check (public.is_superadmin());

-- Defensa en profundidad: nadie que no sea superadmin cambia un rol,
-- ni siquiera sobre su propia fila (la policy "Users update own name"
-- permite auto-editar el nombre pero no escalar privilegios).
create or replace function public.enforce_role_change_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- auth.uid() is null => operación por service role / SQL directo (confiable).
  -- Solo se bloquea a usuarios logueados que no sean superadmin.
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_superadmin() then
    raise exception 'Solo un superadmin puede cambiar el rol de un usuario';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_enforce_role_change on public.profiles;
create trigger profiles_enforce_role_change
  before update on public.profiles
  for each row execute function public.enforce_role_change_rules();
