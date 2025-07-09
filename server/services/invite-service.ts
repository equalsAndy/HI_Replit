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
      
      // Insert the invite into the database with cohort and organization assignment
      const result = await db.execute(sql`
        INSERT INTO invites (invite_code, email, role, name, created_by, expires_at, cohort_id, organization_id)
        VALUES (${inviteCode}, ${data.email.toLowerCase()}, ${data.role}, ${data.name || null}, ${data.createdBy}, ${data.expiresAt || null}, ${data.cohortId || null}, ${data.organizationId || null})
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
        INSERT INTO invites (invite_code, email, role, name, created_by, expires_at, cohort_id, organization_id)
        VALUES (${inviteCode}, ${data.email.toLowerCase()}, ${data.role}, ${data.name || null}, ${data.createdBy}, ${data.expiresAt || null}, ${data.cohortId ? parseInt(data.cohortId) : null}, ${data.organizationId || null})
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
   * Get invites with enhanced information (cohort, organization names)
   */
  async getInvitesWithDetails(creatorId?: number) {
    try {
      let query = sql`
        SELECT 
          i.*,
          u.name as creator_name,
          u.email as creator_email,
          u.role as creator_role,
          c.name as cohort_name,
          o.name as organization_name
        FROM invites i
        LEFT JOIN users u ON i.created_by = u.id
        LEFT JOIN cohorts c ON i.cohort_id = c.id
        LEFT JOIN organizations o ON i.organization_id = o.id
      `;
      
      if (creatorId) {
        query = sql`
          SELECT 
            i.*,
            u.name as creator_name,
            u.email as creator_email,
            u.role as creator_role,
            c.name as cohort_name,
            o.name as organization_name
          FROM invites i
          LEFT JOIN users u ON i.created_by = u.id
          LEFT JOIN cohorts c ON i.cohort_id = c.id
          LEFT JOIN organizations o ON i.organization_id = o.id
          WHERE i.created_by = ${creatorId}
        `;
      }
      
      query = sql`${query} ORDER BY i.created_at DESC`;
      
      const result = await db.execute(query);
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
   * Get all invites (admin only) with creator information
   */
  async getAllInvites() {
    try {
      const result = await db.execute(sql`
        SELECT 
          i.*,
          u.name as creator_name,
          u.email as creator_email,
          u.role as creator_role
        FROM invites i
        LEFT JOIN users u ON i.created_by = u.id
        ORDER BY i.created_at DESC
      `);
      
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
   * Format invite code with hyphens for display
   */
  formatInviteCode(code: string): string {
    if (!code) return '';
    return code.replace(/(.{4})/g, '$1-').replace(/-$/, '');
  }
}

export const inviteService = new InviteService();