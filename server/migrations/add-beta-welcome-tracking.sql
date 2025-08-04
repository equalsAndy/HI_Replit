-- Add has_seen_beta_welcome column to users table
-- This tracks whether a beta tester has seen the welcome modal

ALTER TABLE users 
ADD COLUMN has_seen_beta_welcome BOOLEAN DEFAULT FALSE NOT NULL;

-- Add index for better query performance when checking beta tester welcome status
CREATE INDEX idx_users_beta_welcome ON users(is_beta_tester, has_seen_beta_welcome) WHERE is_beta_tester = true;