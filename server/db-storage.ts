import { eq, and, inArray, count } from "drizzle-orm";
import { db } from "./db.js";
import * as schema from "../shared/schema.js";
import { User, UserRole, StarCard, FlowAttributesResponse } from "../shared/types.js";
import { Cohort } from "../shared/schema.js";
import bcrypt from "bcryptjs";
import connectPg from "connect-pg-simple";
import session from "express-session";

// Role management helper functions
async function getUserRoles(userId: number): Promise<UserRole[]> {
  const userRoles = await db
    .select({ role: schema.users.role })
    .from(schema.users)
    .where(eq(schema.users.id, userId));
  
  return userRoles.map(r => r.role as UserRole);
}

async function setUserRole(userId: number, role: UserRole): Promise<void> {
  // Update the user's role directly in the users table
  await db.update(schema.users)
    .set({ role })
    .where(eq(schema.users.id, userId));
}

// Database Storage class implementation
export class DatabaseStorage {
  public sessionStore: any;

  constructor() {
    // Create PostgreSQL session store
    const pgStore = connectPg(session);
    this.sessionStore = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
      tableName: 'sessions',
      ttl: 7 * 24 * 60 * 60 * 1000 // 1 week
    });
  }
  
  // User management methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id));
    
    if (!user) return undefined;
    
    // Get user roles
    const roles = await getUserRoles(id);
    
    return {
      ...user,
      role: (roles.length > 0 ? roles[0] : 'participant') as UserRole
    } as User;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username));
    
    if (!user) return undefined;
    
    // Get user roles
    const roles = await getUserRoles(user.id);
    
    return {
      ...user,
      role: (roles.length > 0 ? roles[0] : 'participant') as UserRole
    } as User;
  }
  
  async createUser(userData: Partial<User>): Promise<User> {
    // Hash password if provided
    let hashedPassword = undefined;
    if (userData.password) {
      hashedPassword = await bcrypt.hash(userData.password, 10);
    }
    
    // Insert user with role directly
    const [user] = await db
      .insert(schema.users)
      .values({
        ...userData,
        password: hashedPassword,
        role: userData.role || 'participant'
      })
      .returning();
    
    return { ...user, role: user.role as UserRole || 'participant' } as User;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    // Hash password if provided
    let hashedPassword = undefined;
    if (userData.password) {
      hashedPassword = await bcrypt.hash(userData.password, 10);
    }
    
    // Update user with role directly
    const [updatedUser] = await db
      .update(schema.users)
      .set({ 
        ...userData, 
        password: hashedPassword || userData.password,
        updatedAt: new Date() 
      })
      .where(eq(schema.users.id, id))
      .returning();
    
    if (!updatedUser) return undefined;
    
    return { ...updatedUser, role: updatedUser.role as UserRole || 'participant' } as User;
  }
  
  async getAllUsers(): Promise<User[]> {
    const users = await db
      .select()
      .from(schema.users);
    
    // Map users with their roles directly from the user record
    return users.map(user => ({
      ...user,
      role: user.role as UserRole || 'participant' // Default to participant
    })) as User[];
  }

  // Authentication method
  async authenticateUser(username: string, password: string): Promise<User | undefined> {
    const user = await this.getUserByUsername(username);
    
    if (!user) return undefined;
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) return undefined;
    
    return user;
  }
  
  // Role management methods
  async getUsersByRole(role: UserRole): Promise<User[]> {
    const users = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.role, role));
    
    // Map users with their roles 
    return users.map(user => ({
      ...user,
      role: user.role as UserRole
    })) as User[];
  }
  
  async assignRole(userId: number, role: UserRole): Promise<void> {
    await setUserRole(userId, role);
  }
  
  async removeRole(userId: number, role: UserRole): Promise<void> {
    // Reset user role to participant when removing a role
    await db
      .update(schema.users)
      .set({ role: 'participant' })
      .where(eq(schema.users.id, userId));
  }
  
  async getUserRoles(userId: number): Promise<UserRole[]> {
    return getUserRoles(userId);
  }
  
  // Test user operations
  async createTestUsers(): Promise<void> {
    // Create admin user if it doesn't exist
    const adminUsername = 'admin';
    const existingAdmin = await this.getUserByUsername(adminUsername);
    
    if (!existingAdmin) {
      await this.createUser({
        username: adminUsername,
        password: await bcrypt.hash('admin123', 10),
        name: 'Administrator',
        email: 'admin@example.com',
        role: 'admin'
      });
    }
    
    // Create 5 test users if they don't exist
    const testUserCount = 5;
    const hashedPassword = await bcrypt.hash('password', 10);
    
    for (let i = 1; i <= testUserCount; i++) {
      const username = `user${i}`;
      const existingUser = await this.getUserByUsername(username);
      
      if (!existingUser) {
        await this.createUser({
          username,
          password: hashedPassword,
          name: `Test User ${i}`,
          email: `user${i}@example.com`,
          role: 'participant'
        });
      }
    }
  }
  
  async getTestUsers(): Promise<User[]> {
    const testUsers = await db
      .select()
      .from(schema.users)
      .where(inArray(schema.users.username, ['user1', 'user2', 'user3', 'user4', 'user5', 'admin']));
    
    // Map users with their roles directly from the user record
    return testUsers.map(user => ({
      ...user,
      role: user.role as UserRole || 'participant'
    })) as User[];
  }
  
  // Cohort operations
  async createCohort(cohortData: any): Promise<any> {
    // Extract facilitatorId and memberCount, which are not part of the cohort table
    const { facilitatorId, memberCount, ...cohortTableData } = cohortData;
    
    // Insert cohort
    const [cohort] = await db
      .insert(schema.cohorts)
      .values(cohortTableData)
      .returning();
    
    // Add facilitator if provided
    if (facilitatorId) {
      await db
        .insert(schema.cohortFacilitators)
        .values({
          cohortId: cohort.id,
          facilitatorId
        });
    }
    
    return {
      ...cohort,
      facilitatorId,
      memberCount: 0
    };
  }
  
  async getCohort(id: number): Promise<any | undefined> {
    const [cohort] = await db
      .select()
      .from(schema.cohorts)
      .where(eq(schema.cohorts.id, id));
    
    if (!cohort) return undefined;
    
    // Get facilitators
    const facilitators = await db
      .select({
        facilitatorId: schema.cohortFacilitators.facilitatorId
      })
      .from(schema.cohortFacilitators)
      .where(eq(schema.cohortFacilitators.cohortId, id));
    
    // Get participant count
    const participantCount = await db
      .select({ value: count() })
      .from(schema.cohortParticipants)
      .where(eq(schema.cohortParticipants.cohortId, id));
    
    return {
      ...cohort,
      facilitatorId: facilitators.length > 0 ? facilitators[0].facilitatorId : undefined,
      memberCount: Number(participantCount[0]?.value) || 0
    };
  }
  
  async updateCohort(id: number, cohortData: any): Promise<any | undefined> {
    // Extract facilitatorId and memberCount, which are not part of the cohort table
    const { facilitatorId, memberCount, ...cohortTableData } = cohortData;
    
    // Update cohort
    const [updatedCohort] = await db
      .update(schema.cohorts)
      .set({ ...cohortTableData, updatedAt: new Date() })
      .where(eq(schema.cohorts.id, id))
      .returning();
    
    if (!updatedCohort) return undefined;
    
    // Update facilitator if provided
    if (facilitatorId !== undefined) {
      // First remove existing facilitators
      await db
        .delete(schema.cohortFacilitators)
        .where(eq(schema.cohortFacilitators.cohortId, id));
      
      // Then add new facilitator if specified
      if (facilitatorId) {
        await db
          .insert(schema.cohortFacilitators)
          .values({
            cohortId: id,
            facilitatorId
          });
      }
    }
    
    // Get participant count
    const participantCount = await db
      .select({ value: count() })
      .from(schema.cohortParticipants)
      .where(eq(schema.cohortParticipants.cohortId, id));
    
    return {
      ...updatedCohort,
      facilitatorId,
      memberCount: Number(participantCount[0]?.value) || 0
    };
  }
  
  async getAllCohorts(): Promise<any[]> {
    const cohorts = await db
      .select()
      .from(schema.cohorts);
    
    // Get all facilitators for these cohorts
    const cohortIds = cohorts.map(cohort => cohort.id).filter(id => id !== null);
    
    if (cohortIds.length === 0) {
      return cohorts.map(cohort => ({
        ...cohort,
        facilitatorId: undefined,
        memberCount: 0
      }));
    }
    
    const facilitators = await db
      .select()
      .from(schema.cohortFacilitators)
      .where(inArray(schema.cohortFacilitators.cohortId, cohortIds));
    
    // Get participant counts for all cohorts
    const participantCounts = await db
      .select({
        cohortId: schema.cohortParticipants.cohortId,
        count: count()
      })
      .from(schema.cohortParticipants)
      .where(inArray(schema.cohortParticipants.cohortId, cohortIds))
      .groupBy(schema.cohortParticipants.cohortId);
    
    // Map data to cohorts
    return cohorts.map(cohort => {
      const cohortFacilitators = facilitators.filter(f => f.cohortId === cohort.id);
      const participantCountRecord = participantCounts.find(pc => pc.cohortId === cohort.id);
      
      return {
        ...cohort,
        facilitatorId: cohortFacilitators.length > 0 ? cohortFacilitators[0].facilitatorId : undefined,
        memberCount: participantCountRecord ? Number(participantCountRecord.count) : 0
      };
    });
  }
  
  async getCohortsByFacilitator(facilitatorId: number): Promise<any[]> {
    const cohortFacilitators = await db
      .select({
        cohortId: schema.cohortFacilitators.cohortId
      })
      .from(schema.cohortFacilitators)
      .where(eq(schema.cohortFacilitators.facilitatorId, facilitatorId));
    
    const cohortIds = cohortFacilitators.map(cf => cf.cohortId).filter(id => id !== null);
    
    if (cohortIds.length === 0) {
      return [];
    }
    
    const cohorts = await db
      .select()
      .from(schema.cohorts)
      .where(inArray(schema.cohorts.id, cohortIds));
    
    // Get participant counts for all cohorts
    const participantCounts = await db
      .select({
        cohortId: schema.cohortParticipants.cohortId,
        count: count()
      })
      .from(schema.cohortParticipants)
      .where(inArray(schema.cohortParticipants.cohortId, cohortIds))
      .groupBy(schema.cohortParticipants.cohortId);
    
    // Map data to cohorts
    return cohorts.map(cohort => {
      const participantCountRecord = participantCounts.find(pc => pc.cohortId === cohort.id);
      
      return {
        ...cohort,
        facilitatorId: facilitatorId,
        memberCount: participantCountRecord ? Number(participantCountRecord.count) : 0
      };
    });
  }
  
  // Participant management methods
  async getCohortParticipants(cohortId: number): Promise<User[]> {
    const participants = await db
      .select({
        user: schema.users
      })
      .from(schema.cohortParticipants)
      .innerJoin(
        schema.users,
        eq(schema.cohortParticipants.participantId, schema.users.id)
      )
      .where(eq(schema.cohortParticipants.cohortId, cohortId));
    
    // Map users with their roles directly from the user record
    return participants.map(p => ({
      ...p.user,
      role: p.user.role as UserRole || 'participant'
    }));
  }
  
  async addParticipantToCohort(cohortId: number, userId: number): Promise<void> {
    // Check if already a participant
    const existing = await db
      .select()
      .from(schema.cohortParticipants)
      .where(
        and(
          eq(schema.cohortParticipants.cohortId, cohortId),
          eq(schema.cohortParticipants.participantId, userId)
        )
      );
    
    // Only add if not already a participant
    if (existing.length === 0) {
      await db
        .insert(schema.cohortParticipants)
        .values({
          cohortId,
          participantId: userId
        });
    }
  }
  
  async removeParticipantFromCohort(cohortId: number, userId: number): Promise<void> {
    await db
      .delete(schema.cohortParticipants)
      .where(
        and(
          eq(schema.cohortParticipants.cohortId, cohortId),
          eq(schema.cohortParticipants.participantId, userId)
        )
      );
  }
  
  async getParticipantCohorts(participantId: number): Promise<any[]> {
    const cohortParticipants = await db
      .select({
        cohortId: schema.cohortParticipants.cohortId
      })
      .from(schema.cohortParticipants)
      .where(eq(schema.cohortParticipants.participantId, participantId));
    
    const cohortIds = cohortParticipants.map(cp => cp.cohortId).filter(id => id !== null);
    
    if (cohortIds.length === 0) {
      return [];
    }
    
    const cohorts = await db
      .select()
      .from(schema.cohorts)
      .where(inArray(schema.cohorts.id, cohortIds));
    
    // Get facilitators for these cohorts
    const facilitators = await db
      .select()
      .from(schema.cohortFacilitators)
      .where(inArray(schema.cohortFacilitators.cohortId, cohortIds));
    
    // Get participant counts for all cohorts
    const participantCounts = await db
      .select({
        cohortId: schema.cohortParticipants.cohortId,
        count: count()
      })
      .from(schema.cohortParticipants)
      .where(inArray(schema.cohortParticipants.cohortId, cohortIds))
      .groupBy(schema.cohortParticipants.cohortId);
    
    // Map data to cohorts
    return cohorts.map(cohort => {
      const cohortFacilitators = facilitators.filter(f => f.cohortId === cohort.id);
      const participantCountRecord = participantCounts.find(pc => pc.cohortId === cohort.id);
      
      return {
        ...cohort,
        facilitatorId: cohortFacilitators.length > 0 ? cohortFacilitators[0].facilitatorId : undefined,
        memberCount: participantCountRecord ? Number(participantCountRecord.count) : 0
      };
    });
  }
  
  // Star Card methods
  async getStarCard(userId: number): Promise<schema.StarCard | undefined> {
    const [starCard] = await db
      .select()
      .from(schema.starCards)
      .where(eq(schema.starCards.userId, userId));
    
    return starCard;
  }
  
  async createStarCard(starCardData: any): Promise<schema.StarCard> {
    const [starCard] = await db
      .insert(schema.starCards)
      .values(starCardData)
      .returning();
    
    return starCard;
  }
  
  async updateStarCard(userId: number, starCardData: Partial<schema.StarCard>): Promise<schema.StarCard | undefined> {
    const [updatedStarCard] = await db
      .update(schema.starCards)
      .set({ ...starCardData, updatedAt: new Date() })
      .where(eq(schema.starCards.userId, userId))
      .returning();
    
    return updatedStarCard;
  }
  
  // Flow attributes methods
  async getFlowAttributes(userId: number): Promise<schema.FlowAttributesRecord | undefined> {
    const [flowAttributes] = await db
      .select()
      .from(schema.flowAttributes)
      .where(eq(schema.flowAttributes.userId, userId));
    
    return flowAttributes;
  }
  
  async createFlowAttributes(flowAttributesData: any): Promise<schema.FlowAttributesRecord> {
    const [flowAttributes] = await db
      .insert(schema.flowAttributes)
      .values(flowAttributesData)
      .returning();
    
    return flowAttributes;
  }
  
  async updateFlowAttributes(userId: number, attributes: any[]): Promise<schema.FlowAttributesRecord | undefined> {
    const [updatedFlowAttributes] = await db
      .update(schema.flowAttributes)
      .set({ attributes, updatedAt: new Date() })
      .where(eq(schema.flowAttributes.userId, userId))
      .returning();
    
    return updatedFlowAttributes;
  }
}

// Create and export a singleton instance
export const dbStorage = new DatabaseStorage();