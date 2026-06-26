-- Cohort-level participant flags: propagate to all invites and participants
ALTER TABLE cohorts ADD COLUMN IF NOT EXISTS is_test_cohort BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE cohorts ADD COLUMN IF NOT EXISTS is_beta_cohort BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE cohorts ADD COLUMN IF NOT EXISTS show_demo_data_buttons BOOLEAN NOT NULL DEFAULT false;

-- Allow invites to carry the test-user flag so it is set at registration
ALTER TABLE invites ADD COLUMN IF NOT EXISTS is_test_user BOOLEAN NOT NULL DEFAULT false;
