import { db } from '../db.js';
import { emailTemplates } from '../../shared/schema.js';
import { sql } from 'drizzle-orm';

/**
 * Seed 4 default system email templates.
 * Uses admin user (id=1) as creator. Safe to re-run — skips if templates already exist.
 */
export async function seedEmailTemplates(adminUserId = 1) {
  // Check if any system templates already exist
  const existing = await db
    .select({ id: emailTemplates.id })
    .from(emailTemplates)
    .where(sql`${emailTemplates.isSystemTemplate} = true`)
    .limit(1);

  if (existing.length > 0) {
    console.log('[email-seed] System templates already exist — skipping seed.');
    return;
  }

  const templates = [
    {
      name: 'Welcome — Both Workshops',
      description: 'Default welcome email for invites with both AST and IA access',
      subject: 'Welcome to Heliotrope Imaginal — Your Workshop Access is Ready!',
      templateCategory: 'welcome' as const,
      workshopType: 'both' as 'both',
      isDefault: true,
      htmlContent: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
  <tr><td style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:32px;text-align:center;">
    <h1 style="color:#ffffff;margin:0;font-size:24px;">Welcome to Heliotrope Imaginal</h1>
  </td></tr>
  <tr><td style="padding:32px;">
    <p style="font-size:16px;color:#333;">Hi {{invite_name}},</p>
    <p style="font-size:16px;color:#333;">You've been invited to explore your potential through our workshops: <strong>{{workshop_names}}</strong>.</p>
    <p style="font-size:16px;color:#333;">Use the link below to create your account and get started:</p>
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 0;">
      <a href="{{invite_url}}" style="background:#4F46E5;color:#ffffff;padding:14px 32px;border-radius:6px;text-decoration:none;font-size:16px;font-weight:bold;display:inline-block;">Get Started</a>
    </td></tr></table>
    <p style="font-size:14px;color:#666;">Your invite code: <strong>{{invite_code}}</strong></p>
    {{#if invite_expires_at}}<p style="font-size:14px;color:#666;">This invite expires on {{invite_expires_at}}.</p>{{/if}}
    <p style="font-size:16px;color:#333;">We're excited to have you on this journey!</p>
    <p style="font-size:16px;color:#333;">— The {{platform_name}} Team</p>
  </td></tr>
  <tr><td style="background:#f8f8fa;padding:20px 32px;text-align:center;">
    <p style="font-size:12px;color:#999;margin:0;">{{platform_name}} &middot; {{current_year}}<br>
    Questions? <a href="mailto:{{support_email}}" style="color:#4F46E5;">{{support_email}}</a></p>
  </td></tr>
</table>
</td></tr></table>
</body>
</html>`,
      plainTextContent: `Hi {{invite_name}},

You've been invited to Heliotrope Imaginal to explore {{workshop_names}}.

Get started here: {{invite_url}}

Your invite code: {{invite_code}}
{{#if invite_expires_at}}This invite expires on {{invite_expires_at}}.{{/if}}

We're excited to have you on this journey!

— The {{platform_name}} Team

Questions? Email {{support_email}}`,
    },
    {
      name: 'Beta Tester Welcome — Brad\'s Onboarding Email',
      description: 'The actual beta tester onboarding email Brad sends with full getting-started instructions',
      subject: 'You\'re In! Beta Access to AllStarTeams & Imaginal Agility',
      templateCategory: 'beta_tester' as const,
      workshopType: 'both' as 'both',
      isDefault: false,
      htmlContent: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
  <tr><td style="background:linear-gradient(135deg,#059669,#10B981);padding:32px;text-align:center;">
    <h1 style="color:#ffffff;margin:0;font-size:24px;">Welcome, Beta Tester!</h1>
    <p style="color:#d1fae5;margin:8px 0 0;font-size:14px;">AllStarTeams &amp; Imaginal Agility</p>
  </td></tr>
  <tr><td style="padding:32px;">
    <p style="font-size:16px;color:#333;line-height:1.6;">Thank you for agreeing to help us test the new <strong>AllStarTeams (AST)</strong> and <strong>Imaginal Agility (IA)</strong> experiences!</p>

    <p style="font-size:16px;color:#333;line-height:1.6;"><strong>Your mission:</strong> Complete the short self-guided workshops as yourself &mdash; the more authentic your answers, the more meaningful your personalized insights will be.</p>

    <p style="font-size:16px;color:#333;line-height:1.6;">If you&rsquo;d like to share feedback as you go, look for the purple <strong>&ldquo;Beta Notes&rdquo; button</strong> in the lower-right corner of the screen (optional). It&rsquo;s helpful for reporting bugs, flagging confusing wording, suggesting improvements, or asking questions. Your notes are automatically connected to the step you&rsquo;re on.</p>

    <h2 style="font-size:18px;color:#333;margin:24px 0 12px;">Getting started:</h2>
    <ol style="font-size:16px;color:#333;line-height:1.8;padding-left:20px;">
      <li>Go to <a href="{{invite_url}}" style="color:#059669;font-weight:bold;">{{platform_url}}/register</a></li>
      <li>Enter your invite code: <strong>{{invite_code}}</strong></li>
      <li>Create your profile &mdash; upload a photo and set your password. If you forget your password, email me</li>
      <li>Click <strong>Login</strong> to begin the experience.</li>
    </ol>

    <p style="font-size:16px;color:#333;line-height:1.6;">You will see a screen that allows you to choose between the AST and the Imaginal Agility (IA) Workshops. I suggest AST first, but you can switch to the other workshop at any time via the profile menu in the upper-right corner. If you switch mid-activity, make sure you finish what you are doing, or it may not save.</p>

    <p style="font-size:16px;color:#333;line-height:1.6;">In <strong>AllStarTeams</strong>, you&rsquo;ll see a menu of <strong>five modules</strong> &mdash; modules 1&ndash;3 make up the main workshop. When you finish all assessments and reflections, click <strong>&ldquo;Finish Workshop&rdquo;</strong> to unlock your <strong>StarCard</strong> and personalized <strong>holistic report</strong>. You can view your report, print it, or save it as a PDF, then explore the optional modules.</p>

    <p style="font-size:16px;color:#333;line-height:1.6;">In <strong>Imaginal Agility</strong>, you will find some learning content and then activities using AI to connect the I4C Human Capabilities (Imagination, Caring, Courage, Creativity, and Curiosity) and AI in contrast and collaboration.</p>

    <h2 style="font-size:18px;color:#333;margin:24px 0 12px;">Quick tips:</h2>
    <ul style="font-size:16px;color:#333;line-height:1.8;padding-left:20px;">
      <li>Best on a <strong>desktop or laptop browser</strong> &mdash; other devices may not work as intended.</li>
      <li><strong>Responses are saved</strong> when you leave a page. If you refresh or time out mid-answer, it may not be recorded.</li>
      <li>Videos include <strong>sound</strong> &mdash; make sure your system volume isn&rsquo;t muted.</li>
      <li>If you encounter an <strong>error</strong>, refresh your browser; if it persists, email Brad.</li>
    </ul>

    <p style="font-size:16px;color:#333;line-height:1.6;">Enjoy the microcourse &mdash; and thank you for helping us make AllStarTeams and Imaginal Agility even better.</p>

    <p style="font-size:16px;color:#333;line-height:1.6;">Brad</p>
  </td></tr>
  <tr><td style="background:#f8f8fa;padding:20px 32px;text-align:center;">
    <p style="font-size:12px;color:#999;margin:0;">{{platform_name}} &middot; Beta Program &middot; {{current_year}}<br>
    <a href="mailto:{{support_email}}" style="color:#059669;">{{support_email}}</a></p>
  </td></tr>
</table>
</td></tr></table>
</body>
</html>`,
      plainTextContent: `Thank you for agreeing to help us test the new AllStarTeams (AST) and Imaginal Agility (IA) experiences!

Your mission: Complete the short self-guided workshops as yourself — the more authentic your answers, the more meaningful your personalized insights will be.

If you'd like to share feedback as you go, look for the purple "Beta Notes" button in the lower-right corner of the screen (optional). It's helpful for reporting bugs, flagging confusing wording, suggesting improvements, or asking questions. Your notes are automatically connected to the step you're on.

Getting started:

1. Go to {{platform_url}}/register
2. Enter your invite code: {{invite_code}}
3. Create your profile — upload a photo and set your password. If you forget your password, email me
4. Click Login to begin the experience.

You will see a screen that allows you to choose between the AST and the Imaginal Agility (IA) Workshops. I suggest AST first, but you can switch to the other workshop at any time via the profile menu in the upper-right corner. If you switch mid-activity, make sure you finish what you are doing, or it may not save.

In AllStarTeams, you'll see a menu of five modules — modules 1–3 make up the main workshop. When you finish all assessments and reflections, click "Finish Workshop" to unlock your StarCard and personalized holistic report. You can view your report, print it, or save it as a PDF, then explore the optional modules.

In Imaginal Agility, you will find some learning content and then activities using AI to connect the I4C Human Capabilities (Imagination, Caring, Courage, Creativity, and Curiosity) and AI in contrast and collaboration.

Quick tips:
- Best on a desktop or laptop browser — other devices may not work as intended.
- Responses are saved when you leave a page. If you refresh or time out mid-answer, it may not be recorded.
- Videos include sound — make sure your system volume isn't muted.
- If you encounter an error, refresh your browser; if it persists, email Brad.

Enjoy the microcourse — and thank you for helping us make AllStarTeams and Imaginal Agility even better.

Brad
{{support_email}}`,
    },
    {
      name: 'Welcome — AllStarTeams Only',
      description: 'Welcome email for AST-only invites',
      subject: 'Welcome to AllStarTeams — Discover Your Star Power!',
      templateCategory: 'workshop_specific' as const,
      workshopType: 'ast' as 'ast',
      isDefault: false,
      htmlContent: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
  <tr><td style="background:linear-gradient(135deg,#2563EB,#3B82F6);padding:32px;text-align:center;">
    <h1 style="color:#ffffff;margin:0;font-size:24px;">Welcome to AllStarTeams</h1>
  </td></tr>
  <tr><td style="padding:32px;">
    <p style="font-size:16px;color:#333;">Hi {{invite_name}},</p>
    <p style="font-size:16px;color:#333;">You've been invited to the <strong>AllStarTeams</strong> workshop — a journey to discover your strengths, flow patterns, and future potential.</p>
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 0;">
      <a href="{{invite_url}}" style="background:#2563EB;color:#ffffff;padding:14px 32px;border-radius:6px;text-decoration:none;font-size:16px;font-weight:bold;display:inline-block;">Begin Your Journey</a>
    </td></tr></table>
    <p style="font-size:14px;color:#666;">Invite code: <strong>{{invite_code}}</strong></p>
    {{#if invite_expires_at}}<p style="font-size:14px;color:#666;">Expires: {{invite_expires_at}}</p>{{/if}}
    <p style="font-size:16px;color:#333;">— The {{platform_name}} Team</p>
  </td></tr>
  <tr><td style="background:#f8f8fa;padding:20px 32px;text-align:center;">
    <p style="font-size:12px;color:#999;margin:0;">{{platform_name}} &middot; {{current_year}}<br>
    <a href="mailto:{{support_email}}" style="color:#2563EB;">{{support_email}}</a></p>
  </td></tr>
</table>
</td></tr></table>
</body>
</html>`,
      plainTextContent: `Hi {{invite_name}},

You've been invited to the AllStarTeams workshop — a journey to discover your strengths, flow patterns, and future potential.

Get started: {{invite_url}}
Invite code: {{invite_code}}
{{#if invite_expires_at}}Expires: {{invite_expires_at}}{{/if}}

— The {{platform_name}} Team
{{support_email}}`,
    },
    {
      name: 'Welcome — Imaginal Agility Only',
      description: 'Welcome email for IA-only invites',
      subject: 'Welcome to Imaginal Agility — Expand Your Perspective!',
      templateCategory: 'workshop_specific' as const,
      workshopType: 'ia' as 'ia',
      isDefault: false,
      htmlContent: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
  <tr><td style="background:linear-gradient(135deg,#7C3AED,#A855F7);padding:32px;text-align:center;">
    <h1 style="color:#ffffff;margin:0;font-size:24px;">Welcome to Imaginal Agility</h1>
  </td></tr>
  <tr><td style="padding:32px;">
    <p style="font-size:16px;color:#333;">Hi {{invite_name}},</p>
    <p style="font-size:16px;color:#333;">You've been invited to the <strong>Imaginal Agility</strong> workshop — an experience designed to build mental flexibility and expand your creative problem-solving capacity.</p>
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 0;">
      <a href="{{invite_url}}" style="background:#7C3AED;color:#ffffff;padding:14px 32px;border-radius:6px;text-decoration:none;font-size:16px;font-weight:bold;display:inline-block;">Get Started</a>
    </td></tr></table>
    <p style="font-size:14px;color:#666;">Invite code: <strong>{{invite_code}}</strong></p>
    {{#if invite_expires_at}}<p style="font-size:14px;color:#666;">Expires: {{invite_expires_at}}</p>{{/if}}
    <p style="font-size:16px;color:#333;">— The {{platform_name}} Team</p>
  </td></tr>
  <tr><td style="background:#f8f8fa;padding:20px 32px;text-align:center;">
    <p style="font-size:12px;color:#999;margin:0;">{{platform_name}} &middot; {{current_year}}<br>
    <a href="mailto:{{support_email}}" style="color:#7C3AED;">{{support_email}}</a></p>
  </td></tr>
</table>
</td></tr></table>
</body>
</html>`,
      plainTextContent: `Hi {{invite_name}},

You've been invited to the Imaginal Agility workshop — an experience designed to build mental flexibility and expand your creative problem-solving capacity.

Get started: {{invite_url}}
Invite code: {{invite_code}}
{{#if invite_expires_at}}Expires: {{invite_expires_at}}{{/if}}

— The {{platform_name}} Team
{{support_email}}`,
    },
  ];

  for (const t of templates) {
    await db.insert(emailTemplates).values({
      name: t.name,
      description: t.description,
      subject: t.subject,
      htmlContent: t.htmlContent,
      plainTextContent: t.plainTextContent,
      templateCategory: t.templateCategory,
      workshopType: t.workshopType,
      createdBy: adminUserId,
      isSystemTemplate: true,
      isShared: true,
      isActive: true,
      isDefault: t.isDefault,
      tags: '[]',
    });
  }

  console.log(`[email-seed] Seeded ${templates.length} default email templates.`);
}
