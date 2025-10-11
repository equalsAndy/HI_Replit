-- Migration: Add HTML content support to holistic reports
-- Date: 2025-07-31
-- Description: Add html_content column to store HTML report content directly in database for container compatibility

-- Add html_content column to store HTML reports (replaces file system storage)
ALTER TABLE holistic_reports 
ADD COLUMN html_content TEXT;

-- Add comment for documentation
COMMENT ON COLUMN holistic_reports.html_content IS 'HTML content of the generated report (stored directly in database for container compatibility)';

-- Create index for efficient text searches if needed
CREATE INDEX idx_holistic_reports_html_content ON holistic_reports USING gin(to_tsvector('english', html_content));