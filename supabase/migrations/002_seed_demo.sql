-- Optional demo seed.
-- Replace the user id below with an existing auth.users.id from your Supabase project.

do $$
declare
  demo_user uuid := '00000000-0000-0000-0000-000000000001';
  riverbend uuid := gen_random_uuid();
  magnolia uuid := gen_random_uuid();
  inv1 uuid := gen_random_uuid();
  inv2 uuid := gen_random_uuid();
  case1 uuid := gen_random_uuid();
  case2 uuid := gen_random_uuid();
  investigation1 uuid := gen_random_uuid();
begin
  insert into public.clients (id, owner_id, company_name, industry, employee_count, address, city, state, website, status, contract_start_date, contract_end_date, monthly_retainer_amount, billing_frequency, notes)
  values
    (riverbend, demo_user, 'Riverbend Manufacturing', 'Manufacturing', 86, '1200 Commerce Dr', 'Montgomery', 'AL', 'https://example.com', 'Active', '2026-01-01', '2026-12-31', 2500, 'Monthly', 'Fractional HR support.'),
    (magnolia, demo_user, 'Magnolia Care Group', 'Healthcare', 42, '455 Wellness Ave', 'Prattville', 'AL', 'https://example.org', 'Lead', '2026-05-15', '2026-11-15', 1800, 'Monthly', 'Needs handbook and compliance audit.');

  insert into public.contacts (owner_id, client_id, name, title, email, phone, role, primary_contact)
  values
    (demo_user, riverbend, 'Dena Brooks', 'Owner', 'dena@example.com', '334-555-0144', 'Owner', true),
    (demo_user, riverbend, 'Marcus Lee', 'Plant Manager', 'marcus@example.com', '334-555-0199', 'Manager', false),
    (demo_user, magnolia, 'Alicia Moore', 'Finance Director', 'alicia@example.com', '334-555-0177', 'Finance', true);

  insert into public.invoices (id, owner_id, client_id, invoice_number, invoice_date, due_date, billing_period_start, billing_period_end, status, subtotal, discount, tax, payment_date, payment_method, notes)
  values
    (inv1, demo_user, riverbend, 'VS-2026-001', '2026-05-01', '2026-05-16', '2026-05-01', '2026-05-31', 'Paid', 2500, 0, 0, '2026-05-12', 'ACH', 'Monthly retainer'),
    (inv2, demo_user, magnolia, 'VS-2026-002', '2026-05-20', '2026-06-04', '2026-05-15', '2026-06-14', 'Sent', 1800, 0, 0, null, null, 'Initial retainer');

  insert into public.invoice_line_items (owner_id, invoice_id, description, service_category, quantity, rate)
  values
    (demo_user, inv1, 'Monthly HR consulting retainer', 'HR Consulting', 1, 2500),
    (demo_user, inv2, 'Initial monthly retainer', 'HR Consulting', 1, 1800);

  insert into public.engagements (owner_id, client_id, service_date, service_category, description, hours_worked, billable, hourly_rate, invoice_status, notes)
  values
    (demo_user, riverbend, '2026-05-03', 'HR Consulting', 'Monthly compliance call', 2, true, 150, 'Paid', ''),
    (demo_user, riverbend, '2026-05-08', 'Employee Relations', 'Manager coaching on attendance issue', 1.5, true, 150, 'Invoiced', ''),
    (demo_user, riverbend, '2026-05-20', 'Investigation', 'Investigation intake and planning', 3, true, 175, 'Not Invoiced', ''),
    (demo_user, magnolia, '2026-05-22', 'Handbook', 'Handbook gap review', 4, true, 150, 'Not Invoiced', ''),
    (demo_user, magnolia, '2026-05-28', 'Compliance', 'Initial compliance checklist', 2.25, false, 150, 'Not Invoiced', 'Included in sales process.');

  insert into public.cases (id, owner_id, client_id, case_number, case_type, priority, status, employee_involved, manager_involved, summary, recommendation, date_opened, due_date, assigned_consultant, notes)
  values
    (case1, demo_user, riverbend, 'CASE-2026-001', 'Employee Relations', 'High', 'Open', 'Employee A', 'Marcus Lee', 'Attendance and conduct concerns.', '', '2026-05-08', '2026-06-05', 'Valicia Davis', ''),
    (case2, demo_user, magnolia, 'CASE-2026-002', 'Policy Question', 'Medium', 'In Progress', '', 'Alicia Moore', 'PTO policy update question.', '', '2026-05-18', '2026-06-07', 'Valicia Davis', '');

  insert into public.investigations (id, owner_id, client_id, investigation_number, date_opened, complainant, respondent, department, shift, complaint_summary, prior_discipline, witness_1, witness_2, evidence_reviewed, status, findings, investigator_name, follow_up_date, notes)
  values
    (investigation1, demo_user, riverbend, 'INV-2026-001', '2026-05-19', 'Employee B', 'Supervisor C', 'Production', '2nd', 'Alleged hostile conduct and retaliation.', false, 'Witness A', 'Witness B', 'Emails, attendance records', 'Interviews Scheduled', 'Inconclusive', 'Valicia Davis', '2026-06-10', '');

  insert into public.investigation_interviews (owner_id, investigation_id, interviewee_name, interview_date, interview_notes)
  values
    (demo_user, investigation1, 'Witness A', '2026-05-27', 'Initial interview notes placeholder.');

  insert into public.notes (owner_id, parent_type, parent_id, note_body, created_by)
  values
    (demo_user, 'client', riverbend, 'Prepare renewal discussion before Q4.', demo_user),
    (demo_user, 'case', case1, 'Follow up with manager for documentation.', demo_user),
    (demo_user, 'investigation', investigation1, 'Confirm interview schedule with client.', demo_user);
end $$;
