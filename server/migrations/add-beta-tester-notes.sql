-- Add beta tester notes system
-- Migration: Add beta tester notes system

-- Create table for beta tester workshop notes
CREATE TABLE IF NOT EXISTS beta_tester_notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workshop_type VARCHAR(10) NOT NULL CHECK (workshop_type IN ('ast', 'ia')),
    
    -- Context information
    page_title VARCHAR(255) NOT NULL,
    step_id VARCHAR(50),
    module_name VARCHAR(255),
    question_context TEXT,
    url_path VARCHAR(500),
    
    -- Note content
    note_content TEXT NOT NULL,
    note_type VARCHAR(50) DEFAULT 'general' CHECK (note_type IN ('general', 'bug', 'improvement', 'question', 'suggestion')),
    
    -- Technical context
    browser_info JSONB,
    system_info JSONB,
    
    -- Status tracking
    is_submitted BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_beta_tester_notes_user_id ON beta_tester_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_tester_notes_workshop_type ON beta_tester_notes(workshop_type);
CREATE INDEX IF NOT EXISTS idx_beta_tester_notes_submitted ON beta_tester_notes(is_submitted);
CREATE INDEX IF NOT EXISTS idx_beta_tester_notes_created_at ON beta_tester_notes(created_at);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_beta_tester_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_beta_tester_notes_updated_at
    BEFORE UPDATE ON beta_tester_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_beta_tester_notes_updated_at();

-- Add comment
COMMENT ON TABLE beta_tester_notes IS 'Stores workshop feedback notes from beta testers throughout their workshop experience';