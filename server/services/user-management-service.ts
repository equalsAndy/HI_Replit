import { User, NewUser, users } from '@shared/schema';
import { db } from '../db';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

export interface CreateUserParams {
  username: string;
  password: string;
  name: string;
  email: string;
  role: 'admin' | 'facilitator' | 'participant';
  organization?: string;
  jobTitle?: string;
  profilePicture?: string;
}

export class UserManagementService {
  /**
   * Create a new user
   */
  async createUser(userData: CreateUserParams): Promise<User> {
    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Insert the user
    const result = await db.insert(users)
      .values({
        username: userData.username,
        password: hashedPassword,
        name: userData.name,
        email: userData.email,
        role: userData.role as 'admin' | 'facilitator' | 'participant',
        organization: userData.organization || null,
        jobTitle: userData.jobTitle || null,
        profilePicture: userData.profilePicture || null
      })
      .returning();
    
    return result[0];
  }

  /**
   * Get a user by ID
   */
  async getUserById(id: number): Promise<User | null> {
    const result = await db.select()
      .from(users)
      .where(eq(users.id, id));
    
    return result[0] || null;
  }

  /**
   * Get a user by username
   */
  async getUserByUsername(username: string): Promise<User | null> {
    const result = await db.select()
      .from(users)
      .where(eq(users.username, username));
    
    return result[0] || null;
  }

  /**
   * Get a user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    const result = await db.select()
      .from(users)
      .where(eq(users.email, email));
    
    return result[0] || null;
  }

  /**
   * Check if a username is available
   */
  async isUsernameAvailable(username: string): Promise<boolean> {
    const user = await this.getUserByUsername(username);
    return !user;
  }

  /**
   * Check if an email is available
   */
  async isEmailAvailable(email: string): Promise<boolean> {
    const user = await this.getUserByEmail(email);
    return !user;
  }

  /**
   * Validate user credentials
   */
  async validateCredentials(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    
    if (!user) {
      return null;
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    
    return isValid ? user : null;
  }

  /**
   * Update a user's profile
   */
  async updateUser(id: number, userData: Partial<User>): Promise<User | null> {
    // Don't allow updating certain fields
    if (userData.id) delete userData.id;
    if (userData.createdAt) delete userData.createdAt;
    
    // If updating password, hash it
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    // Set the updated timestamp
    userData.updatedAt = new Date();
    
    // Update the user
    const result = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    return result[0] || null;
  }

  /**
   * Get all users
   */
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }
  
  /**
   * Get users by role
   */
  async getUsersByRole(role: 'admin' | 'facilitator' | 'participant'): Promise<User[]> {
    return db.select()
      .from(users)
      .where(eq(users.role, role));
  }

  /**
   * Change a user's role
   */
  async changeUserRole(id: number, newRole: 'admin' | 'facilitator' | 'participant'): Promise<User | null> {
    const result = await db.update(users)
      .set({ 
        role: newRole,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    
    return result[0] || null;
  }

  /**
   * Delete a user
   * Note: This is a hard delete, consider soft deletes for production
   */
  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });
    
    return result.length > 0;
  }
}

// Export a singleton instance
export const userManagementService = new UserManagementService();