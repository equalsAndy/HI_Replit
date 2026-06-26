import Handlebars from 'handlebars';
import { db } from '../db.js';
import { templateVariables, invites, users } from '../../shared/schema.js';
import { eq, sql } from 'drizzle-orm';

// Sender identity display names & emails — all use imaginalmail.com
export const SENDER_IDENTITIES = {
  heliotrope: {
    name: 'Heliotrope Imaginal',
    email: process.env.SES_FROM_EMAIL_HELIOTROPE || 'noreply@imaginalmail.com',
  },
  allstarteams: {
    name: 'AllStarTeams',
    email: process.env.SES_FROM_EMAIL_AST || 'ast@imaginalmail.com',
  },
  imaginalagility: {
    name: 'Imaginal Agility',
    email: process.env.SES_FROM_EMAIL_IA || 'ia@imaginalmail.com',
  },
} as const;

export type SenderIdentity = keyof typeof SENDER_IDENTITIES;

/**
 * Service for resolving Handlebars template variables from invite + platform context.
 */
class EmailVariableService {
  /**
   * Return all variable definitions from the database (for the Tiptap picker UI).
   */
  async getVariableDefinitions() {
    return db.select().from(templateVariables);
  }

  /**
   * Build the full variable context for a given invite, ready to pass to Handlebars.
   */
  async buildVariableContext(inviteId: number): Promise<Record<string, string | boolean>> {
    // Fetch invite
    const [invite] = await db
      .select()
      .from(invites)
      .where(eq(invites.id, inviteId))
      .limit(1);

    if (!invite) {
      throw new Error(`Invite ${inviteId} not found`);
    }

    // Look up the facilitator who created the invite
    let facilitatorName = 'Your Facilitator';
    let facilitatorEmail = '';
    if (invite.createdBy) {
      const facilitatorRows = await db.execute(sql`
        SELECT first_name, last_name, email FROM users WHERE id = ${invite.createdBy} LIMIT 1
      `);
      const f = ((facilitatorRows as any).rows ?? facilitatorRows ?? [])[0];
      if (f) {
        facilitatorName = [f.first_name, f.last_name].filter(Boolean).join(' ') || 'Your Facilitator';
        facilitatorEmail = f.email || '';
      }
    }

    const platformUrl = process.env.PLATFORM_URL || 'https://app2.heliotropeimaginal.com';

    // Format invite code with hyphens (XXX-XXX-XXXX pattern)
    const raw = invite.inviteCode;
    const formatted = raw.length === 12
      ? `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8)}`
      : raw;

    // Build workshop names list
    const workshopNames: string[] = [];
    if (invite.astAccess) workshopNames.push('AllStarTeams');
    if (invite.iaAccess) workshopNames.push('Imaginal Agility');

    return {
      invite_code: formatted,
      invite_code_raw: raw,
      invite_url: `${platformUrl}/register/${formatted}`,
      invite_email: invite.email,
      invite_name: invite.name || 'there',
      facilitator_name: facilitatorName,
      facilitator_email: facilitatorEmail,
      invite_expires_at: invite.expiresAt ? new Date(invite.expiresAt).toLocaleDateString() : '',
      has_ast_access: !!invite.astAccess,
      has_ia_access: !!invite.iaAccess,
      workshop_names: workshopNames.join(', '),
      is_beta_tester: !!invite.isBetaTester,
      platform_name: 'Heliotrope Imaginal',
      platform_url: platformUrl,
      support_email: process.env.SUPPORT_EMAIL || 'support@heliotropeimaginal.com',
      current_year: new Date().getFullYear().toString(),
    };
  }

  /**
   * Strip Tiptap VariableNode chip wrappers from HTML before Handlebars rendering.
   * Converts `<span class="variable-node" ...>{{var}}</span>` → `{{var}}`
   * so that rendered values inherit surrounding text formatting, not chip styling.
   */
  private stripVariableNodeWrappers(html: string): string {
    return html.replace(
      /<span[^>]*class="variable-node"[^>]*>(\{\{[^}]+\}\})<\/span>/g,
      '$1',
    );
  }

  /**
   * Compile a Handlebars template string, returning rendered HTML.
   * Strips VariableNode chip styling first so values look like normal text.
   */
  renderTemplate(templateString: string, variables: Record<string, any>): string {
    const cleaned = this.stripVariableNodeWrappers(templateString);
    const compiled = Handlebars.compile(cleaned);
    return compiled(variables);
  }

  /**
   * Render both HTML and plain-text versions of a template with the given variables.
   */
  renderBoth(
    htmlTemplate: string,
    plainTextTemplate: string | null,
    variables: Record<string, any>,
  ): { html: string; plainText: string } {
    const html = this.renderTemplate(htmlTemplate, variables);
    const plainText = plainTextTemplate
      ? this.renderTemplate(plainTextTemplate, variables)
      : this.stripHtml(html);
    return { html, plainText };
  }

  /**
   * Return sample variable values (from the template_variables table) for preview rendering.
   */
  async getSampleVariables(): Promise<Record<string, string>> {
    const vars = await db.select().from(templateVariables);
    const sample: Record<string, string> = {};
    for (const v of vars) {
      sample[v.variableKey] = v.exampleValue || v.fallbackValue || '';
    }
    return sample;
  }

  /**
   * Naive HTML-to-plain-text fallback: strip tags, collapse whitespace.
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
}

export const emailVariableService = new EmailVariableService();
