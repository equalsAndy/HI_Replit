import { 
  User, InsertUser, 
  UserRole, 
  StarCard, 
  FlowAttributesRecord
} from "@shared/schema";
import { db } from "./db";
import { eq, and, inArray } from "drizzle-orm";
import * as schema from "../shared/schema";
import bcrypt from "bcryptjs";
import connectPg from "connect-pg-simple";
import session from "express-session";

export interface IStorage {
  // For authentication
  sessionStore: any; // session.Store type
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: Partial<User>): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: UserRole): Promise<User[]>;
  
  // Authentication
  authenticateUser(username: string, password: string): Promise<User | undefined>;
  
  // Test user operations
  createTestUsers(): Promise<void>;
  getTestUsers(): Promise<User[]>;
  
  // User role operations
  assignRole(userId: number, role: UserRole): Promise<void>;
  removeRole(userId: number, role: UserRole): Promise<void>;
  getUserRoles(userId: number): Promise<UserRole[]>;
  setUserRole(userId: number, role: UserRole): Promise<void>;
  
  // Star Card operations
  getStarCard(userId: number): Promise<StarCard | undefined>;
  updateStarCard(userId: number, data: Partial<StarCard>): Promise<StarCard | undefined>;
  
  // Flow attributes operations
  getFlowAttributes(userId: number): Promise<FlowAttributesRecord | undefined>;
  updateFlowAttributes(userId: number, data: Partial<FlowAttributesRecord>): Promise<FlowAttributesRecord | undefined>;
  
  // Cohort operations
  createCohort(cohortData: any): Promise<any>;
  getCohort(id: number): Promise<any | undefined>;
  updateCohort(id: number, cohortData: any): Promise<any | undefined>;
  getAllCohorts(): Promise<any[]>;
  getCohortsByFacilitator(facilitatorId: number): Promise<any[]>;
  
  // Cohort participant operations
  addParticipantToCohort(cohortId: number, participantId: number): Promise<void>;
  removeParticipantFromCohort(cohortId: number, participantId: number): Promise<void>;
  getCohortParticipants(cohortId: number): Promise<User[]>;
  getParticipantCohorts(participantId: number): Promise<any[]>;
  
  // Star Card operations
  getStarCard(userId: number): Promise<StarCard | undefined>;
  createStarCard(starCard: any): Promise<StarCard>;
  updateStarCard(id: number, starCardData: Partial<StarCard>): Promise<StarCard | undefined>;
  
  // Flow Attributes operations
  getFlowAttributes(userId: number): Promise<FlowAttributesRecord | undefined>;
  createFlowAttributes(flowAttributes: any): Promise<FlowAttributesRecord>;
  updateFlowAttributes(id: number, flowAttributesData: any): Promise<FlowAttributesRecord | undefined>;
}

// Role management helper functions
async function getUserRoles(userId: number): Promise<UserRole[]> {
  const userRoles = await db
    .select({ role: schema.userRoles.role })
    .from(schema.userRoles)
    .where(eq(schema.userRoles.userId, userId));
  
  return userRoles.map(r => r.role);
}

async function setUserRole(userId: number, role: UserRole): Promise<void> {
  // First delete any existing roles (in case we're changing the role)
  await db.delete(schema.userRoles)
    .where(eq(schema.userRoles.userId, userId));
  
  // Insert the new role
  await db.insert(schema.userRoles)
    .values({ userId, role });
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
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
    
    // Initialize by creating test users
    this.createTestUsers().catch(error => {
      console.error('Error creating test users:', error);
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
      role: roles.length > 0 ? roles[0] : UserRole.Participant // Default to participant
    };
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    // Get user from database
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username));
    
    if (!user) return undefined;
    
    // Get roles directly from database
    const userRoles = await db
      .select({ role: schema.userRoles.role })
      .from(schema.userRoles)
      .where(eq(schema.userRoles.userId, user.id));
    
    console.log(`User ${username} (ID: ${user.id}) has roles:`, userRoles);
    
    // Return user with role
    return {
      ...user,
      role: userRoles.length > 0 ? userRoles[0].role as UserRole : UserRole.Participant
    };
  }
  
  async createUser(userData: Partial<User>): Promise<User> {
    // Hash password if provided
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    // Remove role before inserting (will be added separately)
    const { role, ...userDataWithoutRole } = userData;
    
    // Insert user
    const [user] = await db
      .insert(schema.users)
      .values(userDataWithoutRole)
      .returning();
    
    // Add role if specified
    if (role) {
      await setUserRole(user.id, role);
    }
    
    return { ...user, role: role || UserRole.Participant };
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    // Hash password if provided
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    // Remove role before updating (will be updated separately)
    const { role, ...userDataWithoutRole } = userData;
    
    // Update user
    const [updatedUser] = await db
      .update(schema.users)
      .set({ ...userDataWithoutRole, updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();
    
    if (!updatedUser) return undefined;
    
    // Update role if provided
    if (role) {
      await setUserRole(id, role);
    }
    
    // Get current roles
    const roles = await getUserRoles(id);
    
    return { ...updatedUser, role: roles.length > 0 ? roles[0] : UserRole.Participant };
  }
  
  async getAllUsers(): Promise<User[]> {
    const users = await db
      .select()
      .from(schema.users);
    
    // Get all users' roles
    const userIds = users.map(user => user.id);
    
    if (userIds.length === 0) {
      return [];
    }
    
    const allRoles = await db
      .select()
      .from(schema.userRoles)
      .where(inArray(schema.userRoles.userId, userIds));
    
    // Map roles to users
    return users.map(user => {
      const userRoles = allRoles.filter(r => r.userId === user.id);
      return {
        ...user,
        role: userRoles.length > 0 ? userRoles[0].role : UserRole.Participant // Default to participant
      };
    });
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
    const roleRecords = await db
      .select()
      .from(schema.userRoles)
      .where(eq(schema.userRoles.role, role));
    
    const userIds = roleRecords.map(r => r.userId);
    
    if (userIds.length === 0) {
      return [];
    }
    
    const users = await db
      .select()
      .from(schema.users)
      .where(inArray(schema.users.id, userIds));
    
    // Map roles to users
    return users.map(user => ({
      ...user,
      role
    }));
  }
  
  async assignRole(userId: number, role: UserRole): Promise<void> {
    await setUserRole(userId, role);
  }
  
  async removeRole(userId: number, role: UserRole): Promise<void> {
    await db
      .delete(schema.userRoles)
      .where(
        and(
          eq(schema.userRoles.userId, userId),
          eq(schema.userRoles.role, role)
        )
      );
  }
  
  async getUserRoles(userId: number): Promise<UserRole[]> {
    return getUserRoles(userId);
  }
  
  async setUserRole(userId: number, role: UserRole): Promise<void> {
    // Delete existing roles first
    await db.delete(schema.userRoles)
      .where(eq(schema.userRoles.userId, userId));
      
    // Add the new role
    await db.insert(schema.userRoles)
      .values({ userId, role });
  }
  
  // Test user operations
  async createTestUsers(): Promise<void> {
    try {
      // Create admin user if it doesn't exist
      const adminUsername = 'admin';
      const existingAdmin = await this.getUserByUsername(adminUsername);
      
      if (!existingAdmin) {
        await this.createUser({
          username: adminUsername,
          password: 'admin123', // Will be hashed in createUser
          name: 'Administrator',
          email: 'admin@example.com',
          role: UserRole.Admin
        });
        console.log('Created admin user');
      }
      
      // Create 5 test users if they don't exist
      const testUserCount = 5;
      
      for (let i = 1; i <= testUserCount; i++) {
        const username = `user${i}`;
        const existingUser = await this.getUserByUsername(username);
        
        if (!existingUser) {
          await this.createUser({
            username,
            password: 'password', // Will be hashed in createUser
            name: `Test User ${i}`,
            email: `user${i}@example.com`,
            role: UserRole.Participant
          });
          console.log(`Created test user ${i}`);
        }
      }
    } catch (error) {
      console.error('Error creating test users:', error);
    }
  }
  
  async getTestUsers(): Promise<User[]> {
    const testUsers = await db
      .select()
      .from(schema.users)
      .where(inArray(schema.users.username, ['user1', 'user2', 'user3', 'user4', 'user5', 'admin']));
    
    // Get all roles
    const userIds = testUsers.map(user => user.id);
    
    if (userIds.length === 0) {
      return [];
    }
    
    const allRoles = await db
      .select()
      .from(schema.userRoles)
      .where(inArray(schema.userRoles.userId, userIds));
    
    // Map roles to users
    return testUsers.map(user => {
      const userRoles = allRoles.filter(r => r.userId === user.id);
      return {
        ...user,
        role: userRoles.length > 0 ? userRoles[0].role : UserRole.Participant
      };
    });
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
      .select({ value: db.fn.count() })
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
      .select({ value: db.fn.count() })
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
    
    if (cohorts.length === 0) {
      return [];
    }
    
    // Get all facilitators for these cohorts
    const cohortIds = cohorts.map(cohort => cohort.id);
    
    const facilitators = await db
      .select()
      .from(schema.cohortFacilitators)
      .where(inArray(schema.cohortFacilitators.cohortId, cohortIds));
    
    // Get participant counts for all cohorts
    const participantCounts = await db
      .select({
        cohortId: schema.cohortParticipants.cohortId,
        count: db.fn.count()
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
    
    const cohortIds = cohortFacilitators.map(cf => cf.cohortId);
    
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
        count: db.fn.count()
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
    
    if (participants.length === 0) {
      return [];
    }
    
    // Get user roles
    const userIds = participants.map(p => p.user.id);
    const allRoles = await db
      .select()
      .from(schema.userRoles)
      .where(inArray(schema.userRoles.userId, userIds));
    
    // Map roles to users
    return participants.map(p => {
      const userRoles = allRoles.filter(r => r.userId === p.user.id);
      return {
        ...p.user,
        role: userRoles.length > 0 ? userRoles[0].role : UserRole.Participant
      };
    });
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
    
    const cohortIds = cohortParticipants.map(cp => cp.cohortId);
    
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
        count: db.fn.count()
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
  async getStarCard(userId: number): Promise<StarCard | undefined> {
    const [starCard] = await db
      .select()
      .from(schema.starCards)
      .where(eq(schema.starCards.userId, userId));
    
    return starCard;
  }
  
  async createStarCard(starCardData: any): Promise<StarCard> {
    const [starCard] = await db
      .insert(schema.starCards)
      .values(starCardData)
      .returning();
    
    return starCard;
  }
  
  async updateStarCard(userId: number, starCardData: Partial<StarCard>): Promise<StarCard | undefined> {
    const [updatedStarCard] = await db
      .update(schema.starCards)
      .set({ ...starCardData, updatedAt: new Date() })
      .where(eq(schema.starCards.userId, userId))
      .returning();
    
    return updatedStarCard;
  }
  
  // Flow attributes methods
  async getFlowAttributes(userId: number): Promise<FlowAttributesRecord | undefined> {
    const [flowAttributes] = await db
      .select()
      .from(schema.flowAttributes)
      .where(eq(schema.flowAttributes.userId, userId));
    
    return flowAttributes;
  }
  
  async createFlowAttributes(flowAttributesData: any): Promise<FlowAttributesRecord> {
    const [flowAttributes] = await db
      .insert(schema.flowAttributes)
      .values(flowAttributesData)
      .returning();
    
    return flowAttributes;
  }
  
  async updateFlowAttributes(userId: number, data: Partial<FlowAttributesRecord>): Promise<FlowAttributesRecord | undefined> {
    // Ensure userId isn't being updated
    const { userId: _, id: __, ...updateData } = data as any;
    
    const [updatedFlowAttributes] = await db
      .update(schema.flowAttributes)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(schema.flowAttributes.userId, userId))
      .returning();
    
    return updatedFlowAttributes;
  }
  
  // Star Card operations
  async getStarCard(userId: number): Promise<StarCard | undefined> {
    const [starCard] = await db
      .select()
      .from(schema.starCards)
      .where(eq(schema.starCards.userId, userId));
    
    return starCard;
  }
  
  async updateStarCard(userId: number, data: Partial<StarCard>): Promise<StarCard | undefined> {
    // Ensure userId isn't being updated
    const { userId: _, id: __, ...updateData } = data as any;
    
    const [updatedStarCard] = await db
      .update(schema.starCards)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(schema.starCards.userId, userId))
      .returning();
    
    if (!updatedStarCard) {
      // If there's no existing star card, create a new one
      const [newStarCard] = await db
        .insert(schema.starCards)
        .values({
          userId,
          ...updateData,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      return newStarCard;
    }
    
    return updatedStarCard;
  }
}

// Create and export a singleton instance
export const storage = new DatabaseStorage();