# Upgrade production runtime to Node 22

**Labels:** `chore`, `infrastructure`, `deadline`
**Priority:** Medium (becomes High before January 2027)

## Summary

Production runs **Node 20.20.2**. The AWS SDK for JavaScript v3 now emits a
deprecation warning on every container start:

```
NodeVersionSupportWarning: The AWS SDK for JavaScript (v3) versions published
after the first week of January 2027 will require node >=22.
You are running node v20.20.2.
```

Observed in the `hi-replit-v2` container log on deployment 256 (2026-07-21).

Nothing is broken today — the warning is advisory. But after early January 2027,
SDK updates stop being installable on Node 20, which strands us on unpatched AWS
SDK versions. That matters more than usual here because the AWS SDK is on a
critical path: `@aws-sdk/client-bedrock-runtime` now serves **all** Claude
traffic (see `server/services/bedrock-provider.ts`), plus SES email and S3.

## Current state

Node versions are inconsistent across Dockerfiles:

| File                     | Base image           | Used by                        |
|--------------------------|----------------------|--------------------------------|
| `Dockerfile`             | `node:20-alpine`     | **production** (deploy script) |
| `Dockerfile.production`  | `node:18-bullseye` / `node:18-slim` | unclear — verify |
| `Dockerfile.staging`     | `node:18-alpine`     | staging                        |
| `Dockerfile.minimal`     | `node:18-alpine`     | unclear — verify               |
| `Dockerfile.lightweight` | `node:18-alpine`     | unclear — verify               |

Note **Node 18 is already end-of-life** (EOL April 2025), so the `18-*` images
are a live concern independent of the 2027 SDK deadline.

`package.json` declares no `engines.node` field, so nothing enforces or documents
the intended version. Local dev is on Node 24.

## Acceptance criteria

- [ ] `Dockerfile` (production) on `node:22-alpine`
- [ ] Audit the four non-production Dockerfiles: delete the unused ones, move the
      rest to Node 22 — don't leave EOL Node 18 images lying around
- [ ] Add `"engines": { "node": ">=22" }` to `package.json`
- [ ] `npm run build` and `npm test` pass on Node 22
- [ ] Verify native/transitive deps compile on Node 22 (notably anything with
      prebuilt binaries — check `bcrypt`/`sharp`-class packages if present)
- [ ] Deploy to production and confirm the SDK warning is gone from the container log
- [ ] Smoke test after deploy: `npx tsx scripts/ai-gateway-smoke-test.ts` — this
      exercises Bedrock, OpenAI, and gateway resolution end to end
- [ ] Update `CLAUDE.md` (currently states "Requirements: Node.js 18+")

## Notes

- Deadline is **first week of January 2027** for AWS SDK v3 publishes.
- Alpine vs Debian: production is currently Alpine; keep the base family the same
  to avoid dragging glibc/musl differences into the same change.
- The deploy script is now resumable — if the ECR push flakes, recover with
  `SKIP_BUILD=1 PRODUCTION_TAG=<tag>` rather than rebuilding. See
  `deploy-to-production.sh`.
