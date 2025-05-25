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
    const inviteCode = generateInviteCode();
    
    // Default expiration to 7 days if not specified
    const expiresAt = params.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    const result = await db.insert(schema.invites).values({
      inviteCode,
      email: params.email,
      name: params.name,
      role: params.role,
      createdBy: params.createdBy,
      cohortId: params.cohortId || null,
      createdAt: new Date(),
      expiresAt,
    }).returning();
    
    return result[0];
  }
  
  /**
   * Generate multiple invite codes at once
   */
  async generateBatchInvites(count: number, params: {
    role: 'admin' | 'facilitator' | 'participant',
    createdBy: number,
    cohortId?: number | null,
    expiresAt?: Date | null
  }) {
    const invites = [];
    
    for (let i = 0; i < count; i++) {
      const inviteCode = generateInviteCode();
      
      // Default expiration to 7 days if not specified
      const expiresAt = params.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      
      invites.push({
        inviteCode,
        email: '', // To be filled later
        name: '', // To be filled later
        role: params.role,
        createdBy: params.createdBy,
        cohortId: params.cohortId || null,
        createdAt: new Date(),
        expiresAt,
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
      where: and(
        eq(schema.invites.inviteCode, inviteCode),
        isNull(schema.invites.usedAt)
      )
    });
    
    if (!invite) {
      return { valid: false, message: 'Invalid or expired invite code' };
    }
    
    // Check if invite is expired
    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return { valid: false, message: 'Invite code has expired' };
    }
    
    return { valid: true, invite };
  }
  
  /**
   * Mark an invite as used
   */
  async markInviteAsUsed(inviteCode: string, userId: number) {
    return await db
      .update(schema.invites)
      .set({
        usedAt: new Date(),
        usedBy: userId
      })
      .where(eq(schema.invites.inviteCode, inviteCode))
      .returning();
  }
  
  /**
   * Get all invites
   */
  async getAllInvites() {
    return await db.query.invites.findMany({
      with: {
        creator: {
          columns: {
            id: true,
            username: true,
            name: true,
          }
        }
      },
      orderBy: (invites, { desc }) => [desc(invites.createdAt)]
    });
  }
  
  /**
   * Get all unused invites
   */
  async getUnusedInvites() {
    return await db.query.invites.findMany({
      where: isNull(schema.invites.usedAt),
      with: {
        creator: {
          columns: {
            id: true,
            username: true,
            name: true,
          }
        }
      },
      orderBy: (invites, { desc }) => [desc(invites.createdAt)]
    });
  }
  
  /**
   * Get invite by ID
   */
  async getInviteById(id: number) {
    return await db.query.invites.findFirst({
      where: eq(schema.invites.id, id),
      with: {
        creator: {
          columns: {
            id: true,
            username: true,
            name: true,
          }
        }
      }
    });
  }
  
  /**
   * Get invite by code
   */
  async getInviteByCode(inviteCode: string) {
    return await db.query.invites.findFirst({
      where: eq(schema.invites.inviteCode, inviteCode),
      with: {
        creator: {
          columns: {
            id: true,
            username: true,
            name: true,
          }
        }
      }
    });
  }
  
  /**
   * Delete an invite
   */
  async deleteInvite(id: number) {
    return await db
      .delete(schema.invites)
      .where(eq(schema.invites.id, id))
      .returning();
  }
}

export const inviteService = new InviteService();