#!/bin/bash

# Extract the full personalReport content to a file for easy reading
echo "📄 Extracting full OpenAI content from database..."
echo ""

PGPASSWORD='HeliotropeDev2025' psql -h ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com -U dbmasteruser -d postgres -t -c "
SELECT report_data->>'personalReport' 
FROM holistic_reports 
WHERE user_id = 49 
ORDER BY generated_at DESC 
LIMIT 1;
" > /Users/bradtopliff/Desktop/HI_Replit/openai-content-raw.txt

echo "✅ OpenAI content saved to: /Users/bradtopliff/Desktop/HI_Replit/openai-content-raw.txt"
echo ""
echo "📊 Quick stats:"
wc -w /Users/bradtopliff/Desktop/HI_Replit/openai-content-raw.txt
echo ""
echo "Preview (first 500 chars):"
head -c 500 /Users/bradtopliff/Desktop/HI_Replit/openai-content-raw.txt
echo ""
echo ""
echo "To view full content: cat /Users/bradtopliff/Desktop/HI_Replit/openai-content-raw.txt"
