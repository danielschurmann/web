-- Leads from the landing contact form
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  contacto text not null,
  mensaje text,
  source text not null default 'landing',
  created_at timestamptz not null default now()
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);

alter table public.leads enable row level security;

drop policy if exists "Allow public insert leads" on public.leads;
create policy "Allow public insert leads"
  on public.leads
  for insert
  to anon, authenticated
  with check (true);

revoke all on table public.leads from anon, authenticated;
grant insert on table public.leads to anon, authenticated;
grant select, insert, update, delete on table public.leads to service_role;
