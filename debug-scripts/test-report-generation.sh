#!/bin/bash

echo "🧪 Testing holistic report generation with enhanced logging..."

# Make sure development server is running
echo "📡 Testing server connection..."
curl -s http://localhost:8080/health > /dev/null
if [ $? -ne 0 ]; then
    echo "❌ Server not running on localhost:8080"
    echo "Please start your development server first with: npm run dev"
    exit 1
fi

echo "✅ Server is running"

# Test report generation
echo "🎯 Generating test report with enhanced logging..."
echo "This will show detailed logging of what's sent to OpenAI and what comes back"
echo ""

echo "📊 Calling test endpoint..."
curl -X POST http://localhost:8080/api/reports/holistic/test-generate \
  -H "Content-Type: application/json" \
  -d '{"reportType": "personal", "userId": 1}' \
  2>/dev/null

echo ""
echo ""
echo "📊 Check your development server logs for detailed debug information including:"
echo "  - Raw export data structure from database"
echo "  - Transformed input sent to OpenAI assistant" 
echo "  - OpenAI assistant response analysis (length, formatting, content preview)"
echo "  - Quality warnings and diagnostics"
echo ""
echo "The logs should show lines starting with:"
echo "  🔍 [TRANSFORM DEBUG] - Data transformation process"  
echo "  🔍 [REPORT DEBUG] - OpenAI API interaction and response analysis"
