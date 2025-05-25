import { db } from '../db';
import * as schema from '../../shared/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { UserRole } from '../../shared/types';
import bcrypt from 'bcryptjs';
import { InviteService } from './invite-service';

/**
 * Service for managing users
 */
class UserManagementServiceClass {
  /**
   * Create a new user
   * @param userData User data including email, username, password, and role
   * @returns The created user
   */
  async createUser(userData: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
    organization?: string;
    jobTitle?: string;
    profilePicture?: string;
  }) {
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Insert the user into the database
      const [user] = await db
        .insert(schema.users)
        .values({
          email: userData.email.toLowerCase(),
          username: userData.username,
          password: hashedPassword,
          firstName: userData.firstName || null,
          lastName: userData.lastName || null,
          organization: userData.organization || null,
          jobTitle: userData.jobTitle || null,
          profilePicture: userData.profilePicture || null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null
        })
        .returning();
      
      // Create user role
      await db
        .insert(schema.userRoles)
        .values({
          userId: user.id,
          role: userData.role,
          createdAt: new Date()
        });
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }
  
  /**
   * Register a new user with an invite code
   * @param userData User data including email, password, and invite code
   * @returns The created user with role information
   */
  async registerWithInviteCode(userData: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
    organization?: string;
    jobTitle?: string;
    profilePicture?: string;
    inviteCode: string;
  }) {
    try {
      // Validate the invite code
      const { valid, message, invite } = await InviteService.validateInvite(userData.inviteCode);
      
      if (!valid || !invite) {
        throw new Error(message);
      }
      
      // Create the user with the role from the invite
      const user = await this.createUser({
        ...userData,
        role: invite.role
      });
      
      // Mark the invite as used
      await InviteService.markInviteAsUsed(userData.inviteCode, user.id);
      
      // Return user with role
      const [userRole] = await db
        .select()
        .from(schema.userRoles)
        .where(eq(schema.userRoles.userId, user.id));
      
      return {
        ...user,
        role: userRole?.role
      };
    } catch (error) {
      console.error('Error registering with invite code:', error);
      throw error;
    }
  }
  
  /**
   * Get a user by email
   * @param email The email to look up
   * @returns The user if found, null otherwise
   */
  async getUserByEmail(email: string) {
    try {
      const [user] = await db
        .select()
        .from(schema.users)
        .where(
          and(
            eq(schema.users.email, email.toLowerCase()),
            isNull(schema.users.deletedAt)
          )
        );
        
      return user || null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }
  
  /**
   * Get a user by ID
   * @param id The user ID
   * @returns The user if found, null otherwise
   */
  async getUserById(id: number) {
    try {
      const [user] = await db
        .select()
        .from(schema.users)
        .where(
          and(
            eq(schema.users.id, id),
            isNull(schema.users.deletedAt)
          )
        );
        
      if (!user) {
        return null;
      }
      
      // Get user role
      const [userRole] = await db
        .select()
        .from(schema.userRoles)
        .where(eq(schema.userRoles.userId, id));
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return {
        ...userWithoutPassword,
        role: userRole?.role
      };
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }
  
  /**
   * Verify a user's password
   * @param user The user object
   * @param password The password to verify
   * @returns True if password matches, false otherwise
   */
  async verifyPassword(user: any, password: string) {
    try {
      return await bcrypt.compare(password, user.password);
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  }
  
  /**
   * Update a user's profile
   * @param userId The user ID
   * @param profileData The profile data to update
   * @returns The updated user
   */
  async updateProfile(userId: number, profileData: {
    firstName?: string;
    lastName?: string;
    organization?: string;
    jobTitle?: string;
    profilePicture?: string;
  }) {
    try {
      const result = await db
        .update(schema.users)
        .set({
          ...profileData,
          updatedAt: new Date()
        })
        .where(eq(schema.users.id, userId));
      
      if (!result.rowCount || result.rowCount === 0) {
        throw new Error('User not found');
      }
      
      return this.getUserById(userId);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
  
  /**
   * Change a user's password
   * @param userId The user ID
   * @param currentPassword The current password
   * @param newPassword The new password
   * @returns True if successful, false otherwise
   */
  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    try {
      // Get the user with password
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, userId));
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Verify current password
      const isValid = await this.verifyPassword(user, currentPassword);
      if (!isValid) {
        throw new Error('Current password is incorrect');
      }
      
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update the password
      const result = await db
        .update(schema.users)
        .set({
          password: hashedPassword,
          updatedAt: new Date()
        })
        .where(eq(schema.users.id, userId));
      
      return result.rowCount && result.rowCount > 0;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
  
  /**
   * Get all users (admin function)
   * @returns Array of users
   */
  async getAllUsers() {
    try {
      const users = await db
        .select({
          id: schema.users.id,
          email: schema.users.email,
          username: schema.users.username,
          firstName: schema.users.firstName,
          lastName: schema.users.lastName,
          organization: schema.users.organization,
          jobTitle: schema.users.jobTitle,
          profilePicture: schema.users.profilePicture,
          createdAt: schema.users.createdAt,
          updatedAt: schema.users.updatedAt,
          deletedAt: schema.users.deletedAt
        })
        .from(schema.users)
        .orderBy(schema.users.createdAt);
      
      // Get roles for each user
      const userRoles = await db
        .select()
        .from(schema.userRoles);
      
      // Map roles to users
      return users.map(user => {
        const role = userRoles.find(ur => ur.userId === user.id)?.role || 'participant';
        return { ...user, role };
      });
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }
  
  /**
   * Generate a secure random password
   * @returns A random password
   */
  generateSecurePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    const crypto = require('crypto');
    const bytes = crypto.randomBytes(16);
    
    for (let i = 0; i < 16; i++) {
      const index = bytes[i] % chars.length;
      password += chars.charAt(index);
    }
    
    return password;
  }
}

// Export a singleton instance
export const UserManagementService = new UserManagementServiceClass();