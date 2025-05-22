// We need to export both the storage interface and the actual storage instance
import { db } from "./db";
import { eq, and, inArray } from "drizzle-orm";
import * as schema from "../shared/schema";
import bcrypt from "bcryptjs";
import connectPg from "connect-pg-simple";
import session from "express-session";
import {
  User, InsertUser, 
  UserRole, 
  StarCard, 
  FlowAttributesRecord
} from "@shared/schema";

// Define the storage interface
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

// Get user roles helper function
async function getUserRoles(userId: number): Promise<UserRole[]> {
  const userRoles = await db.query.userRoles.findMany({
    where: eq(schema.userRoles.userId, userId)
  });
  
  return userRoles.map(ur => ur.role as UserRole);
}

// Set user role helper function
async function setUserRole(userId: number, role: UserRole): Promise<void> {
  // Check if the role already exists for the user
  const existingRole = await db.query.userRoles.findFirst({
    where: and(
      eq(schema.userRoles.userId, userId),
      eq(schema.userRoles.role, role)
    )
  });
  
  // If role doesn't exist, add it
  if (!existingRole) {
    await db.insert(schema.userRoles).values({
      userId,
      role
    });
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  public sessionStore: any;
  
  constructor() {
    const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
    const pgStore = connectPg(session);
    this.sessionStore = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
      ttl: sessionTtl,
      tableName: 'sessions'
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, id)
    });
    
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.username, username)
    });
    
    return user;
  }
  
  async createUser(userData: Partial<User>): Promise<User> {
    // Hash password if provided
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    // Set created and updated dates
    userData.createdAt = new Date();
    userData.updatedAt = new Date();
    
    const [user] = await db.insert(schema.users).values(userData).returning();
    
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    // Check if user exists
    const existingUser = await this.getUser(id);
    
    if (!existingUser) {
      return undefined;
    }
    
    // Hash password if it's being updated
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    // Set updated date
    userData.updatedAt = new Date();
    
    const [updatedUser] = await db
      .update(schema.users)
      .set(userData)
      .where(eq(schema.users.id, id))
      .returning();
    
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    const users = await db.query.users.findMany();
    return users;
  }
  
  // Authentication
  async authenticateUser(username: string, password: string): Promise<User | undefined> {
    const user = await this.getUserByUsername(username);
    
    if (!user) {
      return undefined;
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return undefined;
    }
    
    return user;
  }
  
  // User role operations
  async getUsersByRole(role: UserRole): Promise<User[]> {
    const userRoles = await db.query.userRoles.findMany({
      where: eq(schema.userRoles.role, role)
    });
    
    if (!userRoles.length) {
      return [];
    }
    
    const userIds = userRoles.map(ur => ur.userId);
    
    const users = await db.query.users.findMany({
      where: inArray(schema.users.id, userIds)
    });
    
    return users;
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
    const userRoles = await db.query.userRoles.findMany({
      where: eq(schema.userRoles.userId, userId)
    });
    
    return userRoles.map(ur => ur.role as UserRole);
  }
  
  // Test user operations
  async createTestUsers(): Promise<void> {
    // Admin user
    const adminUser = await this.getUserByUsername('admin');
    
    if (!adminUser) {
      const admin = await this.createUser({
        username: 'admin',
        password: 'admin123',
        name: 'Admin User',
        email: 'admin@example.com',
        title: 'Administrator',
        organization: 'Organization'
      });
      
      await this.assignRole(admin.id, UserRole.Admin);
    }
    
    // Create 5 test users if they don't exist
    for (let i = 1; i <= 5; i++) {
      const username = `user${i}`;
      const existingUser = await this.getUserByUsername(username);
      
      if (!existingUser) {
        const user = await this.createUser({
          username,
          password: 'password',
          name: `Test User ${i}`,
          email: `user${i}@example.com`,
          title: 'Test User',
          organization: 'Test Organization'
        });
        
        // Make user 1 a facilitator
        if (i === 1) {
          await this.assignRole(user.id, UserRole.Facilitator);
        } else {
          await this.assignRole(user.id, UserRole.Participant);
        }
      }
    }
  }
  
  async getTestUsers(): Promise<User[]> {
    // Get users with usernames starting with 'user'
    const testUsers = await db.query.users.findMany();
    return testUsers.filter(user => user.username.startsWith('user'));
  }
  
  // Cohort operations
  async createCohort(cohortData: any): Promise<any> {
    // Set created and updated dates
    cohortData.createdAt = new Date();
    cohortData.updatedAt = new Date();
    
    const [cohort] = await db.insert(schema.cohorts).values(cohortData).returning();
    
    return cohort;
  }
  
  async getCohort(id: number): Promise<any | undefined> {
    const cohort = await db.query.cohorts.findFirst({
      where: eq(schema.cohorts.id, id)
    });
    
    return cohort;
  }
  
  async updateCohort(id: number, cohortData: any): Promise<any | undefined> {
    // Check if cohort exists
    const existingCohort = await this.getCohort(id);
    
    if (!existingCohort) {
      return undefined;
    }
    
    // Set updated date
    cohortData.updatedAt = new Date();
    
    const [updatedCohort] = await db
      .update(schema.cohorts)
      .set(cohortData)
      .where(eq(schema.cohorts.id, id))
      .returning();
    
    return updatedCohort;
  }
  
  async getAllCohorts(): Promise<any[]> {
    const cohorts = await db.query.cohorts.findMany();
    return cohorts;
  }
  
  async getCohortsByFacilitator(facilitatorId: number): Promise<any[]> {
    const cohorts = await db.query.cohorts.findMany({
      where: eq(schema.cohorts.facilitatorId, facilitatorId)
    });
    
    return cohorts;
  }
  
  // Cohort participant operations
  async getCohortParticipants(cohortId: number): Promise<User[]> {
    const cohortParticipants = await db.query.cohortParticipants.findMany({
      where: eq(schema.cohortParticipants.cohortId, cohortId)
    });
    
    if (!cohortParticipants.length) {
      return [];
    }
    
    const participantIds = cohortParticipants.map(cp => cp.participantId);
    
    const users = await db.query.users.findMany({
      where: inArray(schema.users.id, participantIds)
    });
    
    return users;
  }
  
  async addParticipantToCohort(cohortId: number, userId: number): Promise<void> {
    // Check if participant is already in cohort
    const existingParticipant = await db.query.cohortParticipants.findFirst({
      where: and(
        eq(schema.cohortParticipants.cohortId, cohortId),
        eq(schema.cohortParticipants.participantId, userId)
      )
    });
    
    if (!existingParticipant) {
      await db.insert(schema.cohortParticipants).values({
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
    const cohortParticipants = await db.query.cohortParticipants.findMany({
      where: eq(schema.cohortParticipants.participantId, participantId)
    });
    
    if (!cohortParticipants.length) {
      return [];
    }
    
    const cohortIds = cohortParticipants.map(cp => cp.cohortId);
    
    const cohorts = await db.query.cohorts.findMany({
      where: inArray(schema.cohorts.id, cohortIds)
    });
    
    return cohorts;
  }
  
  // Star Card operations
  async getStarCard(userId: number): Promise<StarCard | undefined> {
    const starCard = await db.query.starCards.findFirst({
      where: eq(schema.starCards.userId, userId)
    });
    
    return starCard;
  }
  
  async createStarCard(starCardData: any): Promise<StarCard> {
    // Set created and updated dates
    starCardData.createdAt = new Date();
    starCardData.updatedAt = new Date();
    
    const [starCard] = await db.insert(schema.starCards).values(starCardData).returning();
    
    return starCard;
  }
  
  async updateStarCard(userId: number, starCardData: Partial<StarCard>): Promise<StarCard | undefined> {
    // Check if star card exists
    const existingStarCard = await this.getStarCard(userId);
    
    if (!existingStarCard) {
      return undefined;
    }
    
    // Set updated date
    starCardData.updatedAt = new Date();
    
    const [updatedStarCard] = await db
      .update(schema.starCards)
      .set(starCardData)
      .where(eq(schema.starCards.userId, userId))
      .returning();
    
    return updatedStarCard;
  }
  
  // Flow Attributes operations
  async getFlowAttributes(userId: number): Promise<FlowAttributesRecord | undefined> {
    const flowAttributes = await db.query.flowAttributes.findFirst({
      where: eq(schema.flowAttributes.userId, userId)
    });
    
    return flowAttributes;
  }
  
  async createFlowAttributes(flowAttributesData: any): Promise<FlowAttributesRecord> {
    // Set created and updated dates
    flowAttributesData.createdAt = new Date();
    flowAttributesData.updatedAt = new Date();
    
    const [flowAttributes] = await db.insert(schema.flowAttributes).values(flowAttributesData).returning();
    
    return flowAttributes;
  }
  
  async updateFlowAttributes(userId: number, flowAttributesData: any): Promise<FlowAttributesRecord | undefined> {
    // Check if flow attributes exist
    const existingFlowAttributes = await this.getFlowAttributes(userId);
    
    if (!existingFlowAttributes) {
      return undefined;
    }
    
    // Set updated date
    flowAttributesData.updatedAt = new Date();
    
    const [updatedFlowAttributes] = await db
      .update(schema.flowAttributes)
      .set(flowAttributesData)
      .where(eq(schema.flowAttributes.userId, userId))
      .returning();
    
    return updatedFlowAttributes;
  }
}

// Create and export a single instance of the storage
export const storage = new DatabaseStorage();