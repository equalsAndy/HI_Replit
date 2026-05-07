import express from 'express';
import { z } from 'zod';
import { createPasswordChangeTicket } from '../src/auth0/management.js';
import { emailSendService } from '../services/email-send-service.js';

const router = express.Router();

const SUCCESS_RESPONSE = {
  success: true,
  message: 'If an account exists with that email, a password reset link has been sent.',
} as const;

// In-memory rate limiter: max 3 requests per email per hour. The map is keyed
// by lowercased email; entries expire after the window. Sweeps run inline.
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const attempts = new Map<string, number[]>();

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  const prior = (attempts.get(email) || []).filter(ts => ts > cutoff);
  if (prior.length >= RATE_LIMIT_MAX) {
    attempts.set(email, prior);
    return false;
  }
  prior.push(now);
  attempts.set(email, prior);
  return true;
}

function buildResetEmail(resetUrl: string): { subject: string; html: string; plainText: string } {
  const year = new Date().getFullYear();
  const subject = 'Reset your Heliotrope password';

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
  <tr><td style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:32px;text-align:center;">
    <h1 style="color:#ffffff;margin:0;font-size:24px;">Reset Your Password</h1>
  </td></tr>
  <tr><td style="padding:32px;">
    <p style="font-size:16px;color:#333;line-height:1.6;">Click below to set a new password for your Heliotrope account.</p>
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 0;">
      <a href="${resetUrl}" style="background:#4F46E5;color:#ffffff;padding:14px 32px;border-radius:6px;text-decoration:none;font-size:16px;font-weight:bold;display:inline-block;">Reset Password</a>
    </td></tr></table>
    <p style="font-size:14px;color:#666;">This link expires in 1 hour.</p>
    <p style="font-size:14px;color:#666;">If you didn't request this, you can safely ignore this email.</p>
  </td></tr>
  <tr><td style="background:#f8f8fa;padding:20px 32px;text-align:center;">
    <p style="font-size:12px;color:#999;margin:0;">Heliotrope Imaginal &middot; ${year}<br>
    <a href="mailto:support@heliotropeimaginal.com" style="color:#4F46E5;">support@heliotropeimaginal.com</a></p>
  </td></tr>
</table>
</td></tr></table>
</body>
</html>`;

  const plainText = `Reset Your Password

Click the link below to set a new password for your Heliotrope account:

${resetUrl}

This link expires in 1 hour.

If you didn't request this, you can safely ignore this email.

— Heliotrope Imaginal`;

  return { subject, html, plainText };
}

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

/**
 * POST /api/auth/forgot-password
 * Public — never reveals whether the email exists. Always 200 (or 429 when
 * rate-limited). Auth0 generates the reset ticket; HI sends the branded email
 * via SES so the user never sees SelfActual branding.
 */
router.post('/forgot-password', async (req, res) => {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: 'A valid email is required' });
  }

  const email = parsed.data.email.trim().toLowerCase();

  if (!checkRateLimit(email)) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.',
    });
  }

  // Always return the same response regardless of whether the email exists or
  // any downstream step fails. Failures are logged for ops; never surfaced.
  try {
    const clientId = process.env.AUTH0_HI_WEB_CLIENT_ID
      || process.env.VITE_AUTH0_CLIENT_ID
      || 'aeBcWM9HNGevfP7SFdR9dHpKpQChBZ7V';
    const resultUrl = process.env.PLATFORM_URL || 'https://app2.heliotropeimaginal.com';

    const ticketUrl = await createPasswordChangeTicket({
      email,
      clientId,
      resultUrl,
      ttlSec: 3600,
    });

    if (ticketUrl) {
      const { subject, html, plainText } = buildResetEmail(ticketUrl);
      const send = await emailSendService.sendTransactionalEmail({
        to: email,
        subject,
        html,
        plainText,
        senderIdentity: 'heliotrope',
      });
      if (!send.success) {
        console.error('[forgot-password] SES send failed for', email, send.error);
      } else {
        console.log('[forgot-password] reset email sent to', email, 'messageId=', send.messageId);
      }
    } else {
      // Either user does not exist or Auth0 errored. Log and stay silent.
      console.log('[forgot-password] no ticket issued for', email);
    }
  } catch (err) {
    console.error('[forgot-password] unexpected error:', err instanceof Error ? err.message : String(err));
  }

  return res.json(SUCCESS_RESPONSE);
});

export default router;
