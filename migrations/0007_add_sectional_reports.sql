-- Migration 0007: Add sectional report generation system
-- This migration adds support for section-by-section report generation with progress tracking

-- Create report_sections table for storing individual report sections
CREATE TABLE report_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('ast_personal', 'ast_professional')),
  section_id INTEGER NOT NULL CHECK (section_id >= 0 AND section_id <= 5),
  section_name VARCHAR(100) NOT NULL,
  section_title VARCHAR(200),
  section_content TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  generation_attempts INTEGER DEFAULT 0,

  -- Ensure only one section per user per report type per section
  CONSTRAINT unique_user_report_section UNIQUE (user_id, report_type, section_id)
);

-- Add generation_mode column to holistic_reports to distinguish between traditional and sectional generation
ALTER TABLE holistic_reports
ADD COLUMN generation_mode VARCHAR(20) DEFAULT 'traditional' CHECK (generation_mode IN ('traditional', 'sectional')),
ADD COLUMN sectional_progress INTEGER DEFAULT 0 CHECK (sectional_progress >= 0 AND sectional_progress <= 100),
ADD COLUMN total_sections INTEGER DEFAULT 6,
ADD COLUMN sections_completed INTEGER DEFAULT 0,
ADD COLUMN sections_failed INTEGER DEFAULT 0;

-- Create indexes for efficient queries
CREATE INDEX idx_report_sections_user_id ON report_sections(user_id);
CREATE INDEX idx_report_sections_status ON report_sections(status);
CREATE INDEX idx_report_sections_user_report_type ON report_sections(user_id, report_type);
CREATE INDEX idx_report_sections_section_id ON report_sections(section_id);
CREATE INDEX idx_report_sections_created_at ON report_sections(created_at);
CREATE INDEX idx_report_sections_completed_at ON report_sections(completed_at);

-- Create composite index for progress tracking queries
CREATE INDEX idx_report_sections_progress_tracking ON report_sections(user_id, report_type, status, section_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_report_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  -- Set completed_at when status changes to completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_report_sections_updated_at
  BEFORE UPDATE ON report_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_report_sections_updated_at();

-- Create function to update holistic_reports progress when sections change
CREATE OR REPLACE FUNCTION update_holistic_report_progress()
RETURNS TRIGGER AS $$
DECLARE
  completed_count INTEGER;
  failed_count INTEGER;
  total_count INTEGER;
  progress_percentage INTEGER;
BEGIN
  -- Count sections for this user and report type
  SELECT
    COUNT(*) FILTER (WHERE status = 'completed'),
    COUNT(*) FILTER (WHERE status = 'failed'),
    COUNT(*)
  INTO completed_count, failed_count, total_count
  FROM report_sections
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
    AND report_type = COALESCE(NEW.report_type, OLD.report_type);

  -- Calculate progress percentage
  progress_percentage := CASE
    WHEN total_count = 0 THEN 0
    ELSE (completed_count * 100) / total_count
  END;

  -- Update holistic_reports table
  UPDATE holistic_reports
  SET
    sections_completed = completed_count,
    sections_failed = failed_count,
    sectional_progress = progress_percentage,
    updated_at = NOW()
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
    AND report_type = COALESCE(NEW.report_type, OLD.report_type)
    AND generation_mode = 'sectional';

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_holistic_report_progress
  AFTER INSERT OR UPDATE OR DELETE ON report_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_holistic_report_progress();

-- Create view for easy progress monitoring
CREATE VIEW report_generation_progress AS
SELECT
  hr.id as report_id,
  hr.user_id,
  hr.report_type,
  hr.generation_mode,
  hr.generation_status,
  hr.sectional_progress,
  hr.sections_completed,
  hr.sections_failed,
  hr.total_sections,
  CASE
    WHEN hr.generation_mode = 'sectional' THEN
      CASE
        WHEN hr.sectional_progress = 100 THEN 'completed'
        WHEN hr.sections_failed > 0 THEN 'partial_failure'
        WHEN hr.sectional_progress > 0 THEN 'in_progress'
        ELSE 'pending'
      END
    ELSE hr.generation_status
  END as overall_status,
  hr.generated_at,
  hr.updated_at
FROM holistic_reports hr;

-- Add comments for documentation
COMMENT ON TABLE report_sections IS 'Stores individual sections of reports generated using the sectional approach';
COMMENT ON COLUMN report_sections.section_id IS 'Section number (0-5): 0=introduction, 1=strengths_imagination, 2=flow_experiences, 3=strengths_flow_together, 4=wellbeing_future_self, 5=collaboration_closing';
COMMENT ON COLUMN report_sections.section_name IS 'Internal name identifier for the section (e.g., "strengths_imagination")';
COMMENT ON COLUMN report_sections.section_title IS 'Human-readable title for the section';
COMMENT ON COLUMN report_sections.section_content IS 'Generated content for this section (markdown/HTML)';
COMMENT ON COLUMN report_sections.metadata IS 'Additional metadata like generation parameters, quality scores, etc.';
COMMENT ON COLUMN report_sections.generation_attempts IS 'Number of times generation was attempted for this section';
COMMENT ON COLUMN holistic_reports.generation_mode IS 'Mode used for generation: traditional (single call) or sectional (section-by-section)';
COMMENT ON COLUMN holistic_reports.sectional_progress IS 'Progress percentage for sectional generation (0-100)';
COMMENT ON VIEW report_generation_progress IS 'Consolidated view of report generation progress for both traditional and sectional modes';