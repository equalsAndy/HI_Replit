import { db } from '../db';
import * as schema from '../../shared/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { generateInviteCodeNode } from '../utils/invite-code';
import { UserRole } from '../../shared/types';

/**
 * Service for managing invite codes
 */
class InviteServiceClass {
  /**
   * Create a new invite code
   * @param createdBy User ID of the creator
   * @param role Role for the invited user
   * @param expiresAt Optional expiration date
   * @param cohortId Optional cohort ID
   * @returns The created invite code
   */
  async createInvite(createdBy: number, role: UserRole, expiresAt?: Date, cohortId?: number) {
    try {
      // Generate a unique invite code
      const code = generateInviteCodeNode();
      
      // Insert the invite into the database
      const [invite] = await db
        .insert(schema.invites)
        .values({
          code,
          createdBy,
          role,
          createdAt: new Date(),
          expiresAt: expiresAt || null,
          cohortId: cohortId || null,
          usedAt: null,
          usedBy: null
        })
        .returning();
        
      return invite;
    } catch (error) {
      console.error('Error creating invite:', error);
      throw new Error('Failed to create invite code');
    }
  }
  
  /**
   * Get an invite by its code
   * @param code The invite code to look up
   * @returns The invite if found, null otherwise
   */
  async getInviteByCode(code: string) {
    try {
      const [invite] = await db
        .select()
        .from(schema.invites)
        .where(eq(schema.invites.code, code));
        
      return invite || null;
    } catch (error) {
      console.error('Error getting invite by code:', error);
      return null;
    }
  }
  
  /**
   * Get an invite by its ID
   * @param id The invite ID
   * @returns The invite if found, null otherwise
   */
  async getInviteById(id: number) {
    try {
      const [invite] = await db
        .select()
        .from(schema.invites)
        .where(eq(schema.invites.id, id));
        
      return invite || null;
    } catch (error) {
      console.error('Error getting invite by ID:', error);
      return null;
    }
  }
  
  /**
   * Mark an invite as used
   * @param code The invite code
   * @param userId The user ID who used the invite
   * @returns True if successful, false otherwise
   */
  async markInviteAsUsed(code: string, userId: number) {
    try {
      const result = await db
        .update(schema.invites)
        .set({
          usedAt: new Date(),
          usedBy: userId
        })
        .where(
          and(
            eq(schema.invites.code, code),
            isNull(schema.invites.usedAt)
          )
        );
        
      return result.rowCount && result.rowCount > 0;
    } catch (error) {
      console.error('Error marking invite as used:', error);
      return false;
    }
  }
  
  /**
   * Get all invites created by a user
   * @param userId The user ID who created the invites
   * @returns Array of invites
   */
  async getInvitesByCreator(userId: number) {
    try {
      const invites = await db
        .select()
        .from(schema.invites)
        .where(eq(schema.invites.createdBy, userId))
        .orderBy(schema.invites.createdAt);
        
      return invites;
    } catch (error) {
      console.error('Error getting invites by creator:', error);
      return [];
    }
  }
  
  /**
   * Delete an invite
   * @param id The invite ID to delete
   * @param userId The user ID attempting to delete (for authorization)
   * @returns True if successful, false otherwise
   */
  async deleteInvite(id: number, userId: number) {
    try {
      // Check if the invite exists and was created by this user
      const [invite] = await db
        .select()
        .from(schema.invites)
        .where(
          and(
            eq(schema.invites.id, id),
            eq(schema.invites.createdBy, userId)
          )
        );
        
      if (!invite) {
        return false;
      }
      
      // If the invite has been used, don't allow deletion
      if (invite.usedAt) {
        return false;
      }
      
      const result = await db
        .delete(schema.invites)
        .where(eq(schema.invites.id, id));
        
      return result.rowCount && result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting invite:', error);
      return false;
    }
  }
  
  /**
   * Validate if an invite is usable
   * @param code The invite code to validate
   * @returns An object with validity status and invite data
   */
  async validateInvite(code: string) {
    try {
      const invite = await this.getInviteByCode(code);
      
      if (!invite) {
        return { valid: false, message: 'Invalid invite code', invite: null };
      }
      
      // Check if already used
      if (invite.usedAt) {
        return { valid: false, message: 'This invite code has already been used', invite };
      }
      
      // Check if expired
      if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
        return { valid: false, message: 'This invite code has expired', invite };
      }
      
      // Invite is valid
      return { valid: true, message: 'Valid invite code', invite };
    } catch (error) {
      console.error('Error validating invite:', error);
      return { valid: false, message: 'Error validating invite', invite: null };
    }
  }
}

// Export a singleton instance
export const InviteService = new InviteServiceClass();