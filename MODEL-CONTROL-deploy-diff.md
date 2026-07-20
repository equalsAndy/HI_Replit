# Deploy diff — gateway env vars for model-control

Companion to `MODEL-CONTROL-INTEGRATION.md` §4. Two changes to
`deploy-to-production.sh`, mirroring exactly how the existing `AI_PROVIDER` /
`CLAUDE_MODEL` params are handled. **Prerequisite:** the two SSM parameters must
exist first (§4 step 2) — the fetch below tolerates a missing value so a deploy
won't hard-fail, but the container then runs unconfigured and every resolve
returns 401 / hits localhost.

## Change 1 — fetch from SSM

Add alongside the other `aws ssm get-parameter` lines (near lines 63–66, the
`AI_PROVIDER` block):

```diff
 AI_PROVIDER=$(aws ssm get-parameter --name "/prod/hi-replit/AI_PROVIDER" --with-decryption --query "Parameter.Value" --output text 2>/dev/null || echo "openai")
 AI_PROVIDER_IA=$(aws ssm get-parameter --name "/prod/hi-replit/AI_PROVIDER_IA" --with-decryption --query "Parameter.Value" --output text 2>/dev/null || echo "openai")
 CLAUDE_MODEL=$(aws ssm get-parameter --name "/prod/hi-replit/CLAUDE_MODEL" --with-decryption --query "Parameter.Value" --output text 2>/dev/null || echo "claude-haiku-4-5-20251001")
+# Model control plane (selfActual gateway). Both required for /api/model-control
+# resolution; without them the gateway client is unconfigured (isGatewayConfigured
+# → false) and AI features fall back to local env defaults.
+GATEWAY_BASE_URL=$(aws ssm get-parameter --name "/prod/hi-replit/GATEWAY_BASE_URL" --with-decryption --query "Parameter.Value" --output text 2>/dev/null || echo "https://api.selfactual.ai")
+GATEWAY_SERVICE_TOKEN=$(aws ssm get-parameter --name "/prod/hi-replit/GATEWAY_SERVICE_TOKEN" --with-decryption --query "Parameter.Value" --output text 2>/dev/null || echo "")
```

Note the defaults differ by intent: `GATEWAY_BASE_URL` defaults to the prod
gateway (safe, correct for prod); `GATEWAY_SERVICE_TOKEN` defaults to empty
(there is no safe default for a secret — an empty token simply leaves the client
unconfigured rather than sending a wrong one).

## Change 2 — pass into the container

Add to the `environment` block of `aws lightsail create-container-service-deployment`
(near lines 185–187, beside `AI_PROVIDER` / `CLAUDE_MODEL`):

```diff
         \"AI_PROVIDER\": \"${AI_PROVIDER}\",
         \"AI_PROVIDER_IA\": \"${AI_PROVIDER_IA}\",
         \"CLAUDE_MODEL\": \"${CLAUDE_MODEL}\",
+        \"GATEWAY_BASE_URL\": \"${GATEWAY_BASE_URL}\",
+        \"GATEWAY_SERVICE_TOKEN\": \"${GATEWAY_SERVICE_TOKEN}\",
```

## Verify after deploy

From anywhere, with the same token (do not print it):

```bash
curl -s -H "Authorization: Bearer $GATEWAY_SERVICE_TOKEN" \
     -H "x-sa-app: hi-replit" \
     https://api.selfactual.ai/api/model-control/resolve/hi.ia-collab
# expect: {"ok":true,"slot":"hi.ia-collab","modelId":"...","model":{...}}
# 401  → token missing/mismatched
# 404 on a real slot → base URL wrong (hitting something else)
```

## SSM parameter creation (reference, run once with the heliotrope profile)

```bash
aws ssm put-parameter --profile heliotrope --type String \
  --name /prod/hi-replit/GATEWAY_BASE_URL --value https://api.selfactual.ai

aws ssm put-parameter --profile heliotrope --type SecureString \
  --name /prod/hi-replit/GATEWAY_SERVICE_TOKEN --value '<token from selfActual, out-of-band>'
```
