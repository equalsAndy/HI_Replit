import { db } from '../db';
import { invites } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';
import { generateInviteCode } from '../utils/invite-code';

class InviteService {
  /**
   * Create a new invite
   */
  async createInvite(data: {
    email: string;
    role: string;
    name?: string;
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
      
      // Insert the invite into the database using raw SQL to bypass schema issues
      const result = await db.execute(sql`
        INSERT INTO invites (invite_code, email, role, name, created_by, expires_at)
        VALUES (${inviteCode}, ${data.email.toLowerCase()}, ${data.role}, ${data.name || null}, ${data.createdBy}, ${data.expiresAt || null})
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
   * Get all invites (admin only)
   */
  async getAllInvites() {
    try {
      const result = await db.select().from(invites);
      
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
}

export const inviteService = new InviteService();