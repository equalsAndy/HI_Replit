# Auth0 Multi-Tenant Migration — Phase 2 Strategy

**Date:** 2026-04-09
**Status:** All 14 decisions resolved. Approved to proceed into Phase 3.

This document is the executable plan for Phase 3. It locks down:
1. The full URL map (4 apps × 3 envs = 12 rows)
2. The per-tenant delta — exactly what needs to be created on each tenant
3. The execution sequence with dependencies
4. The code changes by file

---

## Resolved Decisions (recap)

| # | Decision | Resolution |
|---|---------|------------|
| 1 | selfActual apps already on dev | Keep. They ARE the dev environment. Audit & fix callbacks (remove prod URLs, fix port collision). |
| 2 | Callback path convention | `/callback` for selfActual, `/auth/callback` for HI |
| 3 | Claims namespace bug | ✅ Already fixed in [server/routes/auth0-routes.ts](~/Desktop/HI_Replit/server/routes/auth0-routes.ts) and [actions/add_roles_and_flags.js](~/Desktop/HI_Replit/actions/add_roles_and_flags.js) |
| 4 | MetaPrompter on staging/prod | Skip. Out of scope. |
| 5 | Orphaned M2M client `vdglxX...` | Don't replicate. Delete from dev after migration confirmed. |
| 6 | Deprecated `auth-api.selfactual.ai` API | Delete from dev. |
| 7 | HI brand color | `#ffd127` yellow. Dev's `#245feb` is stale, update it. |
| 8 | Misnamed staging app | Rename in place. Preserves Client ID. |
| 9 | Custom domain cutover | Inline during Phase 3. ~30-min downtime acceptable. |
| 10 | Dev security hardening | Don't backport. Preserve staging/prod's posture. |
| 11 | selfActual dev ports | Atlas 5173, MyVault 5174, Admin 5175. Pin in vite configs. |
| 12 | Google OAuth on staging/prod | Preserve. Already there. |
| 13 | Universal Login default brand | selfActual when `ext-brand` param missing. |
| 14 | Step 3.5 (HI staging old IP) | No-op. IP doesn't exist. Skip. |

---

## Tenant Architecture (final)

| Tenant Domain | Role | Custom Domain (post-migration) |
|---|---|---|
| `dev-y4g4ug6epxi167a4.us.auth0.com` | DEV | none (after cutover) |
| `selfactual-staging.us.auth0.com` | STAGING | none |
| `selfactual-prod.us.auth0.com` | PROD | `auth.heliotropeimaginal.com` (after cutover) |

---

## Full URL Map (12 rows)

| App | Env | Tenant | Auth0 Domain (used by SDK) | Callback URL | Origin | ext-brand |
|---|---|---|---|---|---|---|
| **HI** | Dev | DEV | `dev-y4g4ug6epxi167a4.us.auth0.com` | `http://localhost:8080/auth/callback` | `http://localhost:8080` | `hi` |
| **HI** | Staging | STAGING | `selfactual-staging.us.auth0.com` | `https://staging.heliotropeimaginal.com/auth/callback` | `https://staging.heliotropeimaginal.com` | `hi` |
| **HI** | Prod | PROD | `auth.heliotropeimaginal.com` | `https://app2.heliotropeimaginal.com/auth/callback` | `https://app2.heliotropeimaginal.com` | `hi` |
| **Atlas** | Dev | DEV | `dev-y4g4ug6epxi167a4.us.auth0.com` | `http://localhost:5173/callback` | `http://localhost:5173` | `selfactual` |
| **Atlas** | Staging | STAGING | `selfactual-staging.us.auth0.com` | `https://staging.atlas.selfactual.ai/callback` | `https://staging.atlas.selfactual.ai` | `selfactual` |
| **Atlas** | Prod | PROD | `auth.heliotropeimaginal.com` | `https://atlas.selfactual.ai/callback` | `https://atlas.selfactual.ai` | `selfactual` |
| **MyVault** | Dev | DEV | `dev-y4g4ug6epxi167a4.us.auth0.com` | `http://localhost:5174/callback` | `http://localhost:5174` | `selfactual` |
| **MyVault** | Staging | STAGING | `selfactual-staging.us.auth0.com` | `https://staging.myvault.selfactual.ai/callback` | `https://staging.myvault.selfactual.ai` | `selfactual` |
| **MyVault** | Prod | PROD | `auth.heliotropeimaginal.com` | `https://myvault.selfactual.ai/callback` | `https://myvault.selfactual.ai` | `selfactual` |
| **Admin** | Dev | DEV | `dev-y4g4ug6epxi167a4.us.auth0.com` | `http://localhost:5175/callback` | `http://localhost:5175` | `selfactual` |
| **Admin** | Staging | STAGING | `selfactual-staging.us.auth0.com` | `https://staging.admin.selfactual.ai/callback` | `https://staging.admin.selfactual.ai` | `selfactual` |
| **Admin** | Prod | PROD | `auth.heliotropeimaginal.com` | `https://admin.selfactual.ai/callback` | `https://admin.selfactual.ai` | `selfactual` |

**Note on staging URLs for selfActual apps:** The plan flagged that `staging.atlas.selfactual.ai`, `staging.myvault.selfactual.ai`, `staging.admin.selfactual.ai` may not have DNS configured yet. I'm registering them in Auth0 anyway — Auth0 doesn't care if DNS resolves; it only matters when a real browser tries to load that URL. If those staging domains never get set up, the staging apps just won't have working logins until they do, but the Auth0 config is ready.

**Note on the prod custom domain:** After cutover, all three prod apps use `auth.heliotropeimaginal.com` as the Auth0 SDK domain. Before cutover, they'd use `selfactual-prod.us.auth0.com`. Phase 3 builds out prod against the raw domain first, then cuts over.

---

## Per-Tenant Delta (what to create / change / delete)

### DEV tenant — audit & fix only

**Change:**
- **Atlas** (`ckwUw0nJ...`): remove `https://atlas.selfactual.ai/callback` from callbacks, remove `https://atlas.selfactual.ai` from origins/logout. Keep `localhost:5173` only.
- **Vault Manager** (`RYUqwD3b...`): remove `https://myvault.selfactual.ai/callback` from callbacks. Keep `localhost:5174` only.
- **SelfActual Admin** (`50eFl8y3...`): change `localhost:5174/callback` → `localhost:5175/callback` (port collision fix). Remove `https://admin.selfactual.ai` from origins/logout. Keep localhost only.
- **Tenant branding**: update `primary` color from `#245feb` → `#ffd127`, `page_background` from `#bababa` → something neutral (the briefing didn't specify; recommend `#ffffff` or leave unchanged).

**Delete:**
- Deprecated API: `https://auth-api.selfactual.ai` (id `68b30485733f654955b8397f`)

**Leave alone:**
- HI apps (Heliotrope Dev, Heliotrope Imaginal) — already correctly configured for dev/staging/prod
- Roles, connections, action — already correct
- MetaPrompter — out of scope, leave it
- Orphaned M2M `vdglxX...` — leave for now, delete after migration confirmed
- Custom domain `auth.heliotropeimaginal.com` — stays here UNTIL the cutover step

### STAGING tenant — build out

**Rename:**
- "SelfActual Staging" (`EvVbcW26...`) → "HI Staging". Add `'ext-brand': 'hi'` consideration via the auth flow (not a tenant-level setting; handled in client code).

**Create (APIs):**
- `Heliotrope` audience `https://api.heliotropeimaginal.com` with same 5 scopes as dev (need to fetch dev's scopes first)
- `SelfActual Platform API` audience `https://api.selfactual.ai` with same 8 scopes as dev

**Create (Roles):**
- Admin
- Facilitator
- Participant

**Create (Apps — 3 SPAs):**
- Atlas Staging — callbacks `https://staging.atlas.selfactual.ai/callback`
- MyVault Staging — callbacks `https://staging.myvault.selfactual.ai/callback`
- Admin Staging — callbacks `https://staging.admin.selfactual.ai/callback`

**Deploy:**
- Post-Login Claims action from [actions/add_roles_and_flags.js](~/Desktop/HI_Replit/actions/add_roles_and_flags.js) — bind to post-login trigger

**Configure:**
- Enable New Universal Login experience (set `flags.new_universal_login_experience_enabled: true`)
- Install brand-switching template (reads `config.extraParams.brand`, defaults to selfActual)
- Set tenant branding: logo `https://app2.heliotropeimaginal.com/assets/HI_Logo_horizontal-B8xLaFPo.png`, primary `#ffd127`

**Preserve (don't touch):**
- Default App
- google-oauth2 connection
- Username-Password-Authentication connection (strong policy + MFA)
- Enable both connections on the new SPAs

### PROD tenant — build out + custom domain cutover

Same shape as staging plus:

**Create (M2M client):**
- "Heliotrope HI Server M2M" — non_interactive, `client_credentials` grant, scopes matching dev's `0iccxn8X...`: `read:users update:users delete:users create:users read:users_app_metadata update:users_app_metadata delete:users_app_metadata create:users_app_metadata read:connections update:connections read:logs read:logs_users update:connections_options`. Save the new client_secret to AWS SSM under `/prod/hi-replit/MGMT_CLIENT_*`.

**Cutover (LAST step on prod):**
1. Verify HI prod app works against raw `selfactual-prod.us.auth0.com` domain
2. Delete custom domain from DEV: `auth0 api delete custom-domains/cd_7POSuKSZjyMLMQN7`
3. Create custom domain on PROD: `auth0 api post custom-domains` with body `{"domain":"auth.heliotropeimaginal.com","type":"auth0_managed_certs","tls_policy":"recommended"}`
4. Auth0 returns a new CNAME verification target — update DNS to point to it
5. Run `auth0 api post custom-domains/<id>/verify` until status = `ready`
6. Wait for cert provisioning (Let's Encrypt — usually 1-5 min)
7. Verify HI prod login works via `auth.heliotropeimaginal.com`

---

## Execution Sequence

The order matters because of cross-tenant dependencies (especially the custom domain cutover at the end).

1. **DEV audit** (3.1) — non-destructive cleanup. Doesn't touch any in-use config. Safe to do first and verify nothing breaks.
2. **STAGING build-out** (3.2) — independent of dev and prod. Can be done in parallel with dev work.
3. **PROD build-out without custom domain** (3.3a-f) — uses raw `selfactual-prod.us.auth0.com` domain temporarily. Verify HI prod works end-to-end on this domain before cutover.
4. **HI codebase changes** (3.6) — per-env Auth0 config, ext-brand, env files. Required before any of the new apps will work.
5. **selfActual codebase changes** (3.6d) — vite port pinning, ext-brand, Auth0 wiring.
6. **Gateway codebase changes** (3.6e) — per-env Auth0 domain.
7. **Universal Login template install** (3.4) on each tenant — needs the apps to exist first.
8. **Custom domain cutover** (3.3g) — LAST. After everything else verified.
9. **Output env-var map** (3.7).
10. **DEV cleanup** (3.8) — delete HI Staging/Prod apps from dev tenant, delete orphaned M2M. ONLY after staging+prod confirmed.

---

## Critical Files to Modify

### HI_Replit
| File | Change |
|---|---|
| [server/config/auth-environment.ts](~/Desktop/HI_Replit/server/config/auth-environment.ts) | Per-env `domain`. Dev: raw tenant. Staging: raw staging tenant. Prod: custom domain. |
| [client/src/config/auth-environment.ts](~/Desktop/HI_Replit/client/src/config/auth-environment.ts) | Same per-env split. |
| [client/src/providers/Auth0Provider.tsx](~/Desktop/HI_Replit/client/src/providers/Auth0Provider.tsx) | Add `authorizationParams: { 'ext-brand': 'hi' }` to provider config |
| [.env](~/Desktop/HI_Replit/.env) | New: `VITE_AUTH0_DOMAIN_DEV/STAGING/PROD` + `VITE_AUTH0_CLIENT_ID_STAGING` |
| [.env.staging](~/Desktop/HI_Replit/.env.staging) | Same |
| [client/.env.development](~/Desktop/HI_Replit/client/.env.development) | Same |
| AWS SSM | `/prod/hi-replit/VITE_AUTH0_CLIENT_ID`, `/prod/hi-replit/VITE_AUTH0_DOMAIN`, `/prod/hi-replit/MGMT_CLIENT_ID`, `/prod/hi-replit/MGMT_CLIENT_SECRET` (flag for Brad — I can't write to SSM) |

### selfactual_apps
| File | Change |
|---|---|
| `apps/atlas/vite.config.ts` | Add `server: { port: 5173 }` |
| `apps/atlas/src/main.tsx` | Add `authorizationParams: { 'ext-brand': 'selfactual' }` |
| `apps/atlas/.env.example` | Populate Auth0 domain + client ID |
| `apps/vault-manager/vite.config.ts` | Add `server: { port: 5174 }` |
| `apps/vault-manager/src/main.tsx` | Add `'ext-brand': 'selfactual'` |
| `apps/vault-manager/.env.example` | Populate |
| `apps/admin/vite.config.ts` | Add `server: { port: 5175 }` |
| `apps/admin/src/main.tsx` | Add `'ext-brand': 'selfactual'` |
| `apps/admin/.env.example` | Populate |

### SelfActualSystem
| File | Change |
|---|---|
| `services/gateway/` Auth0 config | Per-env `AUTH0_DOMAIN` + `AUTH0_AUDIENCE` (specific paths TBD when I look at it) |

---

## Verification Checklist (per tenant)

After Phase 3 build-out, verify each tenant:

- [ ] `auth0 apps list` shows expected apps with correct callbacks
- [ ] `auth0 apis list` shows Heliotrope + SelfActual Platform
- [ ] `auth0 roles list` shows Admin/Facilitator/Participant
- [ ] `auth0 api get "actions/actions?triggerId=post-login"` shows deployed Post-Login Claims action
- [ ] `auth0 universal-login show` shows brand-switching template
- [ ] `auth0 test login <hi-client-id>` opens browser, shows HI yellow branding, completes flow
- [ ] `auth0 test login <atlas-client-id>` opens browser, shows selfActual blue branding, completes flow
- [ ] HI server's `/api/auth/auth0-session` accepts the resulting JWT and creates a session

After custom domain cutover:
- [ ] `https://auth.heliotropeimaginal.com/.well-known/openid-configuration` returns prod tenant's metadata
- [ ] HI prod login works end-to-end via custom domain

---

**>>> All STOP points pre-approved. Beginning Phase 3 execution. <<<**
