#!/bin/bash

# ⚠️ DEPRECATED: The /test-generate endpoint has been removed
# Use the authenticated /generate endpoint or database extraction scripts instead

echo "⚠️  This test script is deprecated!"
echo ""
echo "The /test-generate endpoint has been removed from the codebase."
echo "It was a broken development endpoint that didn't generate complete reports."
echo ""
echo "📋 Alternative Testing Methods:"
echo ""
echo "1️⃣  Use the authenticated endpoint (recommended):"
echo "   curl -X POST http://localhost:8080/api/reports/holistic/generate \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -H 'Cookie: HI_session_development=YOUR_SESSION_COOKIE' \\"
echo "     -d '{\"reportType\": \"personal\"}'"
echo ""
echo "2️⃣  Use database extraction scripts:"
echo "   ./check-user-49.sh      # Check what's stored"
echo "   ./export-html-report.sh # Extract HTML to view"
echo ""
echo "3️⃣  Use the admin dashboard:"
echo "   Generate reports through the web interface with proper authentication"
echo ""
echo "❌ Reason for removal:"
echo "   The test-generate endpoint was missing HTML generation steps,"
echo "   resulting in incomplete reports with no AI content displayed."
echo ""
