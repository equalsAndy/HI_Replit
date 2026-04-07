-- Migration: Email Invitation System
-- Created: 2026-04-06
-- Purpose: Add 5 tables for email template management, sending, images, and variable definitions

-- 1. Email templates — rich-text templates for invitation emails
CREATE TABLE IF NOT EXISTS email_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  subject VARCHAR(500) NOT NULL,
  html_content TEXT NOT NULL,
  plain_text_content TEXT,
  template_category VARCHAR(50) NOT NULL DEFAULT 'custom'
    CHECK (template_category IN ('welcome', 'beta_tester', 'workshop_specific', 'custom')),
  workshop_type VARCHAR(10)
    CHECK (workshop_type IS NULL OR workshop_type IN ('ast', 'ia', 'both')),
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_system_template BOOLEAN NOT NULL DEFAULT FALSE,
  is_shared BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  version INTEGER NOT NULL DEFAULT 1,
  tags JSONB DEFAULT '[]',
  preview_image_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_templates_created_by ON email_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(template_category);
CREATE INDEX IF NOT EXISTS idx_email_templates_workshop_type ON email_templates(workshop_type);

-- 2. Template assignments — links templates to facilitators
CREATE TABLE IF NOT EXISTS template_assignments (
  id SERIAL PRIMARY KEY,
  template_id INTEGER NOT NULL REFERENCES email_templates(id) ON DELETE CASCADE,
  assigned_to INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  can_edit BOOLEAN NOT NULL DEFAULT FALSE,
  can_reassign BOOLEAN NOT NULL DEFAULT FALSE,
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT template_assignee_unique UNIQUE (template_id, assigned_to)
);

-- 3. Email send log — audit trail for all sent emails
CREATE TABLE IF NOT EXISTS email_send_log (
  id SERIAL PRIMARY KEY,
  template_id INTEGER REFERENCES email_templates(id) ON DELETE SET NULL,
  invite_id INTEGER REFERENCES invites(id) ON DELETE SET NULL,
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name TEXT,
  subject VARCHAR(500) NOT NULL,
  html_body TEXT NOT NULL,
  plain_text_body TEXT,
  sender_identity VARCHAR(50) NOT NULL DEFAULT 'heliotrope'
    CHECK (sender_identity IN ('heliotrope', 'allstarteams', 'imaginalagility')),
  ses_message_id VARCHAR(255),
  ses_request_id VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'failed', 'bounced', 'complained')),
  error_message TEXT,
  sent_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  variables_used JSONB DEFAULT '{}',
  queued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_send_log_status ON email_send_log(status);
CREATE INDEX IF NOT EXISTS idx_email_send_log_recipient ON email_send_log(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_send_log_sent_by ON email_send_log(sent_by);
CREATE INDEX IF NOT EXISTS idx_email_send_log_queued_at ON email_send_log(queued_at);

-- 4. Email images — S3-stored images for use in templates
CREATE TABLE IF NOT EXISTS email_images (
  id SERIAL PRIMARY KEY,
  original_filename VARCHAR(500) NOT NULL,
  stored_filename VARCHAR(500) NOT NULL,
  file_size_bytes INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  s3_bucket VARCHAR(255) NOT NULL,
  s3_key VARCHAR(500) NOT NULL,
  s3_url TEXT NOT NULL,
  cdn_url TEXT,
  width_px INTEGER,
  height_px INTEGER,
  alt_text VARCHAR(500),
  uploaded_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_shared BOOLEAN NOT NULL DEFAULT FALSE,
  usage_count INTEGER NOT NULL DEFAULT 0,
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_images_uploaded_by ON email_images(uploaded_by);

-- 5. Template variables — defines available Handlebars variables
CREATE TABLE IF NOT EXISTS template_variables (
  id SERIAL PRIMARY KEY,
  variable_key VARCHAR(100) NOT NULL UNIQUE,
  variable_name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL
    CHECK (category IN ('user', 'invite', 'workshop', 'platform', 'conditional')),
  data_type VARCHAR(50) NOT NULL DEFAULT 'string'
    CHECK (data_type IN ('string', 'boolean', 'date', 'number')),
  example_value TEXT,
  is_required BOOLEAN NOT NULL DEFAULT FALSE,
  is_conditional BOOLEAN NOT NULL DEFAULT FALSE,
  fallback_value TEXT,
  available_for_workshops JSONB DEFAULT '["ast","ia","both"]',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed default template variables
INSERT INTO template_variables (variable_key, variable_name, description, category, data_type, example_value, is_required, is_conditional, fallback_value) VALUES
  ('invite_code', 'Invite Code', 'Formatted invite code with hyphens', 'invite', 'string', 'ABC-DEF-GHI', true, false, NULL),
  ('invite_code_raw', 'Invite Code (Raw)', 'Raw invite code without formatting', 'invite', 'string', 'ABCDEFGHI', false, false, NULL),
  ('invite_url', 'Invite URL', 'Full registration URL with invite code', 'invite', 'string', 'https://app2.heliotropeimaginal.com/register?code=ABCDEFGHI', true, false, NULL),
  ('invite_email', 'Recipient Email', 'Email address of the invite recipient', 'invite', 'string', 'user@example.com', true, false, NULL),
  ('invite_name', 'Recipient Name', 'Name of the invite recipient', 'invite', 'string', 'Jane Smith', false, false, 'there'),
  ('invite_expires_at', 'Invite Expiry', 'When the invite expires', 'invite', 'date', '2026-05-01', false, false, NULL),
  ('has_ast_access', 'Has AST Access', 'Whether invite grants AllStarTeams access', 'workshop', 'boolean', 'true', false, true, 'false'),
  ('has_ia_access', 'Has IA Access', 'Whether invite grants Imaginal Agility access', 'workshop', 'boolean', 'true', false, true, 'false'),
  ('workshop_names', 'Workshop Names', 'Comma-separated list of granted workshop names', 'workshop', 'string', 'AllStarTeams, Imaginal Agility', false, false, ''),
  ('is_beta_tester', 'Is Beta Tester', 'Whether the recipient is a beta tester', 'user', 'boolean', 'false', false, true, 'false'),
  ('platform_name', 'Platform Name', 'Name of the platform', 'platform', 'string', 'Heliotrope Imaginal', false, false, 'Heliotrope Imaginal'),
  ('platform_url', 'Platform URL', 'URL of the platform', 'platform', 'string', 'https://app2.heliotropeimaginal.com', false, false, 'https://app2.heliotropeimaginal.com'),
  ('support_email', 'Support Email', 'Support contact email', 'platform', 'string', 'support@imaginalmail.com', false, false, 'support@imaginalmail.com'),
  ('current_year', 'Current Year', 'Current calendar year', 'platform', 'string', '2026', false, false, '2026')
ON CONFLICT (variable_key) DO NOTHING;

COMMENT ON TABLE email_templates IS 'Rich-text email templates for invitation system';
COMMENT ON TABLE template_assignments IS 'Links email templates to facilitators with edit permissions';
COMMENT ON TABLE email_send_log IS 'Audit trail of all sent invitation emails';
COMMENT ON TABLE email_images IS 'S3-stored images available for use in email templates';
COMMENT ON TABLE template_variables IS 'Defines available Handlebars variables for template substitution';
