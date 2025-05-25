import { db } from '../db';
import * as schema from '../../shared/schema';
import { eq, isNull, and, not, sql, inArray } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { UserRole } from '../../shared/types';
import { InviteService } from './invite-service';

// Password salt rounds for bcrypt
const SALT_ROUNDS = 10;

// Length of generated temporary passwords
const TEMP_PASSWORD_LENGTH = 12;

/**
 * Service class for user management operations
 */
export class UserManagementService {
  /**
   * Creates a new user with the given details
   * @param userData User data for creation
   * @param generateTempPassword Whether to generate a temporary password
   * @returns The created user and temp password if generated
   */
  public static async createUser(
    userData: {
      username: string;
      name: string;
      email?: string;
      organization?: string;
      jobTitle?: string;
      password?: string;
      role: 'admin' | 'facilitator' | 'participant';
      createdByFacilitator?: number;
    },
    generateTempPassword: boolean = false
  ) {
    // Generate a temporary password if requested or if no password provided
    let tempPassword: string | null = null;
    let passwordHash: string;
    
    if (generateTempPassword || !userData.password) {
      tempPassword = this.generateTemporaryPassword();
      passwordHash = await bcrypt.hash(tempPassword, SALT_ROUNDS);
    } else {
      passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS);
    }
    
    // Insert the user
    const [user] = await db.insert(schema.users).values({
      username: userData.username,
      name: userData.name,
      email: userData.email || null,
      organization: userData.organization || null,
      jobTitle: userData.jobTitle || null,
      password: passwordHash,
      profilePicture: null,
      createdByFacilitator: userData.createdByFacilitator || null,
    }).returning();
    
    // Insert the user role
    await db.insert(schema.userRoles).values({
      userId: user.id,
      role: userData.role as UserRole,
    });
    
    // Return the created user and temporary password if generated
    return {
      user,
      temporaryPassword: tempPassword
    };
  }

  /**
   * Updates a user's details
   * @param userId User ID to update
   * @param userData Data to update
   * @param resetPassword Whether to reset the password
   * @returns The updated user and new temp password if reset
   */
  public static async updateUser(
    userId: number,
    userData: {
      name?: string;
      email?: string;
      organization?: string;
      jobTitle?: string;
      role?: 'admin' | 'facilitator' | 'participant';
    },
    resetPassword: boolean = false
  ) {
    let tempPassword: string | null = null;
    
    // Update user record
    const updateData: Record<string, any> = {};
    
    if (userData.name) updateData.name = userData.name;
    if (userData.email !== undefined) updateData.email = userData.email || null;
    if (userData.organization !== undefined) updateData.organization = userData.organization || null;
    if (userData.jobTitle !== undefined) updateData.jobTitle = userData.jobTitle || null;
    
    // Only update if we have data to update
    if (Object.keys(updateData).length > 0 || resetPassword) {
      // Reset password if requested
      if (resetPassword) {
        tempPassword = this.generateTemporaryPassword();
        updateData.password = await bcrypt.hash(tempPassword, SALT_ROUNDS);
      }
      
      // Update the user record
      const [updatedUser] = await db.update(schema.users)
        .set(updateData)
        .where(and(
          eq(schema.users.id, userId),
          isNull(schema.users.deletedAt)
        ))
        .returning();
      
      // Update role if provided
      if (userData.role) {
        await db.update(schema.userRoles)
          .set({ role: userData.role as UserRole })
          .where(eq(schema.userRoles.userId, userId));
      }
      
      return {
        user: updatedUser,
        temporaryPassword: tempPassword
      };
    }
    
    // If no updates were made, return the existing user
    const [user] = await db.select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));
    
    return { user, temporaryPassword: null };
  }

  /**
   * Soft deletes a user (marks as deleted but keeps data)
   * @param userId User ID to delete
   * @returns Whether the deletion was successful
   */
  public static async softDeleteUser(userId: number) {
    if (!userId) return false;
    
    const result = await db.update(schema.users)
      .set({
        deletedAt: new Date(),
      })
      .where(and(
        eq(schema.users.id, userId),
        isNull(schema.users.deletedAt)
      ));
    
    return result.rowCount > 0;
  }

  /**
   * Restores a previously deleted user
   * @param userId User ID to restore
   * @returns Whether the restoration was successful
   */
  public static async restoreUser(userId: number) {
    if (!userId) return false;
    
    const result = await db.update(schema.users)
      .set({
        deletedAt: null,
      })
      .where(and(
        eq(schema.users.id, userId),
        not(isNull(schema.users.deletedAt))
      ));
    
    return result.rowCount > 0;
  }

  /**
   * Changes a user's password
   * @param userId User ID
   * @param currentPassword Current password for verification
   * @param newPassword New password to set
   * @returns Whether the password change was successful
   */
  public static async changePassword(userId: number, currentPassword: string, newPassword: string) {
    if (!userId || !currentPassword || !newPassword) {
      return false;
    }
    
    // Get the user's current password hash
    const [user] = await db.select({ password: schema.users.password })
      .from(schema.users)
      .where(eq(schema.users.id, userId));
    
    if (!user) {
      return false;
    }
    
    // Verify the current password
    const isCorrectPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isCorrectPassword) {
      return false;
    }
    
    // Update with the new password
    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await db.update(schema.users)
      .set({ password: newPasswordHash })
      .where(eq(schema.users.id, userId));
    
    return true;
  }

  /**
   * Checks if a username is available (not taken)
   * @param username Username to check
   * @returns Whether the username is available
   */
  public static async isUsernameAvailable(username: string) {
    if (!username) {
      return false;
    }
    
    const [existingUser] = await db.select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.username, username));
    
    return !existingUser;
  }

  /**
   * Gets a user by ID with role information
   * @param userId User ID to retrieve
   * @returns User with role information if found
   */
  public static async getUserById(userId: number) {
    if (!userId) {
      return null;
    }
    
    // Get user details
    const [user] = await db.select({
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
      createdByFacilitator: schema.users.createdByFacilitator,
    })
    .from(schema.users)
    .where(eq(schema.users.id, userId));
    
    if (!user) {
      return null;
    }
    
    // Get user role
    const [userRole] = await db.select({ role: schema.userRoles.role })
      .from(schema.userRoles)
      .where(eq(schema.userRoles.userId, userId));
    
    return {
      ...user,
      role: userRole?.role || 'participant',
      isDeleted: user.deletedAt !== null
    };
  }

  /**
   * Gets a user by username with role information
   * @param username Username to look up
   * @returns User with role information if found
   */
  public static async getUserByUsername(username: string) {
    if (!username) {
      return null;
    }
    
    // Get user details
    const [user] = await db.select({
      id: schema.users.id,
      username: schema.users.username,
      name: schema.users.name,
      email: schema.users.email,
      organization: schema.users.organization,
      jobTitle: schema.users.jobTitle,
      profilePicture: schema.users.profilePicture,
      password: schema.users.password,
      createdAt: schema.users.createdAt,
      updatedAt: schema.users.updatedAt,
      deletedAt: schema.users.deletedAt,
      createdByFacilitator: schema.users.createdByFacilitator,
    })
    .from(schema.users)
    .where(eq(schema.users.username, username));
    
    if (!user) {
      return null;
    }
    
    // Get user role
    const [userRole] = await db.select({ role: schema.userRoles.role })
      .from(schema.userRoles)
      .where(eq(schema.userRoles.userId, user.id));
    
    return {
      ...user,
      role: userRole?.role || 'participant',
      isDeleted: user.deletedAt !== null
    };
  }

  /**
   * Gets all users with role information
   * @param includeDeleted Whether to include soft-deleted users
   * @returns List of users with roles
   */
  public static async getAllUsers(includeDeleted: boolean = false) {
    // Query condition for deleted status
    const condition = includeDeleted
      ? sql`1=1`  // include all
      : isNull(schema.users.deletedAt);
    
    // Get all users
    const users = await db.select({
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
      createdByFacilitator: schema.users.createdByFacilitator,
    })
    .from(schema.users)
    .where(condition);
    
    if (users.length === 0) {
      return [];
    }
    
    // Get all user IDs
    const userIds = users.map(user => user.id);
    
    // Get roles for all users in one query
    const roles = await db
      .select()
      .from(schema.userRoles)
      .where(
        userIds.length > 0 
          ? inArray(schema.userRoles.userId, userIds) 
          : eq(schema.userRoles.userId, -1) // No users found, return empty result
      );
    
    // Create a map of userId to role
    const roleMap = new Map();
    for (const role of roles) {
      roleMap.set(role.userId, role.role);
    }
    
    // Combine user data with roles
    return users.map(user => ({
      ...user,
      role: roleMap.get(user.id) || 'participant',
      isDeleted: user.deletedAt !== null
    }));
  }

  /**
   * Gets all participants created by a specific facilitator
   * @param facilitatorId Facilitator ID
   * @param includeDeleted Whether to include soft-deleted users
   * @returns List of participants created by the facilitator
   */
  public static async getParticipantsByFacilitator(facilitatorId: number, includeDeleted: boolean = false) {
    if (!facilitatorId) {
      return [];
    }
    
    // Query condition for deleted status
    const condition = includeDeleted
      ? eq(schema.users.createdByFacilitator, facilitatorId)
      : and(
          eq(schema.users.createdByFacilitator, facilitatorId),
          isNull(schema.users.deletedAt)
        );
    
    // Get participants created by this facilitator
    const users = await db.select({
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
    })
    .from(schema.users)
    .where(condition);
    
    if (users.length === 0) {
      return [];
    }
    
    // Get all user IDs
    const userIds = users.map(user => user.id);
    
    // Get roles for all users in one query to verify they are participants
    const roles = await db
      .select()
      .from(schema.userRoles)
      .where(and(
        inArray(schema.userRoles.userId, userIds),
        eq(schema.userRoles.role, 'participant' as UserRole)
      ));
    
    // Create a set of participant userIds
    const participantIds = new Set(roles.map(r => r.userId));
    
    // Filter to only include participants
    return users
      .filter(user => participantIds.has(user.id))
      .map(user => ({
        ...user,
        role: 'participant' as 'admin' | 'facilitator' | 'participant',
        isDeleted: user.deletedAt !== null
      }));
  }

  /**
   * Creates a user from an invite code
   * @param inviteCode Invite code
   * @param userData User data for registration
   * @returns The created user
   */
  public static async createUserFromInvite(inviteCode: string, userData: {
    username: string;
    password: string;
    organization?: string;
    jobTitle?: string;
    profilePicture?: string;
  }) {
    // Verify the invite is valid
    const invite = await InviteService.verifyInvite(inviteCode);
    if (!invite) {
      throw new Error('Invalid or expired invite code');
    }
    
    // Hash the password
    const passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS);
    
    // Create the user
    const [user] = await db.insert(schema.users).values({
      username: userData.username,
      name: invite.name,
      email: invite.email,
      organization: userData.organization || null,
      jobTitle: userData.jobTitle || null,
      password: passwordHash,
      profilePicture: userData.profilePicture || null,
    }).returning();
    
    // Assign the role from the invite
    await db.insert(schema.userRoles).values({
      userId: user.id,
      role: invite.role as UserRole,
    });
    
    // Mark the invite as used
    await InviteService.markInviteAsUsed(inviteCode, user.id);
    
    // Return the created user
    return this.getUserById(user.id);
  }

  /**
   * Updates a user's profile information
   * @param userId User ID
   * @param profileData Profile data to update
   * @returns The updated user
   */
  public static async updateProfile(userId: number, profileData: {
    name?: string;
    email?: string;
    organization?: string;
    jobTitle?: string;
    profilePicture?: string;
  }) {
    if (!userId) {
      return null;
    }
    
    const updateData: Record<string, any> = {};
    
    if (profileData.name) updateData.name = profileData.name;
    if (profileData.email !== undefined) updateData.email = profileData.email || null;
    if (profileData.organization !== undefined) updateData.organization = profileData.organization || null;
    if (profileData.jobTitle !== undefined) updateData.jobTitle = profileData.jobTitle || null;
    if (profileData.profilePicture !== undefined) updateData.profilePicture = profileData.profilePicture || null;
    
    // Only update if we have data to update
    if (Object.keys(updateData).length > 0) {
      await db.update(schema.users)
        .set(updateData)
        .where(eq(schema.users.id, userId));
    }
    
    return this.getUserById(userId);
  }

  /**
   * Generates a random temporary password
   * Uses a mix of uppercase, lowercase, and digits
   * @returns A randomly generated password
   */
  private static generateTemporaryPassword(): string {
    const uppercaseChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // no I, O
    const lowercaseChars = 'abcdefghijkmnopqrstuvwxyz'; // no l
    const digitChars = '23456789'; // no 0, 1
    const allChars = uppercaseChars + lowercaseChars + digitChars;
    
    let result = '';
    
    // Ensure at least one of each type
    result += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
    result += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length));
    result += digitChars.charAt(Math.floor(Math.random() * digitChars.length));
    
    // Fill the rest with random characters
    for (let i = 3; i < TEMP_PASSWORD_LENGTH; i++) {
      result += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    // Shuffle the password characters
    return result.split('').sort(() => 0.5 - Math.random()).join('');
  }
}