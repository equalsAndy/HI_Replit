import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

class UserManagementService {
  /**
   * Check if a username is available
   */
  async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      const result = await db.select({ id: users.id })
        .from(users)
        .where(eq(users.username, username));
      
      return result.length === 0;
    } catch (error) {
      console.error('Error checking username availability:', error);
      throw new Error('Failed to check username availability');
    }
  }
  
  /**
   * Create a new user
   */
  async createUser(data: {
    username: string;
    password: string;
    name: string;
    email: string;
    role: 'admin' | 'facilitator' | 'participant';
    organization?: string;
    jobTitle?: string;
  }) {
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(data.password, 10);
      
      // Insert the user into the database
      const result = await db.insert(users).values({
        username: data.username,
        password: hashedPassword,
        name: data.name,
        email: data.email.toLowerCase(),
        role: data.role,
        organization: data.organization || null,
        jobTitle: data.jobTitle || null,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      return result[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }
  
  /**
   * Get a user by email
   */
  async getUserByEmail(email: string) {
    try {
      const result = await db.select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()));
      
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw new Error('Failed to get user by email');
    }
  }
  
  /**
   * Get a user by username
   */
  async getUserByUsername(username: string) {
    try {
      const result = await db.select()
        .from(users)
        .where(eq(users.username, username));
      
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error getting user by username:', error);
      throw new Error('Failed to get user by username');
    }
  }
  
  /**
   * Get a user by ID
   */
  async getUserById(id: number) {
    try {
      const result = await db.select()
        .from(users)
        .where(eq(users.id, id));
      
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw new Error('Failed to get user by ID');
    }
  }
  
  /**
   * Update a user
   */
  async updateUser(id: number, data: Partial<{
    name: string;
    email: string;
    role: 'admin' | 'facilitator' | 'participant';
    organization: string | null;
    jobTitle: string | null;
    profilePicture: string | null;
  }>) {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date()
      };
      
      if (data.email) {
        updateData.email = data.email.toLowerCase();
      }
      
      const result = await db.update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }
  
  /**
   * Verify a user's password
   */
  async verifyPassword(username: string, password: string) {
    try {
      const user = await this.getUserByUsername(username);
      
      if (!user) {
        return { valid: false, user: null };
      }
      
      const isValid = await bcrypt.compare(password, user.password);
      
      if (!isValid) {
        return { valid: false, user: null };
      }
      
      // Don't send the password back
      const { password: _, ...userWithoutPassword } = user;
      
      return { valid: true, user: userWithoutPassword };
    } catch (error) {
      console.error('Error verifying password:', error);
      throw new Error('Failed to verify password');
    }
  }
  
  /**
   * Generate a secure random password
   */
  generateSecurePassword(length = 12) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    
    return password;
  }
  
  /**
   * Get all users
   */
  async getAllUsers() {
    try {
      const result = await db.select({
        id: users.id,
        username: users.username,
        name: users.name,
        email: users.email,
        role: users.role,
        organization: users.organization,
        jobTitle: users.jobTitle,
        profilePicture: users.profilePicture,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      })
      .from(users)
      .orderBy(users.createdAt);
      
      return result;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw new Error('Failed to get all users');
    }
  }
}

export const userManagementService = new UserManagementService();