# Deployment

Target setup: **Vercel** (web) → **Render** (API, Docker) → **Neon** (Postgres).

```
browser ──► https://jobtrack.vercel.app
                 │  /graphql is rewritten (proxied) server-side
                 ▼
            https://jobtrack-api.onrender.com/graphql
                 │
                 ▼
            Neon Postgres (Singapore)
```

## Why the web proxies the API

If the browser called the API host directly, that request would be **cross-site**, and the
session cookie is `SameSite=Lax` — browsers do not attach it to cross-site fetch. Sign-in would
appear to succeed and then every request would be unauthenticated.

Two ways out: relax the cookie to `SameSite=None; Secure` and live with the weaker CSRF
posture, or keep one origin for the browser. We do the second: Next rewrites `/graphql` to the
API's URL, so the browser only ever talks to its own origin. Cookies stay first-party, CORS
becomes irrelevant, and no cookie flags change.

This is opt-in and does nothing locally: `API_PROXY_URL` is empty in `.env`, so no rewrite is
registered and the client keeps calling `http://localhost:4000/graphql`.

---

## 1. Neon (database)

1. Create the project (region: pick the one closest to your Render region — Singapore if you
   are in Asia). **The region cannot be changed later.**
2. **Connect** → copy the **direct** connection string. The host must NOT contain `-pooler`:

   ```
   postgresql://USER:PASSWORD@ep-xxxx.ap-southeast-1.aws.neon.tech/jobtrack?sslmode=require
   ```

   The pooled string (`...-pooler...`) is for serverless runtimes. Migrations need a direct
   connection — PgBouncer's transaction pooling doesn't support the session-level locks they
   rely on.
3. Drop `&channel_binding=require` if present; `node-postgres` doesn't implement it.
4. If the password has been shared anywhere (chat, screenshot), reset it under
   **Settings → Reset password** once the deployment works.

Nothing else needs provisioning. The API container runs `prisma migrate deploy` and seeds demo
data on first start.

---

## 2. Render (API)

First connect GitHub: **Account Settings → GitHub → Connect account**, install the **Render
GitHub App**, and grant it access to this repository. That installs the webhook which drives
deploys.

**New → Web Service** → pick this repository.

| Setting | Value |
| --- | --- |
| Language | Docker |
| Root Directory | *(leave empty — the build context must be the repo root)* |
| Dockerfile Path | `apps/api/Dockerfile` |
| Branch | `main` |
| Region | match Neon |
| Instance type | Free (sleeps when idle — see below) |
| Health Check Path | `/health` |
| Auto-Deploy | **After CI Checks Pass** |

**Auto-Deploy is the CI/CD join.** `On Commit` deploys immediately; **`After CI Checks Pass`**
waits for the GitHub Actions `verify` workflow on that commit to succeed. Combined with
protected `main`, nothing reaches production from a red build.

Environment variables:

| Key | Value |
| --- | --- |
| `DATABASE_URL` | the **direct** Neon string |
| `JWT_SECRET` | a long random string — `openssl rand -hex 32` |
| `WEB_ORIGIN` | your Vercel URL, e.g. `https://jobtrack.vercel.app` |
| `COOKIE_SECURE` | `true` |

Do **not** set a port. Render injects `PORT` and routes only to it; the API reads `PORT` first
and falls back to `API_PORT` for local use.

`NODE_OPTIONS=--dns-result-order=ipv4first` is already set in the image, so nothing needs adding
in the dashboard. **Why:** Neon publishes both A and AAAA records, but Render's containers have
no IPv6 route. Since Node 17, `dns.lookup` returns records in verbatim order, so if the AAAA
comes back first the driver tries it and fails instantly with `ENETUNREACH`, which Prisma
surfaces as `P1001: Can't reach database server`. The fingerprint is the *timing*: P1001 within
a second or two of the datasource line is a routing failure; a slow failure is a sleeping
compute or a bad host.

Deploy. The logs should show, in order:

```
Applying database migrations...
Seeding demo data if the database is empty...
Starting the API...
```

On later restarts the seed line reports `Seed skipped: 1 user(s) already exist.` — that is
correct, and it is what stops a restart wiping data.

---

## 3. Vercel (web)

**Add New → Project** → import the repository.

| Setting | Value |
| --- | --- |
| Root Directory | `apps/web` |
| Framework Preset | Next.js |

Environment variables (both required at **build** time):

| Key | Value |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | `/graphql` |
| `API_PROXY_URL` | `https://<your-api>.onrender.com/graphql` |

`NEXT_PUBLIC_API_URL` is inlined into the client bundle during the build, so changing it later
requires a redeploy — it is not a runtime variable.

**Monorepo caveat.** The build runs GraphQL codegen against `apps/api/src/schema.gql`, which
sits outside the Root Directory. Vercel's monorepo support needs `pnpm-workspace.yaml` at the
repo root (it is there) and, on some plans, the setting **“Include source files outside of the
Root Directory in the Build Step”** enabled. If the build fails with a missing schema, enable
it — or fall back to deploying `apps/web/Dockerfile` on Render instead.

---

## 4. Verify

```bash
curl https://<api>.onrender.com/health
# {"status":"ok"}

curl -s -X POST https://<api>.onrender.com/graphql \
  -H 'content-type: application/json' -d '{"query":"{ health }"}'
# {"data":{"health":"ok"}}

curl -s -o /dev/null -w '%{http_code}\n' https://<web>.vercel.app/login
# 200
```

Then in a browser: open the web URL, sign in with `demo@jobtrack.dev` / `password123`, and
confirm `/applications`, `/analytics` and `/reminders` all load with data. If sign-in returns
you to `/login`, the proxy or the cookie flags are wrong — see below.

---

## 5. How deployment is triggered

Both platforms watch the repository and redeploy when `main` moves. There is no deploy
workflow to maintain.

`main` is protected and requires the `verify` check, so a merge can only happen from a green
build. That is the whole CD story: **the merge button is the deploy trigger.** Pull requests
also get a Vercel preview URL, which is where you would actually look at a change first.

If you later want deployment gated *inside* Actions (for a host without git integration), add a
`deploy` job that `needs: verify` — but for these two platforms it would duplicate what they
already do.

---

## 6. Cold starts

Render's free web services spin down after inactivity; the first request afterwards can take
30–60 seconds. The database is not the problem (Neon's wake is sub-second).

Options, cheapest first:

1. **Accept it**, and warm the URL yourself a minute before a live demo.
2. **Keep-alive**: a scheduled workflow hitting `/health` every ~10 minutes stays inside the
   idle window.

   ```yaml
   name: keep-alive
   on:
     schedule:
       - cron: '*/10 * * * *'
     workflow_dispatch:
   jobs:
     ping:
       runs-on: ubuntu-latest
       steps:
         - run: curl -fsS "${{ secrets.API_HEALTH_URL }}"
   ```

   Set the `API_HEALTH_URL` repository secret to `https://<api>.onrender.com/health`. GitHub
   cron can be delayed under load, so treat this as best-effort.
3. **Render Starter** (~$7/month) — genuinely always on. Cancel after the interview.

---

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| `P1001: Can't reach database server`, failing in ~1s | Node resolved the AAAA record first and the host has no IPv6 route. Set `NODE_OPTIONS=--dns-result-order=ipv4first`. |
| `prepared statement "..." already exists` on boot | Using the **pooled** Neon URL for migrations. Use the direct host. |
| Sign-in succeeds, then every page redirects to `/login` | The browser is calling the API cross-origin, so the `SameSite=Lax` cookie is dropped. Set `NEXT_PUBLIC_API_URL=/graphql` and `API_PROXY_URL`. |
| `Cannot find module '../api/src/schema.gql'` during build | Vercel isn't including files outside the Root Directory. See the monorepo caveat. |
| Client requests still go to `localhost:4000` | `NEXT_PUBLIC_API_URL` is baked at build time — redeploy after changing it. |
| Cookie not set over https | `COOKIE_SECURE` must be `true` in production. |
| API 500s, logs show a database error, DB was created months ago | Render's free Postgres can be time-limited. Another reason to use Neon. |

---

## Cost

| Service | Free tier |
| --- | --- |
| Neon | Free project, scales to zero, no expiry |
| Render | Free web service that sleeps after inactivity |
| Vercel | Hobby tier, no sleeping for the frontend |
