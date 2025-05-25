import { db } from '../db';
import * as schema from '../../shared/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { generateInviteCode } from '../utils/invite-code';

interface CreateInviteParams {
  name: string;
  email: string;
  role: 'admin' | 'facilitator' | 'participant';
  createdBy: number;
  cohortId?: number | null;
  expiresAt?: Date | null;
}

class InviteService {
  /**
   * Create a new invite
   */
  async createInvite(params: CreateInviteParams) {
    // Generate a unique invite code
    const inviteCode = generateInviteCode();
    
    // Default expiry date is 7 days from now
    const expiresAt = params.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    const invite = await db.insert(schema.invites).values({
      name: params.name,
      email: params.email,
      inviteCode: inviteCode,
      role: params.role,
      createdBy: params.createdBy,
      createdAt: new Date(),
      expiresAt: expiresAt,
      usedAt: null,
      usedBy: null,
      cohortId: params.cohortId || null,
    }).returning();

    return invite[0];
  }

  /**
   * Generate multiple invite codes at once
   */
  async generateBatchInvites(count: number, params: {
    role: 'admin' | 'facilitator' | 'participant';
    createdBy: number;
    cohortId?: number | null;
  }) {
    const invites = [];
    
    // Default expiry date is 7 days from now
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    for (let i = 0; i < count; i++) {
      const inviteCode = generateInviteCode();
      
      invites.push({
        name: `Batch Invite ${i + 1}`,
        email: `invite_${inviteCode.toLowerCase()}@placeholder.com`,
        inviteCode: inviteCode,
        role: params.role,
        createdBy: params.createdBy,
        createdAt: new Date(),
        expiresAt: expiresAt,
        usedAt: null,
        usedBy: null,
        cohortId: params.cohortId || null,
      });
    }
    
    const result = await db.insert(schema.invites).values(invites).returning();
    
    return result;
  }

  /**
   * Verify an invite code is valid and unused
   */
  async verifyInviteCode(inviteCode: string) {
    const invite = await db.query.invites.findFirst({
      where: (invites) => {
        return and(
          eq(invites.inviteCode, inviteCode),
          isNull(invites.usedAt)
        );
      },
    });

    if (!invite) {
      return null;
    }

    // Check if invite is expired
    if (invite.expiresAt && new Date() > invite.expiresAt) {
      return null;
    }

    return invite;
  }

  /**
   * Mark an invite as used
   */
  async markInviteAsUsed(inviteCode: string, userId: number) {
    const updatedInvite = await db.update(schema.invites)
      .set({
        usedAt: new Date(),
        usedBy: userId,
      })
      .where(eq(schema.invites.inviteCode, inviteCode))
      .returning();

    return updatedInvite[0];
  }

  /**
   * Get all invites
   */
  async getAllInvites() {
    return await db.query.invites.findMany({
      orderBy: (invites) => invites.createdAt,
    });
  }

  /**
   * Get all unused invites
   */
  async getUnusedInvites() {
    return await db.query.invites.findMany({
      where: (invites) => isNull(invites.usedAt),
      orderBy: (invites) => invites.createdAt,
    });
  }

  /**
   * Get invite by ID
   */
  async getInviteById(id: number) {
    return await db.query.invites.findFirst({
      where: (invites) => eq(invites.id, id),
    });
  }

  /**
   * Get invite by code
   */
  async getInviteByCode(inviteCode: string) {
    return await db.query.invites.findFirst({
      where: (invites) => eq(invites.inviteCode, inviteCode),
    });
  }

  /**
   * Delete an invite
   */
  async deleteInvite(id: number) {
    await db.delete(schema.invites)
      .where(eq(schema.invites.id, id));
  }
}

export const inviteService = new InviteService();