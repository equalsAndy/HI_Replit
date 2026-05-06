# Auth0 Recon Report — DEV Tenant

**Tenant:** `dev-y4g4ug6epxi167a4.us.auth0.com`
**Date:** 2026-04-09
**Status:** DEV recon complete. STAGING recon BLOCKED — CLI not yet authorized to staging tenant. PROD recon BLOCKED — same.

---

## 🚨 Critical Findings (read these first)

### Finding 1 — selfActual apps already exist on the dev tenant
The briefing assumed Atlas, MyVault, and Admin had no Auth0 setup. They do — they're already registered on the **dev tenant** with mixed prod + localhost callbacks. This changes the migration strategy: instead of "create three new apps on dev", we either move them to selfActual-staging/prod OR we leave them on dev for development and create staging/prod copies on the other tenants.

### Finding 2 — Callback path mismatch
All selfActual apps use `/callback` (not `/auth/callback` like HI). Need to confirm with the actual app code which path to register going forward, or update the apps to match HI's `/auth/callback` convention.

### Finding 3 — Port collision in dev
Both **Vault Manager** and **SelfActual Admin** are registered with `http://localhost:5174/callback`. They cannot run simultaneously. The plan's port assignment (Atlas 5173, MyVault 5174, Admin 5175) is correct — but Admin needs to be moved off 5174 to 5175, AND MetaPrompter currently occupies 5175 in Auth0.

### Finding 4 — POST-LOGIN ACTION NAMESPACE MISMATCH (likely silent bug)
The deployed `Post-Login Claims` action injects custom claims under:
- `https://selfactual.ai/claims/roles`
- `https://heliotropeimaginal.com/claims/roles`
- `https://heliotropeimaginal.com/claims/interface`
- `https://heliotropeimaginal.com/claims/flags`

But [server/routes/auth0-routes.ts:55,112](~/Desktop/HI_Replit/server/routes/auth0-routes.ts#L55) reads from:
- `https://schemas.auth0.com/roles`
- `https://schemas.auth0.com/app_metadata`

**These don't match.** The entire "admin role detected from Auth0 metadata" code path in the HI server is dead — admins are only ever detected via the hardcoded email allowlist. This is a pre-existing bug, not something we caused, but it should be addressed at some point. Whether to fix it as part of this migration is a separate decision.

### Finding 5 — Single connection, no social logins
Only `Username-Password-Authentication` is configured. No Google, no Microsoft, no SSO providers. All 10 apps share this one DB connection. If the briefing's intent included enabling social logins on the new tenants, that's an unstated requirement.

### Finding 6 — There's already a SelfActual API audience
`https://api.selfactual.ai` is already registered on dev (8 scopes), alongside `https://api.heliotropeimaginal.com` (5 scopes). And there's a deprecated one (`https://auth-api.selfactual.ai`, 0 scopes) that should probably be deleted.

---

## 1. Applications (10 total)

### HI apps
| Name | Client ID | Type | Callbacks | Notes |
|------|-----------|------|-----------|-------|
| **Heliotrope Dev** | `fgT0QM0huvQsqPRiivKbdYYDLHQliQs2` | spa | `localhost:8080/auth/callback`, `staging.heliotropeimaginal.com/auth/callback` | Dev + staging combined. Custom Lock-based login page. Has password grants enabled. |
| **Heliotrope Imaginal** | `c28c7gpoPuIrmPrP85NMqtCYhige5Qd9` | spa | `app2.heliotropeimaginal.com/auth/callback`, `app2.heliotropeimaginal.com/api/auth/callback` | Production HI app. |

### selfActual apps (already on dev tenant — finding #1)
| Name | Client ID | Type | Callbacks | Notes |
|------|-----------|------|-----------|-------|
| **Atlas** | `ckwUw0nJDtpbh0jh8XzXaHby87NeYAzm` | spa | `https://atlas.selfactual.ai/callback`, `http://localhost:5173/callback` | Path is `/callback` not `/auth/callback` |
| **Vault Manager** | `RYUqwD3bwJDhp9d8Y54kk3vWXq9bMyrw` | spa | `https://myvault.selfactual.ai/callback`, `http://localhost:5174/callback` | Port collision with SelfActual Admin |
| **MetaPrompter** | `apL87mjpIibt4kno2AsBc0Pv0uDcA38b` | spa | `https://prompter.selfactual.ai/callback`, `http://localhost:5175/callback` | Out of scope per plan, but exists |
| **SelfActual Admin** | `50eFl8y3OW01dREN2IiMnk5zClhu8qXk` | spa | `https://admin.selfactual.ai/callback`, `http://localhost:5174/callback` | **Port collision** with Vault Manager — both on 5174 |

### M2M / Native apps
| Name | Client ID | Type | Notes |
|------|-----------|------|-------|
| **Auth0 Management API (M2M)** | `0iccxn8XTSPQqlDObrtSajwec7eXB372` | non_interactive | The M2M client HI's [server/src/auth0/management.ts](~/Desktop/HI_Replit/server/src/auth0/management.ts) uses |
| **Heliotrope/SelfActual M2M Management** | `vdglxXXmoanRrxTihIfRuUwNp6SOIuQB` | non_interactive | A second M2M client — purpose unclear, probably gateway/provisioning |
| **Claude Code MCP** | `58i3wPUVClCKoBTTQWBrYg2xj074pNM8` | non_interactive | M2M for the Claude Code integration |
| **Imprint MCP (Claude Desktop)** | `t5LoUTJYBsAyptbSGuGTvrUNkhvq4NAC` | native | OAuth callback to `mcp.selfactual.ai/oauth/callback` |

---

## 2. APIs (Resource Servers)

| Name | Identifier | Scopes |
|------|-----------|--------|
| Auth0 Management API | `https://dev-y4g4ug6epxi167a4.us.auth0.com/api/v2/` | 251 (default) |
| **Heliotrope** | `https://api.heliotropeimaginal.com` | 5 |
| **SelfActual Platform API** | `https://api.selfactual.ai` | 8 |
| ~~SelfActual (DEPRECATED)~~ | `https://auth-api.selfactual.ai` | 0 — should be deleted |

(Need to drill into the Heliotrope and SelfActual scopes to capture exact list — Phase 2 follow-up.)

---

## 3. Roles (3 total)

| ID | Name | Description |
|----|------|-------------|
| `rol_oQELsz2dqKzNfyDC` | **Admin** | Can see and do anything in the system |
| `rol_w2L5Q0PfzoTroFVV` | **Facilitator** | Can create/manage participants, students, cohorts, organizations |
| `rol_udyP0CFLMRL5N1sJ` | **Participant** | Can go through the workshops |

These match HI's expected role hierarchy in [server/middleware/auth.ts](~/Desktop/HI_Replit/server/middleware/auth.ts).

---

## 4. Connections

Single connection: **`Username-Password-Authentication`** (database, type `auth0`)
- All 10 apps enabled on it
- Brute-force protection: ON
- Password complexity: min length 1 (very weak — flag for prod)
- Self-service password change: DISABLED
- Signup: DISABLED (`disable_signup: true`)
- Passkey support: enabled in connection but not enforced
- No social/enterprise connections (no Google, no Microsoft, no SAML)

---

## 5. Actions

**1 active post-login action:** `Post-Login Claims` (id `6df4b08f-b3d7-42f9-b3f4-fe1a7f09f52d`, runtime node22, status: built + deployed)

```javascript
exports.onExecutePostLogin = async (event, api) => {
  const roles = event.authorization?.roles || [];
  const am = event.user.app_metadata || {};
  const flags = am.flags || {};

  // SelfActual namespace — used by Atlas, gateway, and SelfActual apps
  const SA = 'https://selfactual.ai/claims';
  api.idToken.setCustomClaim(`${SA}/roles`, roles);
  api.accessToken.setCustomClaim(`${SA}/roles`, roles);

  // Heliotrope namespace — used by HI apps
  const HI = 'https://heliotropeimaginal.com/claims';
  const iface = am.interface === 'professional' ? 'professional' : 'student';
  api.idToken.setCustomClaim(`${HI}/roles`, roles);
  api.idToken.setCustomClaim(`${HI}/interface`, iface);
  api.idToken.setCustomClaim(`${HI}/flags`, {
    beta: !!flags.beta,
    test: !!flags.test
  });
};
```

**This is the action that needs to be replicated verbatim on staging and prod tenants** (Step 3.2/3.3 of the plan). The HI/SelfActual claim namespaces are referenced by both products.

⚠️ **See Finding #4** — the HI server doesn't actually read these claims. There's a namespace mismatch.

---

## 6. Branding & Universal Login

- **New Universal Login experience enabled:** ✅ (`new_universal_login_experience_enabled: true`) — required for the brand-switching template the plan calls for
- **Logo:** `https://app2.heliotropeimaginal.com/assets/HI_Logo_horizontal-B8xLaFPo.png`
- **Primary color:** `#245feb` (note: NOT the `#ffd127` HI yellow the briefing references)
- **Background:** `#bababa`
- **Favicon:** none
- **Custom font:** none
- The custom Lock-based login page on the "Heliotrope Dev" app is `custom_login_page_on: true` — Classic Login script. New Universal Login should override this.

---

## 7. Tenant Settings (notable)

```json
{
  "enabled_locales": ["en"],
  "flags": {
    "enable_custom_domain_in_emails": true,
    "enable_sso": true,
    "new_universal_login_experience_enabled": true,
    "universal_login": true,
    "disable_impersonation": true
  },
  "sandbox_version": "22",
  "oidc_logout": { "rp_logout_end_session_endpoint_discovery": true },
  "resource_parameter_profile": "audience"
}
```

Custom domain (`auth.heliotropeimaginal.com`) is enabled at the tenant level for emails. This is the domain that the plan says should move to the prod tenant.

---

---

# STAGING Tenant Recon

**Tenant:** `selfactual-staging.us.auth0.com`
**Status:** ✅ Recon complete. Tenant is essentially empty — needs everything built out.

## STAGING — Applications (2 total)

| Name | Client ID | Type | Callbacks | Notes |
|------|-----------|------|-----------|-------|
| **Default App** | `693lWmvSgkOO4idbIHdRCNBfyhTRPco6` | (no app_type) | none | Auth0's default placeholder. Should be left alone or deleted. |
| **SelfActual Staging** | `EvVbcW26QWMUdLGHFSsFh9pCmywFuVeC` | spa | `https://staging.heliotropeimaginal.com/auth/callback` | The "HI Staging" app the briefing referenced. Confusingly named — it's HI staging, but called "SelfActual Staging". Callback already correct (no old IP `34.220.143.127`). |

**Note:** No `34.220.143.127` IP callback exists on this app. The plan's Step 3.5 ("Fix HI Staging callback to remove old IP") is a no-op for this tenant. Either the IP was already cleaned up or it lived on a different app.

## STAGING — APIs (1 total)

| Name | Identifier | Scopes |
|------|-----------|--------|
| Auth0 Management API | `https://selfactual-staging.us.auth0.com/api/v2/` | 251 (default) |

**Missing:** No Heliotrope or SelfActual Platform API audiences. Need to create both.

## STAGING — Roles (0 total)

**None.** Need to create Admin / Facilitator / Participant to match dev.

## STAGING — Connections (2 total)

| Name | Strategy | Notes |
|------|----------|-------|
| **google-oauth2** | google-oauth2 | ✨ Google login is enabled here but NOT on dev! |
| **Username-Password-Authentication** | auth0 | Password policy "good" (stronger than dev's `min_length: 1`); MFA active; brute-force protection on |

**Two divergences from dev:**
1. Staging has Google OAuth, dev doesn't.
2. Staging has stronger password policy + MFA enabled.

These are improvements; staging is "more correct" than dev. The migration should bring dev up to staging's standard, not the other way around.

## STAGING — Actions (0 total)

**None.** No post-login action exists on staging. The custom claims that the HI server reads (and that I just fixed in [server/routes/auth0-routes.ts](~/Desktop/HI_Replit/server/routes/auth0-routes.ts)) are NOT being emitted on staging. Once the HI Staging app actually starts being used against this tenant, role-based admin detection will silently fail until the action is deployed.

This is **the highest-priority Phase 3 task for staging** — deploy [actions/add_roles_and_flags.js](~/Desktop/HI_Replit/actions/add_roles_and_flags.js) here.

## STAGING — Branding & Universal Login

- All branding fields **empty** (no logo, no colors, no favicon, no custom font)
- New Universal Login: NOT explicitly flagged in tenant settings (the flag `new_universal_login_experience_enabled` is missing — likely defaulting to old experience)
- No custom domain
- No `enable_custom_domain_in_emails` flag

**Implication:** The brand-switching template (Step 3.4) requires the New Universal Login experience. This may need to be enabled explicitly on staging before the template can be installed.

## STAGING — Tenant Settings (notable absences)

Compared to dev, staging is missing:
- `enable_custom_domain_in_emails: true`
- `new_universal_login_experience_enabled: true`
- `picture_url`
- `universal_login.colors`

It also doesn't have the `dashboard_new_onboarding` or `disable_impersonation` flags set explicitly. Most fields are at Auth0 defaults.

---

## STAGING Delta Summary

**To bring staging to parity with dev (and the migration target), we need to create:**

1. **APIs:** Heliotrope (`https://api.heliotropeimaginal.com`, 5 scopes) + SelfActual Platform (`https://api.selfactual.ai`, 8 scopes). Skip the deprecated `auth-api.selfactual.ai`.
2. **Roles:** Admin / Facilitator / Participant (3 total) — copy from dev.
3. **Apps:** HI Staging (rename "SelfActual Staging" → "HI Staging" for clarity, or delete + recreate), Atlas Staging, MyVault Staging, Admin Staging — 4 SPAs total.
4. **Action:** Deploy the Post-Login Claims action (now lives at [actions/add_roles_and_flags.js](~/Desktop/HI_Replit/actions/add_roles_and_flags.js)).
5. **Universal Login:** Enable New Universal Login experience, then install the brand-switching template with HI yellow `#ffd127` and selfActual blue `#16b1df`.
6. **Branding:** Set logo, colors, favicon at the tenant level.

**Things to leave alone:**
- The Default App (Auth0 placeholder)
- The google-oauth2 connection (it's an improvement over dev — preserve and enable on the new apps)
- The stronger password policy on Username-Password-Authentication

**Open question for Phase 2 strategy:** The "SelfActual Staging" app is named misleadingly. It points at `staging.heliotropeimaginal.com` (HI), not selfActual. Either:
- Rename it to "HI Staging" via `auth0 apps update` (preferred, preserves Client ID `EvVbcW26QWMUdLGHFSsFh9pCmywFuVeC` so any deployed env vars keep working), OR
- Delete it and recreate as "HI Staging" (Client ID changes — requires updating deployed env vars)

Recommend rename.

---

# PROD Tenant Recon

**Tenant:** `selfactual-prod.us.auth0.com`
**Status:** ✅ Recon complete. Tenant is essentially **fresh / empty** — exactly one Default App, exactly one Mgmt API, two connections (Google + DB w/ MFA), no roles, no apps, no actions, no branding, no custom domain.

## PROD — Applications (1 total)

| Name | Client ID | Type | Notes |
|------|-----------|------|-------|
| **Default App** | `qCZTYMDEGjfww7bOdoNqL0BZG4jfLcCv` | (no app_type) | Auth0 placeholder. Leave alone. |

## PROD — APIs (1 total)

Only Auth0 Management API. Need to create Heliotrope + SelfActual Platform.

## PROD — Roles (0 total)

None. Need Admin/Facilitator/Participant.

## PROD — Connections (2 total)

Same shape as staging:
- **google-oauth2** ✅
- **Username-Password-Authentication** with `passwordPolicy: "good"`, MFA active, brute-force on, passkey support

This is the **target standard**. Both staging and prod have it; dev is the outlier with weak password policy and no Google.

## PROD — Actions (0 total)

None. Need to deploy [actions/add_roles_and_flags.js](~/Desktop/HI_Replit/actions/add_roles_and_flags.js).

## PROD — Branding & Universal Login

All empty. Same as staging — no logo, no colors, New Universal Login flag not explicitly set.

## PROD — Custom Domain ⚠️

**Empty.** `auth.heliotropeimaginal.com` is **NOT yet bound to the prod tenant.**

## 🔥 Custom Domain Status (cross-tenant)

| Tenant | Custom Domain |
|--------|---------------|
| `dev-y4g4ug6epxi167a4` | ✅ **`auth.heliotropeimaginal.com`** (verified, Auth0-managed cert via Let's Encrypt, renews 2026-05-25) |
| `selfactual-staging` | none |
| `selfactual-prod` | **none** ← needs to move here |

**This is the single biggest cutover risk in the migration.** Per the plan, the custom domain must move from dev to prod. Auth0 only allows one custom domain per tenant per name, so the cutover sequence must be:

1. Build out prod tenant with apps, APIs, roles, action, etc. (everything except the custom domain)
2. Verify HI prod app works on prod tenant via the raw `selfactual-prod.us.auth0.com` domain
3. **Schedule a brief downtime window:**
   a. Delete `auth.heliotropeimaginal.com` from dev tenant (`auth0 api delete custom-domains/cd_7POSuKSZjyMLMQN7`)
   b. Create it on prod tenant (`auth0 api post custom-domains` with the same name)
   c. Re-verify (CNAME may need to be updated in DNS — Auth0 will give a new verification target)
   d. Wait for cert provisioning (Let's Encrypt — usually fast, but not instant)
4. Until cert is provisioned, **HI production logins fail** — users can't reach Auth0 via the custom domain.

**Rollback plan:** If anything goes wrong during the cutover, the custom domain can be re-created on the dev tenant (DNS change again). This is recoverable but visible. Recommend doing it during a low-traffic window and warning users.

**Open question for Phase 2:** Should the custom domain cutover be scheduled as a separate explicit task with its own downtime window? Or can it be folded into the prod-tenant build-out?

## PROD Delta Summary

To bring prod from "empty tenant" to fully migrated:

1. **APIs:** Heliotrope + SelfActual Platform (skip the deprecated one)
2. **Roles:** Admin / Facilitator / Participant
3. **Apps (4 SPAs):** HI Prod, Atlas Prod, MyVault Prod, Admin Prod — with production callback URLs
4. **Action:** Deploy [actions/add_roles_and_flags.js](~/Desktop/HI_Replit/actions/add_roles_and_flags.js)
5. **Universal Login:** Enable New ULP, install brand-switching template
6. **Branding:** Logo, colors, favicon
7. **Custom domain:** Move `auth.heliotropeimaginal.com` from dev → prod (requires downtime window — see above)
8. **M2M client for HI server:** Create equivalent of dev's `0iccxn8XTSPQqlDObrtSajwec7eXB372` with the same scopes for the HI server's user-provisioning code; new credentials get stored in AWS SSM

---

# Cross-Tenant Comparison

| Feature | DEV | STAGING | PROD |
|---------|:---:|:---:|:---:|
| HI app | ✅ "Heliotrope Dev" + "Heliotrope Imaginal" (2) | ✅ "SelfActual Staging" (misnamed) | ❌ |
| selfActual apps (Atlas/MyVault/Admin) | ✅ all 3 (with port collision + wrong path) | ❌ | ❌ |
| MetaPrompter | ✅ exists (out of scope) | ❌ | ❌ |
| HI API | ✅ `api.heliotropeimaginal.com` | ❌ | ❌ |
| SelfActual API | ✅ `api.selfactual.ai` (+ deprecated) | ❌ | ❌ |
| Roles | ✅ Admin/Facilitator/Participant | ❌ | ❌ |
| google-oauth2 | ❌ | ✅ | ✅ |
| Strong password policy | ❌ (min 1 char) | ✅ ("good") | ✅ ("good") |
| MFA | ❌ | ✅ | ✅ |
| Post-Login Claims action | ✅ deployed (now in sync with [actions/add_roles_and_flags.js](~/Desktop/HI_Replit/actions/add_roles_and_flags.js)) | ❌ | ❌ |
| New Universal Login | ✅ enabled | ❌ default | ❌ default |
| Branding (logo/colors) | ✅ (color is wrong: blue not yellow) | ❌ | ❌ |
| Custom domain `auth.heliotropeimaginal.com` | ✅ (needs to move to prod) | ❌ | ❌ (target) |
| HI server M2M client | ✅ (`0iccxn8X...`) | ❌ | ❌ |

**Two recurring patterns:**
1. **Dev has the most stuff, but the wrong stuff in some places** (port collision, wrong callback paths, weak password, missing Google).
2. **Staging and prod are clean slates** with the security improvements (Google, MFA, strong password) but nothing else.

The migration needs to move *configuration* from dev to staging/prod, while *preserving* the security improvements that already exist on staging/prod, and *backporting* those security improvements to dev.

---

## Decisions Needed Before Phase 2

1. **What to do with the selfActual apps already on the dev tenant (Atlas, Vault Manager, MetaPrompter, SelfActual Admin)?** Options:
   - (a) Leave them on dev as the **dev environment** for selfActual; create staging/prod copies on the other tenants. This is the lowest-risk path and matches the briefing's intent (dev tenant = local development).
   - (b) Recreate them on dev with corrected callback URLs (port collision, callback path), then also build staging/prod copies.
   - (c) Move them to staging/prod and remove from dev.

2. **Callback path: `/callback` or `/auth/callback`?** The selfActual apps use `/callback`. HI uses `/auth/callback`. Decide which convention going forward — affects both Auth0 callback URL registration AND each app's router.

3. **Fix the post-login claim namespace bug?** The HI server reads `https://schemas.auth0.com/roles` but the action emits `https://heliotropeimaginal.com/claims/roles`. Either update the action OR update the server. Recommend updating the server (one place vs. multiple tenants).

4. **MetaPrompter on staging/prod?** Briefing said skip, but it already exists on dev. Options:
   - (a) Leave it on dev only.
   - (b) Replicate to all three tenants for consistency.

5. **`vdglxXXmoanRrxTihIfRuUwNp6SOIuQB` ("Heliotrope/SelfActual M2M Management") — what is this for?** Need to identify which service uses it before deciding whether to replicate.

6. **Delete the deprecated `https://auth-api.selfactual.ai` API?** It has 0 scopes and is marked DEPRECATED. Confirmation needed.

7. **HI Logo / branding colors mismatch.** Briefing says HI primary color is `#ffd127` (yellow), tenant has `#245feb` (blue). Which is canonical?
