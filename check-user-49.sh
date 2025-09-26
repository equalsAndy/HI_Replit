#!/bin/bash

# Check database content for user 49
echo "🔍 Checking database storage for User 49..."
echo ""

PGPASSWORD='HeliotropeDev2025' psql -h ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com -U dbmasteruser -d postgres -c "
SELECT 
    id,
    user_id,
    report_type,
    generation_status,
    LENGTH(html_content) as html_length,
    LENGTH(report_data->>'personalReport') as personal_report_length,
    SUBSTRING(report_data->>'personalReport', 1, 200) as personal_report_preview,
    generated_at
FROM holistic_reports 
WHERE user_id = 49 
ORDER BY generated_at DESC 
LIMIT 1;
"

echo ""
echo "✅ Check complete!"
