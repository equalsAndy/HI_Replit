#!/bin/bash
# Production AI smoke test
# =========================
# Exercises the live AI endpoints on app2.heliotropeimaginal.com end to end.
#
# /api/ai/chat/plain is unauthenticated, so the five gateway-slotted IA exercises
# can be verified without a session. It is the same path a real exercise takes:
# resolve hi.<training_id> from the gateway -> dispatch on the resolved provider.
# A 200 with a non-empty reply proves the whole chain (gateway resolve + Bedrock
# dispatch + AWS creds) works in production, not just in dev.
#
# Usage: ./scripts/prod-ai-smoke-test.sh [base_url]

BASE="${1:-https://app2.heliotropeimaginal.com}"

echo "═══ Production AI smoke test ═══"
echo "target: $BASE"
printf 'version: '
curl -s -m 20 "$BASE/health" | python3 -c "import json,sys; d=json.load(sys.stdin); print(f\"{d['version']} ({d['environment']}) db={d['database']}\")" 2>/dev/null || echo "health unreachable"
echo

PASS=0; FAIL=0
for t in ia-4-2 ia-4-3 ia-4-4 ia-4-5 ia-4-7-synopsis; do
  printf '%-20s ' "$t"
  R=$(curl -s -m 90 -X POST "$BASE/api/ai/chat/plain" \
      -H 'Content-Type: application/json' \
      -d "{\"training_id\":\"$t\",\"messages\":[{\"role\":\"user\",\"content\":\"Reply with the single word OK.\"}]}" 2>&1)
  echo "$R" | python3 -c "
import json,sys
raw=sys.stdin.read()
try: d=json.loads(raw)
except Exception: print('❌ non-JSON:', raw[:110]); sys.exit(1)
if d.get('success'):
    print(f\"✅ {d.get('provider')}/{d.get('model')} -> {json.dumps(d.get('reply',''))[:44]}\")
else:
    print('❌', str(d.get('error'))[:110]); sys.exit(1)
" && PASS=$((PASS+1)) || FAIL=$((FAIL+1))
done

echo
echo "─── $PASS passed, $FAIL failed ───"
[ "$FAIL" -eq 0 ] || exit 1
