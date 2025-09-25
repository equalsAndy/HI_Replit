#!/bin/bash

echo "🔧 Setting up User 1 for proper OpenAI testing..."

# Update user to completed status
echo "📝 Updating user 1 workshop completion status..."
curl -X POST http://localhost:8080/debug/complete-workshop/1 2>/dev/null || echo "Debug endpoint not available"

# Alternative: Direct database update via API (if available)
echo "🗄️ Attempting database update..."
curl -X POST http://localhost:8080/admin/update-user \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "ast_workshop_completed": true}' 2>/dev/null || echo "Admin endpoint not available"

echo ""
echo "✅ If successful, User 1 should now trigger OpenAI assistant instead of mock data"
echo "🧪 Let's test again..."

# Test report generation again
curl -X POST http://localhost:8080/api/reports/holistic/test-generate \
  -H "Content-Type: application/json" \
  -d '{"reportType": "personal", "userId": 1}' \
  2>/dev/null

echo ""
echo "📊 Check server logs - you should now see:"
echo "  - 🔍 [TRANSFORM DEBUG] lines (data transformation)"  
echo "  - 🔍 [REPORT DEBUG] lines (OpenAI assistant interaction)"
