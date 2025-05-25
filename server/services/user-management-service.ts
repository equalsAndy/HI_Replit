import { db } from '../db';
import * as schema from '../../shared/schema';
import { eq, and, isNull, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

class UserManagementService {
  /**
   * Create a new user
   */
  async createUser(userData: {
    username: string;
    password: string;
    email: string;
    name: string;
    role: 'admin' | 'facilitator' | 'participant';
    inviteCode?: string;
    organization?: string;
    jobTitle?: string;
    profilePicture?: string;
    createdByFacilitator?: number;
  }) {
    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Create the user
    const newUser = await db.insert(schema.users).values({
      username: userData.username.toLowerCase(),
      password: hashedPassword,
      email: userData.email.toLowerCase(),
      name: userData.name,
      role: userData.role,
      inviteCode: userData.inviteCode,
      codeUsed: userData.inviteCode ? true : false,
      organization: userData.organization || null,
      jobTitle: userData.jobTitle || null,
      profilePicture: userData.profilePicture || null,
      createdByFacilitator: userData.createdByFacilitator || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    
    return newUser[0];
  }
  
  /**
   * Get a user by ID
   */
  async getUserById(id: number) {
    return await db.query.users.findFirst({
      where: eq(schema.users.id, id),
      columns: {
        password: false, // Exclude password from result
      }
    });
  }
  
  /**
   * Get a user by ID with password included (for verification)
   */
  async getUserWithPassword(id: number) {
    return await db.query.users.findFirst({
      where: eq(schema.users.id, id)
    });
  }
  
  /**
   * Update a user's last login timestamp
   */
  async updateLastLogin(userId: number) {
    return await db.update(schema.users)
      .set({
        lastLogin: new Date(),
      })
      .where(eq(schema.users.id, userId));
  }
  
  /**
   * Get a user by email
   */
  async getUserByEmail(email: string) {
    return await db.query.users.findFirst({
      where: eq(schema.users.email, email.toLowerCase()),
    });
  }
  
  /**
   * Get a user by username
   */
  async getUserByUsername(username: string) {
    return await db.query.users.findFirst({
      where: eq(schema.users.username, username.toLowerCase()),
    });
  }
  
  /**
   * Check if a username is available
   */
  async isUsernameAvailable(username: string): Promise<boolean> {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.username, username.toLowerCase()),
    });
    
    return !user;
  }
  
  /**
   * Update a user's profile
   */
  async updateUserProfile(userId: number, profileData: {
    name?: string;
    organization?: string;
    jobTitle?: string;
    profilePicture?: string;
  }) {
    const updatedUser = await db.update(schema.users)
      .set({
        ...profileData,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId))
      .returning({
        id: schema.users.id,
        name: schema.users.name,
        organization: schema.users.organization,
        jobTitle: schema.users.jobTitle,
        profilePicture: schema.users.profilePicture,
      });
    
    return updatedUser[0];
  }
  
  /**
   * Change a user's password
   */
  async changePassword(userId: number, newPassword: string) {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await db.update(schema.users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId));
    
    return true;
  }
  
  /**
   * Get all users (with optional role filter)
   */
  async getAllUsers(role?: 'admin' | 'facilitator' | 'participant') {
    if (role) {
      return await db.query.users.findMany({
        where: eq(schema.users.role, role),
        columns: {
          password: false, // Exclude password from result
        },
        orderBy: (users, { desc }) => [desc(users.createdAt)]
      });
    }
    
    return await db.query.users.findMany({
      columns: {
        password: false, // Exclude password from result
      },
      orderBy: (users, { desc }) => [desc(users.createdAt)]
    });
  }
  
  /**
   * Validate user credentials for login
   */
  async validateUserCredentials(username: string, password: string) {
    // Get user by username
    const user = await this.getUserByUsername(username);
    
    if (!user) {
      return null;
    }
    
    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return null;
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  
  /**
   * Soft delete a user
   */
  async softDeleteUser(userId: number) {
    return await db.update(schema.users)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(schema.users.id, userId))
      .returning();
  }
  
  /**
   * Get a user's participants (for facilitators)
   */
  async getFacilitatorParticipants(facilitatorId: number) {
    return await db.query.users.findMany({
      where: and(
        eq(schema.users.createdByFacilitator, facilitatorId),
        eq(schema.users.role, 'participant'),
        isNull(schema.users.deletedAt)
      ),
      columns: {
        password: false, // Exclude password from result
      }
    });
  }
  
  /**
   * Check if a password meets requirements
   */
  validatePassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    
    // At least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    
    // At least one lowercase letter
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    
    // At least one number
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' };
    }
    
    // At least one special character
    if (!/[!@#$%^&*]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one special character (!@#$%^&*)' };
    }
    
    return { valid: true };
  }
  
  /**
   * Validate username format and availability
   */
  async validateUsername(username: string): Promise<{ valid: boolean; message?: string }> {
    // Check length
    if (username.length < 3 || username.length > 20) {
      return { valid: false, message: 'Username must be between 3 and 20 characters long' };
    }
    
    // Check allowed characters
    if (!/^[a-zA-Z0-9][a-zA-Z0-9_\-]*$/.test(username)) {
      return { valid: false, message: 'Username can only contain letters, numbers, underscores, and hyphens, and must start with a letter or number' };
    }
    
    // Check for consecutive underscores or hyphens
    if (/__|--/.test(username)) {
      return { valid: false, message: 'Username cannot contain consecutive underscores or hyphens' };
    }
    
    // Check reserved words
    const reservedWords = ['admin', 'system', 'test', 'support', 'help', 'api', 'root'];
    if (reservedWords.includes(username.toLowerCase())) {
      return { valid: false, message: 'This username is reserved and cannot be used' };
    }
    
    // Check availability
    const isAvailable = await this.isUsernameAvailable(username);
    if (!isAvailable) {
      return { valid: false, message: 'This username is already taken' };
    }
    
    return { valid: true };
  }
  
  /**
   * Generate a secure random password
   */
  generateSecurePassword(): string {
    const length = 12;
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const special = '!@#$%^&*';
    
    const allChars = uppercase + lowercase + numbers + special;
    
    // Ensure at least one of each character type
    let password = 
      uppercase.charAt(Math.floor(Math.random() * uppercase.length)) +
      lowercase.charAt(Math.floor(Math.random() * lowercase.length)) +
      numbers.charAt(Math.floor(Math.random() * numbers.length)) +
      special.charAt(Math.floor(Math.random() * special.length));
    
    // Fill the rest with random characters
    for (let i = 4; i < length; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    // Shuffle the password characters
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  }
}

export const userManagementService = new UserManagementService();