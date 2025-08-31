# Codex Auth0 & HMR Setup Pack

This pack gives Codex (or you) everything needed to wire up Auth0, stabilize Vite HMR,
and fix the `useAuth0 is not defined` crash.

## What’s inside

- `scripts/setup_auth0.sh` — idempotent installer + code patcher (TypeScript, @auth0/auth0-react, Vite HMR settings, ProtectedRoute)
- `scripts/run_dev.sh` — frees ports 8080/24679 and starts your dev server
- `snippets/ProtectedRoute.tsx` — working ProtectedRoute using `useAuth0`
- `snippets/main.wrapper.tsx` — a safe example of wrapping your app with `Auth0Provider`
- `snippets/vite.config.ts.example` — Vite server/HMR config block
- `env/client.env.example` — client env template
- `env/server.env.example` — server env template
- `README.md` — this file

> The scripts try to be **safe**: they back up files before overwriting and only patch when patterns match.
> If your project layout differs, copy from `snippets/` manually.

---

## Quick start

```bash
# 1) Unzip into your repo root (or anywhere) and run:
bash scripts/setup_auth0.sh

# 2) Set your env values:
cp env/client.env.example client/.env
cp env/server.env.example server/.env   # if you have a backend

# 3) Start dev (uses a quiet HMR port 24679):
bash scripts/run_dev.sh
```

If you see a compile/runtime error, compare your local files to the copies in `snippets/`.

---

## Notes

- The script will attempt to create/update:
  - `src/components/core/ProtectedRoute.tsx`
  - `vite.config.ts` (or create `vite.config.ts` if missing)
- For the entry file (`src/main.tsx`), it **won’t overwrite blindly**.
  - It will **emit guidance** if it can’t confidently wrap your app.
  - You can always copy `snippets/main.wrapper.tsx` and integrate manually.

- HMR is pinned to `port: 8080` and socket `24679` to avoid conflicts.
- If you’re using a different dev port, adjust `vite.config.ts` accordingly.
- Route53/Auth0 custom domain is independent of this setup; once verified,
  set `VITE_AUTH0_DOMAIN=auth.heliotropeimaginal.com` in `client/.env`.
