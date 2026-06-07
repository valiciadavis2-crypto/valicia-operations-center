# Deployment Guide

## Supabase

1. Create a Supabase project.
2. Run `supabase/migrations/001_initial_schema.sql`.
3. Enable email/password authentication.
4. Confirm the private `hr-documents` bucket exists.
5. Confirm RLS is enabled on every public table and storage policies exist on `storage.objects`.

## Static App Hosting

This MVP is a static app using CDN React/Babel. It can be hosted on Netlify, Vercel static hosting, Supabase Storage static hosting, or any HTTPS file host.

Required files:

- `index.html`
- `src/app.jsx`
- `src/styles.css`

Recommended production hardening before public deployment:

- Move from CDN/Babel-in-browser to a bundled React build.
- Store Supabase URL/key in environment-driven config instead of manual entry.
- Add a Content Security Policy suitable for the selected host.
- Configure a custom domain and HTTPS.

## Smoke Test

After deployment:

1. Open the deployed URL.
2. Save Supabase URL and anon key.
3. Create or sign into a test account.
4. Create a client, contact, engagement, case, investigation, document, and invoice.
5. Verify another test account cannot see the first account's records.
