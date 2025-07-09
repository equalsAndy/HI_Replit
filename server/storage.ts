// We need to export both the storage interface and the actual storage instance
import { db } from "./db.js";
import { eq, and, inArray } from "drizzle-orm";
import * as schema from "../shared/schema.js";
import bcrypt from "bcryptjs";
import connectPg from "connect-pg-simple";
import session from "express-session";
import {
  User, InsertUser, 
  Video,
  InsertVideo
} from "../shared/schema.js";
// Define UserRole type locally to avoid import issues
type UserRole = 'admin' | 'facilitator' | 'participant';

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
  getUsersByRole(role: string): Promise<User[]>;
  
  // Authentication
  authenticateUser(username: string, password: string): Promise<User | undefined>;
  
  // Test user operations
  createTestUsers(): Promise<void>;
  getTestUsers(): Promise<User[]>;
  
  // User role operations
  assignRole(userId: number, role: string): Promise<void>;
  removeRole(userId: number, role: string): Promise<void>;
  getUserRoles(userId: number): Promise<string[]>;
  
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
  getStarCard(userId: number): Promise<any | undefined>;
  createStarCard(starCard: any): Promise<any>;
  updateStarCard(id: number, starCardData: any): Promise<any | undefined>;
  
  // Flow Attributes operations
  getFlowAttributes(userId: number): Promise<any | undefined>;
  createFlowAttributes(flowAttributes: any): Promise<any>;
  updateFlowAttributes(id: number, flowAttributesData: any): Promise<any | undefined>;
  
  // Video management operations
  getAllVideos(): Promise<Video[]>;
  getVideosByWorkshop(workshopType: string): Promise<Video[]>;
  getVideo(id: number): Promise<Video | undefined>;
  createVideo(videoData: InsertVideo): Promise<Video>;
  updateVideo(id: number, videoData: Partial<Video>): Promise<Video | undefined>;
  deleteVideo(id: number): Promise<boolean>;
}

// Get user roles helper function
async function getUserRoles(userId: number): Promise<UserRole[]> {
  const userRoles = await db
    .select({ role: schema.users.role })
    .from(schema.users)
    .where(eq(schema.users.id, userId));
  
  return userRoles.map(ur => ur.role as UserRole);
}

// Set user role helper function
async function setUserRole(userId: number, role: UserRole): Promise<void> {
  // Update the user's role directly in the users table
  await db.update(schema.users)
    .set({ role })
    .where(eq(schema.users.id, userId));
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
    const dataToInsert = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const [user] = await db.insert(schema.users).values(dataToInsert).returning();
    
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
  async getUsersByRole(role: string): Promise<User[]> {
    const userRoles = await db.query.users.findMany({
      where: eq(schema.users.role, role)
    });
    
    if (!userRoles.length) {
      return [];
    }
    
    const userIds = userRoles.map(ur => ur.id);
    
    const users = await db.query.users.findMany({
      where: inArray(schema.users.id, userIds)
    });
    
    return users;
  }
  
  async assignRole(userId: number, role: string): Promise<void> {
    await db.update(schema.users).set({ role }).where(eq(schema.users.id, userId));
  }
  
  async removeRole(userId: number, role: string): Promise<void> {
    await db
      .delete(schema.users)
      .where(
        and(
          eq(schema.users.id, userId),
          eq(schema.users.role, role)
        )
      );
  }
  
  async getUserRoles(userId: number): Promise<string[]> {
    const userRoles = await db.query.users.findMany({
      where: eq(schema.users.id, userId)
    });
    
    return userRoles.map(ur => ur.role as string);
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
      
      await this.assignRole(admin.id, 'admin');
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
          await this.assignRole(user.id, 'facilitator');
        } else {
          await this.assignRole(user.id, 'participant');
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
    // Get cohorts where this user is a facilitator using the cohortFacilitators relation
    const facilitatorCohorts = await db.query.cohortFacilitators.findMany({
      where: eq(schema.cohortFacilitators.facilitatorId, facilitatorId)
    });
    
    if (!facilitatorCohorts.length) {
      return [];
    }
    
    const cohortIds = facilitatorCohorts.map(fc => fc.cohortId);
    
    const cohorts = await db.query.cohorts.findMany({
      where: inArray(schema.cohorts.id, cohortIds)
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

  // Video management operations
  async getAllVideos(): Promise<Video[]> {
    const videos = await db.query.videos.findMany({
      orderBy: [schema.videos.workshopType, schema.videos.sortOrder]
    });
    return videos;
  }

  async getVideosByWorkshop(workshopType: string): Promise<Video[]> {
    const videos = await db.query.videos.findMany({
      where: eq(schema.videos.workshopType, workshopType),
      orderBy: [schema.videos.section, schema.videos.sortOrder]
    });
    return videos;
  }

  async getVideo(id: number): Promise<Video | undefined> {
    const video = await db.query.videos.findFirst({
      where: eq(schema.videos.id, id)
    });
    return video;
  }

  async createVideo(videoData: InsertVideo): Promise<Video> {
    // Set created and updated dates
    const dataWithDates = {
      ...videoData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const [video] = await db.insert(schema.videos).values(dataWithDates).returning();
    return video;
  }

  async updateVideo(id: number, videoData: Partial<Video>): Promise<Video | undefined> {
    // Check if video exists
    const existingVideo = await this.getVideo(id);
    
    if (!existingVideo) {
      return undefined;
    }
    
    // Set updated date
    const dataWithDate = {
      ...videoData,
      updatedAt: new Date()
    };
    
    const [updatedVideo] = await db
      .update(schema.videos)
      .set(dataWithDate)
      .where(eq(schema.videos.id, id))
      .returning();
    
    return updatedVideo;
  }

  async deleteVideo(id: number): Promise<boolean> {
    const existingVideo = await this.getVideo(id);
    
    if (!existingVideo) {
      return false;
    }
    
    const result = await db
      .delete(schema.videos)
      .where(eq(schema.videos.id, id));
    
    return true;
  }
}

// Create and export a single instance of the storage
export const storage = new DatabaseStorage();