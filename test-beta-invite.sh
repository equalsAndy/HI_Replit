#!/bin/bash

echo "=== Testing Beta Tester Invite Flow ==="

# Step 1: Create a test invite with beta tester status
echo "1. Creating test invite with beta tester status..."

# Login first
SESSION_ID=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin","password":"Heliotrope@2025"}' \
  http://localhost:8080/api/auth/login \
  -c /tmp/session_cookies.txt \
  | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4)

if [ -z "$SESSION_ID" ]; then
  echo "❌ Login failed"
  exit 1
fi

echo "✅ Logged in successfully"

# Create invite
INVITE_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -b /tmp/session_cookies.txt \
  -d '{
    "email": "betatest@example.com",
    "role": "participant", 
    "name": "Beta Tester",
    "isBetaTester": true
  }' \
  http://localhost:8080/api/admin/invites)

echo "Invite creation response: $INVITE_RESPONSE"

# Extract invite code from response
INVITE_CODE=$(echo "$INVITE_RESPONSE" | grep -o '"inviteCode":"[^"]*"' | cut -d'"' -f4)

if [ -z "$INVITE_CODE" ]; then
  echo "❌ Failed to create invite"
  exit 1
fi

echo "✅ Created invite with code: $INVITE_CODE"

# Step 2: Validate the invite to see if beta tester status is returned
echo "2. Validating invite to check beta tester status..."

VALIDATE_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{\"inviteCode\": \"$INVITE_CODE\"}" \
  http://localhost:8080/api/auth/validate-invite)

echo "Validation response: $VALIDATE_RESPONSE"

# Check if isBetaTester is true in the response
if echo "$VALIDATE_RESPONSE" | grep -q '"isBetaTester":true'; then
  echo "✅ Beta tester status correctly returned in validation"
else
  echo "❌ Beta tester status NOT found in validation response"
fi

echo "=== Test Complete ==="