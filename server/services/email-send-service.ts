import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { db } from '../db.js';
import { emailSendLog, emailTemplates, invites } from '../../shared/schema.js';
import { eq, desc, and, sql } from 'drizzle-orm';
import { emailVariableService, SENDER_IDENTITIES, type SenderIdentity } from './email-variable-service.js';
import { emailTemplateService } from './email-template-service.js';

const ses = new SESClient({ region: process.env.AWS_REGION || 'us-west-2' });

class EmailSendService {
  /**
   * Send an email for a specific invite using a template and sender identity.
   */
  async sendInviteEmail(opts: {
    inviteId: number;
    templateId: number;
    senderIdentity: SenderIdentity;
    sentBy: number;
  }): Promise<{ success: boolean; logId?: number; error?: string }> {
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
    const { html, plainText } = emailVariableService.renderBoth(
      template.htmlContent,
      template.plainTextContent,
      variables,
    );

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
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const sender = SENDER_IDENTITIES[opts.senderIdentity];

    try {
      const result = await ses.send(
        new SendEmailCommand({
          Source: `${sender.name} <${sender.email}>`,
          Destination: {
            ToAddresses: [opts.to],
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
   * Bulk send to multiple invites using the same template.
   */
  async sendBulkInviteEmails(opts: {
    inviteIds: number[];
    templateId: number;
    senderIdentity: SenderIdentity;
    sentBy: number;
  }): Promise<{ sent: number; failed: number; results: Array<{ inviteId: number; success: boolean; error?: string }> }> {
    const results: Array<{ inviteId: number; success: boolean; error?: string }> = [];
    let sent = 0;
    let failed = 0;

    for (const inviteId of opts.inviteIds) {
      const result = await this.sendInviteEmail({
        inviteId,
        templateId: opts.templateId,
        senderIdentity: opts.senderIdentity,
        sentBy: opts.sentBy,
      });

      results.push({ inviteId, success: result.success, error: result.error });
      if (result.success) sent++;
      else failed++;

      // Small delay to stay under SES rate limit (14/sec)
      if (opts.inviteIds.length > 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return { sent, failed, results };
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
