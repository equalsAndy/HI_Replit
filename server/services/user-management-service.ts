import { db } from '../db';
import * as schema from '@shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

interface CreateUserParams {
  username: string;
  password: string;
  name: string;
  email: string;
  role: string;
  organization?: string;
  jobTitle?: string;
  profilePicture?: string;
  cohortId?: number;
}

class UserManagementService {
  /**
   * Create a new user
   */
  async createUser(params: CreateUserParams) {
    const { username, password, name, email, role, organization, jobTitle, profilePicture, cohortId } = params;
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create the user
    const user = await db.insert(schema.users).values({
      username,
      password: hashedPassword,
      name,
      email,
      role,
      organization: organization || null,
      jobTitle: jobTitle || null,
      profilePicture: profilePicture || null,
      cohortId: cohortId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    
    return user[0];
  }
  
  /**
   * Check if a username is available
   */
  async isUsernameAvailable(username: string): Promise<boolean> {
    const user = await this.getUserByUsername(username);
    return !user;
  }
  
  /**
   * Get a user by username
   */
  async getUserByUsername(username: string) {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.username, username),
    });
    
    return user;
  }
  
  /**
   * Get a user by email
   */
  async getUserByEmail(email: string) {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });
    
    return user;
  }
  
  /**
   * Get a user by ID
   */
  async getUserById(id: number) {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, id),
    });
    
    return user;
  }
  
  /**
   * Validate user credentials
   */
  async validateCredentials(username: string, password: string) {
    const user = await this.getUserByUsername(username);
    
    if (!user) {
      return null;
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return null;
    }
    
    return user;
  }
  
  /**
   * Update user profile
   */
  async updateUserProfile(userId: number, updates: {
    name?: string;
    email?: string;
    organization?: string;
    jobTitle?: string;
    profilePicture?: string;
  }) {
    const result = await db.update(schema.users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId))
      .returning();
    
    return result[0];
  }
  
  /**
   * Change user password
   */
  async changePassword(userId: number, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const result = await db.update(schema.users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId))
      .returning();
    
    return result[0];
  }
  
  /**
   * Update user role (admin only)
   */
  async updateUserRole(userId: number, newRole: string) {
    const result = await db.update(schema.users)
      .set({
        role: newRole,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId))
      .returning();
    
    return result[0];
  }
  
  /**
   * Get all users (admin only)
   */
  async getAllUsers() {
    const users = await db.query.users.findMany({
      orderBy: (users, { asc }) => [asc(users.name)],
    });
    
    // Don't return password hashes
    return users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }
}

export const userManagementService = new UserManagementService();