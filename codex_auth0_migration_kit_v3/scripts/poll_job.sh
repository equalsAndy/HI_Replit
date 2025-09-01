#!/usr/bin/env bash
set -euo pipefail
: "${TENANT_DOMAIN:?TENANT_DOMAIN not set}"
: "${MGMT_TOKEN:?MGMT_TOKEN not set}"

JOB_ID="${1:?Pass JOB_ID}"
while true; do
  resp=$(curl -sS --fail -H "Authorization: Bearer ${MGMT_TOKEN}" "https://${TENANT_DOMAIN}/api/v2/jobs/${JOB_ID}")
  status=$(echo "$resp" | jq -r '.status')
  echo "$resp" | jq . > .poll_job_last.json
  echo "status: $status"
  if [[ "$status" == "completed" || "$status" == "failed" ]]; then
    echo "$resp"
    break
  fi
  sleep 3
done
