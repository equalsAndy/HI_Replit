-- Create vault_accounts table for Solid Pod integration
-- Maps users to their SelfActual Solid Pod URLs

CREATE TABLE IF NOT EXISTS vault_accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pod_username VARCHAR(255) NOT NULL,
  master_pod_url VARCHAR(500) NOT NULL,
  sub_pod_url VARCHAR(500) NOT NULL,
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT vault_accounts_user_id_unique UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_vault_accounts_user_id ON vault_accounts (user_id);
