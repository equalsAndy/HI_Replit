# Auth0 Multi-Tenant Migration — Complete Env-Var Map

**Generated:** 2026-04-10
**Status:** All three tenants built. Custom domain cutover initiated (pending DNS propagation).

---

## Tenant Domains

| Environment | Tenant Domain | Custom Domain |
|---|---|---|
| DEV | `dev-y4g4ug6epxi167a4.us.auth0.com` | none (removed during cutover) |
| STAGING | `selfactual-staging.us.auth0.com` | none |
| PROD | `selfactual-prod.us.auth0.com` | `auth.heliotropeimaginal.com` (pending DNS verification) |

---

## Application Map (12 SPAs + M2M)

| App | Env | Tenant | Client ID | Auth0 Domain (SDK) | Callback URL | ext-brand |
|---|---|---|---|---|---|---|
| **HI** | Dev | DEV | `fgT0QM0huvQsqPRiivKbdYYDLHQliQs2` | `dev-y4g4ug6epxi167a4.us.auth0.com` | `http://localhost:8080/auth/callback` | `hi` |
| **HI** | Staging | STAGING | `EvVbcW26QWMUdLGHFSsFh9pCmywFuVeC` | `selfactual-staging.us.auth0.com` | `https://staging.heliotropeimaginal.com/auth/callback` | `hi` |
| **HI** | Prod | PROD | `aeBcWM9HNGevfP7SFdR9dHpKpQChBZ7V` | `auth.heliotropeimaginal.com` | `https://app2.heliotropeimaginal.com/auth/callback` | `hi` |
| **Atlas** | Dev | DEV | `ckwUw0nJDtpbh0jh8XzXaHby87NeYAzm` | `dev-y4g4ug6epxi167a4.us.auth0.com` | `http://localhost:5173/callback` | `selfactual` |
| **Atlas** | Staging | STAGING | `l8FM8B16NjEujDrvZCSGvG34zdopRUoh` | `selfactual-staging.us.auth0.com` | `https://staging.atlas.selfactual.ai/callback` | `selfactual` |
| **Atlas** | Prod | PROD | `YHfjbTotum8e8OlnBDfhOwNobyetFxL4` | `auth.heliotropeimaginal.com` | `https://atlas.selfactual.ai/callback` | `selfactual` |
| **MyVault** | Dev | DEV | `RYUqwD3bwJDhp9d8Y54kk3vWXq9bMyrw` | `dev-y4g4ug6epxi167a4.us.auth0.com` | `http://localhost:5174/callback` | `selfactual` |
| **MyVault** | Staging | STAGING | `NpQrhuWE243U95gwOsiarVaC256lpkDR` | `selfactual-staging.us.auth0.com` | `https://staging.myvault.selfactual.ai/callback` | `selfactual` |
| **MyVault** | Prod | PROD | `odSVkGi0K8MEVCL85L8o6FlpF4OVDgoR` | `auth.heliotropeimaginal.com` | `https://myvault.selfactual.ai/callback` | `selfactual` |
| **Admin** | Dev | DEV | `50eFl8y3OW01dREN2IiMnk5zClhu8qXk` | `dev-y4g4ug6epxi167a4.us.auth0.com` | `http://localhost:5175/callback` | `selfactual` |
| **Admin** | Staging | STAGING | `aWlvQWZHBRN6zk5OsKgsAN7V8ZDvXCOZ` | `selfactual-staging.us.auth0.com` | `https://staging.admin.selfactual.ai/callback` | `selfactual` |
| **Admin** | Prod | PROD | `igWXhHJJAMXrbuFXDlnbEKO3lMmYsgHs` | `auth.heliotropeimaginal.com` | `https://admin.selfactual.ai/callback` | `selfactual` |

---

## M2M Clients

| Name | Tenant | Client ID | Client Secret | Audience | Scopes |
|---|---|---|---|---|---|
| Auth0 Management API (M2M) | DEV | `0iccxn8XTSPQqlDObrtSajwec7eXB372` | (in .env) | `https://dev-y4g4ug6epxi167a4.us.auth0.com/api/v2/` | read/update/delete/create:users, *_app_metadata, connections, logs |
| HI Server M2M | PROD | `383bXa1vJOm5WXlKe2neZbi4D3kRDeFt` | `s_x10fE7KYawVe8OdpFlpmHYb3ZW8L4b_Cir7YhFrBO6gGk1mjmDRbtheIWZ0njm` | `https://selfactual-prod.us.auth0.com/api/v2/` | Same scopes as dev (Brad granted via dashboard) |
| *(staging M2M)* | STAGING | *not yet created* | — | `https://selfactual-staging.us.auth0.com/api/v2/` | Create when needed |

---

## API Resource Servers (per tenant)

| API | Audience | Scopes | Present On |
|---|---|---|---|
| Heliotrope | `https://api.heliotropeimaginal.com` | `read:profile write:profile read:assessments write:assessments admin:users` | DEV, STAGING, PROD |
| SelfActual Platform API | `https://api.selfactual.ai` | `read:pod write:pod read:profile write:profile read:assessments write:assessments read:synthesis admin:pods` | DEV, STAGING, PROD |

---

## Roles (identical on all three tenants)

| Role | DEV ID | STAGING ID | PROD ID |
|---|---|---|---|
| Admin | `rol_oQELsz2dqKzNfyDC` | `rol_5N027VJ2NlbBNkjK` | `rol_csaxzaiPniSiKfuU` |
| Facilitator | `rol_w2L5Q0PfzoTroFVV` | `rol_vZPUnFmqUrP9c5Sz` | `rol_SeCshndpXG9Ev14C` |
| Participant | `rol_udyP0CFLMRL5N1sJ` | `rol_MEguEveDMgpJVJLV` | `rol_SzcbLXQ7e0U0qImG` |

---

## Gateway Env Vars (per environment)

| Env | AUTH0_DOMAIN | AUTH0_AUDIENCE |
|---|---|---|
| Dev | `dev-y4g4ug6epxi167a4.us.auth0.com` (or unset for dev bypass) | `https://api.selfactual.ai` |
| Staging | `selfactual-staging.us.auth0.com` | `https://api.selfactual.ai` |
| Prod | `selfactual-prod.us.auth0.com` (or `auth.heliotropeimaginal.com` after cutover) | `https://api.selfactual.ai` |

---

## Files Modified

### HI_Replit (`~/Desktop/HI_Replit`)
- `server/config/auth-environment.ts` — per-env domain config
- `client/src/config/auth-environment.ts` — per-env domain config
- `client/src/providers/Auth0Provider.tsx` — added `ext-brand: 'hi'`
- `server/routes/auth0-routes.ts` — fixed claims namespace (selfactual.ai primary, heliotropeimaginal.com fallback)
- `actions/add_roles_and_flags.js` — synced to deployed version (both namespaces)
- `.env` — dev Auth0 domain + client ID vars
- `.env.staging` — staging tenant domain + client ID

### selfactual_apps (`~/Desktop/selfactual_apps`)
- `apps/atlas/vite.config.ts` — pinned port 5173
- `apps/atlas/src/main.tsx` — added `ext-brand: 'selfactual'`
- `apps/atlas/.env.example` — populated with dev config
- `apps/vault-manager/vite.config.ts` — pinned port 5174
- `apps/vault-manager/src/main.tsx` — added `ext-brand: 'selfactual'`
- `apps/vault-manager/.env.example` — populated with dev config
- `apps/admin/vite.config.ts` — pinned port 5175
- `apps/admin/src/main.tsx` — added `ext-brand: 'selfactual'`
- `apps/admin/.env.example` — populated with dev config

### SelfActualSystem (`~/Desktop/SelfActualSystem`)
- No code changes. Gateway already env-var driven. Deployment config needs per-env `AUTH0_DOMAIN`.

---

## AWS SSM Parameters to Update (prod)

These need to be set via `aws ssm put-parameter` or the AWS console:

```
/prod/hi-replit/VITE_AUTH0_DOMAIN_PROD = auth.heliotropeimaginal.com
/prod/hi-replit/VITE_AUTH0_CLIENT_ID_PROD = aeBcWM9HNGevfP7SFdR9dHpKpQChBZ7V
/prod/hi-replit/MGMT_CLIENT_ID = 383bXa1vJOm5WXlKe2neZbi4D3kRDeFt
/prod/hi-replit/MGMT_CLIENT_SECRET = s_x10fE7KYawVe8OdpFlpmHYb3ZW8L4b_Cir7YhFrBO6gGk1mjmDRbtheIWZ0njm
/prod/hi-replit/MGMT_AUDIENCE = https://selfactual-prod.us.auth0.com/api/v2/
/prod/hi-replit/TENANT_DOMAIN = selfactual-prod.us.auth0.com
```

---

## Pending Manual Steps

1. **DNS CNAME update**: `auth.heliotropeimaginal.com` → `selfactual-prod-cd-jcuqpogy7hcthaxl.edge.tenants.us.auth0.com`
2. **Verify custom domain**: After DNS propagates, run `auth0 api post custom-domains/cd_jCuqpogY7HCtHaXl/verify` on the prod tenant
3. **AWS SSM params**: Update the 6 parameters listed above
4. **Staging M2M client**: Create when HI staging deployment needs Management API access (not blocking)
5. **Enable connections on new apps**: Verify that google-oauth2 and Username-Password-Authentication are enabled on all new staging/prod SPAs (Auth0 auto-enables connections on new apps for the Default App, but not always for new SPAs)

---

## Post-Migration Cleanup (deferred until confirmed working)

- Delete "Heliotrope Imaginal" (`c28c7gpoPuIrmPrP85NMqtCYhige5Qd9`) from DEV — it's the old HI prod app that now lives on the prod tenant
- Delete orphaned M2M `vdglxXXmoanRrxTihIfRuUwNp6SOIuQB` from DEV
- Consider backporting Google OAuth + MFA + strong password to DEV
