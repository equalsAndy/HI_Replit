-- Migration 0003: Add holistic reports system
-- This migration creates the infrastructure for storing holistic reports

-- Create holistic_reports table for storing generated PDF reports
CREATE TABLE holistic_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('standard', 'personal')),
  report_data JSONB NOT NULL, -- Store the raw data used to generate the report
  pdf_file_path VARCHAR(500), -- Path to the stored PDF file
  pdf_file_name VARCHAR(255), -- Original filename for download
  pdf_file_size INTEGER, -- File size in bytes
  generation_status VARCHAR(20) DEFAULT 'pending' CHECK (generation_status IN ('pending', 'generating', 'completed', 'failed')),
  generated_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  error_message TEXT, -- Store error details if generation fails
  generated_by_user_id INTEGER REFERENCES users(id), -- Track who triggered generation
  star_card_image_path VARCHAR(500), -- Path to the star card PNG used in report
  
  -- Ensure only one report per user per type
  CONSTRAINT unique_user_report_type UNIQUE (user_id, report_type)
);

-- Add indexes for efficient queries
CREATE INDEX idx_holistic_reports_user_id ON holistic_reports(user_id);
CREATE INDEX idx_holistic_reports_status ON holistic_reports(generation_status);
CREATE INDEX idx_holistic_reports_type ON holistic_reports(report_type);
CREATE INDEX idx_holistic_reports_generated_at ON holistic_reports(generated_at);

-- Update user_workshop_progress to track holistic report availability
ALTER TABLE user_workshop_progress 
ADD COLUMN holistic_reports_unlocked BOOLEAN DEFAULT false,
ADD COLUMN standard_report_generated BOOLEAN DEFAULT false,
ADD COLUMN personal_report_generated BOOLEAN DEFAULT false,
ADD COLUMN reports_unlocked_at TIMESTAMP;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_holistic_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_holistic_reports_updated_at
  BEFORE UPDATE ON holistic_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_holistic_reports_updated_at();

-- Add comments for documentation
COMMENT ON TABLE holistic_reports IS 'Stores generated holistic reports for AST workshop participants';
COMMENT ON COLUMN holistic_reports.report_type IS 'Type of report: standard (shareable) or personal (private with reflections)';
COMMENT ON COLUMN holistic_reports.report_data IS 'JSON data used to generate the report including assessments, reflections, etc.';
COMMENT ON COLUMN holistic_reports.pdf_file_path IS 'Server path to the generated PDF file';
COMMENT ON COLUMN holistic_reports.generation_status IS 'Current status of report generation process';
COMMENT ON COLUMN holistic_reports.star_card_image_path IS 'Path to the star card PNG image embedded in the report';