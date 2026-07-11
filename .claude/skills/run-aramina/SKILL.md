---
name: run-aramina
description: Build, launch, smoke-test, and screenshot the Aramina mental-health app (Go API + Next.js frontend + Postgres, via docker compose). Use when asked to run, start, build, serve, test, or take a screenshot of aramina / the trauma app / the backend or frontend.
---

# Run Aramina

Aramina is a Persian (RTL) mental-health / trauma app. Three services run together via
**docker compose** from the repo root: `postgres`, `backend` (Go API, port **8086**),
`frontend` (Next.js, port **3000**). The frontend is a client-rendered web app that keeps
its auth token in `localStorage` and calls the API.

Drive it with the committed Node driver: **`.claude/skills/run-aramina/driver.mjs`**
(no external browser tooling needed — it talks to Chrome over the DevTools Protocol using
Node's built-in `WebSocket`/`fetch`). Paths below are relative to the repo root.

## Prerequisites

- **Docker** (compose v2), **Node ≥ 22** (needs global `WebSocket`/`fetch`; verified on v25.6.1),
  and **Google Chrome** for screenshots.
- Chrome path defaults to macOS: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`.
  On Linux/other, set `CHROME=/path/to/chrome` (or `chromium`).
- A `.env` file must exist at the repo root (it does; compose reads DB/JWT/CORS values from it).

## Build & launch

From the **repo root** (not `backend/` — that dir has its own unrelated compose file):

```bash
docker compose up -d --build
```

Health check (backend serves `/health`, frontend serves on 3000):

```bash
curl -s -o /dev/null -w "backend %{http_code}\n" http://localhost:8086/health
curl -s -o /dev/null -w "frontend %{http_code}\n" http://localhost:3000/
```

Migrations run automatically on backend start (look for `Applied N migrations!` in
`docker logs aramina_backend`).

> Docker Hub sometimes returns a transient `403 Forbidden` while resolving base images
> during `--build`. Just retry the build — it succeeds within a few attempts (BuildKit
> reuses cached layers).

## Run — agent path (the driver)

**API smoke test** — registers a throwaway user and exercises the core flows
(auth → exercises → daily-drip gate → mood save/read → supervision opt-in). Prints PASS/FAIL:

```bash
node .claude/skills/run-aramina/driver.mjs api
```

**Screenshot a page** — headless Chrome → PNG in `.claude/skills/run-aramina/shots/`.
Every page except `/login` requires auth (the API client redirects to `/login` on 401),
so use `--auth` to have the driver register+login a fresh user and inject the token first.
It also seeds a trauma type + one completed exercise + a mood so pages have data:

```bash
# public page (no auth needed)
node .claude/skills/run-aramina/driver.mjs shot /guide

# a logged-in user page (mobile width by default)
node .claude/skills/run-aramina/driver.mjs shot /exercises --auth

# an admin page (promotes the throwaway user to admin in the DB + re-logins, wider viewport)
node .claude/skills/run-aramina/driver.mjs shot /admin/supervision --auth --admin --w 1100 --h 900
```

Flags: `--auth` (inject user token), `--admin` (real admin JWT — needs the `aramina_postgres`
container running), `--out <file.png>`, `--w <px>` / `--h <px>` (viewport; default 430×1600, phone-ish).

After taking a screenshot, **open the PNG and look at it** — a blank page or a redirect to
`/login` means auth/data wasn't seeded.

## Run — human path

```bash
docker compose up -d --build
# open http://localhost:3000  (register, then use the app)
docker compose down           # stop
```

Useful test accounts already in the DB can be given a known password without knowing the old one:

```bash
curl -s -X POST http://localhost:8086/users/reset-pass \
  -H 'Content-Type: application/json' \
  -d '{"nickname":"rezaabasi","password":"Reza1234"}'
```

## Gotchas

- **API field names are non-obvious.** Register: `{"nickname","phone","password_hash"}`.
  Login: `{"phone_number","password_hash"}` (note `password_hash`, not `password`). The
  reset-pass endpoint uses `{"nickname","password"}`. The driver already uses these.
- **401 → hard redirect to `/login`.** The frontend's axios interceptor sends the browser to
  `/login` on any 401, so an unauthenticated screenshot of any real page just shows the login
  form. That's why screenshots need `--auth`.
- **JWT role is baked at login.** Faking `userRole` in `localStorage` only passes the frontend
  route guard; the backend still sees the token's role. For a working admin view the driver
  promotes the user via `docker exec aramina_postgres psql ... UPDATE users SET role='admin'`
  and **re-logs in** to mint an admin token. That's what `--admin` does.
- **Daily-drip:** an exercise can only be completed once per calendar day (Tehran tz) and
  in order, so the API smoke expects the 2nd complete-of-the-day to return **400** (by design).
- **`docker compose` from repo root only.** `backend/docker-compose.yml` defines different
  services; running compose from there fails with "no such service: backend".
- **zsh quirks when testing by hand:** `UID` is a readonly var (don't assign to it), and
  `mapfile` doesn't exist. The driver is Node, so it avoids both.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `docker compose --build` fails with `403 Forbidden` resolving `golang:*/alpine` | Transient Docker Hub throttle — retry the build (loop 3–5×). |
| Screenshot shows the login page instead of the target | Add `--auth` (page needs a token). |
| Admin page shows red banner "دسترسی فقط برای روانشناس یا ادمین" | Use `--admin` (real admin JWT), and ensure `aramina_postgres` is running. |
| `Chrome DevTools endpoint never came up` | Chrome binary not found — set `CHROME=/path/to/chrome`. |
| Backend `/health` not 200 after up | `docker logs aramina_backend`; Postgres must be `healthy` first (compose waits on it). |
