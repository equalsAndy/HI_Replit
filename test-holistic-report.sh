#!/bin/bash

# Test Holistic Report Generation for User 65
echo "🧪 Testing holistic report generation for User 65..."
echo ""

# Generate report
echo "📝 Generating personal report..."
curl -X POST http://localhost:8080/api/reports/holistic/test-generate \
  -H "Content-Type: application/json" \
  -d '{"userId": 65, "reportType": "personal"}' \
  | jq '.'

echo ""
echo "✅ Test complete!"
