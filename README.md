# Valicia Operations Center

Phase 5 MVP evolved from the V Solutions HR OS into a personal business command center for Valicia. The app preserves the existing Supabase-secured HR consulting workflows while adding command-center sections for revenue, government contracting, operations, automations, and AI workspace planning.

## What is included

- React single-page app in `index.html` and `src/app.jsx`
- Demo/localStorage data mode so the app can still be tested immediately
- Supabase Auth sign-in/sign-up flow
- Supabase-backed CRUD for clients, contacts, invoices, documents, settings, and activity logs
- Supabase PostgreSQL schema with UUID keys, timestamps, owner fields, RLS policies, storage bucket policy, and seed data
- Persistent Government Opportunities data model in `supabase/migrations/003_government_opportunities.sql`
- Operations Center navigation: Home, Revenue, HR Consulting, Government, Operations, AI Workspace, and Admin
- HR Consulting modules: clients, contacts, documents, invoices, engagements, cases, investigations, reports, and search
- Mock command-center data for government opportunities, digital product revenue, automations, deadlines, AI tools, and admin placeholders
- Government Contracting Command Center MVP: opportunities, opportunity detail, mock AI fit review, subcontractor finder, outreach tracker with draft email generation, reminder/follow-up queue, and awards tracking
- Funding & Grants module under Revenue: funding opportunities, mock eligibility review, application draft generation, document checklist, budget/narrative, submission tracker, and outcomes
- Universal Opportunity Engine under Revenue: shared opportunity workflow for government contracts, grants, HR consulting clients, digital product opportunities, AI services, and speaking/training opportunities
- Workflow tools: engagement-to-invoice generation, invoice print/download, invoice email copy, investigation report print/download, report CSV exports, overdue invoice automation, renewal reminders
- Phase 5 readiness: audit logging for creates/updates/deletes, JSON backup export, accessibility landmarks, deployment docs, backup/recovery docs, and QA checklist

## Run locally

Recommended on Windows:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-local-site.ps1
```

Then open:

```text
http://localhost:4173
```

You can also open `index.html` directly, but some browsers block local files loaded through `file://`.

Optional local server:

```powershell
npx serve .
```

Optional validation:

```powershell
npm run validate
```

## Supabase setup

1. Create a Supabase project.
2. Run `supabase/migrations/001_initial_schema.sql` in the Supabase SQL editor.
3. In Supabase Auth, enable email/password authentication.
4. Open the app and enter the Supabase project URL and anon key on the sign-in screen or Settings page.
5. Create an account or sign in.
6. Clients, contacts, invoices, documents, engagements, cases, investigations, notes, AI drafts, settings, and activity logs will use authenticated Supabase requests protected by RLS.

## Storage

Documents upload to the private `hr-documents` bucket using paths like:

```text
{auth-user-id}/{timestamp}-{filename}
```

The storage policies only allow the signed-in user to access files in their own folder.

## Phase plan

- Phase 1: Secure database/RLS foundation, client CRUD, contact CRUD, invoice CRUD/status tracking.
- Phase 2: Supabase Auth, real Supabase CRUD, Storage upload/download, route guards.
- Phase 3: Engagements, cases, investigations, notes/timelines, document library, AI generator.
- Phase 4: Invoice print/download, report exports, workflow automation, investigation report export.
- Phase 5: production hardening, validation script, deployment docs, accessibility/mobile QA, backup/export strategy.

## Production Docs

- `docs/DEPLOYMENT.md`
- `docs/BACKUP_AND_RECOVERY.md`
- `docs/QA_CHECKLIST.md`
