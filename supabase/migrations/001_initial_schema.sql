-- V Solutions HR OS - Phase 1 database foundation
-- Run this in the Supabase SQL editor after creating a project.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  business_name text default 'V Solutions LLC',
  business_email text,
  phone text,
  address text default 'Montgomery, AL',
  default_hourly_rate numeric(12,2) default 150,
  default_invoice_terms text default 'Net 15',
  default_monthly_retainer_terms text default 'Monthly retainer billed in advance',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  company_name text not null,
  industry text,
  employee_count integer,
  address text,
  city text,
  state text,
  website text,
  status text not null default 'Lead' check (status in ('Lead','Active','Paused','Former')),
  contract_start_date date,
  contract_end_date date,
  monthly_retainer_amount numeric(12,2) default 0,
  billing_frequency text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  title text,
  email text,
  phone text,
  role text default 'Other' check (role in ('Owner','HR Contact','Manager','Finance','Legal','Other')),
  primary_contact boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete restrict,
  invoice_number text not null,
  invoice_date date not null default current_date,
  due_date date,
  billing_period_start date,
  billing_period_end date,
  status text not null default 'Draft' check (status in ('Draft','Sent','Paid','Overdue','Cancelled')),
  subtotal numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total numeric(12,2) generated always as (subtotal - discount + tax) stored,
  payment_date date,
  payment_method text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, invoice_number)
);

create table public.invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  description text not null,
  service_category text,
  quantity numeric(12,2) not null default 1,
  rate numeric(12,2) not null default 0,
  amount numeric(12,2) generated always as (quantity * rate) stored,
  related_engagement_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Future-module tables are included now so RLS is secure from day one.
create table public.engagements (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  service_date date not null,
  service_category text,
  description text,
  hours_worked numeric(8,2) default 0,
  billable boolean default true,
  hourly_rate numeric(12,2) default 0,
  amount numeric(12,2) generated always as (hours_worked * hourly_rate) stored,
  invoice_status text default 'Not Invoiced' check (invoice_status in ('Not Invoiced','Invoiced','Paid')),
  related_case_id uuid,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cases (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  case_number text not null,
  case_type text,
  priority text default 'Medium' check (priority in ('Low','Medium','High','Urgent')),
  status text default 'Open' check (status in ('Open','In Progress','Waiting on Client','Resolved','Closed')),
  employee_involved text,
  manager_involved text,
  summary text,
  recommendation text,
  date_opened date default current_date,
  due_date date,
  date_closed date,
  assigned_consultant text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, case_number)
);

create table public.case_notes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  case_id uuid not null references public.cases(id) on delete cascade,
  note_body text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.investigations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  investigation_number text not null,
  date_opened date default current_date,
  date_closed date,
  complainant text,
  respondent text,
  department text,
  shift text,
  complaint_summary text,
  prior_discipline boolean default false,
  witness_1 text,
  witness_2 text,
  witness_3 text,
  evidence_reviewed text,
  status text default 'Intake',
  findings text,
  recommended_action text,
  final_summary text,
  investigator_name text,
  follow_up_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, investigation_number)
);

create table public.investigation_interviews (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  investigation_id uuid not null references public.investigations(id) on delete cascade,
  interviewee_name text not null,
  interview_date date,
  interview_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  title text not null,
  document_type text,
  storage_path text,
  file_name text,
  related_case_id uuid references public.cases(id) on delete set null,
  related_investigation_id uuid references public.investigations(id) on delete set null,
  expiration_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ai_documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  document_type text not null,
  situation_summary text,
  tone text,
  employee_name text,
  policy_reference text,
  output text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  parent_type text,
  parent_id uuid,
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  parent_type text not null,
  parent_id uuid not null,
  note_body text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles','clients','contacts','engagements','cases','case_notes','investigations',
    'investigation_interviews','documents','invoices','invoice_line_items','ai_documents',
    'activity_logs','notes'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "%I_select_own" on public.%I', t, t);
    execute format('drop policy if exists "%I_insert_own" on public.%I', t, t);
    execute format('drop policy if exists "%I_update_own" on public.%I', t, t);
    execute format('drop policy if exists "%I_delete_own" on public.%I', t, t);
  end loop;
end $$;

create policy profiles_select_own on public.profiles for select using (id = auth.uid());
create policy profiles_insert_own on public.profiles for insert with check (id = auth.uid());
create policy profiles_update_own on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_delete_own on public.profiles for delete using (id = auth.uid());

create policy clients_select_own on public.clients for select using (owner_id = auth.uid());
create policy clients_insert_own on public.clients for insert with check (owner_id = auth.uid());
create policy clients_update_own on public.clients for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy clients_delete_own on public.clients for delete using (owner_id = auth.uid());

create policy contacts_select_own on public.contacts for select using (owner_id = auth.uid());
create policy contacts_insert_own on public.contacts for insert with check (
  owner_id = auth.uid()
  and exists (select 1 from public.clients c where c.id = client_id and c.owner_id = auth.uid())
);
create policy contacts_update_own on public.contacts for update using (owner_id = auth.uid()) with check (
  owner_id = auth.uid()
  and exists (select 1 from public.clients c where c.id = client_id and c.owner_id = auth.uid())
);
create policy contacts_delete_own on public.contacts for delete using (owner_id = auth.uid());

create policy invoices_select_own on public.invoices for select using (owner_id = auth.uid());
create policy invoices_insert_own on public.invoices for insert with check (
  owner_id = auth.uid()
  and exists (select 1 from public.clients c where c.id = client_id and c.owner_id = auth.uid())
);
create policy invoices_update_own on public.invoices for update using (owner_id = auth.uid()) with check (
  owner_id = auth.uid()
  and exists (select 1 from public.clients c where c.id = client_id and c.owner_id = auth.uid())
);
create policy invoices_delete_own on public.invoices for delete using (owner_id = auth.uid());

create policy invoice_line_items_select_own on public.invoice_line_items for select using (owner_id = auth.uid());
create policy invoice_line_items_insert_own on public.invoice_line_items for insert with check (
  owner_id = auth.uid()
  and exists (select 1 from public.invoices i where i.id = invoice_id and i.owner_id = auth.uid())
);
create policy invoice_line_items_update_own on public.invoice_line_items for update using (owner_id = auth.uid()) with check (
  owner_id = auth.uid()
  and exists (select 1 from public.invoices i where i.id = invoice_id and i.owner_id = auth.uid())
);
create policy invoice_line_items_delete_own on public.invoice_line_items for delete using (owner_id = auth.uid());

create policy engagements_select_own on public.engagements for select using (owner_id = auth.uid());
create policy engagements_insert_own on public.engagements for insert with check (
  owner_id = auth.uid()
  and exists (select 1 from public.clients c where c.id = client_id and c.owner_id = auth.uid())
);
create policy engagements_update_own on public.engagements for update using (owner_id = auth.uid()) with check (
  owner_id = auth.uid()
  and exists (select 1 from public.clients c where c.id = client_id and c.owner_id = auth.uid())
);
create policy engagements_delete_own on public.engagements for delete using (owner_id = auth.uid());

create policy cases_select_own on public.cases for select using (owner_id = auth.uid());
create policy cases_insert_own on public.cases for insert with check (
  owner_id = auth.uid()
  and exists (select 1 from public.clients c where c.id = client_id and c.owner_id = auth.uid())
);
create policy cases_update_own on public.cases for update using (owner_id = auth.uid()) with check (
  owner_id = auth.uid()
  and exists (select 1 from public.clients c where c.id = client_id and c.owner_id = auth.uid())
);
create policy cases_delete_own on public.cases for delete using (owner_id = auth.uid());

create policy case_notes_select_own on public.case_notes for select using (owner_id = auth.uid());
create policy case_notes_insert_own on public.case_notes for insert with check (
  owner_id = auth.uid()
  and exists (select 1 from public.cases c where c.id = case_id and c.owner_id = auth.uid())
);
create policy case_notes_update_own on public.case_notes for update using (owner_id = auth.uid()) with check (
  owner_id = auth.uid()
  and exists (select 1 from public.cases c where c.id = case_id and c.owner_id = auth.uid())
);
create policy case_notes_delete_own on public.case_notes for delete using (owner_id = auth.uid());

create policy investigations_select_own on public.investigations for select using (owner_id = auth.uid());
create policy investigations_insert_own on public.investigations for insert with check (
  owner_id = auth.uid()
  and exists (select 1 from public.clients c where c.id = client_id and c.owner_id = auth.uid())
);
create policy investigations_update_own on public.investigations for update using (owner_id = auth.uid()) with check (
  owner_id = auth.uid()
  and exists (select 1 from public.clients c where c.id = client_id and c.owner_id = auth.uid())
);
create policy investigations_delete_own on public.investigations for delete using (owner_id = auth.uid());

create policy investigation_interviews_select_own on public.investigation_interviews for select using (owner_id = auth.uid());
create policy investigation_interviews_insert_own on public.investigation_interviews for insert with check (
  owner_id = auth.uid()
  and exists (select 1 from public.investigations i where i.id = investigation_id and i.owner_id = auth.uid())
);
create policy investigation_interviews_update_own on public.investigation_interviews for update using (owner_id = auth.uid()) with check (
  owner_id = auth.uid()
  and exists (select 1 from public.investigations i where i.id = investigation_id and i.owner_id = auth.uid())
);
create policy investigation_interviews_delete_own on public.investigation_interviews for delete using (owner_id = auth.uid());

create policy documents_select_own on public.documents for select using (owner_id = auth.uid());
create policy documents_insert_own on public.documents for insert with check (
  owner_id = auth.uid()
  and (
    client_id is null
    or exists (select 1 from public.clients c where c.id = client_id and c.owner_id = auth.uid())
  )
);
create policy documents_update_own on public.documents for update using (owner_id = auth.uid()) with check (
  owner_id = auth.uid()
  and (
    client_id is null
    or exists (select 1 from public.clients c where c.id = client_id and c.owner_id = auth.uid())
  )
);
create policy documents_delete_own on public.documents for delete using (owner_id = auth.uid());

create policy ai_documents_select_own on public.ai_documents for select using (owner_id = auth.uid());
create policy ai_documents_insert_own on public.ai_documents for insert with check (
  owner_id = auth.uid()
  and (
    client_id is null
    or exists (select 1 from public.clients c where c.id = client_id and c.owner_id = auth.uid())
  )
);
create policy ai_documents_update_own on public.ai_documents for update using (owner_id = auth.uid()) with check (
  owner_id = auth.uid()
  and (
    client_id is null
    or exists (select 1 from public.clients c where c.id = client_id and c.owner_id = auth.uid())
  )
);
create policy ai_documents_delete_own on public.ai_documents for delete using (owner_id = auth.uid());

create policy activity_logs_select_own on public.activity_logs for select using (owner_id = auth.uid());
create policy activity_logs_insert_own on public.activity_logs for insert with check (owner_id = auth.uid());
create policy activity_logs_update_own on public.activity_logs for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy activity_logs_delete_own on public.activity_logs for delete using (owner_id = auth.uid());

create policy notes_select_own on public.notes for select using (owner_id = auth.uid());
create policy notes_insert_own on public.notes for insert with check (owner_id = auth.uid());
create policy notes_update_own on public.notes for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy notes_delete_own on public.notes for delete using (owner_id = auth.uid());

create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_clients_updated_at before update on public.clients for each row execute function public.set_updated_at();
create trigger set_contacts_updated_at before update on public.contacts for each row execute function public.set_updated_at();
create trigger set_invoices_updated_at before update on public.invoices for each row execute function public.set_updated_at();
create trigger set_invoice_line_items_updated_at before update on public.invoice_line_items for each row execute function public.set_updated_at();
create trigger set_engagements_updated_at before update on public.engagements for each row execute function public.set_updated_at();
create trigger set_cases_updated_at before update on public.cases for each row execute function public.set_updated_at();
create trigger set_case_notes_updated_at before update on public.case_notes for each row execute function public.set_updated_at();
create trigger set_investigations_updated_at before update on public.investigations for each row execute function public.set_updated_at();
create trigger set_investigation_interviews_updated_at before update on public.investigation_interviews for each row execute function public.set_updated_at();
create trigger set_documents_updated_at before update on public.documents for each row execute function public.set_updated_at();
create trigger set_ai_documents_updated_at before update on public.ai_documents for each row execute function public.set_updated_at();
create trigger set_activity_logs_updated_at before update on public.activity_logs for each row execute function public.set_updated_at();
create trigger set_notes_updated_at before update on public.notes for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('hr-documents', 'hr-documents', false)
on conflict (id) do nothing;

create policy "storage_select_own_documents"
on storage.objects for select
using (bucket_id = 'hr-documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "storage_insert_own_documents"
on storage.objects for insert
with check (bucket_id = 'hr-documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "storage_update_own_documents"
on storage.objects for update
using (bucket_id = 'hr-documents' and auth.uid()::text = (storage.foldername(name))[1])
with check (bucket_id = 'hr-documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "storage_delete_own_documents"
on storage.objects for delete
using (bucket_id = 'hr-documents' and auth.uid()::text = (storage.foldername(name))[1]);
