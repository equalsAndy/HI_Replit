#!/bin/bash

echo "🔍 Checking OpenAI API key environment variables..."

# Test if the API key is loaded in the server environment
curl -s "http://localhost:8080/debug/env-check" 2>/dev/null || echo "Debug endpoint not available"

# Test OpenAI API key directly
echo "🧪 Testing OpenAI API key validation..."
curl -X POST http://localhost:8080/debug/test-openai-key \
  -H "Content-Type: application/json" 2>/dev/null || echo "OpenAI test endpoint not available"

# Test the report generation again after restart
echo "🎯 Testing User 65 report generation after environment fix..."
curl -X POST http://localhost:8080/api/reports/holistic/test-generate \
  -H "Content-Type: application/json" \
  -d '{"reportType": "personal", "userId": 65}' \
  -s | jq .

echo ""
echo "📊 Check server logs for:"
echo "  - OpenAI API key validation"
echo "  - 🔍 [REPORT DEBUG] lines showing OpenAI assistant interaction"
echo "  - Actual report generation instead of fallback"
