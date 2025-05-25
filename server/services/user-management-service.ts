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
      const existingUser = await db.select()
        .from(users)
        .where(eq(users.username, username));
      
      return existingUser.length === 0;
    } catch (error) {
      console.error('Error checking username availability:', error);
      return false;
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
    organization?: string | null;
    jobTitle?: string | null;
    profilePicture?: string | null;
  }) {
    try {
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);
      
      // Insert the user into the database
      const result = await db.insert(users).values({
        username: data.username,
        password: hashedPassword,
        name: data.name,
        email: data.email.toLowerCase(),
        role: data.role,
        organization: data.organization || null,
        jobTitle: data.jobTitle || null,
        profilePicture: data.profilePicture || null,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      // Return the user without the password
      const user = result[0];
      if (user) {
        const { password, ...userWithoutPassword } = user;
        return {
          success: true,
          user: userWithoutPassword
        };
      }
      
      return {
        success: false,
        error: 'Failed to create user'
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return {
        success: false,
        error: 'Failed to create user'
      };
    }
  }
  
  /**
   * Authenticate a user
   */
  async authenticateUser(username: string, password: string) {
    try {
      // Find the user by username
      const result = await db.select()
        .from(users)
        .where(eq(users.username, username));
      
      if (!result || result.length === 0) {
        return {
          success: false,
          error: 'Invalid username or password'
        };
      }
      
      const user = result[0];
      
      // Verify the password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return {
          success: false,
          error: 'Invalid username or password'
        };
      }
      
      // Return the user without the password
      const { password: _, ...userWithoutPassword } = user;
      return {
        success: true,
        user: userWithoutPassword
      };
    } catch (error) {
      console.error('Error authenticating user:', error);
      return {
        success: false,
        error: 'Authentication failed'
      };
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
      
      if (!result || result.length === 0) {
        return {
          success: false,
          error: 'User not found'
        };
      }
      
      const user = result[0];
      
      // Return the user without the password
      const { password, ...userWithoutPassword } = user;
      return {
        success: true,
        user: userWithoutPassword
      };
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return {
        success: false,
        error: 'Failed to get user'
      };
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
      
      if (!result || result.length === 0) {
        return {
          success: false,
          error: 'User not found'
        };
      }
      
      const user = result[0];
      
      // Return the user without the password
      const { password, ...userWithoutPassword } = user;
      return {
        success: true,
        user: userWithoutPassword
      };
    } catch (error) {
      console.error('Error getting user by email:', error);
      return {
        success: false,
        error: 'Failed to get user'
      };
    }
  }
  
  /**
   * Update a user
   */
  async updateUser(id: number, data: {
    name?: string;
    email?: string;
    organization?: string | null;
    jobTitle?: string | null;
    profilePicture?: string | null;
  }) {
    try {
      // Update the user in the database
      const result = await db.update(users)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(users.id, id))
        .returning();
      
      if (!result || result.length === 0) {
        return {
          success: false,
          error: 'User not found'
        };
      }
      
      const user = result[0];
      
      // Return the user without the password
      const { password, ...userWithoutPassword } = user;
      return {
        success: true,
        user: userWithoutPassword
      };
    } catch (error) {
      console.error('Error updating user:', error);
      return {
        success: false,
        error: 'Failed to update user'
      };
    }
  }
}

export const userManagementService = new UserManagementService();