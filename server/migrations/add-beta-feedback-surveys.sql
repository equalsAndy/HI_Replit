-- Add Beta Feedback Surveys Table
-- Date: 2025-08-06
-- Description: Store final beta tester feedback surveys

CREATE TABLE IF NOT EXISTS beta_feedback_surveys (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  
  -- Rating questions (1-5 scale)
  overall_quality INTEGER NOT NULL CHECK (overall_quality >= 1 AND overall_quality <= 5),
  authenticity INTEGER NOT NULL CHECK (authenticity >= 1 AND authenticity <= 5),
  recommendation INTEGER NOT NULL CHECK (recommendation >= 1 AND recommendation <= 5),
  
  -- Rose, Bud, Thorn (text responses)
  rose TEXT,
  bud TEXT,
  thorn TEXT,
  
  -- Professional application
  professional_application TEXT,
  improvements TEXT,
  
  -- Interests (JSON array)
  interests JSONB,
  
  -- Final comments
  final_comments TEXT,
  
  -- Timestamps
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key constraint
  CONSTRAINT beta_feedback_surveys_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_beta_feedback_surveys_user_id ON beta_feedback_surveys(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_surveys_submitted_at ON beta_feedback_surveys(submitted_at);

-- Add comments for clarity
COMMENT ON TABLE beta_feedback_surveys IS 'Final beta tester feedback surveys collected at workshop completion';
COMMENT ON COLUMN beta_feedback_surveys.overall_quality IS 'Overall experience quality rating (1-5)';
COMMENT ON COLUMN beta_feedback_surveys.authenticity IS 'How authentic did Star Card/report feel (1-5)';
COMMENT ON COLUMN beta_feedback_surveys.recommendation IS 'Likelihood to recommend to colleague (1-5)';
COMMENT ON COLUMN beta_feedback_surveys.rose IS 'What worked really well';
COMMENT ON COLUMN beta_feedback_surveys.bud IS 'What has potential but needs development';
COMMENT ON COLUMN beta_feedback_surveys.thorn IS 'What was problematic or frustrating';
COMMENT ON COLUMN beta_feedback_surveys.interests IS 'JSON array of interest selections';