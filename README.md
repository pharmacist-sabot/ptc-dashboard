PTC Monitor Dashboard
=====================

A lightweight dashboard to track the Pharmacy and Therapeutics Committee (PTC) improvement plans.  
Originally developed for Sarabost Hospital (HA II-6, Fiscal Year 2568). This repository contains a Vue 3 + TypeScript frontend that synchronizes progress data to and from a Google Sheets backend via Google Apps Script. The project is simple to deploy on Vercel.

Tech stack
----------
- Frontend: `Vue 3` + `TypeScript`
- State management: `Pinia`
- Styling: `Tailwind CSS v4`
- HTTP client: `Axios`
- Backend/API: Google Apps Script (GAS) reading/writing a Google Sheet
- Hosting: `Vercel`

Overview
--------
This dashboard helps the PTC team track status and progress for 12 actions across 3 improvement proposals (from HA reaccreditation). Progress and metadata are stored in a Google Sheet (sheet name: `ActionProgress`) and accessed via an Apps Script Web App. The frontend consumes the GAS web app as a simple JSON API (GET/POST).

High-level flow
- The browser (Vue + TS) calls the GAS Web App via `axios` requests.
- GAS uses `SpreadsheetApp` to read/write the `ActionProgress` sheet.
- The sheet holds rows for each action with status, percentage complete, notes, and audit fields.

Project structure
-----------------
Top-level (important files and directories):

- `index.html`
- `public/favicon.svg`
- `src/`
  - `main.ts` — application entry
  - `App.vue` — root component and background effects
  - `assets/main.css` — Tailwind configuration, tokens, animations
  - `types/index.ts` — TypeScript interfaces
  - `data/planData.ts` — static plan definitions + status configuration
  - `composables/useCountUp.ts` — animated numeric counter
  - `services/gasApi.ts` — Axios wrapper for calling GAS
  - `stores/dashboard.ts` — Pinia store (state, sync, save)
  - `components/` — UI components:
    - `AppHeader.vue`, `SummaryCards.vue`, `GanttChart.vue`, `SparklineChart.vue`
    - `ActionCard.vue` (inline edit), `ActionDetailPanel.vue` (slide-in editor)
  - `views/DashboardView.vue` — main view with tabs and grid
  - `gas/Code.gs` — Google Apps Script code that implements the backend API
- `vercel.json`
- `.env.example`
- `.gitignore`

Installation (local development)
--------------------------------

1. Clone repository and install dependencies

    git clone https://github.com/YOUR_ORG/ptc-dashboard.git
    cd ptc-dashboard
    npm install

2. Prepare Google Apps Script (GAS)

   2.1 Create or open a Google Sheet
   - Create a new Google Sheet (or use an existing one).
   - The script will create a tab named `ActionProgress` if it does not exist.

   2.2 Open Apps Script editor
   - In the Sheet: Extensions → Apps Script
   - Replace the default code with the contents of `src/gas/Code.gs`.

   2.3 Deploy the script as a Web App
   - Click "Deploy" → "New deployment"
   - Select Type: Web app
   - Description: PTC Dashboard API v1
   - Execute as: Me (your email)
   - Who has access: Anyone
   - Deploy and copy the Web App URL (it looks like `https://script.google.com/macros/s/AKfycb.../exec`)

   2.4 Test the API
   - Open the deployed Web App URL in a browser. You should see a JSON response similar to:

       { "success": true, "data": [ { "id": "R1A1", "status": "not_started", ... } ] }

3. Configure environment variables

    cp .env.example .env.local

   Edit `.env.local` and set:

    VITE_GAS_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec

   Keep this URL secret; treat it like an API endpoint credential.

4. Run the development server

    npm run dev

   By default the app runs at `http://localhost:5173`.

Deployment (Vercel)
-------------------
Two recommended approaches:

- Vercel CLI

    npm i -g vercel
    vercel
    # Answer prompts: framework = Vite, output = dist

- GitHub integration (recommended)
  1. Push the repository to GitHub.
  2. On vercel.com, create a New Project and import the repo.
  3. Set Framework Preset: Vite.
  4. In Project Settings → Environment Variables, add:
       Name: `VITE_GAS_URL`
       Value: `https://script.google.com/macros/s/YOUR_ID/exec`
  5. Redeploy so the environment variable takes effect.

Vercel will auto-deploy on pushes to the primary branch if configured.

Usage
-----
- Syncing: Click the header "sync — HH:MM" button to fetch the latest data from Google Sheets. The app performs an initial sync automatically on load.
- Updating status:
  - Inline quick edits: Use the controls on each `ActionCard` (status dropdown and progress slider). Edits are saved to the sheet immediately (optimistic updates).
  - Detail panel: Click any card to open the slide-in `ActionDetailPanel`. Provide status, progress percentage, `actualValue`, `notes`, and `blockers`, then click Save to persist to Google Sheets.
- Navigation: Tabs filter the actions by proposal (All / Proposal 1 / Proposal 2 / Proposal 3). The Alerts tab shows items with status `blocked` or `delayed`.

Google Sheets schema
--------------------
Sheet name: `ActionProgress`

Columns (per-row):
- `id` (string) — Action ID, e.g. `R1A1`–`R3A4`
- `status` (string) — `not_started`, `in_progress`, `completed`, `delayed`, `blocked`
- `progressPct` (number) — 0–100
- `actualValue` (string) — measured / recorded value
- `notes` (string) — free-text notes
- `blockers` (string) — obstacles or risks
- `lastUpdated` (ISO string) — timestamp of last update
- `updatedBy` (string) — user name or identifier that updated the row

Action ID reference
-------------------
- `R1A1` — Proposal 1 — Establish / review Medication Safety Team roles
- `R1A2` — Proposal 1 — Create QI plan for medication management
- `R1A3` — Proposal 1 — Improve proactive ME reporting and analysis
- `R1A4` — Proposal 1 — Review professional pharmacy standards
- `R2A1` — Proposal 2 — Review and update HAD policy
- `R2A2` — Proposal 2 — Develop Medication Reconciliation system
- `R2A3` — Proposal 2 — Conduct Drug Use Evaluation (DUE)
- `R2A4` — Proposal 2 — Monitor ADR Type A and review prescriptions
- `R3A1` — Proposal 3 — Review emergency reserve medicines system
- `R3A2` — Proposal 3 — Review controlled substances and narcotics procedures
- `R3A3` — Proposal 3 — Define after-hours medication dispensing procedures
- `R3A4` — Proposal 3 — Perform ward stock audits

Security considerations
-----------------------
- The GAS Web App is typically deployed with "Execute as: Me", so the script operates under the deployer's account permissions.
- The GAS Web App URL is a sensitive endpoint. Do not commit the URL to a public repository. Use Vercel environment variables or other secret management.
- If you need authentication, set "Who has access" to "Anyone with Google account" and implement token checks (example: a Bearer token header in `gasApi.ts`).
- Limit sheet permissions: keep the backing Google Sheet within the organization account and restrict editing to authorized accounts.

Troubleshooting
---------------
- Sync button returns an error: verify `VITE_GAS_URL` in `.env.local` (or Vercel env settings).
- GAS returns 401: ensure GAS is deployed with an appropriate "Who has access" setting, or re-deploy after changing permissions.
- Changes in `Code.gs` are not reflected: re-deploy the GAS Web App after code edits.
- CORS errors: the Google Apps Script web app handles cross-origin headers for simple GET/POST JSON APIs; double-check deployment.
- Vercel build failures: ensure `VITE_GAS_URL` is defined in Vercel project environment variables.

Development notes
-----------------
- The frontend expects the GAS API to respond with a JSON object: `{ success: boolean, data: [...] }`.
- `src/gas/Code.gs` contains the minimal endpoints required by the frontend: list entries, update an entry, and bulk sync.
- The app performs optimistic UI updates for a responsive UX. Errors during save will be surfaced to the user and the state synchronized from the server.

Contributing
------------
This repository contains internal healthcare-related data and processes. If you plan to contribute:
- Open an issue describing the change or feature.
- For code changes, create a branch and submit a pull request with a concise description of the intent and impact.
- Keep sensitive values out of commits (do not commit `.env.local` or real GAS URLs).

License and usage policy
------------------------
This project was developed for Sarabost Hospital — Pharmacy Department. It contains design and operational data intended for internal use. Patient data or identifiable risk information must not be uploaded to or stored in this repository.

If you intend to publish or adapt this project publicly, obtain approval from the appropriate institutional authority and sanitize any sensitive content.

Contact
-------
For questions about this repository, deployments, or Google Apps Script configuration, contact the project maintainer (Pharmacy Department, Sarabost Hospital).
