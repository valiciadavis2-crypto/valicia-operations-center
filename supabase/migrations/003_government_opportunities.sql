-- Government Opportunities persistent data model.
-- Run this after 001_initial_schema.sql for the Government Contracting Command Center.

create table if not exists public.government_opportunities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  agency text,
  solicitation_number text,
  naics text,
  set_aside text,
  due_date date,
  estimated_value numeric(14,2) default 0,
  source_url text,
  ai_fit_score integer default 0 check (ai_fit_score >= 0 and ai_fit_score <= 100),
  status text not null default 'New',
  next_action text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.government_opportunities enable row level security;

drop policy if exists government_opportunities_select_own on public.government_opportunities;
drop policy if exists government_opportunities_insert_own on public.government_opportunities;
drop policy if exists government_opportunities_update_own on public.government_opportunities;
drop policy if exists government_opportunities_delete_own on public.government_opportunities;

create policy government_opportunities_select_own on public.government_opportunities
for select using (owner_id = auth.uid());

create policy government_opportunities_insert_own on public.government_opportunities
for insert with check (owner_id = auth.uid());

create policy government_opportunities_update_own on public.government_opportunities
for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy government_opportunities_delete_own on public.government_opportunities
for delete using (owner_id = auth.uid());

drop trigger if exists set_government_opportunities_updated_at on public.government_opportunities;
create trigger set_government_opportunities_updated_at
before update on public.government_opportunities
for each row execute function public.set_updated_at();
