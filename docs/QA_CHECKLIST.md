# QA Checklist

## Functional

- Create, edit, delete a client.
- Add contacts under a client.
- Create billable engagements.
- Generate an invoice from uninvoiced engagements.
- Mark an invoice sent and paid.
- Upload and download a document.
- Open a case, add notes, generate a recommendation draft, and close it.
- Open an investigation, add interview notes, generate draft questions and summary, print/export report.
- Generate and save an AI document draft.
- Export reports to CSV.
- Export JSON backup from Settings.

## Security

- Confirm RLS is enabled on all public tables.
- Confirm each table has owner-scoped SELECT, INSERT, UPDATE, and DELETE policies.
- Confirm child records cannot link to another user's client, invoice, case, or investigation.
- Confirm Storage object paths start with the signed-in user id.
- Confirm a second test user cannot access the first user's records.

## Accessibility And Mobile

- Use keyboard only to navigate sidebar, search, forms, modals, and buttons.
- Confirm the skip link appears on focus.
- Confirm focus outlines are visible.
- Confirm table overflow works on mobile.
- Confirm forms are one column on narrow screens.
- Confirm text does not overlap on mobile widths.

## Browser Smoke Test

- Open `index.html` directly.
- Open through a local server.
- Test in current Chrome or Edge.
- Print an invoice and investigation report.
- Download report CSV, invoice HTML, email copy, and JSON backup.
