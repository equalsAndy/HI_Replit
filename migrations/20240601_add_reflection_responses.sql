-- Migration: add reflection_responses table for storing reflection answers
CREATE TABLE reflection_responses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reflection_set_id VARCHAR(100) NOT NULL,
  reflection_id VARCHAR(100) NOT NULL,
  response TEXT,
  completed BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, reflection_set_id, reflection_id)
);

CREATE INDEX idx_reflection_responses_user_set ON reflection_responses(user_id, reflection_set_id);
