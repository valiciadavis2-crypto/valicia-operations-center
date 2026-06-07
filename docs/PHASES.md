# Build Phases

## Phase 1 - Database, Clients, Invoices

Status: complete in this workspace.

- App shell and responsive SaaS layout
- Supabase SQL schema with UUID keys, timestamps, owner fields, RLS policies, storage policies, and seed data
- Client CRUD with client detail tabs
- Contact CRUD linked to clients
- Invoice CRUD, invoice status tracking, outstanding/paid metrics, and V Solutions LLC invoice identity copy
- Demo localStorage repository so these workflows can be tested before Supabase credentials are connected

## Phase 2 - Real Supabase Integration

Status: complete in this workspace.

- Added Supabase Auth screens and session handling
- Replaced Phase 1 demo repository calls with authenticated Supabase queries for clients, contacts, invoices, documents, settings, and activity logs
- Added Storage uploads, signed downloads, and cleanup deletes for the private `hr-documents` bucket
- Enforced user-owned inserts with `owner_id = auth.uid()`
- Added route protection, sign out, empty states, error banners, loading state, and demo fallback

## Phase 3 - HR Operations Modules

Status: complete in this workspace.

- Engagement tracker CRUD with billable status and invoice status
- HR case management CRUD with auto case numbers, status tracking, notes, and AI recommendation drafts
- Investigation center CRUD with auto investigation numbers, interview-note entry/timeline display, AI interview-question generation, AI summary draft, and print action
- Document library remains Supabase Storage-backed from Phase 2
- AI HR document generator with editable output and saved `ai_documents`
- Notes and activity timelines for clients, cases, and investigations
- Dashboard, global search, and reports include engagements, cases, investigations, services, and billable hours

## Phase 4 - Workflow Depth

Status: complete in this workspace.

- Invoice print view and downloadable HTML invoice file
- Email-ready invoice copy download
- Print/export investigation report views
- Engagement-to-invoice wizard that creates draft invoices and line items from uninvoiced billable engagements
- Report-level and all-report CSV exports
- Renewal reminders and overdue invoice automation with activity logs

## Phase 5 - Production Readiness

Status: complete in this workspace.

- Added audit logging for create, update, delete, upload, workflow, and automation actions
- Added JSON backup export from Settings
- Added deployment documentation
- Added backup and recovery documentation
- Added accessibility/mobile QA checklist
- Added skip link, ARIA landmarks, `aria-current`, search label, and visible focus styles
- Added lightweight validation script for Phase 5 readiness markers
