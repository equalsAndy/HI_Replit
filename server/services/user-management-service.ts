import { db } from '../db';
import * as schema from '../../shared/schema';
import { eq } from 'drizzle-orm';

interface CreateUserParams {
  username: string;
  email: string;
  password: string;
  firstName: string | null;
  lastName: string | null;
  organization: string | null;
  jobTitle: string | null;
  role: 'admin' | 'facilitator' | 'participant';
  cohortId?: number | null;
}

interface UpdateUserParams {
  firstName?: string | null;
  lastName?: string | null;
  email?: string;
  organization?: string | null;
  jobTitle?: string | null;
  profilePicture?: string | null;
}

class UserManagementService {
  /**
   * Create a new user
   */
  async createUser(params: CreateUserParams) {
    const newUser = await db.insert(schema.users).values({
      username: params.username,
      email: params.email,
      password: params.password,
      firstName: params.firstName,
      lastName: params.lastName,
      organization: params.organization,
      jobTitle: params.jobTitle,
      role: params.role,
      cohortId: params.cohortId || null,
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
      where: (users) => eq(users.id, id),
    });
  }

  /**
   * Get a user by username
   */
  async getUserByUsername(username: string) {
    return await db.query.users.findFirst({
      where: (users) => eq(users.username, username),
    });
  }

  /**
   * Get a user by email
   */
  async getUserByEmail(email: string) {
    return await db.query.users.findFirst({
      where: (users) => eq(users.email, email),
    });
  }

  /**
   * Update a user's profile
   */
  async updateUserProfile(userId: number, params: UpdateUserParams) {
    const updatedUser = await db.update(schema.users)
      .set({
        ...params,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId))
      .returning();

    return updatedUser[0];
  }

  /**
   * Change a user's role
   */
  async changeUserRole(userId: number, newRole: 'admin' | 'facilitator' | 'participant') {
    const updatedUser = await db.update(schema.users)
      .set({
        role: newRole,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId))
      .returning();

    return updatedUser[0];
  }

  /**
   * Delete a user
   */
  async deleteUser(userId: number) {
    await db.delete(schema.users)
      .where(eq(schema.users.id, userId));
  }

  /**
   * Get all users
   */
  async getAllUsers() {
    return await db.query.users.findMany({
      orderBy: (users) => users.createdAt,
    });
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: 'admin' | 'facilitator' | 'participant') {
    return await db.query.users.findMany({
      where: (users) => eq(users.role, role),
      orderBy: (users) => users.createdAt,
    });
  }

  /**
   * Get users by cohort
   */
  async getUsersByCohort(cohortId: number) {
    return await db.query.users.findMany({
      where: (users) => eq(users.cohortId, cohortId),
      orderBy: (users) => users.createdAt,
    });
  }
}

export const userManagementService = new UserManagementService();