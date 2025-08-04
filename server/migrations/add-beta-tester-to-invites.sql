-- Migration: Add beta tester support to invites table
-- Date: 2025-07-31
-- Description: Add is_beta_tester column to invites table for marking beta tester invites

-- Add is_beta_tester column with default false
ALTER TABLE invites 
ADD COLUMN IF NOT EXISTS is_beta_tester BOOLEAN DEFAULT FALSE NOT NULL;

-- Update any existing invites that might need beta tester status
-- (This query can be customized based on existing data patterns)
-- UPDATE invites SET is_beta_tester = TRUE WHERE role = 'admin' AND name LIKE '%beta%';

-- Add comment for documentation
COMMENT ON COLUMN invites.is_beta_tester IS 'Indicates whether this invite is for a beta tester with enhanced access';

-- Create index for performance if needed
CREATE INDEX IF NOT EXISTS idx_invites_beta_tester ON invites(is_beta_tester);