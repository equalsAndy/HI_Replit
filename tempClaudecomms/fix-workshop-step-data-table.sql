-- Create workshop_step_data table if it doesn't exist
CREATE TABLE IF NOT EXISTS workshop_step_data (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workshop_type VARCHAR(10) NOT NULL,
  step_id VARCHAR(20) NOT NULL,
  data JSONB NOT NULL,
  version INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, workshop_type, step_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workshop_step_data_user_workshop ON workshop_step_data(user_id, workshop_type);
CREATE INDEX IF NOT EXISTS idx_workshop_step_data_step ON workshop_step_data(step_id);
EOF < /dev/null