#!/bin/bash

# Check the actual report content in the database
echo "🔍 Analyzing report content for User 65..."
echo ""

# Connect to database and get report details
PGPASSWORD='HeliotropeDev2025' psql -h ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com -U dbmasteruser -d postgres -c "
SELECT 
    id,
    user_id,
    report_type,
    generation_status,
    LENGTH(html_content) as html_length,
    LENGTH(report_data::text) as data_length,
    pdf_file_name,
    generated_at,
    SUBSTRING(html_content, 1, 500) as html_preview
FROM holistic_reports 
WHERE user_id = 65 
ORDER BY generated_at DESC 
LIMIT 1;
"

echo ""
echo "✅ Analysis complete!"
