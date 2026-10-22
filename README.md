# JobTrack

A job application tracker: every application, its stage history, your pipeline analytics,
and the follow-ups that keep them moving.

**Monorepo** — Next.js (React) web client, NestJS GraphQL API, Prisma + Postgres, one
command to run.

---

## Quick start

### Docker (recommended)

```bash
cp .env.example .env
docker compose up --build
```

Then open **http://localhost:3000** and sign in with the seeded demo account:

| Email | Password |
| --- | --- |
| `demo@jobtrack.dev` | `password123` |

The API applies migrations and seeds eight demo applications on first start. The seed is
skipped when data already exists, so restarting the stack will not wipe anything you
entered. To start over: `docker compose down -v && docker compose up --build`.

| Service | URL |
| --- | --- |
| Web | http://localhost:3000 |
| GraphQL | http://localhost:4000/graphql |
| Health | http://localhost:4000/health |

### Local development

Requires Node >= 22.12, pnpm and Docker (for Postgres only).

```bash
cp .env.example .env
pnpm install
pnpm --filter @jobtrack/api prisma:generate
docker compose up -d db
pnpm --filter @jobtrack/api prisma:migrate
pnpm --filter @jobtrack/api prisma:seed
pnpm dev
```

`pnpm dev` starts both apps through Turborepo. Reseeding: `pnpm --filter @jobtrack/api db:reset`.

---

## Screens

1. **Applications board** — every application, filtered by status or searched by company/role,
   with a validated create form.
2. **Application detail** — fields, contacts, notes, the full status timeline, and a control
   that only offers legal next stages.
3. **Analytics** — KPI tiles plus pipeline-by-status and applications-over-time charts.
4. **Reminders** — overdue and upcoming follow-ups with browser notifications.

Login is the entry point; unauthenticated visits are redirected there and authenticated
visits to `/login` are redirected to the board.

---

## Architecture

```
┌──────────────────────────────┐        ┌──────────────────────────────┐
│  web — Next.js (App Router)  │        │  api — NestJS + GraphQL      │
│                              │        │                              │
│  client components           │  HTTP  │  resolvers → services        │
│   Apollo Client ─────────────┼───────►│  guards (JWT cookie)         │
│   Zustand (UI state only)    │ /graphql│  Prisma client              │
│   React Hook Form + Zod      │        │                              │
│  proxy.ts (route guard)      │        │  /health (container probe)   │
└──────────────────────────────┘        └───────────────┬──────────────┘
                                                        │
                                            ┌───────────▼───────────┐
                                            │  Postgres (Prisma)     │
                                            │  User · Application    │
                                            │  StageEvent · Contact  │
                                            │  Reminder              │
                                            └────────────────────────┘
```

**The schema is the contract.** The API is code-first: `apps/api/src/schema.gql` is generated
on boot and committed. The web client's typed operations are generated from that file, so the
two sides cannot drift.

**Stage history is the model, not a feature.** Every status change writes a `StageEvent` row.
The timeline reads those rows, and the analytics figures are calculated from them — nothing is
precomputed or denormalised.

---

## Project layout

```
apps/
  api/                    NestJS + GraphQL
    prisma/               schema, migrations, seed
    src/
      auth/               register, login, logout, me · JWT cookie · guard
      applications/       CRUD, status transitions, models
      analytics/          summary query + pure calculator
      reminders/          follow-up reminders
      common/             env helper, gql context, decorators, enums
  web/                    Next.js
    src/
      app/                routes: (app) group, login, applications/[id], analytics, reminders
      features/           applications · analytics · reminders · auth
      components/ui/      shadcn/ui primitives
      graphql/            operations + generated types (gitignored)
      stores/             Zustand
      proxy.ts            route guard
docker-compose.yml        db + api + web
```

---

## Data model

| Model | Purpose |
| --- | --- |
| `User` | Account. Unique email, hashed password. |
| `Application` | One role at one company, with its current status. |
| `StageEvent` | An append-only record of a status change. Powers the timeline and analytics. |
| `Contact` | People attached to an application. |
| `Reminder` | A follow-up with a due date. |

Statuses: `WISHLIST → APPLIED → SCREENING → INTERVIEW → OFFER`, with `REJECTED` and `GHOSTED`
reachable along the way. Legal transitions live in one table
(`applications/application-status.rules.ts`) and are exposed to the client as
`allowedNextStatuses`, so the UI never keeps a second copy of the rules.

---

## GraphQL

All operations require a session cookie except `register` and `login`.

```graphql
query {
  applications(status: INTERVIEW) {
    company
    role
    status
    allowedNextStatuses
    timeline {
      fromStatus
      toStatus
      at
      note
    }
  }
}
```

Queries: `me`, `applications`, `application`, `analytics`, `upcomingReminders`, `health`.
Mutations: `register`, `login`, `logout`, `createApplication`, `updateApplication`,
`changeStatus`, `deleteApplication`, `createReminder`, `toggleReminder`.

---

## Scripts

Run from the repository root.

| Command | What it does |
| --- | --- |
| `pnpm dev` | Both apps in watch mode |
| `pnpm build` | Build both apps |
| `pnpm test` | Vitest across both apps |
| `pnpm typecheck` | `tsc --noEmit` across both apps |
| `pnpm check` | Biome: format, lint and import order (read-only) |
| `pnpm check:fix` | Same, applying safe fixes |
| `pnpm format` | Format only |

---

## Testing

84 tests, split by what they are worth testing:

- **API unit tests** cover logic rather than HTTP: password hashing and credential checks,
  the status-transition table, and the analytics maths (response rate, day averaging, date
  grouping) as pure functions with no database.
- **Web component tests** cover behaviour: the login flow via a mocked GraphQL client, card
  and timeline rendering, form schema validation, the filter store, the debounce hook, the
  reminder split, and the notification hook with a stubbed `Notification`.
- Chart components are deliberately not asserted on at the pixel level; the data mapping they
  consume is tested instead.

---

## Code standards

- **Biome** formats and lints in one pass (replaces ESLint + Prettier), with the `next` and
  `react` rule domains scoped to the web app and `test` rules scoped to test files.
- **Husky** runs Biome on staged files at commit time and **commitlint** enforces
  Conventional Commits.
- **CI** (`.github/workflows/ci.yml`) runs install → Prisma generate → check → typecheck →
  test → build on every pull request and on `main`.
- **`main` is protected**: pull requests required, the `verify` check required, linear
  history, no force pushes or deletions.

## Environment variables

| Variable | Default | Notes |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://jobtrack:jobtrack@localhost:5432/jobtrack` | Compose overrides the host to `db`. |
| `API_PORT` | `4000` | |
| `JWT_SECRET` | dev placeholder | Set a real secret in production. |
| `WEB_ORIGIN` | `http://localhost:3000` | Allowed CORS origin; the cookie depends on it. |
| `COOKIE_SECURE` | `false` | Set to `true` only when served over HTTPS. |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000/graphql` | Inlined at build time. |
| `API_PROXY_URL` | *(empty)* | When set, Next proxies `/graphql` here. See [DEPLOYMENT.md](./DEPLOYMENT.md). |

---

## Deployment

`DEPLOYMENT.md` covers hosting the web on Vercel, the API on Render from the existing
Dockerfile, and Postgres on Neon — including why the web proxies `/graphql` rather than calling
the API cross-origin.

---

## Notes and trade-offs

- Charts are a real dependency (Recharts) rather than hand-rolled, because the over-time
  series is a genuine chart and Recharts keeps the components declarative.
- Deleted applications cascade to their timeline, contacts and reminders.
- Reminders are listed only while open; a completed-history view is the obvious next step.
- Browser notifications fire for reminders already due, once per reminder, and only after
  permission is granted on an explicit action. True scheduled push would need a service worker.
