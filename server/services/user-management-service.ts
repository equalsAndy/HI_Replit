/**
 * User management service handling creation and updates of users
 */
import { db } from '../db';
import * as schema from '../../shared/schema';
import { eq, and, isNull } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { UserRole } from '@shared/types';
import { generateInviteCode } from '../utils/invite-code';

export class UserManagementService {
  /**
   * Create a new user with role
   * 
   * @param userData User data including role
   * @returns The created user
   */
  public static async createUser(userData: {
    username: string;
    password: string;
    name: string;
    email?: string;
    organization?: string;
    jobTitle?: string;
    profilePicture?: string;
    role: UserRole;
    createdByFacilitator?: number;
  }) {
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Generate invite code for tracking even if created directly
    const inviteCode = userData.role === UserRole.Admin 
      ? null // Admins don't need invite codes
      : generateInviteCode();
    
    // Insert user
    const [user] = await db
      .insert(schema.users)
      .values({
        username: userData.username,
        password: hashedPassword,
        name: userData.name,
        email: userData.email,
        organization: userData.organization,
        jobTitle: userData.jobTitle,
        profilePicture: userData.profilePicture,
        inviteCode: inviteCode,
        codeUsed: true, // Since this is direct creation, code is considered used
        createdByFacilitator: userData.createdByFacilitator
      })
      .returning();
    
    // Add role
    await db
      .insert(schema.userRoles)
      .values({
        userId: user.id,
        role: userData.role
      });
    
    // Return user with role
    return {
      ...user,
      role: userData.role
    };
  }
  
  /**
   * Complete user registration with invite code
   * 
   * @param inviteCode The invite code used
   * @param userData User data to create account
   * @returns The created user
   */
  public static async registerWithInviteCode(
    inviteCode: string,
    userData: {
      username: string;
      password: string;
      name: string;
      organization?: string;
      jobTitle?: string;
      profilePicture?: string;
      email?: string; // Should match invite email
    }
  ) {
    // Find the invite
    const [invite] = await db
      .select()
      .from(schema.pendingInvites)
      .where(eq(schema.pendingInvites.inviteCode, inviteCode));
    
    if (!invite) {
      throw new Error('Invalid invite code');
    }
    
    // Check if invite is expired
    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      throw new Error('Invite code has expired');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Create user
    const [user] = await db
      .insert(schema.users)
      .values({
        username: userData.username,
        password: hashedPassword,
        name: userData.name || invite.name, // Use name from invite if not provided
        email: invite.email, // Use email from invite
        organization: userData.organization,
        jobTitle: userData.jobTitle,
        profilePicture: userData.profilePicture,
        inviteCode,
        codeUsed: true,
        createdByFacilitator: invite.createdBy
      })
      .returning();
    
    // Add role (default to participant)
    await db
      .insert(schema.userRoles)
      .values({
        userId: user.id,
        role: UserRole.Participant
      });
    
    // Delete the pending invite
    await db
      .delete(schema.pendingInvites)
      .where(eq(schema.pendingInvites.id, invite.id));
    
    // If invite had a cohort, add user to that cohort
    if (invite.cohortId) {
      await db
        .insert(schema.cohortParticipants)
        .values({
          cohortId: invite.cohortId,
          participantId: user.id
        });
    }
    
    // Return user with role
    return {
      ...user,
      role: UserRole.Participant
    };
  }
  
  /**
   * Update a user's profile
   * 
   * @param userId ID of user to update
   * @param userData Updated user data
   * @returns The updated user
   */
  public static async updateUserProfile(
    userId: number,
    userData: {
      name?: string;
      organization?: string;
      jobTitle?: string;
      profilePicture?: string;
      firstName?: string;
      lastName?: string;
    }
  ) {
    // Update user
    const [updatedUser] = await db
      .update(schema.users)
      .set({
        ...userData,
        updatedAt: new Date()
      })
      .where(eq(schema.users.id, userId))
      .returning();
    
    if (!updatedUser) {
      throw new Error('User not found');
    }
    
    // Get user role
    const [userRole] = await db
      .select()
      .from(schema.userRoles)
      .where(eq(schema.userRoles.userId, userId));
    
    // Return updated user with role
    return {
      ...updatedUser,
      role: userRole?.role || UserRole.Participant
    };
  }
  
  /**
   * Change a user's password
   * 
   * @param userId ID of user
   * @param currentPassword Current password for verification
   * @param newPassword New password to set
   * @returns Boolean indicating success
   */
  public static async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ) {
    // Get user
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }
    
    // Hash and set new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await db
      .update(schema.users)
      .set({
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(schema.users.id, userId));
    
    return true;
  }
  
  /**
   * Reset a user's password (admin/facilitator function)
   * 
   * @param userId ID of user to reset
   * @param newPassword New password to set
   * @returns Boolean indicating success
   */
  public static async resetPassword(userId: number, newPassword: string) {
    // Hash and set new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const [user] = await db
      .update(schema.users)
      .set({
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(schema.users.id, userId))
      .returning();
    
    return !!user;
  }
  
  /**
   * Soft delete a user
   * 
   * @param userId ID of user to delete
   * @returns Boolean indicating success
   */
  public static async softDeleteUser(userId: number) {
    const [deletedUser] = await db
      .update(schema.users)
      .set({
        deletedAt: new Date()
      })
      .where(eq(schema.users.id, userId))
      .returning();
    
    return !!deletedUser;
  }
  
  /**
   * Get all users with optional filters
   * 
   * @param options Optional filters
   * @returns Array of users with roles
   */
  public static async getUsers(options?: {
    includeDeleted?: boolean;
    role?: UserRole;
    createdBy?: number;
  }) {
    // Build query
    let query = db
      .select()
      .from(schema.users);
    
    // Apply filters
    if (!options?.includeDeleted) {
      query = query.where(isNull(schema.users.deletedAt));
    }
    
    // Execute query
    const users = await query;
    
    // Get roles for all users
    const userIds = users.map(user => user.id);
    
    if (userIds.length === 0) {
      return [];
    }
    
    const userRoles = await db
      .select()
      .from(schema.userRoles);
    
    // Map roles to users
    const usersWithRoles = users.map(user => {
      const role = userRoles.find(r => r.userId === user.id)?.role || UserRole.Participant;
      
      // If role filter is applied, skip users that don't match
      if (options?.role && role !== options.role) {
        return null;
      }
      
      // If createdBy filter is applied, skip users not created by this facilitator
      if (options?.createdBy && user.createdByFacilitator !== options.createdBy) {
        return null;
      }
      
      return {
        ...user,
        role
      };
    }).filter(Boolean); // Remove null entries from filters
    
    return usersWithRoles;
  }
  
  /**
   * Update a user's role
   * 
   * @param userId ID of user
   * @param newRole New role to assign
   * @returns Boolean indicating success
   */
  public static async updateUserRole(userId: number, newRole: UserRole) {
    // Delete existing roles
    await db
      .delete(schema.userRoles)
      .where(eq(schema.userRoles.userId, userId));
    
    // Add new role
    await db
      .insert(schema.userRoles)
      .values({
        userId,
        role: newRole
      });
    
    return true;
  }
  
  /**
   * Get users created by a specific facilitator
   * 
   * @param facilitatorId ID of facilitator
   * @returns Array of users created by this facilitator
   */
  public static async getUsersCreatedByFacilitator(facilitatorId: number) {
    const users = await db
      .select()
      .from(schema.users)
      .where(
        and(
          eq(schema.users.createdByFacilitator, facilitatorId),
          isNull(schema.users.deletedAt)
        )
      );
    
    // Get roles for these users
    const userIds = users.map(user => user.id);
    
    if (userIds.length === 0) {
      return [];
    }
    
    const userRoles = await db
      .select()
      .from(schema.userRoles);
    
    // Map roles to users
    return users.map(user => {
      const role = userRoles.find(r => r.userId === user.id)?.role || UserRole.Participant;
      return {
        ...user,
        role
      };
    });
  }
  
  /**
   * Check if a username is available
   * 
   * @param username Username to check
   * @returns Boolean indicating if username is available
   */
  public static async isUsernameAvailable(username: string) {
    const [existingUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username));
    
    return !existingUser;
  }
  
  /**
   * Generate a secure random password
   * 
   * @returns A secure password meeting requirements
   */
  public static generateSecurePassword(): string {
    const uppercaseChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijkmnopqrstuvwxyz';
    const numberChars = '23456789'; // No 0/1 to avoid confusion
    const specialChars = '!@#$%^&*';
    
    // Get at least one of each character type
    const uppercase = uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
    const lowercase = lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
    const number = numberChars[Math.floor(Math.random() * numberChars.length)];
    const special = specialChars[Math.floor(Math.random() * specialChars.length)];
    
    // Generate remaining characters (4-8 more)
    const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
    const remainingLength = 4 + Math.floor(Math.random() * 5); // 4-8 more chars
    let remainingChars = '';
    
    for (let i = 0; i < remainingLength; i++) {
      remainingChars += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Combine all parts and shuffle
    const password = uppercase + lowercase + number + special + remainingChars;
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  }
}