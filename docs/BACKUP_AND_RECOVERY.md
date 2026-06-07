# Backup And Recovery

## In-App Export

Use `Settings -> Export JSON backup` to download a snapshot of the currently loaded app data. This is useful for quick local backups and migration checks.

The JSON export includes:

- Clients, contacts, engagements, cases, investigations, invoices, documents, notes, AI drafts, and activity logs
- Current app mode
- Export timestamp

## Supabase Backup

For production, use Supabase-managed database backups and periodic manual exports:

- Enable point-in-time recovery if available on the Supabase plan.
- Export table data before schema changes.
- Keep the SQL migration files in source control.
- Store important uploaded documents outside a single device; Supabase Storage is private but should still be part of a backup plan.

## Recovery Checklist

1. Restore the Supabase database or rerun migrations.
2. Restore Storage bucket objects if needed.
3. Recreate Auth users if restoring into a new project.
4. Validate that `owner_id` values match restored `auth.users.id` values.
5. Sign in and confirm dashboard metrics match expected totals.
