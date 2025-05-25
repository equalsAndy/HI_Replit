import { db } from '../db';
import * as schema from '@shared/schema';
import { generateInviteCode, isValidInviteCodeFormat } from '../utils/invite-code';
import { eq, and, isNull } from 'drizzle-orm';
import { userManagementService } from './user-management-service';

interface CreateInviteParams {
  name?: string;
  email: string;
  role: 'admin' | 'facilitator' | 'participant';
  createdBy: number;
  cohortId?: number;
  expiresAt?: string; // ISO date string
}

interface InviteVerificationResult {
  valid: boolean;
  error?: string;
  invite?: {
    id: number;
    inviteCode: string;
    name?: string;
    email: string;
    role: string;
    cohortId?: number;
  };
}

class InviteService {
  /**
   * Create a new invite code
   */
  async createInvite(params: CreateInviteParams) {
    const { name, email, role, createdBy, cohortId, expiresAt } = params;
    
    // Generate a unique invite code
    let inviteCode = generateInviteCode();
    let isUnique = false;
    
    // Keep generating until we get a unique code
    while (!isUnique) {
      const existingInvite = await db.query.invites.findFirst({
        where: eq(schema.invites.inviteCode, inviteCode),
      });
      
      if (!existingInvite) {
        isUnique = true;
      } else {
        inviteCode = generateInviteCode();
      }
    }
    
    // Create the invite
    const invite = await db.insert(schema.invites).values({
      inviteCode,
      name,
      email,
      role,
      createdBy,
      cohortId,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdAt: new Date(),
    }).returning();
    
    return invite[0];
  }
  
  /**
   * Verify an invite code
   */
  async verifyInviteCode(inviteCode: string): Promise<InviteVerificationResult> {
    // Validate format
    if (!isValidInviteCodeFormat(inviteCode)) {
      return {
        valid: false,
        error: 'Invalid invite code format',
      };
    }
    
    // Check if the invite exists
    const invite = await db.query.invites.findFirst({
      where: eq(schema.invites.inviteCode, inviteCode),
    });
    
    if (!invite) {
      return {
        valid: false,
        error: 'Invite code not found',
      };
    }
    
    // Check if the invite has already been used
    if (invite.usedAt) {
      return {
        valid: false,
        error: 'This invite code has already been used',
      };
    }
    
    // Check if the invite has expired
    if (invite.expiresAt && new Date() > invite.expiresAt) {
      return {
        valid: false,
        error: 'This invite code has expired',
      };
    }
    
    // Check if there's already a user with the same email
    const existingUser = await userManagementService.getUserByEmail(invite.email);
    
    if (existingUser) {
      return {
        valid: false,
        error: 'A user with this email already exists',
      };
    }
    
    // Invite is valid
    return {
      valid: true,
      invite: {
        id: invite.id,
        inviteCode: invite.inviteCode,
        name: invite.name ?? undefined,
        email: invite.email,
        role: invite.role,
        cohortId: invite.cohortId ?? undefined,
      },
    };
  }
  
  /**
   * Mark an invite as used
   */
  async markInviteAsUsed(inviteCode: string, userId: number) {
    try {
      await db.update(schema.invites)
        .set({
          usedAt: new Date(),
          usedBy: userId,
        })
        .where(eq(schema.invites.inviteCode, inviteCode));
      
      return true;
    } catch (error) {
      console.error('Error marking invite as used:', error);
      return false;
    }
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
  async getInvitesByCreator(userId: number) {
    const invites = await db.query.invites.findMany({
      where: eq(schema.invites.createdBy, userId),
      orderBy: (invites, { desc }) => [desc(invites.createdAt)],
    });
    
    return invites;
  }
  
  /**
   * Get an invite by ID
   */
  async getInviteById(id: number) {
    const invite = await db.query.invites.findFirst({
      where: eq(schema.invites.id, id),
    });
    
    return invite;
  }
  
  /**
   * Revoke an invite (Delete it)
   */
  async revokeInvite(id: number) {
    try {
      // Only revoke if the invite hasn't been used
      const result = await db.delete(schema.invites)
        .where(
          and(
            eq(schema.invites.id, id),
            isNull(schema.invites.usedAt)
          )
        )
        .returning({ id: schema.invites.id });
      
      return result.length > 0;
    } catch (error) {
      console.error('Error revoking invite:', error);
      return false;
    }
  }
}

export const inviteService = new InviteService();