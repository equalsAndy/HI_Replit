# CODEX RUNBOOK — Auth0 Migration + Roles + Admin Hard Delete (E2E)

You are Codex. Execute these steps verbatim. If any step fails, log the error and continue.

## 0) Workspace
- The kit folder is `codex_auth0_migration_kit_v3` after unzip.

## 1) Prepare environment
```bash
cd codex_auth0_migration_kit_v3
cp .env.example .env
# EDIT .env with values (TENANT_DOMAIN, MGMT creds, AUDIENCE, CONNECTION_ID, ROLE IDs, LEGACY_ROLE_PATH)
```

## 2) Tools check
```bash
which curl jq node npm >/dev/null
```

## 3) Get Management API token
```bash
source .env
bash scripts/get_mgmt_token.sh > .mgmt_token.json
cat .mgmt_token.json | jq -r '.access_token' > .mgmt_token.txt
export MGMT_TOKEN=$(cat .mgmt_token.txt)
```

## 4) Bulk import users
- Place the import file at `data/users.to_import.json`.
```bash
bash scripts/create_import_job.sh data/users.to_import.json > .import_job.json
bash scripts/poll_job.sh "$(jq -r '.id' .import_job.json)" > .import_status.json
jq '.status' .import_status.json
```

## 5) Assign roles from legacy field
```bash
bash scripts/assign_roles.sh
```

## 6) Install backend deps (if missing)
```bash
# adjust workspace/package manager to your repo; this assumes workspaces with 'server' package
npm i -w server node-fetch@3 jsonwebtoken jwks-rsa express zod
npm i -D -w server @types/express @types/jsonwebtoken typescript ts-node
```

## 7) Wire server: Admin Hard Delete
Copy/merge into your server project:
- `server/src/auth0/management.ts`
- `server/src/routes/admin.deleteUser.ts`
- `server/src/routes/index.ts` (merge with main router)
- `server/src/env.ts`

Mount router in your server bootstrap (e.g., `server/src/index.ts`):
```ts
import express from 'express';
import { adminRouter } from './routes';
const app = express();
app.use(express.json());
app.use('/admin', adminRouter);
app.listen(process.env.PORT || 3001);
```

Add `TENANT_DOMAIN`, `MGMT_CLIENT_ID`, `MGMT_CLIENT_SECRET`, `MGMT_AUDIENCE` in `server/.env`.

## 8) Frontend Admin Console
Copy into your client:
- `client/src/admin/api.ts`
- `client/src/admin/DeleteUserButton.tsx`

Render in Admin UI, e.g.:
```tsx
<DeleteUserButton auth0Id="auth0|SOME_ID" />
```

## 9) Post-Login Action
Create action from `actions/add_roles_and_flags.js`, Deploy, Add to Flow.

## 10) Smoke tests
- Call `DELETE /admin/users/:auth0Id` without `hard=true` → expect 400.
- Call with `?hard=true` for a test user → expect success.
- Verify DB & Auth0 deletion.

## 11) Report
- Output `.import_status.json` status, role assignment counts, and delete response.
