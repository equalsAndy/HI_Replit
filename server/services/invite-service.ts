import { db } from '../db';
import * as schema from '@shared/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { generateInviteCode, normalizeInviteCode } from '../utils/invite-code';
import { InviteVerificationResult } from '@shared/types';

class InviteService {
  /**
   * Create a new invite
   */
  async createInvite(params: {
    email: string;
    role: schema.UserRole;
    createdBy: number;
    name?: string;
    cohortId?: number;
    expiresAt?: Date;
  }) {
    const inviteCode = generateInviteCode();
    
    const invite = await db.insert(schema.invites).values({
      inviteCode: normalizeInviteCode(inviteCode), // Store without hyphens
      email: params.email,
      role: params.role,
      createdBy: params.createdBy,
      name: params.name || null,
      cohortId: params.cohortId || null,
      expiresAt: params.expiresAt || null,
      createdAt: new Date(),
    }).returning();
    
    return {
      ...invite[0],
      inviteCode: inviteCode, // Return the formatted code with hyphens
    };
  }
  
  /**
   * Get all invites
   */
  async getAllInvites() {
    const invites = await db.query.invites.findMany({
      orderBy: (invites, { desc }) => [desc(invites.createdAt)],
    });
    
    return invites;
  }
  
  /**
   * Get invites created by a specific user
   */
  async getInvitesByCreator(creatorId: number) {
    const invites = await db.query.invites.findMany({
      where: eq(schema.invites.createdBy, creatorId),
      orderBy: (invites, { desc }) => [desc(invites.createdAt)],
    });
    
    return invites;
  }
  
  /**
   * Get unused invites
   */
  async getUnusedInvites() {
    const invites = await db.query.invites.findMany({
      where: isNull(schema.invites.usedAt),
      orderBy: (invites, { desc }) => [desc(invites.createdAt)],
    });
    
    return invites;
  }
  
  /**
   * Verify an invite code
   */
  async verifyInviteCode(code: string): Promise<InviteVerificationResult> {
    // Normalize the code (remove hyphens)
    const normalizedCode = normalizeInviteCode(code);
    
    // Look up the invite
    const invite = await db.query.invites.findFirst({
      where: eq(schema.invites.inviteCode, normalizedCode),
    });
    
    // Check if invite exists
    if (!invite) {
      return {
        valid: false,
        error: 'Invalid invite code',
      };
    }
    
    // Check if invite has been used
    if (invite.usedAt) {
      return {
        valid: false,
        error: 'This invite code has already been used',
      };
    }
    
    // Check if invite has expired
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      return {
        valid: false,
        error: 'This invite code has expired',
      };
    }
    
    // Invite is valid
    return {
      valid: true,
      invite: {
        id: invite.id,
        inviteCode: normalizedCode,
        name: invite.name || undefined,
        email: invite.email,
        role: invite.role,
        cohortId: invite.cohortId || undefined,
      },
    };
  }
  
  /**
   * Mark an invite as used
   */
  async markInviteAsUsed(inviteCode: string, userId: number) {
    const normalizedCode = normalizeInviteCode(inviteCode);
    
    const result = await db.update(schema.invites)
      .set({
        usedAt: new Date(),
        usedBy: userId,
      })
      .where(eq(schema.invites.inviteCode, normalizedCode))
      .returning();
    
    return result[0];
  }
  
  /**
   * Delete an invite
   */
  async deleteInvite(inviteId: number) {
    const result = await db.delete(schema.invites)
      .where(eq(schema.invites.id, inviteId))
      .returning();
    
    return result[0];
  }
}

export const inviteService = new InviteService();