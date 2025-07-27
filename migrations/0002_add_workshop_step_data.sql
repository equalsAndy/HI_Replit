-- Migration: Add workshop_step_data table for IA workshop data persistence
-- Date: 2025-07-26
-- Purpose: Fix missing workshop_step_data table that was preventing IA workshop data from persisting

-- Create workshop_step_data table
CREATE TABLE IF NOT EXISTS workshop_step_data (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workshop_type VARCHAR(10) NOT NULL,
  step_id VARCHAR(20) NOT NULL,
  data JSONB NOT NULL,
  version INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create unique constraint to ensure one record per user/workshop/step
ALTER TABLE workshop_step_data 
ADD CONSTRAINT workshop_step_data_user_workshop_step_unique 
UNIQUE (user_id, workshop_type, step_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workshop_step_data_user_workshop 
ON workshop_step_data(user_id, workshop_type);

CREATE INDEX IF NOT EXISTS idx_workshop_step_data_step 
ON workshop_step_data(step_id);

-- Add trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workshop_step_data_updated_at 
    BEFORE UPDATE ON workshop_step_data 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();