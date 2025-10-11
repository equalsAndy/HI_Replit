-- Add Beta Tester functionality
-- Date: 2025-01-26

-- Add isBetaTester column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_beta_tester BOOLEAN NOT NULL DEFAULT false;

-- Add showDemoDataButtons column for test users to control demo data button visibility
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS show_demo_data_buttons BOOLEAN NOT NULL DEFAULT true;

-- Add comments for clarity
COMMENT ON COLUMN users.is_beta_tester IS 'Indicates if user is a beta tester with access to pre-release features';
COMMENT ON COLUMN users.show_demo_data_buttons IS 'For test users: controls visibility of demo data buttons in UI';