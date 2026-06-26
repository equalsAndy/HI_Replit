-- Add disabled_at to users for soft account disable (blocks login without deleting)
ALTER TABLE users ADD COLUMN IF NOT EXISTS disabled_at TIMESTAMP WITH TIME ZONE;
