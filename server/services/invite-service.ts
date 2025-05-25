import { Invite, NewInvite, invites } from '@shared/schema';
import { db } from '../db';
import { generateInviteCode, isValidInviteCodeFormat } from '../utils/invite-code';
import { eq, and, isNull } from 'drizzle-orm';

export interface InviteVerificationResult {
  valid: boolean;
  invite?: Invite;
  error?: string;
}

export class InviteService {
  /**
   * Create a new invite for a user
   */
  async createInvite(data: Omit<NewInvite, 'inviteCode'>): Promise<Invite> {
    // Generate a unique invite code
    const inviteCode = generateInviteCode();
    
    // Insert into database
    const result = await db.insert(invites)
      .values({
        ...data,
        inviteCode,
      })
      .returning();
    
    return result[0];
  }

  /**
   * Get an invite by its code
   */
  async getInviteByCode(inviteCode: string): Promise<Invite | null> {
    if (!isValidInviteCodeFormat(inviteCode)) {
      return null;
    }

    const result = await db.select()
      .from(invites)
      .where(eq(invites.inviteCode, inviteCode));
    
    return result[0] || null;
  }

  /**
   * Check if an invite is valid (exists and not used)
   */
  async verifyInvite(inviteCode: string): Promise<InviteVerificationResult> {
    // Check format first
    if (!isValidInviteCodeFormat(inviteCode)) {
      return {
        valid: false,
        error: 'Invalid invite code format'
      };
    }

    // Check if the invite exists
    const invite = await this.getInviteByCode(inviteCode);
    
    if (!invite) {
      return {
        valid: false,
        error: 'Invite code not found'
      };
    }

    // Check if the invite has been used
    if (invite.usedAt) {
      return {
        valid: false,
        error: 'This invite has already been used'
      };
    }

    // Check if the invite has expired
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      return {
        valid: false,
        error: 'This invite has expired'
      };
    }

    return {
      valid: true,
      invite
    };
  }

  /**
   * Mark an invite as used
   */
  async markInviteAsUsed(inviteCode: string, userId: number): Promise<boolean> {
    // Check if the invite exists and is valid
    const verification = await this.verifyInvite(inviteCode);
    
    if (!verification.valid || !verification.invite) {
      return false;
    }
    
    // Mark as used
    await db.update(invites)
      .set({
        usedAt: new Date(),
        usedBy: userId
      })
      .where(eq(invites.id, verification.invite.id));
    
    return true;
  }

  /**
   * Get all invites
   */
  async getAllInvites(): Promise<Invite[]> {
    return db.select().from(invites);
  }

  /**
   * Get all unused invites
   */
  async getUnusedInvites(): Promise<Invite[]> {
    return db.select().from(invites)
      .where(isNull(invites.usedAt));
  }

  /**
   * Get invites created by a specific user
   */
  async getInvitesByCreator(userId: number): Promise<Invite[]> {
    return db.select().from(invites)
      .where(eq(invites.createdBy, userId));
  }

  /**
   * Delete an invite (if it hasn't been used)
   */
  async deleteInvite(inviteId: number): Promise<boolean> {
    const invite = await db.select()
      .from(invites)
      .where(eq(invites.id, inviteId));
    
    if (!invite[0] || invite[0].usedAt) {
      return false; // Can't delete used invites
    }
    
    await db.delete(invites)
      .where(eq(invites.id, inviteId));
    
    return true;
  }
}

// Export a singleton instance
export const inviteService = new InviteService();