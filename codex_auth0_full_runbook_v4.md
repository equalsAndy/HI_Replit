
# Codex Runbook (v4) — Auth0 Login Flow + Roles UX + Hard Logout Landing
**This version does not rely on `codex_auth0_migration_kit_v3`.** It stands alone.

## What Codex should do
1) Install/verify **@auth0/auth0-react** in the client.  
2) Add a proper `Auth0Provider` wrapper (no auto-login; redirect-only).  
3) Add a dedicated `/auth` page with **Continue** (redirect) and **Cancel** (back to landing with `?showCode=1`).  
4) Add a `/auth/callback` page (no-op, lets the provider complete the flow).  
5) Add a `ProtectedRoute` wrapper that sends unauthenticated users to `/auth` (do **not** auto-login).  
6) Ensure **logout** returns to the landing `/` URL.  
7) Print a final checklist and smoke-test plan.

---

## Assumptions & paths
- Client code lives under **`client/`** OR directly under repo **`src/`**.  
- Router is **wouter** (as seen in your logs). If different, Codex should adapt the route wiring accordingly.  
- Env is Vite (`import.meta.env.*`).

---

## Environment variables (client)
Set these in your client env (e.g., `client/.env` or `.env` if single app):

```
VITE_AUTH0_DOMAIN=dev-y4g4ug6epxi167a4.us.auth0.com
VITE_AUTH0_CLIENT_ID=fgT0QM0huvQsqPRiivKbdYYDLHQliQs2
# Optional if you call a custom API:
# VITE_AUTH0_AUDIENCE=https://auth-api.selfactual.ai

# Redirect callback route inside your app:
VITE_AUTH0_REDIRECT_URI=http://localhost:8080/auth/callback
```

For **production**, set the same keys with your prod URLs (e.g., `https://app2.heliotropeimaginal.com/auth/callback`).

---

## Auth0 Dashboard — One-time manual (you do this)
**Applications → Heliotrope (SPA) → Settings**

- **Allowed Callback URLs**  
  `http://localhost:8080/auth/callback`, `https://app2.heliotropeimaginal.com/auth/callback`

- **Allowed Logout URLs**  
  `http://localhost:8080/`, `https://app2.heliotropeimaginal.com/`

- **Allowed Web Origins**  
  `http://localhost:8080`, `https://app2.heliotropeimaginal.com`

> Do **not** use embedded login (`/co/authenticate`). We use `loginWithRedirect()` only.

---

## Run these steps with Codex

### 1) Install the dependency (if needed)
```bash
npm i @auth0/auth0-react
```

### 2) Apply the minimal patch (creates/overwrites the 3 core files)
```bash
bash codex_auth0_patch.sh
```

This will:
- Create **Auth0Provider** wrapper (`src/providers/Auth0Provider.tsx`)
- Create **AuthPage** with **Continue** and **Cancel** (`src/pages/AuthPage.tsx`)
- Create **AuthCallback** no-op (`src/pages/AuthCallback.tsx`)
- Create **ProtectedRoute** (`src/components/ProtectedRoute.tsx`)

> Codex should then wire routes in your router (`/auth`, `/auth/callback`) and import `ProtectedRoute` where needed. If your `App.tsx` uses wouter, the patterns are trivial. If Codex can’t safely patch, it should print the exact `Route` snippets to paste.

---

## Route snippets (wouter examples)
```tsx
// Add these somewhere in your main router:
import AuthPage from "./pages/AuthPage";
import AuthCallback from "./pages/AuthCallback";
import { ProtectedRoute } from "./components/ProtectedRoute";

<Route path="/auth" component={AuthPage} />
<Route path="/auth/callback" component={AuthCallback} />

// Example protecting a dashboard:
<Route path="/dashboard">
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
</Route>
```

---

## Smoke test
1. Load `/` landing.  
2. Click **Login** → goes to `/auth`.  
3. Click **Continue** → Auth0 Universal Login → back to `/auth/callback` → redirected to `/dashboard`.  
4. Click **Cancel** on `/auth` → `/?showCode=1`.  
5. Logout → lands on `/` (landing).

---

## Troubleshooting
- Seeing `403 Cross origin login not allowed`? Remove any `auth0-js WebAuth` or `/co/authenticate` calls. We only use `loginWithRedirect()` via `@auth0/auth0-react`.
- Callback loop? Ensure `VITE_AUTH0_REDIRECT_URI` and Auth0 “Allowed Callback URLs” **match exactly**.
- Blank page after callback? Ensure you mounted the `Auth0Provider` at the app root and your router has a route for `/auth/callback`.
