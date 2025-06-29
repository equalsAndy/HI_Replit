import { db } from '../db';
import { invites } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { generateInviteCode } from '../utils/invite-code';

class InviteService {
  /**
   * Create a new invite
   */
  async createInvite(data: {
    email: string;
    role: 'admin' | 'facilitator' | 'participant' | 'student';
    name?: string;
    createdBy: number;
    expiresAt?: Date;
  }) {
    try {
      // Validate role
      const validRoles = ['admin', 'facilitator', 'participant', 'student'];
      if (!validRoles.includes(data.role)) {
        return {
          success: false,
          error: 'Invalid role provided'
        };
      }
      
      // Generate a unique invite code
      const inviteCode = generateInviteCode().replace(/-/g, '');
      
      // Insert the invite into the database
      const result = await db.insert(invites).values({
        inviteCode,
        email: data.email.toLowerCase(),
        role: data.role,
        name: data.name || null,
        createdBy: data.createdBy,
        expiresAt: data.expiresAt || null,
        createdAt: new Date()
      }).returning();
      
      return {
        success: true,
        invite: result[0]
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
      console.error('Error getting invite by code:', error);
      return {
        success: false,
        error: 'Failed to get invite'
      };
    }
  }
  
  /**
   * Mark an invite as used
   */
  async markInviteAsUsed(inviteCode: string, userId: number) {
    try {
      const result = await db.update(invites)
        .set({
          usedAt: new Date(),
          usedBy: userId
        })
        .where(eq(invites.inviteCode, inviteCode))
        .returning();
      
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
        .where(eq(invites.createdBy, creatorId))
        .orderBy(invites.createdAt);
      
      return result;
    } catch (error) {
      console.error('Error getting invites by creator:', error);
      return [];
    }
  }
  
  /**
   * Get all invites for an admin view
   */
  async getAllInvites() {
    try {
      const result = await db.select().from(invites).orderBy(invites.createdAt);
      
      return {
        success: true,
        invites: result
      };
    } catch (error) {
      console.error('Error getting all invites:', error);
      return {
        success: false,
        error: 'Failed to get invites'
      };
    }
  }
  
  /**
   * Delete an invite
   */
  async deleteInvite(id: number) {
    try {
      const result = await db.delete(invites)
        .where(eq(invites.id, id))
        .returning();
      
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
      console.error('Error deleting invite:', error);
      return {
        success: false,
        error: 'Failed to delete invite'
      };
    }
  }
}

export const inviteService = new InviteService();