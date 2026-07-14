import { db } from '../db.js';
import { emailTemplates } from '../../shared/schema.js';
import { sql } from 'drizzle-orm';

/**
 * Seed the default system email templates.
 * Uses admin user (id=1) as creator. Safe to re-run — each template is matched by
 * name, so re-running adds any newly-defined templates without touching existing ones.
 */
export async function seedEmailTemplates(adminUserId = 1) {
  const existing = await db
    .select({ name: emailTemplates.name })
    .from(emailTemplates)
    .where(sql`${emailTemplates.isSystemTemplate} = true`);

  const existingNames = new Set(existing.map(t => t.name));

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
    {
      // Generalised from the original pilot-cohort welcome email. All cohort-specific
      // details (school name, facilitator names, timezone, dates, Zoom links) are now
      // variables: the schedule table is generated from the cohort's own sessions.
      name: 'Cohort Welcome — Schedule & Access',
      description: 'Welcome email for a cohort: introduces the facilitator, shares the invite code, and renders the cohort session schedule',
      subject: 'Welcome to {{platform_name}} — Your Schedule and Access',
      templateCategory: 'welcome' as const,
      workshopType: 'both' as 'both',
      isDefault: false,
      htmlContent: `<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: rgb(51, 51, 51);">
<p>Hi {{invite_name}},</p>
<p>We're looking forward to our upcoming sessions with you. We wanted to share the schedule and your access information ahead of time so you're all set.</p>
<p>I'm {{facilitator_name}} — your point of contact for the platform.{{#if facilitator_email}} If you need any help, reach me directly at <a href="mailto:{{facilitator_email}}">{{facilitator_email}}</a>.{{/if}}</p>
<p>During our first session, we'll provide a brief overview and then share the link to begin your exploration in the app.</p>
<p>Your invite code: <strong>{{invite_code}}</strong> — we'll walk you through how to use it in our first session.</p>
<p>You can also get started any time at <a href="{{invite_url}}">{{invite_url}}</a>.</p>
{{#if session_schedule_html}}
<p><strong>Session Schedule</strong></p>
{{{session_schedule_html}}}
{{/if}}
<p>If you have any questions before we begin, don't hesitate to reach out.</p>
<p>We look forward to seeing you soon.</p>
<p>{{facilitator_name}}<br>{{platform_name}}</p>
<p><a href="https://www.heliotropeimaginal.com"><img src="https://www.heliotropeimaginal.com/images/Heliotrope-Imaginal-logo.horizongal.black-text.png" alt="Heliotrope Imaginal" width="200"></a></p>
<hr>
<p style="font-size: 12px; color: rgb(136, 136, 136);">This message is from imaginalmail.com, part of the Heliotrope Imaginal platform. You may also see references to our data partner selfactual.ai or our microcourse product allstarteams.co. If you're not receiving expected emails, please check your spam or junk folder.</p>
</div>`,
      plainTextContent: `Hi {{invite_name}},

We're looking forward to our upcoming sessions with you. We wanted to share the schedule and your access information ahead of time so you're all set.

I'm {{facilitator_name}} — your point of contact for the platform.{{#if facilitator_email}} If you need any help, reach me directly at {{facilitator_email}}.{{/if}}

During our first session, we'll provide a brief overview and then share the link to begin your exploration in the app.

Your invite code: {{invite_code}} — we'll walk you through how to use it in our first session.
You can also get started any time at {{invite_url}}

{{#if session_schedule}}SESSION SCHEDULE

{{session_schedule}}{{/if}}

If you have any questions before we begin, don't hesitate to reach out.

We look forward to seeing you soon.

{{facilitator_name}}
{{platform_name}}`,
    },
  ];

  const toInsert = templates.filter(t => !existingNames.has(t.name));

  if (toInsert.length === 0) {
    console.log('[email-seed] All system templates already present — nothing to seed.');
    return;
  }

  for (const t of toInsert) {
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

  console.log(`[email-seed] Seeded ${toInsert.length} email template(s): ${toInsert.map(t => t.name).join(', ')}`);
}

/**
 * Seed the Handlebars variable definitions that power the editor's variable picker
 * and preview rendering. Keys must match what emailVariableService.buildVariableContext()
 * actually returns. Safe to re-run — conflicts on variable_key are ignored.
 */
export async function seedTemplateVariables() {
  const vars: Array<[string, string, string, string, string, string]> = [
    // key, name, description, category, dataType, exampleValue
    ['invite_code', 'Invite Code', 'Formatted invite code with hyphens', 'invite', 'string', 'ABCD-EFGH-IJKL'],
    ['invite_code_raw', 'Invite Code (Raw)', 'Raw invite code without formatting', 'invite', 'string', 'ABCDEFGHIJKL'],
    ['invite_url', 'Invite URL', 'Full registration URL with invite code', 'invite', 'string', 'https://app2.heliotropeimaginal.com/register/ABCD-EFGH-IJKL'],
    ['invite_email', 'Recipient Email', 'Email address of the invite recipient', 'invite', 'string', 'user@example.com'],
    ['invite_name', 'Recipient Name', 'Name of the invite recipient', 'invite', 'string', 'Jane Smith'],
    ['invite_expires_at', 'Invite Expiry', 'When the invite expires', 'invite', 'date', '5/1/2026'],
    ['facilitator_name', 'Facilitator Name', 'Name of the facilitator who created the invite', 'user', 'string', 'Brad Topliff'],
    ['facilitator_email', 'Facilitator Email', 'Email of the facilitator who created the invite', 'user', 'string', 'brad@allstarteams.co'],
    ['has_ast_access', 'Has AST Access', 'Whether the invite grants AllStarTeams access', 'workshop', 'boolean', 'true'],
    ['has_ia_access', 'Has IA Access', 'Whether the invite grants Imaginal Agility access', 'workshop', 'boolean', 'true'],
    ['workshop_names', 'Workshop Names', 'Comma-separated list of granted workshop names', 'workshop', 'string', 'AllStarTeams, Imaginal Agility'],
    ['is_beta_tester', 'Is Beta Tester', 'Whether the recipient is a beta tester', 'user', 'boolean', 'false'],
    // category is constrained to user|invite|workshop|platform|conditional
    ['session_schedule', 'Session Schedule (Text)', "The cohort's session schedule as plain text", 'workshop', 'string', 'SELF AWARENESS\n\nSession 1 – Web App – Mon, Jun 29, 2026 – 4:00 PM–5:30 PM'],
    ['session_schedule_html', 'Session Schedule (Table)', "The cohort's session schedule as an HTML table. Insert with triple braces to render as a table.", 'workshop', 'string', '<table><tr><td>Session 1</td></tr></table>'],
    ['platform_name', 'Platform Name', 'Name of the platform', 'platform', 'string', 'Heliotrope Imaginal'],
    ['platform_url', 'Platform URL', 'URL of the platform', 'platform', 'string', 'https://app2.heliotropeimaginal.com'],
    ['support_email', 'Support Email', 'Support contact email', 'platform', 'string', 'support@heliotropeimaginal.com'],
    ['current_year', 'Current Year', 'Current calendar year', 'platform', 'string', new Date().getFullYear().toString()],
  ];

  for (const [key, name, description, category, dataType, exampleValue] of vars) {
    await db.execute(sql`
      INSERT INTO template_variables (variable_key, variable_name, description, category, data_type, example_value)
      VALUES (${key}, ${name}, ${description}, ${category}, ${dataType}, ${exampleValue})
      ON CONFLICT (variable_key) DO UPDATE
        SET variable_name = EXCLUDED.variable_name,
            description   = EXCLUDED.description,
            category      = EXCLUDED.category,
            data_type     = EXCLUDED.data_type,
            example_value = EXCLUDED.example_value
    `);
  }

  console.log(`[email-seed] Seeded ${vars.length} template variables.`);
}
