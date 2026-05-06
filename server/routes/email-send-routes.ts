import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { isFacilitatorOrAdmin, isAdmin } from '../middleware/roles.js';
import { isFeatureEnabled } from '../utils/feature-flags.js';
import { emailSendService } from '../services/email-send-service.js';

const router = Router();

// Gate all routes behind the feature flag
router.use((_req: Request, res: Response, next) => {
  if (!isFeatureEnabled('emailInvitationSystem')) {
    return res.status(404).json({ success: false, message: 'Email invitation system is not enabled' });
  }
  next();
});

// ── Send Emails ───────────────────────────────────────────────────────────────

/** POST /api/email-send/invite — send an email for a single invite */
router.post('/invite', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const { inviteId, templateId, senderIdentity } = req.body;
    const sentBy = (req.session as any).userId;

    if (!inviteId || !templateId) {
      return res.status(400).json({ success: false, message: 'inviteId and templateId are required' });
    }

    const validIdentities = ['heliotrope', 'allstarteams', 'imaginalagility'];
    if (senderIdentity && !validIdentities.includes(senderIdentity)) {
      return res.status(400).json({ success: false, message: 'Invalid sender identity' });
    }

    const result = await emailSendService.sendInviteEmail({
      inviteId,
      templateId,
      senderIdentity: senderIdentity || 'heliotrope',
      sentBy,
    });

    if (result.success) {
      res.json({ success: true, logId: result.logId, message: 'Email sent successfully' });
    } else {
      res.status(500).json({ success: false, error: result.error, logId: result.logId });
    }
  } catch (error: any) {
    console.error('Error sending invite email:', error);
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }
});

/** POST /api/email-send/bulk — send emails for multiple invites */
router.post('/bulk', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const { inviteIds, templateId, senderIdentity } = req.body;
    const sentBy = (req.session as any).userId;

    if (!inviteIds || !Array.isArray(inviteIds) || inviteIds.length === 0) {
      return res.status(400).json({ success: false, message: 'inviteIds array is required' });
    }
    if (!templateId) {
      return res.status(400).json({ success: false, message: 'templateId is required' });
    }

    const result = await emailSendService.sendBulkInviteEmails({
      inviteIds,
      templateId,
      senderIdentity: senderIdentity || 'heliotrope',
      sentBy,
    });

    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Error sending bulk emails:', error);
    res.status(500).json({ success: false, message: 'Failed to send bulk emails' });
  }
});

/** POST /api/email-send/test — send a test email (no invite required) */
router.post('/test', requireAuth, isAdmin, async (req: Request, res: Response) => {
  try {
    const { to, subject, html, plainText, senderIdentity } = req.body;
    const sentBy = (req.session as any).userId;

    if (!to || !subject) {
      return res.status(400).json({ success: false, message: 'to and subject are required' });
    }

    const result = await emailSendService.sendRawEmail({
      to,
      subject: subject || 'Test Email from Heliotrope Imaginal',
      html: html || `<h1>Test Email</h1><p>This is a test from the Heliotrope Imaginal email system.</p>`,
      plainText,
      senderIdentity: senderIdentity || 'heliotrope',
      sentBy,
    });

    if (result.success) {
      res.json({ success: true, messageId: result.messageId, message: 'Test email sent' });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error('Error sending test email:', error);
    res.status(500).json({ success: false, message: 'Failed to send test email' });
  }
});

// ── Send History ──────────────────────────────────────────────────────────────

/** GET /api/email-send/history — get email send history */
router.get('/history', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId;
    const role = (req.session as any).userRole;

    const filters: any = {
      limit: parseInt(req.query.limit as string) || 50,
      offset: parseInt(req.query.offset as string) || 0,
    };

    if (req.query.status) filters.status = req.query.status;
    if (req.query.recipient) filters.recipientEmail = req.query.recipient;

    // Facilitators only see their own sends
    if (role !== 'admin') {
      filters.sentBy = userId;
    }

    const history = await emailSendService.getSendHistory(filters);
    res.json({ success: true, history });
  } catch (error: any) {
    console.error('Error fetching send history:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch send history' });
  }
});

/** GET /api/email-send/history/:id — single send log entry */
router.get('/history/:id', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid log ID' });
    }
    const entry = await emailSendService.getSendLogById(id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Send log entry not found' });
    }
    res.json({ success: true, entry });
  } catch (error: any) {
    console.error('Error fetching send log:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch send log entry' });
  }
});

// ── Download as HTML ──────────────────────────────────────────────────────────

/** GET /api/email-send/download/:inviteId — download rendered HTML for a single invite */
router.get('/download/:inviteId', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const inviteId = parseInt(req.params.inviteId, 10);
    const templateId = parseInt(req.query.templateId as string, 10);

    if (isNaN(inviteId) || isNaN(templateId)) {
      return res.status(400).json({ success: false, message: 'inviteId and templateId are required' });
    }

    const { emailVariableService } = await import('../services/email-variable-service.js');
    const { emailTemplateService } = await import('../services/email-template-service.js');

    const template = await emailTemplateService.getTemplateById(templateId);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    const variables = await emailVariableService.buildVariableContext(inviteId);
    const { html } = emailVariableService.renderBoth(template.htmlContent, template.plainTextContent, variables);
    const subject = emailVariableService.renderTemplate(template.subject, variables);

    const filename = `email-${variables.invite_name || 'invite'}-${variables.invite_code_raw}.html`
      .replace(/[^a-zA-Z0-9._-]/g, '_');

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(html);
  } catch (error: any) {
    console.error('Error downloading email:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to download email' });
  }
});

/** POST /api/email-send/download-bulk — download a zip of rendered HTML files for multiple invites */
router.post('/download-bulk', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const { inviteIds, templateId } = req.body;

    if (!inviteIds || !Array.isArray(inviteIds) || !templateId) {
      return res.status(400).json({ success: false, message: 'inviteIds array and templateId are required' });
    }

    const { emailVariableService } = await import('../services/email-variable-service.js');
    const { emailTemplateService } = await import('../services/email-template-service.js');

    const template = await emailTemplateService.getTemplateById(templateId);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    // Build all rendered HTMLs
    const files: Array<{ name: string; content: string }> = [];
    for (const inviteId of inviteIds) {
      try {
        const variables = await emailVariableService.buildVariableContext(inviteId);
        const { html } = emailVariableService.renderBoth(template.htmlContent, template.plainTextContent, variables);
        const filename = `${variables.invite_name || 'invite'}-${variables.invite_code_raw}.html`
          .replace(/[^a-zA-Z0-9._-]/g, '_');
        files.push({ name: filename, content: html });
      } catch (err: any) {
        files.push({ name: `error-invite-${inviteId}.txt`, content: `Error: ${err.message}` });
      }
    }

    // For single file, just return the HTML directly
    if (files.length === 1) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${files[0].name}"`);
      return res.send(files[0].content);
    }

    // For multiple files, return JSON with all rendered content
    // (Client-side zip generation is more practical than server-side for small batches)
    res.json({ success: true, files });
  } catch (error: any) {
    console.error('Error downloading bulk emails:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to download emails' });
  }
});

export default router;
