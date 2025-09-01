#!/usr/bin/env bash
set -euo pipefail
: "${TENANT_DOMAIN:?TENANT_DOMAIN not set}"
: "${MGMT_CLIENT_ID:?MGMT_CLIENT_ID not set}"
: "${MGMT_CLIENT_SECRET:?MGMT_CLIENT_SECRET not set}"
: "${MGMT_AUDIENCE:?MGMT_AUDIENCE not set}"

curl -sS --fail -X POST "https://${TENANT_DOMAIN}/oauth/token" \
  -H "content-type: application/json" \
  -d @- <<JSON
{
  "client_id":   "${MGMT_CLIENT_ID}",
  "client_secret":"${MGMT_CLIENT_SECRET}",
  "audience":    "${MGMT_AUDIENCE}",
  "grant_type":  "client_credentials"
}
JSON
