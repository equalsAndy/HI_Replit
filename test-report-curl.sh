#!/bin/bash

# Simple test script using curl
# Tests holistic report generation for user 65

echo "🧪 Testing Holistic Report Data Fix"
echo "===================================="
echo ""

USER_ID=65
REPORT_TYPE="personal"

echo "📋 Test Configuration:"
echo "  User ID: $USER_ID"
echo "  Report Type: $REPORT_TYPE"
echo ""

echo "🚀 Generating report..."
echo ""

# Generate report
curl -X POST http://localhost:8080/api/reports/holistic/test-generate \
  -H "Content-Type: application/json" \
  -d "{\"userId\": $USER_ID, \"reportType\": \"$REPORT_TYPE\"}" \
  -w "\n\n"

echo ""
echo "📝 To view the report:"
echo "   HTML: http://localhost:8080/api/reports/holistic/test-view/$REPORT_TYPE/$USER_ID"
echo ""
echo "🔍 Check server logs for:"
echo "   ✅ \"🔧 [DATA FIX] Participant name: Millie Millie\""
echo "   ✅ \"🔍 [TRANSFORM DEBUG] Leading strengths: [ 'acting', 'planning' ]\""
echo "   ✅ \"🔍 [REPORT DEBUG] Response length: >5000\""
