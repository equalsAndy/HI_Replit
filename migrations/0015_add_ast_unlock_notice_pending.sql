-- ICIE pilot onboarding notice
-- Add a per-user flag that gates the one-time "start with AllStarTeams first" popup
-- shown to ICIE pilot participants on their first workshop login.
-- Cleared once the user dismisses the notice.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS ast_unlock_notice_pending BOOLEAN NOT NULL DEFAULT false;

-- Flag the 3 ICIE pilot users who already registered (so they also see the new pathway notice).
-- Identified by the invite they redeemed (organization = 'ICIE').
UPDATE users
SET ast_unlock_notice_pending = true, updated_at = NOW()
WHERE id IN (
  SELECT used_by FROM invites
  WHERE organization = 'ICIE' AND used_at IS NOT NULL AND used_by IS NOT NULL
);
