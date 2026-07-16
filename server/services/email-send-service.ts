import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { db } from '../db.js';
import { emailSendLog, emailTemplates, invites } from '../../shared/schema.js';
import { eq, desc, and, sql } from 'drizzle-orm';
import { emailVariableService, SENDER_IDENTITIES, type SenderIdentity } from './email-variable-service.js';
import { emailTemplateService } from './email-template-service.js';

const ses = new SESClient({ region: process.env.AWS_REGION || 'us-west-2' });

const MAX_PERSONAL_NOTE = 1000;

/** Escape HTML special chars so a personal note can't inject markup. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Normalise a personal note: trim and cap length. Returns '' if empty. */
function normalizeNote(note?: string | null): string {
  if (!note) return '';
  return note.trim().slice(0, MAX_PERSONAL_NOTE);
}

/** Insert a rendered note block at the top of the email body. */
function injectNoteHtml(html: string, note: string): string {
  if (!note) return html;
  const block =
    `<div style="background:#f8f7ff;border-left:4px solid #7c3aed;padding:12px 16px;` +
    `margin:0 0 20px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;` +
    `line-height:1.6;color:#333;">${escapeHtml(note).replace(/\n/g, '<br>')}</div>`;
  const bodyMatch = html.match(/<body[^>]*>/i);
  if (bodyMatch && bodyMatch.index !== undefined) {
    const idx = bodyMatch.index + bodyMatch[0].length;
    return html.slice(0, idx) + block + html.slice(idx);
  }
  return block + html;
}

function injectNoteText(text: string, note: string): string {
  if (!note) return text;
  return `${note}\n\n----------\n\n${text}`;
}

class EmailSendService {
  /**
   * Whether a given invite already has a successful ('sent') email in the log.
   */
  async hasBeenSent(inviteId: number): Promise<boolean> {
    const [row] = await db
      .select({ id: emailSendLog.id })
      .from(emailSendLog)
      .where(and(eq(emailSendLog.inviteId, inviteId), eq(emailSendLog.status, 'sent')))
      .limit(1);
    return !!row;
  }

  /**
   * Send an email for a specific invite using a template and sender identity.
   * Skips (without sending) if the invite already has a successful send, unless
   * `resend` is set. An optional `personalNote` is inserted at the top of the email.
   */
  async sendInviteEmail(opts: {
    inviteId: number;
    templateId: number;
    senderIdentity: SenderIdentity;
    sentBy: number;
    cc?: string[];
    bcc?: string[];
    personalNote?: string;
    resend?: boolean;
  }): Promise<{ success: boolean; logId?: number; error?: string; skipped?: boolean }> {
    // Duplicate guard: don't re-send a previously-sent invite unless explicitly resending.
    if (!opts.resend && (await this.hasBeenSent(opts.inviteId))) {
      return { success: false, skipped: true, error: 'already-sent' };
    }

    // Build variables from the invite
    let variables: Record<string, any>;
    try {
      variables = await emailVariableService.buildVariableContext(opts.inviteId);
    } catch (err: any) {
      return { success: false, error: err.message };
    }

    // Fetch the template
    const template = await emailTemplateService.getTemplateById(opts.templateId);
    if (!template) {
      return { success: false, error: `Template ${opts.templateId} not found` };
    }

    // Render subject, HTML, and plain text
    const subject = emailVariableService.renderTemplate(template.subject, variables);
    const note = normalizeNote(opts.personalNote);
    let { html, plainText } = emailVariableService.renderBoth(
      template.htmlContent,
      template.plainTextContent,
      variables,
    );
    html = injectNoteHtml(html, note);
    plainText = injectNoteText(plainText, note);

    const sender = SENDER_IDENTITIES[opts.senderIdentity];
    const recipientEmail = variables.invite_email as string;
    const recipientName = variables.invite_name as string;

    // Create the send log entry (pending)
    const [logEntry] = await db
      .insert(emailSendLog)
      .values({
        templateId: opts.templateId,
        inviteId: opts.inviteId,
        recipientEmail,
        recipientName,
        subject,
        htmlBody: html,
        plainTextBody: plainText,
        senderIdentity: opts.senderIdentity,
        status: 'pending',
        sentBy: opts.sentBy,
        variablesUsed: JSON.stringify(variables),
      })
      .returning();

    // Send via SES
    try {
      const result = await ses.send(
        new SendEmailCommand({
          Source: `${sender.name} <${sender.email}>`,
          Destination: {
            ToAddresses: [recipientEmail],
            ...(opts.cc?.length ? { CcAddresses: opts.cc } : {}),
            ...(opts.bcc?.length ? { BccAddresses: opts.bcc } : {}),
          },
          Message: {
            Subject: { Data: subject, Charset: 'UTF-8' },
            Body: {
              Html: { Data: html, Charset: 'UTF-8' },
              Text: { Data: plainText, Charset: 'UTF-8' },
            },
          },
        }),
      );

      // Update log with success
      await db
        .update(emailSendLog)
        .set({
          status: 'sent',
          sesMessageId: result.MessageId,
          sesRequestId: result.$metadata.requestId,
          sentAt: new Date(),
        })
        .where(eq(emailSendLog.id, logEntry.id));

      return { success: true, logId: logEntry.id };
    } catch (err: any) {
      // Update log with failure
      await db
        .update(emailSendLog)
        .set({
          status: 'failed',
          errorMessage: err.message || String(err),
        })
        .where(eq(emailSendLog.id, logEntry.id));

      console.error('[EmailSendService] SES send failed:', err.message);
      return { success: false, logId: logEntry.id, error: err.message };
    }
  }

  /**
   * Send a raw email (no invite/template — for testing or custom sends).
   */
  async sendRawEmail(opts: {
    to: string;
    subject: string;
    html: string;
    plainText?: string;
    senderIdentity: SenderIdentity;
    sentBy: number;
    cc?: string[];
    bcc?: string[];
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const sender = SENDER_IDENTITIES[opts.senderIdentity];

    try {
      const result = await ses.send(
        new SendEmailCommand({
          Source: `${sender.name} <${sender.email}>`,
          Destination: {
            ToAddresses: [opts.to],
            ...(opts.cc?.length ? { CcAddresses: opts.cc } : {}),
            ...(opts.bcc?.length ? { BccAddresses: opts.bcc } : {}),
          },
          Message: {
            Subject: { Data: opts.subject, Charset: 'UTF-8' },
            Body: {
              Html: { Data: opts.html, Charset: 'UTF-8' },
              Text: { Data: opts.plainText || opts.subject, Charset: 'UTF-8' },
            },
          },
        }),
      );

      // Log the send
      await db.insert(emailSendLog).values({
        recipientEmail: opts.to,
        subject: opts.subject,
        htmlBody: opts.html,
        plainTextBody: opts.plainText || opts.subject,
        senderIdentity: opts.senderIdentity,
        status: 'sent',
        sentBy: opts.sentBy,
        sesMessageId: result.MessageId,
        sesRequestId: result.$metadata.requestId,
        sentAt: new Date(),
      });

      return { success: true, messageId: result.MessageId };
    } catch (err: any) {
      console.error('[EmailSendService] Raw send failed:', err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Send a system/transactional email (e.g. password reset) without requiring a
   * sentBy user or persisting to email_send_log. The DB log requires a real
   * user FK, but transactional emails are triggered by anonymous users.
   */
  async sendTransactionalEmail(opts: {
    to: string;
    subject: string;
    html: string;
    plainText: string;
    senderIdentity: SenderIdentity;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const sender = SENDER_IDENTITIES[opts.senderIdentity];

    try {
      const result = await ses.send(
        new SendEmailCommand({
          Source: `${sender.name} <${sender.email}>`,
          Destination: { ToAddresses: [opts.to] },
          Message: {
            Subject: { Data: opts.subject, Charset: 'UTF-8' },
            Body: {
              Html: { Data: opts.html, Charset: 'UTF-8' },
              Text: { Data: opts.plainText, Charset: 'UTF-8' },
            },
          },
        }),
      );
      return { success: true, messageId: result.MessageId };
    } catch (err: any) {
      console.error('[EmailSendService] Transactional send failed:', err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Bulk send to multiple invites using the same template.
   */
  async sendBulkInviteEmails(opts: {
    inviteIds: number[];
    templateId: number;
    senderIdentity: SenderIdentity;
    sentBy: number;
    cc?: string[];
    bcc?: string[];
    personalNote?: string;
    resend?: boolean;
  }): Promise<{ sent: number; failed: number; skipped: number; results: Array<{ inviteId: number; success: boolean; skipped?: boolean; error?: string }> }> {
    const results: Array<{ inviteId: number; success: boolean; skipped?: boolean; error?: string }> = [];
    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const inviteId of opts.inviteIds) {
      const result = await this.sendInviteEmail({
        inviteId,
        templateId: opts.templateId,
        senderIdentity: opts.senderIdentity,
        sentBy: opts.sentBy,
        cc: opts.cc,
        bcc: opts.bcc,
        personalNote: opts.personalNote,
        resend: opts.resend,
      });

      results.push({ inviteId, success: result.success, skipped: result.skipped, error: result.error });
      if (result.success) sent++;
      else if (result.skipped) skipped++;
      else failed++;

      // Small delay to stay under SES rate limit (14/sec)
      if (opts.inviteIds.length > 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return { sent, failed, skipped, results };
  }

  /**
   * Full email history for a single invite, newest first, with template name.
   */
  async getInviteSendHistory(inviteId: number) {
    return db
      .select({
        id: emailSendLog.id,
        templateId: emailSendLog.templateId,
        templateName: emailTemplates.name,
        senderIdentity: emailSendLog.senderIdentity,
        subject: emailSendLog.subject,
        status: emailSendLog.status,
        sentAt: emailSendLog.sentAt,
        queuedAt: emailSendLog.queuedAt,
        errorMessage: emailSendLog.errorMessage,
        sentBy: emailSendLog.sentBy,
      })
      .from(emailSendLog)
      .leftJoin(emailTemplates, eq(emailSendLog.templateId, emailTemplates.id))
      .where(eq(emailSendLog.inviteId, inviteId))
      .orderBy(desc(emailSendLog.queuedAt));
  }

  /**
   * Get send history with optional filters.
   */
  async getSendHistory(filters?: {
    status?: string;
    recipientEmail?: string;
    sentBy?: number;
    limit?: number;
    offset?: number;
  }) {
    const conditions = [];
    if (filters?.status) {
      conditions.push(eq(emailSendLog.status, filters.status));
    }
    if (filters?.recipientEmail) {
      conditions.push(eq(emailSendLog.recipientEmail, filters.recipientEmail));
    }
    if (filters?.sentBy) {
      conditions.push(eq(emailSendLog.sentBy, filters.sentBy));
    }

    const query = db
      .select()
      .from(emailSendLog)
      .orderBy(desc(emailSendLog.queuedAt))
      .limit(filters?.limit || 50)
      .offset(filters?.offset || 0);

    if (conditions.length > 0) {
      return query.where(and(...conditions));
    }
    return query;
  }

  /**
   * Get a single send log entry by ID.
   */
  async getSendLogById(id: number) {
    const [entry] = await db
      .select()
      .from(emailSendLog)
      .where(eq(emailSendLog.id, id))
      .limit(1);
    return entry ?? null;
  }
}

export const emailSendService = new EmailSendService();
