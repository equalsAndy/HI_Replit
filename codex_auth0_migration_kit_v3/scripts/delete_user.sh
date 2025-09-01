#!/usr/bin/env bash
set -euo pipefail
: "${TENANT_DOMAIN:?TENANT_DOMAIN not set}"
: "${MGMT_TOKEN:?MGMT_TOKEN not set}"

AUTH0_USER_ID="${1:?Pass AUTH0_USER_ID (e.g., auth0|123)}"
CONFIRM="${2:-}"

if [[ "$CONFIRM" != "--yes" ]]; then
  echo "Refusing to delete without --yes"
  echo "Usage: $0 <AUTH0_USER_ID> --yes"
  exit 2
fi

echo "Deleting Auth0 user: ${AUTH0_USER_ID}"
curl -sS --fail -X DELETE "https://${TENANT_DOMAIN}/api/v2/users/${AUTH0_USER_ID}" \
  -H "Authorization: Bearer ${MGMT_TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n"
