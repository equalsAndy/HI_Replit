-- Migration 0009: Add raw_content column to report_sections
-- This migration adds support for storing raw OpenAI responses before RML processing
-- Allows for deferred RML processing at report viewing time instead of generation time

-- Add raw_content column to store unprocessed OpenAI responses
ALTER TABLE report_sections
ADD COLUMN raw_content TEXT;

-- Backfill existing records: copy section_content to raw_content
-- This is safe because existing records already have processed content
UPDATE report_sections
SET raw_content = section_content
WHERE raw_content IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN report_sections.raw_content IS 'Raw OpenAI-generated content before RML processing (markdown with RML tags)';
COMMENT ON COLUMN report_sections.section_content IS 'Processed content after RML rendering (HTML with visual components)';
