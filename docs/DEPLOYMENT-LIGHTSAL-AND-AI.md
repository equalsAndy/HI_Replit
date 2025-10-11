# Deployment: Build, Push, and Lightsail Deploy (M1 → linux/amd64)

This document describes the repeatable process to build the production container on an M1 Mac (amd64), push it to ECR, deploy to AWS Lightsail, and verify. It also covers environment handling (DB TLS and IA/OpenAI keys), common errors we encountered, diagnostics, and recovery steps.

## Prerequisites

- AWS CLI configured with permissions for ECR & Lightsail. (`aws configure`)
- Docker with Buildx available (for cross-arch build on Mac M1).
- Repo contains `Dockerfile.production`, `client/` Vite app, and `package.json`.
- Optional: DB CA PEM in `certs/` (gitignored) if you need custom CA trust.

## Build & Push (local)

1. Set a timestamp tag and repository image name:

   ```bash
   TAG="$(date +%Y%m%d-%H%M%S)"
   ECR="962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:$TAG"
   ```

2. Login to ECR:

   ```bash
   aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 962000089613.dkr.ecr.us-west-2.amazonaws.com
   ```

3. Build and push (ensure linux/amd64 platform so Lightsail can run it):

   ```bash
   docker buildx build --platform linux/amd64 -f Dockerfile.production -t "$ECR" --push .
   ```

Notes:
- On M1/Mac use `--platform linux/amd64` (or configure a buildx builder) so the image runs on x86.
- If `vite` can’t find the client entry during the Docker build, ensure `package.json` runs `vite build` from the `client/` directory and outputs to `dist/public`.

## Create Lightsail Deployment (CLI)

1. Create the containers JSON (replace `<DB_URL>`):

   ```json
   {
     "allstarteams-app": {
       "image": "962000089613.dkr.ecr.us-west-2.amazonaws.com/hi-replit-app:<TAG>",
       "ports": {"8080":"HTTP"},
       "environment": {
         "NODE_ENV": "production",
         "DATABASE_URL": "<DB_URL>"
       }
     }
   }
   ```

2. Public endpoint JSON (health path):

   ```json
   {
     "containerName":"allstarteams-app",
     "containerPort":8080,
     "healthCheck":{"healthyThreshold":3,"unhealthyThreshold":3,"timeoutSeconds":10,"intervalSeconds":30,"path":"/health","successCodes":"200-399"}
   }
   ```

3. Create deployment:

   ```bash
   aws lightsail create-container-service-deployment --service-name hi-replit-v2 --containers file:///tmp/containers.json --public-endpoint file:///tmp/public-endpoint.json
   ```

## Environment handling (critical)

- Database URL must include TLS: prefer `?sslmode=verify-full` or `?ssl=true`.
  - Example: `postgresql://USER:PASS@db-host.rds.amazonaws.com:5432/dbname?sslmode=verify-full`
- Do not set `NODE_TLS_REJECT_UNAUTHORIZED=0` in production — this is insecure. Remove it from env.
- For custom CA, place PEM files in `certs/` and the Dockerfile will copy them and set `NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt`.
- Imaginal Agility / IA features may require a separate key (`OPENAI_KEY_IA`) and project id (`IMAGINAL_AGILITY_PROJECT_ID`). Make sure these are present in the container environment.

## Verification commands

- Deployment state:
  - `aws lightsail get-container-service-deployments --service-name hi-replit-v2 --output json`
  - Look at `.containerService.nextDeployment.state` and `.containerService.currentDeployment.state`.
- Tail logs:
  - `aws lightsail get-container-service-logs --service-name hi-replit-v2 --container-name allstarteams-app --start-time "$(python3 -c "from datetime import datetime,timedelta;print((datetime.utcnow()-timedelta(minutes=15)).replace(microsecond=0).isoformat()+'Z')")"`
- Health check:
  - `curl -v https://app2.heliotropeimaginal.com/health`
- Check image in ECR:
  - `aws ecr describe-images --repository-name hi-replit-app --image-ids imageTag=<TAG> --region us-west-2`

## Diagnosing report/IA failures (example symptom)

- Symptom: front-end POST to `/api/reports/holistic/generate` returns `504 Gateway Timeout`, followed by client error parsing HTML as JSON: `SyntaxError: Unexpected token '<'`.

Root causes to check:
- Missing/placeholder `DATABASE_URL` → `ERR_INVALID_URL` in server logs.
- Missing `OPENAI_KEY_IA` or other IA key → IA calls fail or hang.
- Long-running synchronous work (report generation) → exceed Lightsail/load-balancer timeout.
- External API (OpenAI) auth errors (401/403) or rate limits.

Immediate diagnostic steps:

1. Fetch recent logs and grep for IA/OpenAI errors:

   ```bash
   aws lightsail get-container-service-logs --service-name hi-replit-v2 --container-name allstarteams-app --start-time "$(python3 -c "from datetime import datetime,timedelta;print((datetime.utcnow()-timedelta(minutes=15)).replace(microsecond=0).isoformat()+'Z')")" --output text | rg -i "openai|imaginal|holistic|report|ERROR|504|401|403|timeout|rate limit"
   ```

2. Reproduce the request with `curl` to capture response body and headers:

   ```bash
   curl -v -H "Content-Type: application/json" -X POST https://app2.heliotropeimaginal.com/api/reports/holistic/generate -d '{"sample":"payload"}'
   ```

3. Check deployment env for IA keys:

   ```bash
   aws lightsail get-container-service-deployments --service-name hi-replit-v2 --output json | jq -r '.containerService.currentDeployment.containers["allstarteams-app"].environment'
   ```

## Short-term fixes

- Make report generation asynchronous: return `202 Accepted` + job id and process in a background worker (Redis/Bull, or AWS SQS + worker). Client polls status or uses websocket.
- Ensure the route always returns JSON error responses, never HTML error pages.
- Add timeouts and fail-fast behavior on external AI calls; add retries with backoff.
- If necessary temporarily, extend the server/load-balancer timeout — but prefer background jobs.

## Long-term / automation

- Add GitHub Actions workflow to build, push, and create a Lightsail deployment on push to `main` or `development`.
- Store secrets in repo secrets / AWS Secrets Manager and inject at deploy time.
- Track the last successful image tag in CI artifacts so rollbacks are simple.

## Troubleshooting checklist (quick)

- If a deployment fails with `ERR_INVALID_URL` or `Invalid URL` — check `DATABASE_URL` for placeholders.
- If IA features fail — ensure `OPENAI_KEY_IA` and `IMAGINAL_AGILITY_PROJECT_ID` are in the container env.
- If requests time out (504) — convert work to background jobs; inspect logs for blocking calls.
- To roll back: redeploy the previous working image tag from ECR using the same env.

---

Document maintained by: DevOps / Deployment automation notes. Add this file to `docs/` for team reference.

