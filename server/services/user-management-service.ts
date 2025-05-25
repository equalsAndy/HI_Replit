import { db } from '../db';
import * as schema from '../../shared/schema';
import { eq, isNull, and, not } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { UserRole } from '@shared/types';
import { InviteService } from './invite-service';

// Password salt rounds for bcrypt
const SALT_ROUNDS = 10;

// Special characters for password generation
const SPECIAL_CHARS = '!@#$%^&*';

interface CreateUserOptions {
  username: string;
  password: string;
  name: string;
  email?: string;
  organization?: string;
  jobTitle?: string;
  role: UserRole;
  profilePicture?: string;
  createdByFacilitator?: number;
}

interface RegisterWithInviteOptions {
  username: string;
  password: string;
  name: string;
  organization?: string;
  jobTitle?: string;
  profilePicture?: string;
}

interface UpdateProfileOptions {
  name?: string;
  firstName?: string;
  lastName?: string;
  organization?: string;
  jobTitle?: string;
  profilePicture?: string;
}

export class UserManagementService {
  /**
   * Check if a username is available
   * @param username The username to check
   * @returns True if username is available, false otherwise
   */
  static async isUsernameAvailable(username: string): Promise<boolean> {
    const [existingUser] = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.username, username));
    
    return !existingUser;
  }
  
  /**
   * Register a new user with an invite code
   * @param inviteCode The invite code
   * @param options User registration options
   * @returns The created user with role
   */
  static async registerWithInviteCode(
    inviteCode: string,
    options: RegisterWithInviteOptions
  ): Promise<any> {
    // Get invite details
    const invite = await InviteService.getInviteByCode(inviteCode);
    
    if (!invite) {
      throw new Error('Invalid invite code');
    }
    
    if (invite.isExpired) {
      throw new Error('Invite code has expired');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(options.password, SALT_ROUNDS);
    
    // Begin transaction
    return await db.transaction(async (tx) => {
      // Create user
      const [user] = await tx
        .insert(schema.users)
        .values({
          username: options.username,
          password: hashedPassword,
          name: options.name,
          email: invite.email,
          organization: options.organization,
          jobTitle: options.jobTitle,
          profilePicture: options.profilePicture
        })
        .returning();
      
      // Assign role from invite
      await tx
        .insert(schema.userRoles)
        .values({
          userId: user.id,
          role: invite.role
        });
      
      // If invite has a cohort ID, add user to that cohort
      const [inviteDetails] = await tx
        .select({ cohortId: schema.pendingInvites.cohortId })
        .from(schema.pendingInvites)
        .where(eq(schema.pendingInvites.id, invite.id));
      
      if (inviteDetails?.cohortId) {
        await tx
          .insert(schema.cohortParticipants)
          .values({
            cohortId: inviteDetails.cohortId,
            participantId: user.id
          });
      }
      
      // Mark invite as used
      await InviteService.markInviteAsUsed(invite.id);
      
      // Return user with role
      return {
        ...user,
        role: invite.role
      };
    });
  }
  
  /**
   * Create a new user (admin function)
   * @param options User creation options
   * @returns The created user with role
   */
  static async createUser(options: CreateUserOptions): Promise<any> {
    // Check if username is available
    const isAvailable = await UserManagementService.isUsernameAvailable(options.username);
    
    if (!isAvailable) {
      throw new Error('Username already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(options.password, SALT_ROUNDS);
    
    // Begin transaction
    return await db.transaction(async (tx) => {
      // Create user
      const [user] = await tx
        .insert(schema.users)
        .values({
          username: options.username,
          password: hashedPassword,
          name: options.name,
          email: options.email || null,
          organization: options.organization,
          jobTitle: options.jobTitle,
          profilePicture: options.profilePicture,
          createdByFacilitator: options.createdByFacilitator
        })
        .returning();
      
      // Assign role
      await tx
        .insert(schema.userRoles)
        .values({
          userId: user.id,
          role: options.role
        });
      
      // Return user with role
      return {
        ...user,
        role: options.role
      };
    });
  }
  
  /**
   * Update user profile
   * @param userId The ID of the user to update
   * @param options Profile update options
   * @returns The updated user
   */
  static async updateUserProfile(userId: number, options: UpdateProfileOptions): Promise<any> {
    // Get current user
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Update user
    const [updatedUser] = await db
      .update(schema.users)
      .set({
        name: options.name ?? user.name,
        firstName: options.firstName ?? user.firstName,
        lastName: options.lastName ?? user.lastName,
        organization: options.organization ?? user.organization,
        jobTitle: options.jobTitle ?? user.jobTitle,
        profilePicture: options.profilePicture ?? user.profilePicture,
        updatedAt: new Date()
      })
      .where(eq(schema.users.id, userId))
      .returning();
    
    // Get user role
    const [userRole] = await db
      .select()
      .from(schema.userRoles)
      .where(eq(schema.userRoles.userId, userId));
    
    // Return user with role (excluding password)
    const { password: _, ...userWithoutPassword } = updatedUser;
    
    return {
      ...userWithoutPassword,
      role: userRole?.role || UserRole.Participant
    };
  }
  
  /**
   * Update user role
   * @param userId The ID of the user
   * @param role The new role
   * @returns True if successful
   */
  static async updateUserRole(userId: number, role: UserRole): Promise<boolean> {
    // Check if user has a role
    const [existingRole] = await db
      .select()
      .from(schema.userRoles)
      .where(eq(schema.userRoles.userId, userId));
    
    if (existingRole) {
      // Update existing role
      await db
        .update(schema.userRoles)
        .set({ role })
        .where(eq(schema.userRoles.userId, userId));
    } else {
      // Create new role
      await db
        .insert(schema.userRoles)
        .values({ userId, role });
    }
    
    return true;
  }
  
  /**
   * Change user password
   * @param userId The ID of the user
   * @param currentPassword The current password
   * @param newPassword The new password
   * @returns True if successful
   */
  static async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<boolean> {
    // Get user
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Verify current password
    const isCorrect = await bcrypt.compare(currentPassword, user.password);
    
    if (!isCorrect) {
      throw new Error('Current password is incorrect');
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    
    // Update password
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
   * Reset user password (admin function)
   * @param userId The ID of the user
   * @param newPassword The new password
   * @returns True if successful
   */
  static async resetPassword(userId: number, newPassword: string): Promise<boolean> {
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    
    // Update password
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
   * Soft delete a user
   * @param userId The ID of the user to delete
   * @returns True if successful
   */
  static async softDeleteUser(userId: number): Promise<boolean> {
    const [user] = await db
      .update(schema.users)
      .set({ 
        deletedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(schema.users.id, userId))
      .returning();
    
    return !!user;
  }
  
  /**
   * Restore a soft-deleted user
   * @param userId The ID of the user to restore
   * @returns True if successful
   */
  static async restoreUser(userId: number): Promise<boolean> {
    const [user] = await db
      .update(schema.users)
      .set({ 
        deletedAt: null,
        updatedAt: new Date()
      })
      .where(eq(schema.users.id, userId))
      .returning();
    
    return !!user;
  }
  
  /**
   * Get users
   * @param options Options for filtering users
   * @returns Array of users
   */
  static async getUsers(options: {
    includeDeleted?: boolean
  } = {}): Promise<any[]> {
    let query = db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        name: schema.users.name,
        email: schema.users.email,
        organization: schema.users.organization,
        jobTitle: schema.users.jobTitle,
        profilePicture: schema.users.profilePicture,
        createdAt: schema.users.createdAt,
        updatedAt: schema.users.updatedAt,
        deletedAt: schema.users.deletedAt,
        createdByFacilitator: schema.users.createdByFacilitator
      })
      .from(schema.users);
    
    // Filter out deleted users unless includeDeleted is true
    if (!options.includeDeleted) {
      query = query.where(isNull(schema.users.deletedAt));
    }
    
    const users = await query;
    
    // Get all user roles
    const userIds = users.map(user => user.id);
    const roles = await db
      .select()
      .from(schema.userRoles)
      .where(
        userIds.length > 0 
          ? db.inArray(schema.userRoles.userId, userIds) 
          : eq(schema.userRoles.userId, -1) // No users found, return empty result
      );
    
    // Map users with their roles
    return users.map(user => {
      const userRole = roles.find(role => role.userId === user.id);
      return {
        ...user,
        role: userRole?.role || UserRole.Participant,
        isDeleted: !!user.deletedAt
      };
    });
  }
  
  /**
   * Get users created by a specific facilitator
   * @param facilitatorId The ID of the facilitator
   * @returns Array of users
   */
  static async getUsersCreatedByFacilitator(facilitatorId: number): Promise<any[]> {
    // Get users created by this facilitator
    const users = await db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        name: schema.users.name,
        email: schema.users.email,
        organization: schema.users.organization,
        jobTitle: schema.users.jobTitle,
        profilePicture: schema.users.profilePicture,
        createdAt: schema.users.createdAt,
        updatedAt: schema.users.updatedAt
      })
      .from(schema.users)
      .where(
        and(
          eq(schema.users.createdByFacilitator, facilitatorId),
          isNull(schema.users.deletedAt)
        )
      );
    
    // Get all user roles
    const userIds = users.map(user => user.id);
    const roles = await db
      .select()
      .from(schema.userRoles)
      .where(
        userIds.length > 0 
          ? db.inArray(schema.userRoles.userId, userIds) 
          : eq(schema.userRoles.userId, -1) // No users found, return empty result
      );
    
    // Map users with their roles
    return users.map(user => {
      const userRole = roles.find(role => role.userId === user.id);
      return {
        ...user,
        role: userRole?.role || UserRole.Participant
      };
    });
  }
  
  /**
   * Generate a secure random password
   * @returns A secure password
   */
  static generateSecurePassword(): string {
    const length = 12;
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    
    let password = '';
    
    // At least one uppercase letter
    password += charset.match(/[A-Z]/g)![Math.floor(Math.random() * 23)];
    
    // At least one lowercase letter
    password += charset.match(/[a-z]/g)![Math.floor(Math.random() * 23)];
    
    // At least one number
    password += charset.match(/[0-9]/g)![Math.floor(Math.random() * 8)];
    
    // At least one special character
    password += SPECIAL_CHARS[Math.floor(Math.random() * SPECIAL_CHARS.length)];
    
    // Fill the rest with random characters
    for (let i = password.length; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    
    // Shuffle the password
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }
}