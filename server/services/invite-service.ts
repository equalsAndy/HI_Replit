import { db } from '../db';
import * as schema from '../../shared/schema';
import { eq, and, isNull, not, lt, sql } from 'drizzle-orm';
import { generateInviteCodeNode } from '../utils/invite-code';
import { UserRole } from '../../shared/types';

/**
 * Service for managing invite codes
 */
export class InviteService {
  /**
   * Default expiration time for invite codes (30 days)
   */
  private static DEFAULT_EXPIRATION_DAYS = 30;

  /**
   * Creates a new invite code
   * @param email Email address for the invited user
   * @param name Name of the invited user
   * @param role Role to assign upon registration
   * @param createdById ID of the user creating the invite
   * @param cohortId Optional cohort ID to associate with the invite
   * @returns The created invite with code
   */
  public static async createInvite(
    email: string,
    name: string,
    role: 'admin' | 'facilitator' | 'participant',
    createdById: number,
    cohortId?: number
  ) {
    // Generate a unique invite code
    const inviteCode = generateInviteCodeNode();
    
    // Calculate expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.DEFAULT_EXPIRATION_DAYS);
    
    // Insert the invite into the database
    const [invite] = await db.insert(schema.invites).values({
      email,
      name,
      inviteCode,
      role: role as UserRole,
      createdBy: createdById,
      expiresAt,
      cohortId: cohortId || null,
    }).returning();
    
    return invite;
  }

  /**
   * Verifies if an invite code is valid and usable
   * @param inviteCode The code to verify
   * @returns The invite information if valid, null otherwise
   */
  public static async verifyInvite(inviteCode: string) {
    if (!inviteCode) {
      return null;
    }
    
    const now = new Date();
    
    // Find the invite with the given code
    const [invite] = await db.select()
      .from(schema.invites)
      .where(and(
        eq(schema.invites.inviteCode, inviteCode),
        isNull(schema.invites.usedAt),
        sql`${schema.invites.expiresAt} > ${now}`
      ));
    
    if (!invite) {
      return null;
    }
    
    return {
      id: invite.id,
      email: invite.email,
      name: invite.name,
      role: invite.role as 'admin' | 'facilitator' | 'participant',
    };
  }

  /**
   * Marks an invite as used
   * @param inviteCode The code that was used
   * @param userId The ID of the user who used the code
   * @returns Whether the operation was successful
   */
  public static async markInviteAsUsed(inviteCode: string, userId: number) {
    if (!inviteCode || !userId) {
      return false;
    }
    
    // Update the invite to mark it as used
    const result = await db.update(schema.invites)
      .set({
        usedAt: new Date(),
        usedBy: userId
      })
      .where(and(
        eq(schema.invites.inviteCode, inviteCode),
        isNull(schema.invites.usedAt)
      ));
    
    return result.rowCount > 0;
  }

  /**
   * Regenerates a new invite code for an existing invite
   * @param inviteId ID of the invite to regenerate
   * @returns The updated invite with new code
   */
  public static async regenerateInviteCode(inviteId: number) {
    if (!inviteId) {
      return null;
    }
    
    // Generate a new unique invite code
    const newInviteCode = generateInviteCodeNode();
    
    // Reset expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.DEFAULT_EXPIRATION_DAYS);
    
    // Update the invite with the new code
    const [updatedInvite] = await db.update(schema.invites)
      .set({
        inviteCode: newInviteCode,
        expiresAt,
        usedAt: null,
        usedBy: null
      })
      .where(and(
        eq(schema.invites.id, inviteId),
        isNull(schema.invites.usedAt)
      ))
      .returning();
    
    return updatedInvite;
  }

  /**
   * Deletes an invite
   * @param inviteId ID of the invite to delete
   * @returns Whether the deletion was successful
   */
  public static async deleteInvite(inviteId: number) {
    if (!inviteId) {
      return false;
    }
    
    const result = await db.delete(schema.invites)
      .where(eq(schema.invites.id, inviteId));
    
    return result.rowCount > 0;
  }

  /**
   * Gets all invites with calculated status fields
   * @param createdBy Optional user ID to filter by creator
   * @returns List of invites with additional status fields
   */
  public static async getAllInvites(createdBy?: number) {
    const now = new Date();
    
    // Select query with condition based on createdBy parameter
    const query = createdBy 
      ? db.select().from(schema.invites).where(eq(schema.invites.createdBy, createdBy))
      : db.select().from(schema.invites);
    
    // Execute the query
    const invites = await query;
    
    // Add calculated fields for client-side display
    return invites.map(invite => ({
      id: invite.id,
      email: invite.email,
      name: invite.name,
      inviteCode: invite.inviteCode,
      expiresAt: invite.expiresAt,
      createdAt: invite.createdAt,
      role: invite.role as 'admin' | 'facilitator' | 'participant',
      isExpired: invite.expiresAt < now,
      isUsed: invite.usedAt !== null
    }));
  }

  /**
   * Gets invites created by facilitators for participants
   * @param facilitatorId ID of the facilitator
   * @returns List of participant invites created by the facilitator
   */
  public static async getFacilitatorInvites(facilitatorId: number) {
    if (!facilitatorId) {
      return [];
    }
    
    const now = new Date();
    
    // Get invites created by this facilitator for participants only
    const invites = await db.select()
      .from(schema.invites)
      .where(and(
        eq(schema.invites.createdBy, facilitatorId),
        eq(schema.invites.role, 'participant' as UserRole)
      ));
    
    // Add calculated fields for client-side display
    return invites.map(invite => ({
      id: invite.id,
      email: invite.email,
      name: invite.name,
      inviteCode: invite.inviteCode,
      expiresAt: invite.expiresAt,
      createdAt: invite.createdAt,
      role: invite.role as 'admin' | 'facilitator' | 'participant',
      isExpired: invite.expiresAt < now,
      isUsed: invite.usedAt !== null
    }));
  }

  /**
   * Gets an invite by ID
   * @param inviteId ID of the invite to retrieve
   * @returns The invite if found, null otherwise
   */
  public static async getInviteById(inviteId: number) {
    if (!inviteId) {
      return null;
    }
    
    const [invite] = await db.select()
      .from(schema.invites)
      .where(eq(schema.invites.id, inviteId));
    
    return invite || null;
  }
}