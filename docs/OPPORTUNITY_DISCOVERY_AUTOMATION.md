# Opportunity Discovery Daily Automation

This workflow is live-only in normal mode. Alabama procurement runs against the public Alabama Buys solicitation page. City of Montgomery runs against the City's OpenGov procurement portal, with the City's official Bids and RFPs page used as a public status check. SAM.gov runs through the official public Contract Opportunities API when an API key is configured. If a source is unavailable, blocked, missing credentials, or returns no usable rows, the report records that status and does not write mock opportunities.

## What It Runs

Command:

```powershell
npm.cmd run daily:discovery
```

The command runs `scripts/daily_opportunity_discovery.js`, which:

- reads the Alabama, City of Montgomery, SAM.gov, and Montgomery County adapters
- uses the live Alabama procurement adapter
- uses the live City of Montgomery adapter
- uses the live SAM.gov public opportunities API when `SAM_GOV_API_KEY` is configured
- marks SAM.gov as `SAM.gov not connected — API key required.` when the key is missing
- marks Montgomery County as `not connected yet`
- writes no fake opportunities when live sources return nothing
- scores each opportunity using the capital-aware formula
- classifies Tier A, Tier B, and Tier C
- writes the top 3-5 practical live matches to `workflows/daily-opportunity-discovery-latest.json`
- writes a clear no-live-opportunities message when there are no real matches

## SAM.gov Setup

SAM.gov's public Contract Opportunities API requires a public API key. The app uses the official v2 endpoint:

```text
https://api.sam.gov/opportunities/v2/search
```

According to the GSA API documentation, requests require `api_key`, `postedFrom`, and `postedTo` parameters. The current adapter searches recent solicitation notices by posted date and does not filter opportunities by NAICS. Existing NAICS alignment improves scoring, but it does not exclude opportunities.

For daily automation, set the key as an environment variable before running the command:

```powershell
$env:SAM_GOV_API_KEY="your-public-sam-key"
npm.cmd run daily:discovery
```

For Windows Task Scheduler, add `SAM_GOV_API_KEY` to the user or system environment variables, or run the task through a wrapper script that sets the variable before calling `npm.cmd run daily:discovery`.

For local browser testing in the static app, the current app can read a key from browser local storage under:

```text
valicia-sam-gov-api-key
```

Do not commit API keys into project files.

## Manual Real Opportunity Intake

Opportunity Discovery also supports manual intake inside the app for real opportunities copied from blocked or credentialed sources such as Alabama Buys, City of Montgomery, Montgomery County, DIBBS, SAM.gov, email notices, PDFs, or vendor portals.

Manual entries are labeled `Manual Entry — Real Opportunity` in the dashboard. They run through the same capital-aware scoring, Tier A/B/C classification, Top Matches for Review, Add to Pipeline, Find Subcontractors, Review Opportunity, and Archive actions as live-source records.

Manual entries are local to the current app session unless a later sprint adds Supabase persistence. The daily automation script does not invent manual entries and does not write manual records to `workflows/daily-opportunity-discovery-latest.json`; that report remains live-source-only in normal mode.

## Windows Task Scheduler

1. Open Task Scheduler.
2. Create Basic Task.
3. Set the trigger to daily, preferably early morning.
4. Set Action to `Start a program`.
5. Program/script:

```text
npm.cmd
```

6. Arguments:

```text
run daily:discovery
```

7. Start in:

```text
C:\Users\valic\Documents\Codex\valicia-operations-center
```

## n8n

Use a Cron node followed by an Execute Command node.

Execute Command:

```powershell
npm.cmd run daily:discovery
```

Working directory:

```text
C:\Users\valic\Documents\Codex\valicia-operations-center
```

Set `SAM_GOV_API_KEY` in the n8n environment or credentials layer before running the command. Later, n8n can read `workflows/daily-opportunity-discovery-latest.json` and send a short daily summary with only the top practical live matches.

If `topMatches` is empty, n8n should send either no alert or a short "no live opportunities found" note.

## Live Source TODO

Harden the Alabama and City of Montgomery parsers after confirming stable source markup or API/export options, then replace the Montgomery County placeholder fetch function in `scripts/daily_opportunity_discovery.js` and the matching app adapter in `src/app.jsx` with stable API, export, or scraping logic after the county source format is confirmed.

Developer/test mock data remains in clearly named helper functions only. Do not use those helpers in normal dashboard or scheduled automation runs.
