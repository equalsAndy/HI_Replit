-- Migration: Split users.name into first_name and last_name
-- Created: 2026-04-07
-- Purpose: Separate first/last name for better personalization

-- Step 1: Add new columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(255);

-- Step 2: Migrate existing data (first space splits first/last)
UPDATE users SET
  first_name = CASE
    WHEN position(' ' in name) > 0 THEN left(name, position(' ' in name) - 1)
    ELSE name
  END,
  last_name = CASE
    WHEN position(' ' in name) > 0 THEN substring(name from position(' ' in name) + 1)
    ELSE NULL
  END
WHERE first_name IS NULL;

-- Step 3: Make first_name NOT NULL
ALTER TABLE users ALTER COLUMN first_name SET NOT NULL;

-- Step 4: Drop dependent views and old column
DROP VIEW IF EXISTS users_without_photos CASCADE;
ALTER TABLE users DROP COLUMN IF EXISTS name CASCADE;
