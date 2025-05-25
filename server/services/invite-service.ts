/**
 * Invite service for managing user invitation codes
 */
import { db } from '../db';
import * as schema from '../../shared/schema';
import { generateInviteCode, getInviteCodeExpirationDate } from '../utils/invite-code';
import { eq } from 'drizzle-orm';
import { UserRole } from '@shared/schema';

export class InviteService {
  /**
   * Create a new invite for a user
   * 
   * @param creatorId ID of the admin/facilitator creating the invite
   * @param data Object containing email, name, and optional cohortId
   * @returns The generated invite code and full invite data
   */
  public static async createInvite(
    creatorId: number, 
    data: { 
      email: string; 
      name: string; 
      cohortId?: number;
      role?: UserRole;
    }
  ) {
    const inviteCode = generateInviteCode();
    const expiresAt = getInviteCodeExpirationDate();
    
    // Save invite to database
    const [invite] = await db.insert(schema.pendingInvites)
      .values({
        inviteCode,
        email: data.email,
        name: data.name,
        createdBy: creatorId,
        expiresAt,
        cohortId: data.cohortId
      })
      .returning();
    
    return {
      inviteCode,
      invite
    };
  }
  
  /**
   * Get invite by code
   * 
   * @param code The invite code to look up
   * @returns The invite record if found and not expired
   */
  public static async getInviteByCode(code: string) {
    const [invite] = await db
      .select()
      .from(schema.pendingInvites)
      .where(eq(schema.pendingInvites.inviteCode, code));
    
    if (!invite) {
      return null;
    }
    
    // Check if invite is expired
    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return {
        ...invite,
        isExpired: true
      };
    }
    
    return {
      ...invite,
      isExpired: false
    };
  }
  
  /**
   * Mark an invite as used
   * 
   * @param code The invite code to mark as used
   */
  public static async markInviteAsUsed(code: string) {
    // First retrieve the invite to get data for the user
    const invite = await this.getInviteByCode(code);
    
    if (!invite || invite.isExpired) {
      throw new Error('Invalid or expired invite code');
    }
    
    // Delete the invite from pending invites (it's been used)
    await db
      .delete(schema.pendingInvites)
      .where(eq(schema.pendingInvites.inviteCode, code));
    
    return invite;
  }
  
  /**
   * Get all pending invites created by a specific user
   * 
   * @param creatorId The ID of the user who created the invites
   * @returns Array of pending invites with status info
   */
  public static async getInvitesByCreator(creatorId: number) {
    const invites = await db
      .select()
      .from(schema.pendingInvites)
      .where(eq(schema.pendingInvites.createdBy, creatorId));
    
    // Add status information
    return invites.map(invite => ({
      ...invite,
      isExpired: invite.expiresAt && new Date(invite.expiresAt) < new Date()
    }));
  }
  
  /**
   * Delete an invite
   * 
   * @param inviteId The ID of the invite to delete
   */
  public static async deleteInvite(inviteId: number) {
    await db
      .delete(schema.pendingInvites)
      .where(eq(schema.pendingInvites.id, inviteId));
  }
  
  /**
   * Regenerate an invite code
   * 
   * @param inviteId The ID of the invite to regenerate
   * @returns The new invite code and updated invite
   */
  public static async regenerateInviteCode(inviteId: number) {
    const newCode = generateInviteCode();
    const expiresAt = getInviteCodeExpirationDate();
    
    const [updatedInvite] = await db
      .update(schema.pendingInvites)
      .set({
        inviteCode: newCode,
        expiresAt
      })
      .where(eq(schema.pendingInvites.id, inviteId))
      .returning();
    
    return {
      inviteCode: newCode,
      invite: updatedInvite
    };
  }
}