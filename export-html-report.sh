#!/bin/bash

# Fetch and save the HTML report directly from database
echo "📄 Fetching HTML report content from database..."
echo ""

PGPASSWORD='HeliotropeDev2025' psql -h ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com -U dbmasteruser -d postgres -t -c "
SELECT html_content 
FROM holistic_reports 
WHERE user_id = 65 
ORDER BY generated_at DESC 
LIMIT 1;
" > /Users/bradtopliff/Desktop/HI_Replit/report-output.html

echo "✅ Report saved to: /Users/bradtopliff/Desktop/HI_Replit/report-output.html"
echo ""
echo "Open the file in your browser to view the report:"
echo "open /Users/bradtopliff/Desktop/HI_Replit/report-output.html"
