import { db } from '../db.js';
import {
  emailTemplates,
  templateAssignments,
  users,
  type InsertEmailTemplate,
} from '../../shared/schema.js';
import { eq, and, or, sql, desc } from 'drizzle-orm';

class EmailTemplateService {
  // ── Create ──────────────────────────────────────────────────────────────────

  async createTemplate(data: {
    name: string;
    description?: string;
    subject: string;
    htmlContent: string;
    plainTextContent?: string;
    templateCategory?: 'welcome' | 'beta_tester' | 'workshop_specific' | 'custom';
    workshopType?: 'ast' | 'ia' | 'both' | null;
    createdBy: number;
    isSystemTemplate?: boolean;
    isShared?: boolean;
    isDefault?: boolean;
    tags?: string[];
  }) {
    const [template] = await db
      .insert(emailTemplates)
      .values({
        name: data.name,
        description: data.description ?? null,
        subject: data.subject,
        htmlContent: data.htmlContent,
        plainTextContent: data.plainTextContent ?? null,
        templateCategory: data.templateCategory || 'custom',
        workshopType: data.workshopType ?? null,
        createdBy: data.createdBy,
        isSystemTemplate: data.isSystemTemplate ?? false,
        isShared: data.isShared ?? false,
        isDefault: data.isDefault ?? false,
        tags: data.tags ? JSON.stringify(data.tags) : '[]',
      })
      .returning();

    return template;
  }

  // ── Read ────────────────────────────────────────────────────────────────────

  /**
   * Get a single template by ID.
   */
  async getTemplateById(id: number) {
    const [template] = await db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.id, id))
      .limit(1);
    return template ?? null;
  }

  /**
   * List templates visible to a given user:
   * - Admins see everything
   * - Facilitators see: their own, system templates, shared templates, and assigned templates
   */
  async getTemplatesForUser(userId: number, role: string) {
    if (role === 'admin') {
      return db
        .select()
        .from(emailTemplates)
        .where(eq(emailTemplates.isActive, true))
        .orderBy(desc(emailTemplates.updatedAt));
    }

    // Facilitator: own + system + shared + assigned
    const assignedIds = db
      .select({ templateId: templateAssignments.templateId })
      .from(templateAssignments)
      .where(eq(templateAssignments.assignedTo, userId));

    return db
      .select()
      .from(emailTemplates)
      .where(
        and(
          eq(emailTemplates.isActive, true),
          or(
            eq(emailTemplates.createdBy, userId),
            eq(emailTemplates.isSystemTemplate, true),
            eq(emailTemplates.isShared, true),
            sql`${emailTemplates.id} IN (${assignedIds})`,
          ),
        ),
      )
      .orderBy(desc(emailTemplates.updatedAt));
  }

  // ── Update ──────────────────────────────────────────────────────────────────

  async updateTemplate(
    id: number,
    data: Partial<{
      name: string;
      description: string | null;
      subject: string;
      htmlContent: string;
      plainTextContent: string | null;
      templateCategory: string;
      workshopType: string | null;
      isShared: boolean;
      isActive: boolean;
      isDefault: boolean;
      tags: string[];
    }>,
  ) {
    const updateValues: Record<string, any> = { ...data, updatedAt: new Date() };
    if (data.tags) {
      updateValues.tags = JSON.stringify(data.tags);
    }

    // Bump version on content changes
    if (data.htmlContent || data.subject) {
      updateValues.version = sql`${emailTemplates.version} + 1`;
    }

    const [updated] = await db
      .update(emailTemplates)
      .set(updateValues)
      .where(eq(emailTemplates.id, id))
      .returning();

    return updated ?? null;
  }

  // ── Delete (soft — sets isActive=false) ─────────────────────────────────────

  async deleteTemplate(id: number) {
    const [deleted] = await db
      .update(emailTemplates)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(emailTemplates.id, id))
      .returning();
    return deleted ?? null;
  }

  // ── Clone ───────────────────────────────────────────────────────────────────

  async cloneTemplate(id: number, newOwnerId: number) {
    const source = await this.getTemplateById(id);
    if (!source) throw new Error(`Template ${id} not found`);

    return this.createTemplate({
      name: `${source.name} (copy)`,
      description: source.description ?? undefined,
      subject: source.subject,
      htmlContent: source.htmlContent,
      plainTextContent: source.plainTextContent ?? undefined,
      templateCategory: source.templateCategory as any,
      workshopType: source.workshopType as any,
      createdBy: newOwnerId,
      isSystemTemplate: false,
      isShared: false,
      isDefault: false,
      tags: Array.isArray(source.tags) ? source.tags as string[] : [],
    });
  }

  // ── Assignments ─────────────────────────────────────────────────────────────

  async assignTemplate(data: {
    templateId: number;
    assignedTo: number;
    assignedBy: number;
    canEdit?: boolean;
    canReassign?: boolean;
  }) {
    const [assignment] = await db
      .insert(templateAssignments)
      .values({
        templateId: data.templateId,
        assignedTo: data.assignedTo,
        assignedBy: data.assignedBy,
        canEdit: data.canEdit ?? false,
        canReassign: data.canReassign ?? false,
      })
      .onConflictDoUpdate({
        target: [templateAssignments.templateId, templateAssignments.assignedTo],
        set: {
          canEdit: data.canEdit ?? false,
          canReassign: data.canReassign ?? false,
          assignedBy: data.assignedBy,
          assignedAt: new Date(),
        },
      })
      .returning();
    return assignment;
  }

  async removeAssignment(templateId: number, assignedTo: number) {
    await db
      .delete(templateAssignments)
      .where(
        and(
          eq(templateAssignments.templateId, templateId),
          eq(templateAssignments.assignedTo, assignedTo),
        ),
      );
  }

  async getAssignmentsForTemplate(templateId: number) {
    return db
      .select({
        assignment: templateAssignments,
        userName: users.name,
        userEmail: users.email,
      })
      .from(templateAssignments)
      .innerJoin(users, eq(templateAssignments.assignedTo, users.id))
      .where(eq(templateAssignments.templateId, templateId));
  }

  // ── Ownership check ─────────────────────────────────────────────────────────

  async canUserEditTemplate(userId: number, templateId: number, role: string): Promise<boolean> {
    if (role === 'admin') return true;

    const template = await this.getTemplateById(templateId);
    if (!template) return false;

    // Owner can always edit
    if (template.createdBy === userId) return true;

    // Check assignment with canEdit
    const [assignment] = await db
      .select()
      .from(templateAssignments)
      .where(
        and(
          eq(templateAssignments.templateId, templateId),
          eq(templateAssignments.assignedTo, userId),
          eq(templateAssignments.canEdit, true),
        ),
      )
      .limit(1);

    return !!assignment;
  }
}

export const emailTemplateService = new EmailTemplateService();
