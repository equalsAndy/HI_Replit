#!/bin/bash

# Auth0 Debugging Script
echo "🔍 AUTH0 DEBUGGING SCRIPT"
echo "========================="

# Check if server is running
echo "1. Testing if server is running..."
curl -s http://localhost:8080/health > /dev/null
if [ $? -eq 0 ]; then
  echo "✅ Server is running on port 8080"
else
  echo "❌ Server is not responding on port 8080"
  exit 1
fi

echo ""
echo "2. Testing auth endpoints..."

# Test each auth endpoint
endpoints=(
  "/api/auth/auth0-session"
  "/api/auth/session"  
  "/api/auth0/auth0-session"
  "/api/auth0/session"
  "/api/auth0-session"
  "/api/session"
)

echo "Expected: 401 Unauthorized (routes working)"
echo "Actual results:"

for endpoint in "${endpoints[@]}"; do
  response_code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:8080${endpoint}" -H "Content-Type: application/json")
  if [ "$response_code" = "401" ]; then
    echo "✅ ${endpoint} -> ${response_code} (WORKING - needs auth header)"
  elif [ "$response_code" = "404" ]; then
    echo "❌ ${endpoint} -> ${response_code} (BROKEN - route not found)"
  else
    echo "⚠️  ${endpoint} -> ${response_code} (UNEXPECTED)"
  fi
done

echo ""
echo "3. Testing /api/auth/me endpoint..."
me_response_code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8080/api/auth/me")
if [ "$me_response_code" = "401" ]; then
  echo "✅ /api/auth/me -> ${me_response_code} (WORKING - needs authentication)"
elif [ "$me_response_code" = "404" ]; then
  echo "❌ /api/auth/me -> ${me_response_code} (BROKEN - route not found)"
else
  echo "⚠️  /api/auth/me -> ${me_response_code} (UNEXPECTED)"
fi

echo ""
echo "4. Summary:"
echo "If you see ❌ 404 errors above, the routes are not being mounted properly."
echo "If you see ✅ 401 errors above, the routes exist but need authentication."
echo "The 404 errors indicate a server-side routing issue, not an Auth0 issue."
