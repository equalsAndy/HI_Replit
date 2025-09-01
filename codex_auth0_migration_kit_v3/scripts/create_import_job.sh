#!/usr/bin/env bash
set -euo pipefail
: "${TENANT_DOMAIN:?TENANT_DOMAIN not set}"
: "${MGMT_TOKEN:?MGMT_TOKEN not set}"
: "${CONNECTION_ID:?CONNECTION_ID not set}"

USERS_FILE="${1:-data/users.to_import.json}"
if [[ ! -f "$USERS_FILE" ]]; then
  echo "Users file not found: $USERS_FILE" >&2
  exit 1
fi

curl -sS --fail -X POST "https://${TENANT_DOMAIN}/api/v2/jobs/users-imports" \
  -H "Authorization: Bearer ${MGMT_TOKEN}" \
  -F "users=@${USERS_FILE};type=application/json" \
  -F "connection_id=${CONNECTION_ID}" \
  -F "upsert=true" \
  -F "send_completion_email=false"
