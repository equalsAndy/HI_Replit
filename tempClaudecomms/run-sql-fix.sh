#\!/bin/bash
# Run the SQL script to create workshop_step_data table

# Load environment variables
source /Users/bradtopliff/Desktop/HI_Replit/server/.env.development

# Run the SQL script
psql "$DATABASE_URL" -f /Users/bradtopliff/Desktop/HI_Replit/tempClaudecomms/fix-workshop-step-data-table.sql

echo "SQL script executed. Check for any errors above."
