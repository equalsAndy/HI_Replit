import { db } from '../db';
import { invites } from '@shared/schema';
import { generateInviteCode, normalizeInviteCode } from '../utils/invite-code';
import { eq, and, isNull, desc } from 'drizzle-orm';

class InviteService {
  /**
   * Create a new invite
   */
  async createInvite(data: {
    email: string;
    role: 'admin' | 'facilitator' | 'participant';
    name?: string | null;
    createdBy: number;
    expiresAt?: Date | null;
  }) {
    try {
      // Generate a unique invite code
      const inviteCode = generateInviteCode();
      
      // Insert the invite into the database
      const result = await db.insert(invites).values({
        email: data.email.toLowerCase(),
        role: data.role,
        name: data.name || null,
        inviteCode: inviteCode,
        createdBy: data.createdBy,
        expiresAt: data.expiresAt || null,
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
   * Verify if an invite code is valid
   */
  async verifyInvite(code: string) {
    try {
      // Normalize the code
      const normalizedCode = normalizeInviteCode(code);
      
      // Check if the invite exists and is not used
      const result = await db.select()
        .from(invites)
        .where(
          and(
            eq(invites.inviteCode, normalizedCode),
            isNull(invites.usedAt)
          )
        );
      
      if (!result || result.length === 0) {
        return {
          valid: false,
          error: 'Invite code is invalid or has already been used'
        };
      }
      
      const invite = result[0];
      
      // Check if the invite has expired
      if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
        return {
          valid: false,
          error: 'Invite code has expired'
        };
      }
      
      return {
        valid: true,
        invite
      };
    } catch (error) {
      console.error('Error verifying invite:', error);
      return {
        valid: false,
        error: 'Failed to verify invite'
      };
    }
  }
  
  /**
   * Mark an invite as used
   */
  async markInviteAsUsed(code: string, userId: number) {
    try {
      // Normalize the code
      const normalizedCode = normalizeInviteCode(code);
      
      // Update the invite
      await db.update(invites)
        .set({
          usedAt: new Date(),
          usedBy: userId
        })
        .where(eq(invites.inviteCode, normalizedCode));
      
      return {
        success: true
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
   * Get all invites
   */
  async getAllInvites() {
    try {
      const result = await db.select()
        .from(invites)
        .orderBy(desc(invites.createdAt));
      
      return result;
    } catch (error) {
      console.error('Error getting all invites:', error);
      throw new Error('Failed to get all invites');
    }
  }
  
  /**
   * Get all unused invites
   */
  async getUnusedInvites() {
    try {
      const result = await db.select()
        .from(invites)
        .where(isNull(invites.usedAt))
        .orderBy(desc(invites.createdAt));
      
      return result;
    } catch (error) {
      console.error('Error getting unused invites:', error);
      throw new Error('Failed to get unused invites');
    }
  }
  
  /**
   * Get all invites created by a user
   */
  async getInvitesByCreator(creatorId: number) {
    try {
      const result = await db.select()
        .from(invites)
        .where(eq(invites.createdBy, creatorId))
        .orderBy(desc(invites.createdAt));
      
      return result;
    } catch (error) {
      console.error('Error getting invites by creator:', error);
      throw new Error('Failed to get invites');
    }
  }
  
  /**
   * Delete an invite
   */
  async deleteInvite(id: number) {
    try {
      // First check if the invite exists and is not used
      const existingInvite = await db.select()
        .from(invites)
        .where(
          and(
            eq(invites.id, id),
            isNull(invites.usedAt)
          )
        );
      
      if (!existingInvite || existingInvite.length === 0) {
        return {
          success: false,
          error: 'Invite not found or already used'
        };
      }
      
      // Delete the invite
      await db.delete(invites)
        .where(eq(invites.id, id));
      
      return {
        success: true
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