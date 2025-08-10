-- Feedback System Tables
-- Creates tables for user feedback, beta tester notes, and beta surveys

-- General feedback table (yellow button submissions)
CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  page_context VARCHAR(255), -- Which page the feedback was from
  feedback_text TEXT NOT NULL,
  priority_level VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
  status VARCHAR(20) DEFAULT 'open', -- open, in_progress, resolved, closed
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Beta tester notes (workshop-specific contextual notes)
CREATE TABLE IF NOT EXISTS beta_tester_notes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workshop_type VARCHAR(20), -- 'ast' or 'ia'
  step_id VARCHAR(20), -- e.g., '1-1', '2-3', 'ia-1-1'
  note_content TEXT NOT NULL,
  note_type VARCHAR(50) DEFAULT 'general', -- general, bug, suggestion, question
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Beta survey responses (final comprehensive surveys)
CREATE TABLE IF NOT EXISTS beta_surveys (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Star ratings (1-5 scale)
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  authenticity_rating INTEGER CHECK (authenticity_rating >= 1 AND authenticity_rating <= 5),
  recommendation_rating INTEGER CHECK (recommendation_rating >= 1 AND recommendation_rating <= 5),
  
  -- Rose/Bud/Thorn responses
  rose_response TEXT, -- What went well
  bud_response TEXT, -- What has potential
  thorn_response TEXT, -- What was challenging
  
  -- Professional application
  professional_application TEXT,
  
  -- Improvements and suggestions
  suggested_improvements TEXT,
  
  -- What they'd like to hear more about (the missing field)
  interests TEXT, -- Can be JSON array or simple text
  
  -- Final comments
  final_comments TEXT,
  
  -- Survey metadata
  completed_at TIMESTAMP DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Add beta tester flag to users table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='is_beta_tester') THEN
    ALTER TABLE users ADD COLUMN is_beta_tester BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add has_seen_beta_welcome flag to users table if not exists  
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='users' AND column_name='has_seen_beta_welcome') THEN
    ALTER TABLE users ADD COLUMN has_seen_beta_welcome BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);

CREATE INDEX IF NOT EXISTS idx_beta_notes_user_id ON beta_tester_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_notes_workshop_type ON beta_tester_notes(workshop_type);
CREATE INDEX IF NOT EXISTS idx_beta_notes_created_at ON beta_tester_notes(created_at);

CREATE INDEX IF NOT EXISTS idx_beta_surveys_user_id ON beta_surveys(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_surveys_completed_at ON beta_surveys(completed_at);

-- Insert sample data for testing (optional)
-- This helps admins see the interface with data
-- Note: Only insert if tables are empty to avoid duplicates

DO $$
BEGIN
  -- Sample feedback (only if no feedback exists)
  IF (SELECT COUNT(*) FROM feedback) = 0 THEN
    INSERT INTO feedback (user_id, page_context, feedback_text, priority_level, status) VALUES
    (1, 'AST Dashboard', 'The navigation could be more intuitive', 'medium', 'open'),
    (16, 'Star Card Generation', 'Love the visual design but the loading is slow', 'low', 'open');
  END IF;
  
  -- Sample beta notes (only if no notes exist)
  IF (SELECT COUNT(*) FROM beta_tester_notes) = 0 THEN
    INSERT INTO beta_tester_notes (user_id, workshop_type, step_id, note_content, note_type) VALUES
    (16, 'ast', '1-1', 'The introduction video was very engaging', 'general'),
    (16, 'ast', '2-3', 'Had trouble with the flow assessment on mobile', 'bug');
  END IF;
  
  -- Sample beta survey (only if no surveys exist)  
  IF (SELECT COUNT(*) FROM beta_surveys) = 0 THEN
    INSERT INTO beta_surveys (
      user_id, quality_rating, authenticity_rating, recommendation_rating,
      rose_response, bud_response, thorn_response, 
      professional_application, suggested_improvements, interests, final_comments
    ) VALUES (
      16, 5, 4, 5,
      'The insights were incredibly accurate and helpful',
      'More integration with team workflows',
      'Some technical glitches during assessment',
      'Will use this for our quarterly team reviews',
      'Add mobile-first responsive design',
      '["Team dynamics", "Leadership development", "Flow optimization"]',
      'Overall excellent experience, looking forward to updates'
    );
  END IF;
END $$;

-- Update user 16 to be a beta tester if exists
UPDATE users SET is_beta_tester = true WHERE id = 16 AND EXISTS (SELECT 1 FROM users WHERE id = 16);

COMMIT;