#!/usr/bin/env bash
set -euo pipefail
: "${TENANT_DOMAIN:?TENANT_DOMAIN not set}"
: "${MGMT_TOKEN:?MGMT_TOKEN not set}"
: "${CONNECTION_ID:?CONNECTION_ID not set}"

# Role IDs from .env
: "${ROLE_ADMIN:?ROLE_ADMIN not set}"
: "${ROLE_FACILITATOR:?ROLE_FACILITATOR not set}"
: "${ROLE_PARTICIPANT:?ROLE_PARTICIPANT not set}"

# LEGACY_ROLE_PATH is a dot path into the Auth0 user JSON; default if unset
LEGACY_ROLE_PATH="${LEGACY_ROLE_PATH:-app_metadata.legacy_role}"

echo "Using LEGACY_ROLE_PATH='${LEGACY_ROLE_PATH}'"

# Turn "a.b.c" into ["a","b","c"] for jq getpath()
jq_path_array() {
  local IFS='.'; read -ra PARTS <<< "$1"
  local jq_arr="["
  local first=1
  for p in "${PARTS[@]}"; do
    [[ -z "$p" ]] && continue
    if [[ $first -eq 1 ]]; then first=0; else jq_arr+=", "; fi
    jq_arr+="\"$p\""
  done
  jq_arr+="]"
  echo "$jq_arr"
}

JQ_PATH=$(jq -n --argjson arr "$(jq_path_array "$LEGACY_ROLE_PATH")" '$arr')

PAGE=0
PER_PAGE=50

while true; do
  resp=$(curl -sS --fail "https://${TENANT_DOMAIN}/api/v2/users" \
    -H "Authorization: Bearer ${MGMT_TOKEN}" \
    --get --data-urlencode "q=identities.connection:${CONNECTION_ID}" \
    --data-urlencode "search_engine=v3" \
    --data-urlencode "page=${PAGE}" \
    --data-urlencode "per_page=${PER_PAGE}")
  count=$(echo "$resp" | jq 'length')
  if [[ "$count" -eq 0 ]]; then
    echo "No more users." ; break
  fi

  echo "$resp" | jq -c '.[]' | while read -r user; do
    uid=$(echo "$user" | jq -r '.user_id')
    # get legacy role via getpath
    legacy_role=$(echo "$user" | jq -r --argjson p "$JQ_PATH" 'getpath($p) // empty')

    # default to participant when role missing
    role_id=""
    case "${legacy_role:-}" in
      admin) role_id="$ROLE_ADMIN" ;;
      facilitator) role_id="$ROLE_FACILITATOR" ;;
      participant|"") role_id="$ROLE_PARTICIPANT" ;;
      *) echo "Unknown legacy role '${legacy_role}' for ${uid}; assigning PARTICIPANT" >&2
         role_id="$ROLE_PARTICIPANT"
         ;;
    esac

    echo "Assigning ${legacy_role:-participant} (${role_id}) to ${uid}"
    curl -sS --fail -X POST "https://${TENANT_DOMAIN}/api/v2/users/${uid}/roles" \
      -H "Authorization: Bearer ${MGMT_TOKEN}" \
      -H "Content-Type: application/json" \
      -d "{\"roles\":[\"${role_id}\"]}" > /dev/null
    sleep 0.2
  done

  PAGE=$((PAGE+1))
done
