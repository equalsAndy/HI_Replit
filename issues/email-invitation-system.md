# Email Invitation System with Rich-Text Templates

**Type:** Epic  
**Priority:** High  
**Labels:** email, templates, aws-ses, aws-s3, facilitator-tools, tiptap  
**Components:** Backend, Frontend, Database, AWS Integration  
**Estimated Effort:** 16–18 working days  

---

## Epic Summary

Implement a comprehensive email invitation system that allows admins and facilitators to create, manage, and send rich-text email templates with dynamic variable substitution. The system will integrate AWS SES for email delivery and AWS S3 for image storage, with a Tiptap-based rich text editor. Facilitators can send emails through any of the three branded sender identities or download pre-formatted HTML to use in their own email client.

---

## Business Value

**Problem:**
- Invite codes must be manually copied and shared — no automated delivery
- No email communication for new invites
- Facilitators cannot customize invitation messaging for their context (corporate, coaching, education)
- No tracking of sent invitations

**Solution:**
- Automated email sending on invite creation (optional, facilitator-controlled)
- Rich-text template editor with dynamic variable substitution
- Facilitator-specific template management with admin oversight
- Multi-brand sender identity selection
- Download pre-formatted HTML for use in facilitator's own email client
- Email delivery tracking and audit logging

---

## User Stories

### 1. Admin Template Management
**As an** admin, I want to create and manage email templates with rich formatting so that I can ensure professional, consistent invitation emails.

**Acceptance Criteria:**
- Create templates with Tiptap rich-text editor
- Insert dynamic variables via picker
- Preview templates with sample data
- Assign templates to facilitators
- Mark templates as default, share with all facilitators

### 2. Facilitator Template Creation
**As a** facilitator, I want to create my own custom email templates so that I can personalize invitations for my cohorts.

**Acceptance Criteria:**
- Access template management in Facilitator Console
- Create from scratch or clone existing templates
- View assigned and shared system templates
- Cannot access other facilitators' private templates

### 3. Automated Email Sending
- Checkbox "Send welcome email" on invite creation
- Template selector + sender identity selector (Heliotrope Imaginal / AllStarTeams / Imaginal Agility)
- Email logged for auditing

### 4. Download Pre-Formatted Email
- "Download Email" button on invite detail
- Downloads self-contained HTML with all variables rendered
- Batch: zip of one file per invite

### 5. Variable Substitution
- Searchable variable picker in Tiptap toolbar
- Handlebars syntax, conditional block support
- Preview with sample data

### 6. Image Management
- Upload via drag-and-drop (JPEG/PNG/GIF/WebP, 5MB max)
- Stored in AWS S3, auto-optimized via Sharp
- Gallery view, shareable with other facilitators

### 7. Bulk Email Sending
- Select multiple invites, choose template + sender identity
- Preview before sending, queue bulk operation

### 8. Email Tracking
- Send history with filters (date, status, recipient, sender identity)
- Status: pending, sent, delivered, failed, bounced

---

## Technical Architecture

### Database Schema — 5 New Tables

```sql
-- email_templates
id, name, description, subject, html_content, plain_text_content
template_category (welcome | beta_tester | workshop_specific | custom)
workshop_type (ast | ia | both | NULL)
created_by (FK users), is_system_template, is_shared, is_active, is_default
version, tags, preview_image_url, created_at, updated_at

-- template_assignments
id, template_id (FK), assigned_to (FK users), assigned_by (FK users)
can_edit, can_reassign, assigned_at

-- email_send_log
id, template_id (FK), invite_id (FK invites)
recipient_email, recipient_name, subject, html_body, plain_text_body
sender_identity (heliotrope | allstarteams | imaginalagility)
ses_message_id, ses_request_id
status (pending | sent | failed | bounced | complained)
error_message, sent_by (FK users), variables_used (jsonb)
queued_at, sent_at, delivered_at, opened_at, clicked_at

-- email_images
id, original_filename, stored_filename, file_size_bytes, mime_type
s3_bucket, s3_key, s3_url, cdn_url, width_px, height_px, alt_text
uploaded_by (FK users), is_shared, usage_count, uploaded_at, last_used_at

-- template_variables
id, variable_key, variable_name, description
category (user | invite | workshop | platform | conditional)
data_type, example_value, is_required, is_conditional, fallback_value
available_for_workshops (jsonb), created_at, updated_at
```

### Rich Text Editor: Tiptap

MIT-licensed, no API key required. Extensions:
- `@tiptap/starter-kit`, `extension-image`, `extension-link`, `extension-text-align`, `extension-color`, `extension-text-style`
- Custom `VariableNode` extension — inline chip rendering for variables (non-editable)
- VariablePicker toolbar button — searchable popover, inserts VariableNode at cursor

### Multi-Brand Sender Identities

- `noreply@heliotropeimaginal.com` — Heliotrope Imaginal
- `noreply@allstarteams.com` — AllStarTeams
- `noreply@imaginalagility.com` — Imaginal Agility

Selected at send time. All three domains require DKIM/SPF/DMARC + SES verification.

### Variable System (Handlebars)

```handlebars
{{invite_code}} {{invite_code_raw}} {{invite_url}} {{invite_email}} {{invite_name}}
{{invite_expires_at}} {{has_ast_access}} {{has_ia_access}} {{workshop_names}}
{{is_beta_tester}} {{platform_name}} {{platform_url}} {{support_email}} {{current_year}}

{{#if is_beta_tester}}Beta content{{/if}}
{{#if has_ast_access}}AST content{{/if}}
```

---

## AWS Setup

### SES
- Verify all three domains: heliotropeimaginal.com, allstarteams.com, imaginalagility.com
- DNS records: DKIM, SPF, DMARC per domain (DNS access confirmed)
- Request production access
- Configuration set: `heliotrope-email-tracking`

### S3
- Bucket: `heliotrope-email-images`
- CORS for browser uploads, public-read ACL

### Environment Variables

```bash
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
SES_FROM_EMAIL_HELIOTROPE=noreply@heliotropeimaginal.com
SES_FROM_EMAIL_AST=noreply@allstarteams.com
SES_FROM_EMAIL_IA=noreply@imaginalagility.com
SES_CONFIGURATION_SET=heliotrope-email-tracking
S3_EMAIL_IMAGES_BUCKET=heliotrope-email-images
PLATFORM_URL=https://app2.heliotropeimaginal.com
SUPPORT_EMAIL=support@heliotropeimaginal.com
FEATURE_EMAIL_TEMPLATES=true
```

---

## Implementation Phases

### Phase 1: Database & Core Services (Days 1-4)
- [ ] Migration: 5 new tables in schema.ts
- [ ] EmailTemplateService, EmailVariableService (Handlebars)
- [ ] Seed 4 default templates

### Phase 2: AWS Integration (Days 5-7)
- [ ] DNS records for all three domains (**prerequisite — critical path**)
- [ ] SES verification + production access request
- [ ] S3 bucket + CORS
- [ ] EmailSendService (sender identity routing), EmailImageService (Sharp)

### Phase 3: API Routes (Days 8-10)
- [ ] email-template-routes.ts, email-send-routes.ts, email-image-routes.ts
- [ ] Register in server/index.ts
- [ ] Role-based access control

### Phase 4: Editor & UI (Days 11-15)
- [ ] Tiptap setup + VariableNode extension
- [ ] VariablePicker toolbar
- [ ] EmailTemplateEditor, EmailTemplateManagement, ImageBrowser, EmailTemplatePreview, BulkEmailSender

### Phase 5: Integration (Days 16-17)
- [ ] Email option in Facilitator Console invite creation
- [ ] Download-email button on invite detail
- [ ] Email Templates tab in admin dashboard

### Phase 6: DNS & Go-Live (Day 18)
- [ ] Confirm DNS propagation, SES out of sandbox
- [ ] Smoke test all sender identities
- [ ] Enable FEATURE_EMAIL_TEMPLATES=true in production

---

## Default Seed Templates

1. Welcome (Both Workshops)
2. Beta Tester Welcome
3. AST Only Welcome
4. IA Only Welcome

---

## Files to Create

**Backend (9):** migration sql, email-template-service.ts, email-variable-service.ts, email-send-service.ts, email-image-service.ts, email-template-routes.ts, email-send-routes.ts, email-image-routes.ts, email-templates-seed.ts

**Frontend (7):** EmailTemplateManagement.tsx, EmailTemplateEditor.tsx, VariablePicker.tsx, ImageBrowser.tsx, EmailTemplatePreview.tsx, BulkEmailSender.tsx (all in `client/src/components/facilitator/`), VariableNode.ts (Tiptap extension)

**Files to Modify (4):** shared/schema.ts, server/index.ts, FacilitatorDashboard.tsx (Email Templates tab), InviteManagement.tsx (email option)

---

## NPM Dependencies

```json
{
  "@tiptap/react": "^2.x",
  "@tiptap/starter-kit": "^2.x",
  "@tiptap/extension-image": "^2.x",
  "@tiptap/extension-link": "^2.x",
  "@tiptap/extension-text-align": "^2.x",
  "@tiptap/extension-color": "^2.x",
  "@tiptap/extension-text-style": "^2.x",
  "@aws-sdk/client-ses": "^3.x",
  "@aws-sdk/client-s3": "^3.x",
  "handlebars": "^4.7.8",
  "sharp": "^0.33.0",
  "multer": "^1.4.5-lts.1"
}
```

---

## Security

- Tiptap HTML sanitized — validate on server before storing
- Handlebars auto-escaping on all variable substitution
- Image type validation, 5MB max, Sharp re-encodes
- Ownership checks on every endpoint
- AWS credentials in env vars only
- Rate limiting on /send endpoints

## Rollback

- Set `FEATURE_EMAIL_TEMPLATES=false`
- Drop the 5 new tables — no existing tables modified

## Notes

- DNS records are the critical path — add them before writing any code
- Tiptap: no API key, no usage limits
- Download-to-HTML covers facilitators who prefer their own email client
- Components live in `client/src/components/facilitator/` not `admin/`
