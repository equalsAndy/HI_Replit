-- Add Talia training access control field to users table
-- Migration: add-talia-training-access.sql
-- Date: 2025-08-03

-- Add canTrainTalia field to users table
ALTER TABLE users 
ADD COLUMN can_train_talia BOOLEAN DEFAULT FALSE NOT NULL;

-- Grant training access to all admin users by default
UPDATE users 
SET can_train_talia = TRUE 
WHERE role = 'admin';

-- Add index for performance
CREATE INDEX idx_users_can_train_talia ON users(can_train_talia) WHERE can_train_talia = TRUE;

-- Comment for documentation
COMMENT ON COLUMN users.can_train_talia IS 'Whether user can access Talia training interface and TRAIN commands';