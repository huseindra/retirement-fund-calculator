# Retirement Fund Calculator

A browser-based retirement planning tool. Model how your savings grow, check
them against a retirement goal, and see how long they'll last once you start
withdrawing — all with no backend and no external services. Everything you
enter is stored locally in your browser.

Built with **Next.js (App Router)** and **Tailwind CSS** only — no other
runtime dependencies, no chart libraries, no UI kits.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to
the login page.

### Login

This app uses a single **hardcoded** account (there is no sign-up and no
real user database):

| Username | Password    |
|----------|-------------|
| `admin`  | `retire2026` |

Credentials live in plain text in `lib/auth.js`. This is a **demo-only**
login gate, not real authentication — see [Security notes](#security--privacy-notes)
below before using this for anything sensitive.

### Production build

```bash
npm run build
npm start
```

## How your data is stored

There is no server, database, or API. Every scenario you create, your login
session, and your display preferences are saved in your browser's
`localStorage`:

- `rfc_session` — your login session
- `rfc_scenarios` — all saved retirement scenarios
- `rfc_settings` — display currency/locale preference

This means:
- Your data never leaves your machine.
- Clearing browser storage (or using a different browser/device/incognito
  window) means your scenarios are gone or inaccessible.
- Nothing is shared between users — "login" only gates the UI, it does not
  separate or protect data per-account.

## Features

### Phase 1 — Core

- **Login** with a hardcoded username/password and a persisted session.
- **Scenario CRUD** — create, view, edit, and delete named retirement
  scenarios, all stored in `localStorage`.
- **Savings projection** — compound monthly growth from your current age to
  retirement age, based on current savings, monthly contribution, and an
  expected annual return.
- **Retirement goal check** — compares your projected balance at retirement
  against a target nest egg and shows the surplus or shortfall.
- **Withdrawal phase** — models drawing down savings in retirement using
  either a fixed monthly withdrawal or a withdrawal-rate rule (e.g. the
  "4% rule"), and reports how long the money lasts.

### Phase 2 — High value

- **Employer match** — a percentage of your contribution matched by an
  employer, with an optional monthly dollar cap.
- **Contribution step-up** — automatically increase your monthly
  contribution by a fixed percentage every year (e.g. to model raises).
- **Inflation-adjusted toggle** — switch summaries and tables between
  nominal (future) dollars and real (today's purchasing power) dollars.
- **Growth chart** — a stacked chart (custom SVG, no chart library)
  showing the split between your contributions, employer match, and
  investment growth over time.
- **Scenario comparison** — select two or more saved scenarios and see
  them side-by-side in a table and on an overlaid balance chart.

### Phase 3 — Nice to have

- **Tax treatment** — model contributions/withdrawals as tax-free (Roth),
  taxed on withdrawal (Traditional), or untaxed/not modeled.
- **Social Security / pension offset** — a guaranteed monthly income in
  retirement that reduces how much you need to withdraw from savings.
- **Monte Carlo simulation** — 300 trials with randomized annual returns
  (drawn from a normal distribution around your expected return and a
  volatility you set), showing pessimistic/median/optimistic outcomes
  instead of a single fixed-rate projection.
- **Export** — download the full projection as a CSV file, or use
  "Print / Save as PDF" for a print-friendly report.
- **Currency & locale** — choose how amounts are displayed (USD, EUR, GBP,
  IDR, INR, JPY, AUD, CAD, SGD) from the Settings page.

## Project structure

```
app/
  login/            Login page
  dashboard/         Scenario list (create, view, edit, delete)
  scenario/new/       Create a scenario
  scenario/[id]/      View a scenario's projections
  scenario/[id]/edit/ Edit a scenario
  compare/           Side-by-side scenario comparison
  settings/          Currency/locale preference
components/          Shared UI (forms, charts, auth guard, header)
lib/
  auth.js            Hardcoded login + session handling
  storage.js         Scenario CRUD backed by localStorage
  calculations.js    Accumulation, withdrawal, goal-check, Monte Carlo math
  settings.js        Currency/locale preference storage
  format.js          Currency/percent formatting helpers
  export.js          CSV export
```

## Security & privacy notes

- The login is a **UI gate only**: the username and password are hardcoded
  in client-side JavaScript, visible to anyone who opens the browser's
  dev tools or reads the source. Do not reuse this password anywhere else,
  and do not treat this as protecting sensitive data.
- All figures are for planning purposes only. The projections use
  simplified, fixed-rate (or randomly varied, in the Monte Carlo case)
  assumptions and are not financial advice.

## Limitations

- Single hardcoded account — no multi-user support, no password reset.
- No cloud sync or backup — data lives only in the current browser.
- Tax modeling is simplified (a single flat withdrawal tax rate) and does
  not model tax brackets, contribution limits, or account-specific rules.
