-- Migration 0004: AI Management System Phase 1 MVP
-- This migration creates the infrastructure for AI management and beta tester system

-- Create AI configuration table for managing AI feature settings
CREATE TABLE ai_configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_name VARCHAR(50) NOT NULL UNIQUE,
  enabled BOOLEAN DEFAULT true,
  rate_limit_per_hour INTEGER DEFAULT 100,
  rate_limit_per_day INTEGER DEFAULT 1000,
  max_tokens INTEGER DEFAULT 4000,
  timeout_ms INTEGER DEFAULT 30000,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_feature_name CHECK (feature_name IN ('global', 'coaching', 'holistic_reports', 'reflection_assistance'))
);

-- Create AI usage tracking table for monitoring API calls
CREATE TABLE ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feature_name VARCHAR(50) NOT NULL,
  api_call_count INTEGER DEFAULT 1,
  tokens_used INTEGER DEFAULT 0,
  response_time_ms INTEGER DEFAULT 0,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  cost_estimate DECIMAL(10,4) DEFAULT 0.0000, -- Estimated cost in USD
  timestamp TIMESTAMP DEFAULT NOW(),
  session_id VARCHAR(255), -- For grouping related calls
  
  CONSTRAINT valid_feature_name_logs CHECK (feature_name IN ('coaching', 'holistic_reports', 'reflection_assistance'))
);

-- Add beta tester functionality to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_beta_tester BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS beta_tester_granted_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS beta_tester_granted_by INTEGER REFERENCES users(id);

-- Add beta tester option to invites (check if column exists first)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invites' AND column_name = 'grant_beta_access') THEN
    ALTER TABLE invites ADD COLUMN grant_beta_access BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Insert default AI configuration
INSERT INTO ai_configuration (feature_name, enabled, rate_limit_per_hour, rate_limit_per_day, max_tokens, timeout_ms) VALUES
('global', true, 500, 5000, 4000, 30000),
('coaching', true, 100, 1000, 4000, 30000),
('holistic_reports', true, 10, 50, 8000, 60000),
('reflection_assistance', false, 50, 200, 2000, 20000)
ON CONFLICT (feature_name) DO NOTHING;

-- Create indexes for performance
CREATE INDEX idx_ai_usage_logs_user_id ON ai_usage_logs(user_id);
CREATE INDEX idx_ai_usage_logs_feature_name ON ai_usage_logs(feature_name);
CREATE INDEX idx_ai_usage_logs_timestamp ON ai_usage_logs(timestamp);
CREATE INDEX idx_ai_usage_logs_success ON ai_usage_logs(success);
CREATE INDEX idx_users_beta_tester ON users(is_beta_tester) WHERE is_beta_tester = true;

-- Create trigger to update updated_at timestamp for ai_configuration
CREATE OR REPLACE FUNCTION update_ai_configuration_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ai_configuration_updated_at
  BEFORE UPDATE ON ai_configuration
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_configuration_updated_at();

-- Add comments for documentation
COMMENT ON TABLE ai_configuration IS 'Configuration settings for AI features including rate limits and toggles';
COMMENT ON TABLE ai_usage_logs IS 'Tracking table for AI API usage, costs, and performance metrics';
COMMENT ON COLUMN users.is_beta_tester IS 'Flag indicating if user has access to beta AI features';
COMMENT ON COLUMN users.beta_tester_granted_at IS 'Timestamp when beta tester access was granted';
COMMENT ON COLUMN users.beta_tester_granted_by IS 'Admin user ID who granted beta tester access';
COMMENT ON COLUMN invites.grant_beta_access IS 'Whether this invite should grant beta tester access upon acceptance';

-- Create view for AI usage statistics (for admin dashboard)
CREATE VIEW ai_usage_statistics AS
SELECT 
  feature_name,
  DATE_TRUNC('hour', timestamp) as hour,
  COUNT(*) as total_calls,
  SUM(tokens_used) as total_tokens,
  AVG(response_time_ms) as avg_response_time,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_calls,
  SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as failed_calls,
  SUM(cost_estimate) as total_estimated_cost,
  COUNT(DISTINCT user_id) as unique_users
FROM ai_usage_logs
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY feature_name, DATE_TRUNC('hour', timestamp)
ORDER BY hour DESC, feature_name;

COMMENT ON VIEW ai_usage_statistics IS 'Hourly AI usage statistics for admin dashboard monitoring';