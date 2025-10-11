#!/bin/bash

# Test script for holistic report data fix
# Tests the transformer with proper data structure

echo "🧪 Testing Holistic Report Data Fix"
echo "===================================="
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test user 65 (Millie Millie)
USER_ID=65
REPORT_TYPE="personal"

echo -e "${YELLOW}📋 Test Configuration:${NC}"
echo "  User ID: $USER_ID"
echo "  Report Type: $REPORT_TYPE"
echo "  API Endpoint: http://localhost:8080/api/reports/holistic/test-generate"
echo ""

echo -e "${YELLOW}🚀 Generating report...${NC}"
echo ""

# Generate report
RESPONSE=$(curl -s -X POST http://localhost:8080/api/reports/holistic/test-generate \
  -H "Content-Type: application/json" \
  -d "{\"userId\": $USER_ID, \"reportType\": \"$REPORT_TYPE\"}")

echo "$RESPONSE" | jq '.'

# Check if successful
if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  REPORT_ID=$(echo "$RESPONSE" | jq -r '.reportId')
  echo ""
  echo -e "${GREEN}✅ Report generated successfully!${NC}"
  echo "   Report ID: $REPORT_ID"
  echo ""
  
  # Get report status
  echo -e "${YELLOW}📊 Checking report status...${NC}"
  STATUS_RESPONSE=$(curl -s "http://localhost:8080/api/reports/holistic/test-status/$REPORT_TYPE/$USER_ID")
  echo "$STATUS_RESPONSE" | jq '.'
  
  echo ""
  echo -e "${YELLOW}📈 Analyzing report content...${NC}"
  
  # Query database for report details
  QUERY="SELECT 
    LENGTH(html_content) as html_length,
    LENGTH(report_data::text) as data_length,
    (report_data::json->'professionalProfile')::text as content_preview
  FROM holistic_reports 
  WHERE id = '$REPORT_ID'"
  
  echo "  SQL Query: $QUERY"
  echo ""
  
  # Execute query and show results
  PGPASSWORD=$DATABASE_PASSWORD psql -h $DATABASE_HOST -U $DATABASE_USER -d $DATABASE_NAME -c "$QUERY"
  
  echo ""
  echo -e "${GREEN}🎉 Test Complete!${NC}"
  echo ""
  echo -e "${YELLOW}📝 To view the report:${NC}"
  echo "   HTML: http://localhost:8080/api/reports/holistic/test-view/$REPORT_TYPE/$USER_ID"
  echo "   PDF:  http://localhost:8080/api/reports/holistic/test-download/$REPORT_TYPE/$USER_ID"
  
else
  echo ""
  echo -e "${RED}❌ Report generation failed${NC}"
  echo "   Response: $RESPONSE"
  exit 1
fi
