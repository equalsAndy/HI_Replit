import { db } from '../db.js';
import { invites, users, cohorts, organizations } from '../../shared/schema.js';
import { eq, sql } from 'drizzle-orm';
import { generateInviteCode } from '../utils/invite-code.js';

class InviteService {
  /**
   * Create a new invite with cohort and organization assignment
   */
  async createInviteWithAssignment(data: {
    email: string;
    role: 'admin' | 'facilitator' | 'participant' | 'student';
    name?: string;
    cohortId?: number | null;
    organizationId?: string | null;
    createdBy: number;
    expiresAt?: Date;
    isBetaTester?: boolean;
    astAccess?: boolean;
    iaAccess?: boolean;
    showDemoDataButtons?: boolean;
  }) {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return {
          success: false,
          error: 'Invalid email format'
        };
      }
      
      // Prevent duplicate invites for the same email
      const existingInvites = await db.select().from(invites).where(eq(invites.email, data.email.toLowerCase()));
      if (existingInvites.length > 0) {
        return { success: false, error: 'An invite already exists for this email' };
      }
      // Generate a unique invite code (remove hyphens to fit 12-char limit)
      const inviteCode = generateInviteCode().replace(/-/g, '');
      
      // Ensure code fits database constraint (max 12 characters)
      if (inviteCode.length > 12) {
        throw new Error('Generated invite code exceeds database limit');
      }
      
      // Insert the invite into the database with cohort and organization assignment
      const result = await db.execute(sql`
        INSERT INTO invites (invite_code, email, role, name, created_by, expires_at, cohort_id, organization_id, is_beta_tester, ast_access, ia_access, show_demo_data_buttons)
        VALUES (
          ${inviteCode},
          ${data.email.toLowerCase()},
          ${data.role},
          ${data.name || null},
          ${data.createdBy},
          ${data.expiresAt || null},
          ${data.cohortId || null},
          ${data.organizationId || null},
          ${data.isBetaTester || false},
          ${data.astAccess ?? true},
          ${data.iaAccess ?? true},
          ${data.showDemoDataButtons ?? false}
        )
        RETURNING *
      `);
      
      // Handle different result structures from drizzle
      const inviteData = (result as any)[0] || (result as any).rows?.[0] || {
        invite_code: inviteCode,
        email: data.email.toLowerCase(),
        role: data.role,
        name: data.name || null,
        created_by: data.createdBy,
        expires_at: data.expiresAt || null,
        cohort_id: data.cohortId || null,
        organization_id: data.organizationId || null,
        is_beta_tester: data.isBetaTester || false,
        ast_access: data.astAccess ?? true,
        ia_access: data.iaAccess ?? true,
        show_demo_data_buttons: data.showDemoDataButtons ?? false,
        created_at: new Date(),
        used_at: null,
        used_by: null
      };

      return {
        success: true,
        invite: {
          ...inviteData,
          formattedCode: this.formatInviteCode(inviteCode)
        }
      };
    } catch (error) {
      console.error('Error creating invite:', error);
      return {
        success: false,
        error: 'Failed to create invite'
      };
    }
  }

  /**
   * Legacy create invite method for backward compatibility
   */
  async createInvite(data: {
    email: string;
    role: string;
    name?: string;
    createdBy: number;
    expiresAt?: Date;
    cohortId?: string;
    organizationId?: string;
    isBetaTester?: boolean;
    astAccess?: boolean;
    iaAccess?: boolean;
    showDemoDataButtons?: boolean;
  }) {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return {
          success: false,
          error: 'Invalid email format'
        };
      }
      
      // Generate a unique invite code (remove hyphens to fit 12-char limit)
      const inviteCode = generateInviteCode().replace(/-/g, '');
      
      // Ensure code fits database constraint (max 12 characters)
      if (inviteCode.length > 12) {
        throw new Error('Generated invite code exceeds database limit');
      }
      
      // Insert the invite into the database using raw SQL to bypass schema issues
      const result = await db.execute(sql`
        INSERT INTO invites (invite_code, email, role, name, created_by, expires_at, cohort_id, organization_id, is_beta_tester, ast_access, ia_access, show_demo_data_buttons)
        VALUES (
          ${inviteCode},
          ${data.email.toLowerCase()},
          ${data.role},
          ${data.name || null},
          ${data.createdBy},
          ${data.expiresAt || null},
          ${data.cohortId ? parseInt(data.cohortId) : null},
          ${data.organizationId || null},
          ${data.isBetaTester || false},
          ${data.astAccess ?? true},
          ${data.iaAccess ?? true},
          ${data.showDemoDataButtons ?? false}
        )
        RETURNING *
      `);
      
      // Handle different result structures from drizzle
      const inviteData = (result as any)[0] || (result as any).rows?.[0] || {
        invite_code: inviteCode,
        email: data.email.toLowerCase(),
        role: data.role,
        name: data.name || null,
        created_by: data.createdBy,
        expires_at: data.expiresAt || null,
        is_beta_tester: data.isBetaTester || false,
        ast_access: data.astAccess ?? true,
        ia_access: data.iaAccess ?? true,
        show_demo_data_buttons: data.showDemoDataButtons ?? false,
        created_at: new Date(),
        used_at: null,
        used_by: null
      };
      
      return {
        success: true,
        invite: inviteData
      };
    } catch (error) {
      console.error('Error creating invite:', error);
      return {
        success: false,
        error: 'Failed to create invite'
      };
    }
  }
  
  /**
   * Get an invite by code
   */
  async getInviteByCode(inviteCode: string) {
    try {
      const result = await db.select()
        .from(invites)
        .where(eq(invites.inviteCode, inviteCode));
      
      if (!result || result.length === 0) {
        return {
          success: false,
          error: 'Invite not found'
        };
      }
      
      return {
        success: true,
        invite: result[0]
      };
    } catch (error) {
      console.error('Error fetching invite:', error);
      return {
        success: false,
        error: 'Failed to fetch invite'
      };
    }
  }

  /**
   * Get an invite by id
   */
  async getInviteById(id: number) {
    try {
      const result = await db.select()
        .from(invites)
        .where(eq(invites.id, id));
      
      if (!result || result.length === 0) {
        return {
          success: false,
          error: 'Invite not found'
        };
      }
      
      return {
        success: true,
        invite: result[0]
      };
    } catch (error) {
      console.error('Error fetching invite by id:', error);
      return {
        success: false,
        error: 'Failed to fetch invite'
      };
    }
  }

  /**
   * Update an invite (pending only)
   */
  async updateInvite(id: number, updates: {
    name?: string;
    role?: 'admin' | 'facilitator' | 'participant' | 'student';
    isBetaTester?: boolean;
    astAccess?: boolean;
    iaAccess?: boolean;
    showDemoDataButtons?: boolean;
  }) {
    try {
      // Build dynamic set clauses
      const setClauses: any[] = [];
      if (updates.name !== undefined) setClauses.push(sql`name = ${updates.name}`);
      if (updates.role !== undefined) setClauses.push(sql`role = ${updates.role}`);
      if (updates.isBetaTester !== undefined) setClauses.push(sql`is_beta_tester = ${updates.isBetaTester}`);
      if (updates.astAccess !== undefined) setClauses.push(sql`ast_access = ${updates.astAccess}`);
      if (updates.iaAccess !== undefined) setClauses.push(sql`ia_access = ${updates.iaAccess}`);
      if (updates.showDemoDataButtons !== undefined) setClauses.push(sql`show_demo_data_buttons = ${updates.showDemoDataButtons}`);

      if (setClauses.length === 0) {
        return { success: false, error: 'No fields provided for update' };
      }

      const query = sql`
        UPDATE invites
        SET ${sql.join(setClauses, sql`, `)}
        WHERE id = ${id} AND used_at IS NULL
        RETURNING *
      `;

      const result = await db.execute(query);
      const inviteData = (result as any)[0] || (result as any).rows?.[0];

      if (!inviteData) {
        return { success: false, error: 'Invite not found or already used' };
      }

      return { success: true, invite: inviteData };
    } catch (error) {
      console.error('Error updating invite:', error);
      return {
        success: false,
        error: 'Failed to update invite'
      };
    }
  }
  
  /**
   * Mark an invite as used
   */
  async markInviteAsUsed(inviteCode: string, userId: number) {
    try {
      const result = await db.execute(sql`
        UPDATE invites 
        SET used_at = NOW(), used_by = ${userId}
        WHERE invite_code = ${inviteCode}
        RETURNING *
      `);
      
      const inviteData = (result as any)[0] || (result as any).rows?.[0];
      return {
        success: true,
        invite: inviteData
      };
    } catch (error) {
      console.error('Error marking invite as used:', error);
      return {
        success: false,
        error: 'Failed to mark invite as used'
      };
    }
  }
  
  /**
   * Get all invites created by a specific user
   */
  async getInvitesByCreator(creatorId: number) {
    try {
      const result = await db.select()
        .from(invites)
        .where(eq(invites.createdBy, creatorId));
      
      return {
        success: true,
        invites: result
      };
    } catch (error) {
      console.error('Error fetching invites by creator:', error);
      return {
        success: false,
        error: 'Failed to fetch invites'
      };
    }
  }
  
  /**
   * Get invites with enhanced information (cohort, organization names, user status)
   */
  async getInvitesWithDetails(creatorId?: number, status?: 'used' | 'pending') {
    try {
      let base = sql`
        SELECT 
          i.*, 
          creator.name as creator_name,
          creator.email as creator_email,
          creator.role as creator_role,
          c.name as cohort_name,
          o.name as organization_name,
          invited_user.is_test_user,
          invited_user.is_beta_tester as user_is_beta_tester,
          used_user.name as used_by_name,
          used_user.email as used_by_email
        FROM invites i
        LEFT JOIN users creator ON i.created_by = creator.id
        LEFT JOIN cohorts c ON i.cohort_id = c.id
        LEFT JOIN organizations o ON i.organization_id = o.id
        LEFT JOIN users invited_user ON i.email = invited_user.email
        LEFT JOIN users used_user ON i.used_by = used_user.id
      `;
      const where: any[] = [];
      if (creatorId) where.push(sql`i.created_by = ${creatorId}`);
      if (status === 'used') where.push(sql`i.used_at IS NOT NULL`);
      if (status === 'pending') where.push(sql`i.used_at IS NULL`);

      let finalQuery: any = base;
      if (where.length) finalQuery = sql`${base} WHERE ${sql.join(where, sql` AND `)}`;
      finalQuery = sql`${finalQuery} ORDER BY i.created_at DESC`;

      const result = await db.execute(finalQuery);
      const invitesData = (result as any) || (result as any).rows || [];
      
      return {
        success: true,
        invites: invitesData.map((invite: any) => ({
          ...invite,
          formattedCode: this.formatInviteCode(invite.invite_code)
        }))
      };
    } catch (error) {
      console.error('Error fetching invites with details:', error);
      return {
        success: false,
        error: 'Failed to fetch invites'
      };
    }
  }

  /**
   * Get all invites (admin only) with creator information and user status
   */
  async getAllInvites(status?: 'used' | 'pending') {
    try {
      let base = sql`
        SELECT 
          i.*,
          creator.name as creator_name,
          creator.email as creator_email,
          creator.role as creator_role,
          c.name as cohort_name,
          o.name as organization_name,
          invited_user.is_test_user,
          invited_user.is_beta_tester as user_is_beta_tester,
          used_user.name as used_by_name,
          used_user.email as used_by_email
        FROM invites i
        LEFT JOIN users creator ON i.created_by = creator.id
        LEFT JOIN cohorts c ON i.cohort_id = c.id
        LEFT JOIN organizations o ON i.organization_id = o.id
        LEFT JOIN users invited_user ON i.email = invited_user.email
        LEFT JOIN users used_user ON i.used_by = used_user.id
      `;

      let finalQuery: any = base;
      if (status === 'used') finalQuery = sql`${finalQuery} WHERE i.used_at IS NOT NULL`;
      if (status === 'pending') finalQuery = sql`${finalQuery} WHERE i.used_at IS NULL`;
      finalQuery = sql`${finalQuery} ORDER BY i.created_at DESC`;

      const result = await db.execute(finalQuery);
      
      return {
        success: true,
        invites: result
      };
    } catch (error) {
      console.error('Error fetching all invites:', error);
      return {
        success: false,
        error: 'Failed to fetch invites'
      };
    }
  }

  /**
   * Get invites by creator with creator information
   */
  async getInvitesByCreatorWithInfo(creatorId: number) {
    try {
      const result = await db.execute(sql`
        SELECT 
          i.*,
          u.name as creator_name,
          u.email as creator_email,
          u.role as creator_role
        FROM invites i
        LEFT JOIN users u ON i.created_by = u.id
        WHERE i.created_by = ${creatorId}
        ORDER BY i.created_at DESC
      `);
      
      return {
        success: true,
        invites: result
      };
    } catch (error) {
      console.error('Error fetching invites by creator:', error);
      return {
        success: false,
        error: 'Failed to fetch invites'
      };
    }
  }
  
  /**
   * Delete an invite
   */
  async deleteInvite(id: number) {
    try {
      const result = await db.execute(sql`
        DELETE FROM invites WHERE id = ${id}
        RETURNING *
      `);
      
      const inviteData = (result as any)[0] || (result as any).rows?.[0];
      return {
        success: true,
        deletedInvite: inviteData
      };
    } catch (error) {
      console.error('Error deleting invite:', error);
      return {
        success: false,
        error: 'Failed to delete invite'
      };
    }
  }

  /**
   * Bulk delete invites by IDs
   */
  async deleteInvites(ids: number[]) {
    try {
      if (!ids || ids.length === 0) {
        return { success: true, deletedCount: 0 };
      }
      const result = await db.execute(sql`
        DELETE FROM invites WHERE id = ANY(${sql.array(ids, 'int4')})
        RETURNING id
      `);
      const rows = (result as any).rows || (Array.isArray(result) ? result : []);
      const count = rows.length ?? 0;
      return {
        success: true,
        deletedCount: count
      };
    } catch (error) {
      console.error('Error bulk deleting invites:', error);
      return {
        success: false,
        error: 'Failed to bulk delete invites'
      };
    }
  }

  /**
   * Update a pending invite's workshop access settings
   */
  async updateInvite(inviteId: number, updates: {
    astAccess?: boolean;
    iaAccess?: boolean;
    showDemoDataButtons?: boolean;
    name?: string;
    role?: 'admin' | 'facilitator' | 'participant' | 'student';
    expiresAt?: Date | null;
    cohortId?: number | null;
    organizationId?: string | null;
    isBetaTester?: boolean;
  }) {
    try {
      // First check if the invite exists and is not used
      const checkResult = await db.execute(sql`
        SELECT id, used_at FROM invites WHERE id = ${inviteId}
      `);
      const invite = (checkResult as any)[0] || (checkResult as any).rows?.[0];

      if (!invite) {
        return {
          success: false,
          error: 'Invite not found'
        };
      }

      if (invite.used_at) {
        return {
          success: false,
          error: 'Cannot update an invite that has already been used'
        };
      }

      // Build update object with only defined fields (using camelCase to match schema)
      const updateData: any = {};

      if (updates.astAccess !== undefined) updateData.astAccess = updates.astAccess;
      if (updates.iaAccess !== undefined) updateData.iaAccess = updates.iaAccess;
      if (updates.showDemoDataButtons !== undefined) updateData.showDemoDataButtons = updates.showDemoDataButtons;
      if (updates.name !== undefined) updateData.name = updates.name || null;
      if (updates.role !== undefined) updateData.role = updates.role;
      if (updates.expiresAt !== undefined) updateData.expiresAt = updates.expiresAt || null;
      if (updates.cohortId !== undefined) updateData.cohortId = updates.cohortId || null;
      if (updates.organizationId !== undefined) updateData.organizationId = updates.organizationId || null;
      if (updates.isBetaTester !== undefined) updateData.isBetaTester = updates.isBetaTester;

      if (Object.keys(updateData).length === 0) {
        return {
          success: false,
          error: 'No fields to update'
        };
      }

      // Use Drizzle's update method
      const result = await db
        .update(invites)
        .set(updateData)
        .where(eq(invites.id, inviteId))
        .returning();

      const updatedInvite = result[0];

      return {
        success: true,
        invite: updatedInvite
      };
    } catch (error) {
      console.error('Error updating invite:', error);
      return {
        success: false,
        error: 'Failed to update invite'
      };
    }
  }

  /**
   * Delete all used invites (used_at is not null)
   */
  async deleteUsedInvites() {
    try {
      const result = await db.execute(sql`
        DELETE FROM invites WHERE used_at IS NOT NULL RETURNING id
      `);
      const rows = (result as any).rows || (Array.isArray(result) ? result : []);
      const count = rows.length ?? 0;
      return { success: true, deletedCount: count };
    } catch (error) {
      console.error('Error deleting used invites:', error);
      return { success: false, error: 'Failed to delete used invites' };
    }
  }

  /**
   * Format invite code with hyphens for display
   */
  formatInviteCode(code: string): string {
    if (!code) return '';
    return code.replace(/(.{4})/g, '$1-').replace(/-$/, '');
  }
}

export const inviteService = new InviteService();
