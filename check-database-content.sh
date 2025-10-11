#!/bin/bash

# Check what's actually stored in the database for the report
echo "🔍 Checking database storage for OpenAI content..."
echo ""

PGPASSWORD='HeliotropeDev2025' psql -h ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com -U dbmasteruser -d postgres -c "
SELECT 
    id,
    user_id,
    report_type,
    generation_status,
    LENGTH(html_content) as html_length,
    LENGTH(report_data::text) as report_data_length,
    jsonb_typeof(report_data) as report_data_type,
    jsonb_object_keys(report_data) as report_data_keys,
    LENGTH(report_data->>'personalReport') as personal_report_length,
    LENGTH(report_data->>'professionalProfile') as professional_profile_length,
    SUBSTRING(report_data->>'personalReport', 1, 200) as personal_report_preview,
    SUBSTRING(report_data->>'professionalProfile', 1, 200) as professional_profile_preview
FROM holistic_reports 
WHERE user_id = 65 
ORDER BY generated_at DESC 
LIMIT 1;
"

echo ""
echo "✅ Check complete!"
