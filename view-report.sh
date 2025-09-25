#!/bin/bash

# View the generated report for User 65
echo "📊 Checking report status for User 65..."
echo ""

# Get report status
curl -X GET "http://localhost:8080/api/reports/holistic/test-status/personal/65" | jq '.'

echo ""
echo "🔍 Report ID: b48e05b3-06a8-4edd-835e-1ace92bd25ef"
echo ""
echo "To view the report, open: http://localhost:8080/api/reports/holistic/test-view/personal/65"
