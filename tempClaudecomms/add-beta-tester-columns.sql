-- Add Beta Tester columns to users table
-- Run this SQL on your database to add the missing columns

-- Add is_beta_tester column
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_beta_tester BOOLEAN DEFAULT FALSE;

-- Add show_demo_data_buttons column  
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_demo_data_buttons BOOLEAN DEFAULT TRUE;

-- Update any NULL values to defaults (just in case)
UPDATE users SET is_beta_tester = FALSE WHERE is_beta_tester IS NULL;
UPDATE users SET show_demo_data_buttons = TRUE WHERE show_demo_data_buttons IS NULL;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('is_beta_tester', 'show_demo_data_buttons');