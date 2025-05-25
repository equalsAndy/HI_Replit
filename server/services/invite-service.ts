import { db } from '../db';
import * as schema from '../../shared/schema';
import { eq, and, isNull, lt, gte, sql } from 'drizzle-orm';
import { generateInviteCode } from '../utils/invite-code';
import { UserRole } from '../../shared/types';

// Default invite expiration (30 days)
const DEFAULT_EXPIRATION_DAYS = 30;

export interface InviteCreateOptions {
  email: string;
  name: string;
  role: UserRole;
  cohortId?: number;
  expiresInDays?: number;
}

export interface InviteWithCode {
  inviteCode: string;
  invite: {
    id: number;
    email: string;
    name: string;
    expiresAt: Date;
    createdAt: Date;
    role: UserRole;
  };
}

export class InviteService {
  /**
   * Create a new invite
   * @param createdById The ID of the user creating the invite
   * @param options Invite creation options
   * @returns The created invite with its code
   */
  static async createInvite(createdById: number, options: InviteCreateOptions): Promise<InviteWithCode> {
    // Generate expiration date (default 30 days)
    const expirationDays = options.expiresInDays || DEFAULT_EXPIRATION_DAYS;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expirationDays);
    
    // Generate a unique invite code
    const inviteCode = generateInviteCode();
    
    // Create the invite
    const [invite] = await db
      .insert(schema.pendingInvites)
      .values({
        email: options.email,
        name: options.name,
        inviteCode: inviteCode,
        role: options.role,
        createdBy: createdById,
        cohortId: options.cohortId,
        expiresAt: expiresAt,
      })
      .returning();
    
    return {
      inviteCode,
      invite: {
        id: invite.id,
        email: invite.email,
        name: invite.name,
        expiresAt: invite.expiresAt,
        createdAt: invite.createdAt,
        role: invite.role,
      }
    };
  }
  
  /**
   * Regenerate an invite code for an existing invite
   * @param inviteId The ID of the invite
   * @returns The updated invite with new code
   */
  static async regenerateInviteCode(inviteId: number): Promise<InviteWithCode> {
    // Generate a new invite code
    const inviteCode = generateInviteCode();
    
    // Update expiration date to 30 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + DEFAULT_EXPIRATION_DAYS);
    
    // Update the invite
    const [invite] = await db
      .update(schema.pendingInvites)
      .set({ 
        inviteCode,
        expiresAt,
        updatedAt: new Date()
      })
      .where(eq(schema.pendingInvites.id, inviteId))
      .returning();
    
    if (!invite) {
      throw new Error('Invite not found');
    }
    
    return {
      inviteCode,
      invite: {
        id: invite.id,
        email: invite.email,
        name: invite.name,
        expiresAt: invite.expiresAt,
        createdAt: invite.createdAt,
        role: invite.role,
      }
    };
  }
  
  /**
   * Get an invite by its code
   * @param inviteCode The invite code
   * @returns The invite or null if not found or expired
   */
  static async getInviteByCode(inviteCode: string): Promise<{
    id: number;
    email: string;
    name: string;
    expiresAt: string;
    role: UserRole;
    isExpired: boolean;
  } | null> {
    // Find the invite
    const [invite] = await db
      .select()
      .from(schema.pendingInvites)
      .where(eq(schema.pendingInvites.inviteCode, inviteCode));
    
    if (!invite) {
      return null;
    }
    
    // Check if expired
    const now = new Date();
    const isExpired = new Date(invite.expiresAt) < now;
    
    return {
      id: invite.id,
      email: invite.email,
      name: invite.name,
      expiresAt: invite.expiresAt.toISOString(),
      role: invite.role,
      isExpired
    };
  }
  
  /**
   * Get all invites created by a specific user
   * @param createdById The ID of the user who created the invites
   * @returns Array of invites
   */
  static async getInvitesByCreator(createdById: number): Promise<Array<{
    id: number;
    email: string;
    name: string;
    inviteCode: string;
    expiresAt: Date;
    createdAt: Date;
    role: UserRole;
    isExpired: boolean;
    isUsed: boolean;
  }>> {
    // Find all invites created by this user
    const invites = await db
      .select({
        id: schema.pendingInvites.id,
        email: schema.pendingInvites.email,
        name: schema.pendingInvites.name,
        inviteCode: schema.pendingInvites.inviteCode,
        expiresAt: schema.pendingInvites.expiresAt,
        createdAt: schema.pendingInvites.createdAt,
        role: schema.pendingInvites.role,
        usedAt: schema.pendingInvites.usedAt
      })
      .from(schema.pendingInvites)
      .where(eq(schema.pendingInvites.createdBy, createdById))
      .orderBy(schema.pendingInvites.createdAt);
    
    const now = new Date();
    
    // Process and return invites with expired/used status
    return invites.map(invite => ({
      id: invite.id,
      email: invite.email,
      name: invite.name,
      inviteCode: invite.inviteCode,
      expiresAt: invite.expiresAt,
      createdAt: invite.createdAt,
      role: invite.role,
      isExpired: invite.expiresAt < now,
      isUsed: invite.usedAt !== null
    }));
  }
  
  /**
   * Delete an invite
   * @param inviteId The ID of the invite to delete
   * @returns True if successful
   */
  static async deleteInvite(inviteId: number): Promise<boolean> {
    const result = await db
      .delete(schema.pendingInvites)
      .where(eq(schema.pendingInvites.id, inviteId));
    
    return true;
  }
  
  /**
   * Mark an invite as used
   * @param inviteId The ID of the invite
   * @returns True if successful
   */
  static async markInviteAsUsed(inviteId: number): Promise<boolean> {
    const result = await db
      .update(schema.pendingInvites)
      .set({ usedAt: new Date() })
      .where(eq(schema.pendingInvites.id, inviteId));
    
    return true;
  }
  
  /**
   * Clean up expired invites
   * @returns Number of invites deleted
   */
  static async cleanupExpiredInvites(): Promise<number> {
    const now = new Date();
    
    const result = await db
      .delete(schema.pendingInvites)
      .where(
        and(
          lt(schema.pendingInvites.expiresAt, now),
          isNull(schema.pendingInvites.usedAt)
        )
      );
    
    return result.rowCount || 0;
  }
}