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
  place_of_performance text,
  city text,
  state text,
  zip_code text,
  county text,
  service_radius numeric(10,2) default 0,
  remote_virtual_allowed text not null default 'unknown',
  delivery_required text not null default 'no',
  shipping_acceptable text not null default 'unknown',
  fulfillment_type text,
  ai_fit_score integer default 0 check (ai_fit_score >= 0 and ai_fit_score <= 100),
  status text not null default 'New',
  next_action text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.government_subcontractors (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid not null references auth.users(id) on delete cascade,
  company_name text not null,
  service_category text,
  location text,
  fulfillment_type text,
  city text,
  state text,
  zip_code text,
  service_area_radius numeric(10,2) default 0,
  remote_service text not null default 'no',
  delivery_shipping_capability text not null default 'no',
  national_supplier text not null default 'no',
  contact_name text,
  email text,
  phone text,
  sam_registered boolean not null default false,
  sam_registration_status text not null default 'unknown' check (sam_registration_status in ('yes', 'no', 'unknown')),
  status text not null default 'not contacted' check (status in ('not contacted', 'emailed', 'called', 'responded', 'interested', 'not interested')),
  last_contact_date date,
  next_follow_up_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.government_opportunities
  add column if not exists place_of_performance text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists zip_code text,
  add column if not exists county text,
  add column if not exists service_radius numeric(10,2) default 0,
  add column if not exists remote_virtual_allowed text not null default 'unknown',
  add column if not exists delivery_required text not null default 'no',
  add column if not exists shipping_acceptable text not null default 'unknown',
  add column if not exists fulfillment_type text;

alter table public.government_opportunities
  drop constraint if exists government_opportunities_remote_virtual_allowed_check,
  drop constraint if exists government_opportunities_delivery_required_check,
  drop constraint if exists government_opportunities_shipping_acceptable_check;

alter table public.government_opportunities
  add constraint government_opportunities_remote_virtual_allowed_check
  check (remote_virtual_allowed in ('yes', 'no', 'unknown')),
  add constraint government_opportunities_delivery_required_check
  check (delivery_required in ('yes', 'no', 'unknown')),
  add constraint government_opportunities_shipping_acceptable_check
  check (shipping_acceptable in ('yes', 'no', 'unknown'));

alter table public.government_subcontractors
  add column if not exists sam_registration_status text not null default 'unknown',
  add column if not exists next_follow_up_date date,
  add column if not exists fulfillment_type text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists zip_code text,
  add column if not exists service_area_radius numeric(10,2) default 0,
  add column if not exists remote_service text not null default 'no',
  add column if not exists delivery_shipping_capability text not null default 'no',
  add column if not exists national_supplier text not null default 'no';

alter table public.government_subcontractors
  alter column sam_registration_status set default 'unknown',
  alter column status set default 'not contacted';

update public.government_subcontractors
set
  sam_registration_status = case
    when lower(coalesce(sam_registration_status, '')) in ('yes', 'no', 'unknown') then lower(sam_registration_status)
    when sam_registered is true then 'yes'
    when sam_registered is false then 'no'
    else 'unknown'
  end,
  status = case lower(coalesce(status, ''))
    when 'sent' then 'emailed'
    when 'email sent' then 'emailed'
    when 'emailed' then 'emailed'
    when 'called' then 'called'
    when 'responded' then 'responded'
    when 'interested' then 'interested'
    when 'declined' then 'not interested'
    when 'not interested' then 'not interested'
    when 'quote requested' then 'interested'
    when 'quote received' then 'interested'
    when 'partner selected' then 'interested'
    else 'not contacted'
  end;

alter table public.government_subcontractors
  drop constraint if exists government_subcontractors_sam_registration_status_check,
  drop constraint if exists government_subcontractors_status_check,
  drop constraint if exists government_subcontractors_remote_service_check,
  drop constraint if exists government_subcontractors_delivery_shipping_capability_check,
  drop constraint if exists government_subcontractors_national_supplier_check;

alter table public.government_subcontractors
  add constraint government_subcontractors_sam_registration_status_check
  check (sam_registration_status in ('yes', 'no', 'unknown')),
  add constraint government_subcontractors_status_check
  check (status in ('not contacted', 'emailed', 'called', 'responded', 'interested', 'not interested')),
  add constraint government_subcontractors_remote_service_check
  check (remote_service in ('yes', 'no', 'unknown')),
  add constraint government_subcontractors_delivery_shipping_capability_check
  check (delivery_shipping_capability in ('yes', 'no', 'unknown')),
  add constraint government_subcontractors_national_supplier_check
  check (national_supplier in ('yes', 'no', 'unknown'));

create table if not exists public.government_outreach (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid not null references auth.users(id) on delete cascade,
  opportunity_id uuid not null references public.government_opportunities(id) on delete cascade,
  subcontractor_id text references public.government_subcontractors(id) on delete set null,
  status text not null default 'Draft',
  created_at date not null default current_date,
  follow_up_date date,
  last_contact_date date,
  draft_email text,
  notes text,
  response_summary text,
  updated_at timestamptz not null default now()
);

create table if not exists public.government_reminders (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid not null references auth.users(id) on delete cascade,
  opportunity_id uuid not null references public.government_opportunities(id) on delete cascade,
  subcontractor_id text references public.government_subcontractors(id) on delete set null,
  type text not null default 'Outreach follow-up',
  due_date date not null default current_date,
  priority text not null default 'Normal',
  status text not null default 'Pending',
  notes text,
  completed_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.government_awards (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid not null references auth.users(id) on delete cascade,
  opportunity_id uuid not null references public.government_opportunities(id) on delete cascade unique,
  award_status text not null default 'Pending Award',
  award_date date,
  award_amount numeric(14,2) default 0,
  prime_or_subcontract text not null default 'Prime',
  contract_number text,
  period_of_performance text,
  awarding_agency text,
  assigned_subcontractors jsonb not null default '[]'::jsonb,
  internal_notes text,
  reason_lost text,
  winning_competitor text,
  lessons_learned text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.government_opportunities enable row level security;
alter table public.government_subcontractors enable row level security;
alter table public.government_outreach enable row level security;
alter table public.government_reminders enable row level security;
alter table public.government_awards enable row level security;

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

drop policy if exists government_subcontractors_select_own on public.government_subcontractors;
drop policy if exists government_subcontractors_insert_own on public.government_subcontractors;
drop policy if exists government_subcontractors_update_own on public.government_subcontractors;
drop policy if exists government_subcontractors_delete_own on public.government_subcontractors;

create policy government_subcontractors_select_own on public.government_subcontractors
for select using (owner_id = auth.uid());

create policy government_subcontractors_insert_own on public.government_subcontractors
for insert with check (owner_id = auth.uid());

create policy government_subcontractors_update_own on public.government_subcontractors
for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy government_subcontractors_delete_own on public.government_subcontractors
for delete using (owner_id = auth.uid());

drop policy if exists government_outreach_select_own on public.government_outreach;
drop policy if exists government_outreach_insert_own on public.government_outreach;
drop policy if exists government_outreach_update_own on public.government_outreach;
drop policy if exists government_outreach_delete_own on public.government_outreach;

create policy government_outreach_select_own on public.government_outreach
for select using (owner_id = auth.uid());

create policy government_outreach_insert_own on public.government_outreach
for insert with check (
  owner_id = auth.uid()
  and exists (select 1 from public.government_opportunities o where o.id = opportunity_id and o.owner_id = auth.uid())
  and (
    subcontractor_id is null
    or exists (select 1 from public.government_subcontractors s where s.id = subcontractor_id and s.owner_id = auth.uid())
  )
);

create policy government_outreach_update_own on public.government_outreach
for update using (owner_id = auth.uid()) with check (
  owner_id = auth.uid()
  and exists (select 1 from public.government_opportunities o where o.id = opportunity_id and o.owner_id = auth.uid())
  and (
    subcontractor_id is null
    or exists (select 1 from public.government_subcontractors s where s.id = subcontractor_id and s.owner_id = auth.uid())
  )
);

create policy government_outreach_delete_own on public.government_outreach
for delete using (owner_id = auth.uid());

drop policy if exists government_reminders_select_own on public.government_reminders;
drop policy if exists government_reminders_insert_own on public.government_reminders;
drop policy if exists government_reminders_update_own on public.government_reminders;
drop policy if exists government_reminders_delete_own on public.government_reminders;

create policy government_reminders_select_own on public.government_reminders
for select using (owner_id = auth.uid());

create policy government_reminders_insert_own on public.government_reminders
for insert with check (
  owner_id = auth.uid()
  and exists (select 1 from public.government_opportunities o where o.id = opportunity_id and o.owner_id = auth.uid())
  and (
    subcontractor_id is null
    or exists (select 1 from public.government_subcontractors s where s.id = subcontractor_id and s.owner_id = auth.uid())
  )
);

create policy government_reminders_update_own on public.government_reminders
for update using (owner_id = auth.uid()) with check (
  owner_id = auth.uid()
  and exists (select 1 from public.government_opportunities o where o.id = opportunity_id and o.owner_id = auth.uid())
  and (
    subcontractor_id is null
    or exists (select 1 from public.government_subcontractors s where s.id = subcontractor_id and s.owner_id = auth.uid())
  )
);

create policy government_reminders_delete_own on public.government_reminders
for delete using (owner_id = auth.uid());

drop policy if exists government_awards_select_own on public.government_awards;
drop policy if exists government_awards_insert_own on public.government_awards;
drop policy if exists government_awards_update_own on public.government_awards;
drop policy if exists government_awards_delete_own on public.government_awards;

create policy government_awards_select_own on public.government_awards
for select using (owner_id = auth.uid());

create policy government_awards_insert_own on public.government_awards
for insert with check (
  owner_id = auth.uid()
  and exists (select 1 from public.government_opportunities o where o.id = opportunity_id and o.owner_id = auth.uid())
);

create policy government_awards_update_own on public.government_awards
for update using (owner_id = auth.uid()) with check (
  owner_id = auth.uid()
  and exists (select 1 from public.government_opportunities o where o.id = opportunity_id and o.owner_id = auth.uid())
);

create policy government_awards_delete_own on public.government_awards
for delete using (owner_id = auth.uid());

drop trigger if exists set_government_opportunities_updated_at on public.government_opportunities;
create trigger set_government_opportunities_updated_at
before update on public.government_opportunities
for each row execute function public.set_updated_at();

drop trigger if exists set_government_subcontractors_updated_at on public.government_subcontractors;
create trigger set_government_subcontractors_updated_at
before update on public.government_subcontractors
for each row execute function public.set_updated_at();

drop trigger if exists set_government_outreach_updated_at on public.government_outreach;
create trigger set_government_outreach_updated_at
before update on public.government_outreach
for each row execute function public.set_updated_at();

drop trigger if exists set_government_reminders_updated_at on public.government_reminders;
create trigger set_government_reminders_updated_at
before update on public.government_reminders
for each row execute function public.set_updated_at();

drop trigger if exists set_government_awards_updated_at on public.government_awards;
create trigger set_government_awards_updated_at
before update on public.government_awards
for each row execute function public.set_updated_at();
