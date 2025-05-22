import { 
  User, InsertUser, 
  UserRole, 
  StarCard, 
  FlowAttributesRecord
} from "@shared/schema";
import { nanoid } from 'nanoid';
import { db } from './db';
import { eq, and, sql, desc, inArray } from 'drizzle-orm';
import * as schema from '@shared/schema';
import connectPg from 'connect-pg-simple';
import session from 'express-session';
import { Pool } from 'pg';
import createMemoryStore from 'memorystore';

export interface IStorage {
  // For authentication
  sessionStore: any; // session.Store type
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: UserRole): Promise<User[]>;
  
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
      ttl: 7 * 24 * 60 * 60 // 1 week
    });

    // Create admin user if it doesn't exist
    this.createAdminUser()
      .then(() => console.log("Admin user created or verified successfully"))
      .catch(err => console.error("Error creating admin user:", err));
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));
      return user;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db.insert(schema.users).values(insertUser).returning();
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    try {
      const [user] = await db
        .update(schema.users)
        .set({ ...userData, updatedAt: new Date() })
        .where(eq(schema.users.id, id))
        .returning();
      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await db.select().from(schema.users);
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    try {
      const usersWithRole = await db.select()
        .from(schema.users)
        .innerJoin(schema.userRoles, eq(schema.users.id, schema.userRoles.userId))
        .where(eq(schema.userRoles.role, role));
      
      return usersWithRole.map(ur => ur.users);
    } catch (error) {
      console.error(`Error getting users by role ${role}:`, error);
      return [];
    }
  }

  // User role operations
  async assignRole(userId: number, role: UserRole): Promise<void> {
    try {
      await db.insert(schema.userRoles)
        .values({ userId, role })
        .onConflictDoNothing({ target: [schema.userRoles.userId, schema.userRoles.role] });
    } catch (error) {
      console.error(`Error assigning role ${role} to user ${userId}:`, error);
      throw error;
    }
  }

  async removeRole(userId: number, role: UserRole): Promise<void> {
    try {
      await db.delete(schema.userRoles)
        .where(and(
          eq(schema.userRoles.userId, userId),
          eq(schema.userRoles.role, role)
        ));
    } catch (error) {
      console.error(`Error removing role ${role} from user ${userId}:`, error);
      throw error;
    }
  }

  async getUserRoles(userId: number): Promise<UserRole[]> {
    try {
      const roles = await db.select({ role: schema.userRoles.role })
        .from(schema.userRoles)
        .where(eq(schema.userRoles.userId, userId));
      
      return roles.map(r => r.role);
    } catch (error) {
      console.error(`Error getting roles for user ${userId}:`, error);
      return [];
    }
  }

  // Cohort operations
  async createCohort(cohortData: any): Promise<any> {
    try {
      const [cohort] = await db.insert(schema.cohorts).values(cohortData).returning();
      
      // If facilitatorId is provided, add it to the facilitators table
      if (cohortData.facilitatorId) {
        await db.insert(schema.cohortFacilitators).values({
          cohortId: cohort.id,
          facilitatorId: cohortData.facilitatorId
        }).onConflictDoNothing();
      }
      
      return cohort;
    } catch (error) {
      console.error('Error creating cohort:', error);
      throw error;
    }
  }

  async getCohort(id: number): Promise<any | undefined> {
    try {
      const [cohort] = await db.select().from(schema.cohorts).where(eq(schema.cohorts.id, id));
      
      if (cohort) {
        // Get facilitators
        const facilitators = await db.select({ facilitatorId: schema.cohortFacilitators.facilitatorId })
          .from(schema.cohortFacilitators)
          .where(eq(schema.cohortFacilitators.cohortId, id));
        
        // Get participant count
        const participantCount = await db.select({ count: sql<number>`count(*)` })
          .from(schema.cohortParticipants)
          .where(eq(schema.cohortParticipants.cohortId, id));
        
        return {
          ...cohort,
          facilitators: facilitators.map(f => f.facilitatorId),
          memberCount: participantCount[0]?.count || 0
        };
      }
      
      return undefined;
    } catch (error) {
      console.error(`Error getting cohort ${id}:`, error);
      return undefined;
    }
  }

  async updateCohort(id: number, cohortData: any): Promise<any | undefined> {
    try {
      const [cohort] = await db
        .update(schema.cohorts)
        .set({ ...cohortData, updatedAt: new Date() })
        .where(eq(schema.cohorts.id, id))
        .returning();
      
      return cohort;
    } catch (error) {
      console.error(`Error updating cohort ${id}:`, error);
      return undefined;
    }
  }

  async getAllCohorts(): Promise<any[]> {
    try {
      const cohorts = await db.select().from(schema.cohorts);
      
      // Enhance cohorts with member counts
      const enhancedCohorts = await Promise.all(cohorts.map(async (cohort) => {
        const participantCount = await db.select({ count: sql<number>`count(*)` })
          .from(schema.cohortParticipants)
          .where(eq(schema.cohortParticipants.cohortId, cohort.id));
        
        return {
          ...cohort,
          memberCount: participantCount[0]?.count || 0
        };
      }));
      
      return enhancedCohorts;
    } catch (error) {
      console.error('Error getting all cohorts:', error);
      return [];
    }
  }

  async getCohortsByFacilitator(facilitatorId: number): Promise<any[]> {
    try {
      const facilitated = await db.select({ cohortId: schema.cohortFacilitators.cohortId })
        .from(schema.cohortFacilitators)
        .where(eq(schema.cohortFacilitators.facilitatorId, facilitatorId));
      
      if (facilitated.length === 0) return [];
      
      const cohortIds = facilitated.map(f => f.cohortId);
      
      const cohorts = await db.select()
        .from(schema.cohorts)
        .where(inArray(schema.cohorts.id, cohortIds));
      
      return cohorts;
    } catch (error) {
      console.error(`Error getting cohorts for facilitator ${facilitatorId}:`, error);
      return [];
    }
  }

  // Cohort participant operations
  async addParticipantToCohort(cohortId: number, participantId: number): Promise<void> {
    try {
      await db.insert(schema.cohortParticipants)
        .values({ cohortId, participantId })
        .onConflictDoNothing();
    } catch (error) {
      console.error(`Error adding participant ${participantId} to cohort ${cohortId}:`, error);
      throw error;
    }
  }

  async removeParticipantFromCohort(cohortId: number, participantId: number): Promise<void> {
    try {
      await db.delete(schema.cohortParticipants)
        .where(and(
          eq(schema.cohortParticipants.cohortId, cohortId),
          eq(schema.cohortParticipants.participantId, participantId)
        ));
    } catch (error) {
      console.error(`Error removing participant ${participantId} from cohort ${cohortId}:`, error);
      throw error;
    }
  }

  async getCohortParticipants(cohortId: number): Promise<User[]> {
    try {
      const participants = await db.select()
        .from(schema.cohortParticipants)
        .innerJoin(schema.users, eq(schema.cohortParticipants.participantId, schema.users.id))
        .where(eq(schema.cohortParticipants.cohortId, cohortId));
      
      return participants.map(p => p.users);
    } catch (error) {
      console.error(`Error getting participants for cohort ${cohortId}:`, error);
      return [];
    }
  }

  async getParticipantCohorts(participantId: number): Promise<any[]> {
    try {
      const userCohorts = await db.select({ cohortId: schema.cohortParticipants.cohortId })
        .from(schema.cohortParticipants)
        .where(eq(schema.cohortParticipants.participantId, participantId));
      
      if (userCohorts.length === 0) return [];
      
      const cohortIds = userCohorts.map(uc => uc.cohortId);
      
      const cohorts = await db.select()
        .from(schema.cohorts)
        .where(inArray(schema.cohorts.id, cohortIds));
      
      return cohorts;
    } catch (error) {
      console.error(`Error getting cohorts for participant ${participantId}:`, error);
      return [];
    }
  }

  // StarCard operations
  async getStarCard(userId: number): Promise<StarCard | undefined> {
    try {
      const [starCard] = await db.select()
        .from(schema.starCards)
        .where(eq(schema.starCards.userId, userId));
      
      return starCard;
    } catch (error) {
      console.error(`Error getting star card for user ${userId}:`, error);
      return undefined;
    }
  }

  async createStarCard(starCardData: any): Promise<StarCard> {
    try {
      const [starCard] = await db.insert(schema.starCards)
        .values(starCardData)
        .returning();
      
      return starCard;
    } catch (error) {
      console.error('Error creating star card:', error);
      throw error;
    }
  }

  async updateStarCard(id: number, starCardData: Partial<StarCard>): Promise<StarCard | undefined> {
    try {
      const [starCard] = await db.update(schema.starCards)
        .set({ ...starCardData, updatedAt: new Date() })
        .where(eq(schema.starCards.id, id))
        .returning();
      
      return starCard;
    } catch (error) {
      console.error(`Error updating star card ${id}:`, error);
      return undefined;
    }
  }

  // Flow attributes operations
  async getFlowAttributes(userId: number): Promise<FlowAttributesRecord | undefined> {
    try {
      const [flowAttributes] = await db.select()
        .from(schema.flowAttributes)
        .where(eq(schema.flowAttributes.userId, userId));
      
      return flowAttributes;
    } catch (error) {
      console.error(`Error getting flow attributes for user ${userId}:`, error);
      return undefined;
    }
  }

  async createFlowAttributes(flowAttributesData: any): Promise<FlowAttributesRecord> {
    try {
      const [flowAttributes] = await db.insert(schema.flowAttributes)
        .values(flowAttributesData)
        .returning();
      
      return flowAttributes;
    } catch (error) {
      console.error('Error creating flow attributes:', error);
      throw error;
    }
  }

  async updateFlowAttributes(id: number, flowAttributesData: any): Promise<FlowAttributesRecord | undefined> {
    try {
      const [flowAttributes] = await db.update(schema.flowAttributes)
        .set({ ...flowAttributesData, updatedAt: new Date() })
        .where(eq(schema.flowAttributes.id, id))
        .returning();
      
      return flowAttributes;
    } catch (error) {
      console.error(`Error updating flow attributes ${id}:`, error);
      return undefined;
    }
  }

  // Test user operations
  async createTestUsers(): Promise<void> {
    try {
      // Create 5 test users if they don't exist
      const testUsers = [
        {
          username: 'user1',
          password: 'password', // In a real app, this would be hashed
          name: 'Test User 1',
          title: 'Software Engineer',
          organization: 'Tech Company',
          progress: 0
        },
        {
          username: 'user2',
          password: 'password',
          name: 'Test User 2',
          title: 'Product Manager',
          organization: 'Innovation Inc',
          progress: 0
        },
        {
          username: 'user3',
          password: 'password',
          name: 'Test User 3',
          title: 'Data Scientist',
          organization: 'Analytics Co',
          progress: 0
        },
        {
          username: 'user4',
          password: 'password',
          name: 'Test User 4',
          title: 'UX Designer',
          organization: 'Design Studio',
          progress: 0
        },
        {
          username: 'user5',
          password: 'password',
          name: 'Test User 5',
          title: 'Marketing Director',
          organization: 'Brand Agency',
          progress: 0
        }
      ];
      
      for (const userData of testUsers) {
        const existingUser = await this.getUserByUsername(userData.username);
        if (!existingUser) {
          const user = await this.createUser(userData);
          await this.assignRole(user.id, UserRole.Participant);
        }
      }
    } catch (error) {
      console.error('Error creating test users:', error);
      throw error;
    }
  }

  async getTestUsers(): Promise<User[]> {
    try {
      return await db.select()
        .from(schema.users)
        .where(sql`${schema.users.username} LIKE 'user%'`);
    } catch (error) {
      console.error('Error getting test users:', error);
      return [];
    }
  }

  // Helper to create admin user on startup
  private async createAdminUser(): Promise<void> {
    try {
      const adminUser = {
        username: 'admin',
        password: 'admin123', // In a real app, this would be hashed
        name: 'Admin User',
        title: 'System Administrator',
        organization: 'AllStarTeams'
      };

      // Check if admin user exists
      const existingAdmin = await this.getUserByUsername(adminUser.username);
      
      if (!existingAdmin) {
        // Create admin user
        const user = await this.createUser(adminUser);
        
        // Assign admin role
        await this.assignRole(user.id, UserRole.Admin);
      }
    } catch (error) {
      console.error('Error creating admin user:', error);
      throw error;
    }
  }
}

// Export DatabaseStorage as the default storage implementation
export const storage = new DatabaseStorage();

// In-memory storage implementation for reference
class MemStorage implements Partial<IStorage> {
  private users: Map<number, User>;
  private assessments: Map<number, Assessment>;
  private questions: Map<number, Question>;
  private answers: Map<number, Answer>;
  private starCards: Map<number, StarCard>;
  private flowAttributes: Map<number, FlowAttributes>;
  private visualizations: Map<number, Visualization>;
  private currentUserId: number;
  private currentAssessmentId: number;
  private currentQuestionId: number;
  private currentAnswerId: number;
  private currentStarCardId: number;
  private currentFlowAttributesId: number;
  private currentVisualizationId: number;
  public sessionStore: any;
  
  constructor() {
    this.users = new Map();
    this.assessments = new Map();
    this.questions = new Map();
    this.answers = new Map();
    this.starCards = new Map();
    this.flowAttributes = new Map();
    this.visualizations = new Map();
    this.currentUserId = 1;
    this.currentAssessmentId = 1;
    this.currentQuestionId = 1;
    this.currentAnswerId = 1;
    this.currentStarCardId = 1;
    this.currentFlowAttributesId = 1;
    this.currentVisualizationId = 1;
    
    // Session store for in-memory storage
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Prune expired entries every 24h
    });
    
    // Initialize with demo questions
    this.initializeQuestions();
    
    // Create test users immediately to ensure they're available
    this.createTestUsers()
      .then(() => console.log("Test users created successfully on startup"))
      .catch(err => console.error("Error creating test users on startup:", err));
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async createTestUsers(): Promise<void> {
    // Create 5 test users with different profiles
    const testUsers = [
      {
        username: 'user1',
        password: 'password', // In a real app, this would be hashed
        name: 'Test User 1',
        title: 'Software Engineer',
        organization: 'Tech Company',
        progress: 0
      },
      {
        username: 'user2',
        password: 'password',
        name: 'Test User 2',
        title: 'Product Manager',
        organization: 'Innovation Inc',
        progress: 0
      },
      {
        username: 'user3',
        password: 'password',
        name: 'Test User 3',
        title: 'Data Scientist',
        organization: 'Analytics Co',
        progress: 0
      },
      {
        username: 'user4',
        password: 'password',
        name: 'Test User 4',
        title: 'UX Designer',
        organization: 'Design Studio',
        progress: 0
      },
      {
        username: 'user5',
        password: 'password',
        name: 'Test User 5',
        title: 'Marketing Director',
        organization: 'Brand Agency',
        progress: 0
      }
    ];
    
    // First, check if these users already exist
    for (const userData of testUsers) {
      const existingUser = await this.getUserByUsername(userData.username);
      if (!existingUser) {
        await this.createUser(userData);
      }
    }
  }
  
  async getTestUsers(): Promise<User[]> {
    // Get all users with usernames beginning with 'user'
    return Array.from(this.users.values()).filter(
      (user) => user.username.startsWith('user')
    );
  }

  async getQuestions(): Promise<Question[]> {
    return Array.from(this.questions.values());
  }

  async getAssessment(userId: number): Promise<Assessment | undefined> {
    return Array.from(this.assessments.values()).find(
      (assessment) => assessment.userId === userId,
    );
  }

  async createAssessment(insertAssessment: InsertAssessment): Promise<Assessment> {
    const id = this.currentAssessmentId++;
    const assessment: Assessment = { ...insertAssessment, id };
    this.assessments.set(id, assessment);
    return assessment;
  }

  async updateAssessment(id: number, assessmentData: Partial<Assessment>): Promise<Assessment | undefined> {
    const assessment = this.assessments.get(id);
    if (!assessment) return undefined;
    
    const updatedAssessment = { ...assessment, ...assessmentData };
    this.assessments.set(id, updatedAssessment);
    return updatedAssessment;
  }
  
  async deleteAssessment(userId: number): Promise<void> {
    const assessment = await this.getAssessment(userId);
    if (assessment) {
      this.assessments.delete(assessment.id);
    }
  }

  async saveAnswer(insertAnswer: InsertAnswer): Promise<Answer> {
    const id = this.currentAnswerId++;
    const answer: Answer = { ...insertAnswer, id };
    this.answers.set(id, answer);
    return answer;
  }

  async getAnswers(userId: number): Promise<Answer[]> {
    return Array.from(this.answers.values()).filter(
      (answer) => answer.userId === userId,
    );
  }
  
  async deleteAnswers(userId: number): Promise<void> {
    // Find all answer ids for the user and delete them
    const userAnswers = await this.getAnswers(userId);
    userAnswers.forEach(answer => {
      this.answers.delete(answer.id);
    });
  }

  async getStarCard(userId: number): Promise<StarCard | undefined> {
    return Array.from(this.starCards.values()).find(
      (starCard) => starCard.userId === userId,
    );
  }

  async createStarCard(insertStarCard: InsertStarCard): Promise<StarCard> {
    const id = this.currentStarCardId++;
    const starCard: StarCard = { ...insertStarCard, id };
    this.starCards.set(id, starCard);
    return starCard;
  }

  async updateStarCard(id: number, starCardData: Partial<StarCard>): Promise<StarCard | undefined> {
    const starCard = this.starCards.get(id);
    if (!starCard) return undefined;
    
    const updatedStarCard = { ...starCard, ...starCardData };
    this.starCards.set(id, updatedStarCard);
    return updatedStarCard;
  }
  
  async deleteStarCard(userId: number): Promise<void> {
    const starCard = await this.getStarCard(userId);
    if (starCard) {
      this.starCards.delete(starCard.id);
    }
  }
  
  async getFlowAttributes(userId: number): Promise<FlowAttributes | undefined> {
    return Array.from(this.flowAttributes.values()).find(
      (flowAttribute) => flowAttribute.userId === userId
    );
  }

  async createFlowAttributes(insertFlowAttributes: InsertFlowAttributes): Promise<FlowAttributes> {
    const id = this.currentFlowAttributesId++;
    const flowAttributes: FlowAttributes = { 
      ...insertFlowAttributes, 
      id, 
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.flowAttributes.set(id, flowAttributes);
    return flowAttributes;
  }

  async updateFlowAttributes(id: number, flowAttributesData: Partial<FlowAttributes>): Promise<FlowAttributes | undefined> {
    const flowAttributes = this.flowAttributes.get(id);
    if (!flowAttributes) return undefined;
    
    const updatedFlowAttributes = { 
      ...flowAttributes, 
      ...flowAttributesData,
      updatedAt: new Date()
    };
    this.flowAttributes.set(id, updatedFlowAttributes);
    return updatedFlowAttributes;
  }
  
  async deleteFlowAttributes(userId: number): Promise<void> {
    const flowAttributes = await this.getFlowAttributes(userId);
    if (flowAttributes) {
      this.flowAttributes.delete(flowAttributes.id);
    }
  }
  
  async getVisualization(userId: number): Promise<Visualization | undefined> {
    try {
      // Always use in-memory storage for now until database is fully set up
      return Array.from(this.visualizations.values()).find(
        (visualization) => visualization.userId === userId
      );
    } catch (error) {
      console.error('Error getting visualization:', error);
      return undefined;
    }
  }

  async createVisualization(insertVisualization: InsertVisualization): Promise<Visualization> {
    try {
      // Always use in-memory storage for now
      const id = this.currentVisualizationId++;
      const visualization: Visualization = { 
        ...insertVisualization, 
        id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.visualizations.set(id, visualization);
      return visualization;
    } catch (error) {
      console.error('Error creating visualization:', error);
      throw error;
    }
  }

  async updateVisualization(id: number, visualizationData: Partial<Visualization>): Promise<Visualization | undefined> {
    try {
      // Always use in-memory storage for now
      const visualization = this.visualizations.get(id);
      if (!visualization) return undefined;
      
      const updatedVisualization = { 
        ...visualization, 
        ...visualizationData,
        updatedAt: new Date()
      };
      this.visualizations.set(id, updatedVisualization);
      return updatedVisualization;
    } catch (error) {
      console.error('Error updating visualization:', error);
      return undefined;
    }
  }
  
  async deleteVisualization(userId: number): Promise<void> {
    const visualization = await this.getVisualization(userId);
    if (visualization) {
      this.visualizations.delete(visualization.id);
    }
  }
  
  async resetUserData(userId: number): Promise<void> {
    // Get the user to keep basic info
    const user = await this.getUser(userId);
    if (!user) return;
    
    // Reset progress to 0
    await this.updateUser(userId, { progress: 0 });
    
    // Delete all user data
    await this.deleteAssessment(userId);
    await this.deleteAnswers(userId);
    await this.deleteStarCard(userId);
    await this.deleteFlowAttributes(userId);
    await this.deleteVisualization(userId);
  }

  private initializeQuestions() {
    const sampleQuestions: InsertQuestion[] = [
      {
        text: "When starting a new project, I prefer to...",
        options: [
          { id: nanoid(), text: "Start working right away and adjust as I go", category: "acting" },
          { id: nanoid(), text: "Get to know my teammates and build good working relationships", category: "feeling" },
          { id: nanoid(), text: "Break down the work into clear steps with deadlines", category: "planning" },
          { id: nanoid(), text: "Consider different approaches before deciding how to proceed", category: "thinking" }
        ],
        category: "work"
      },
      {
        text: "When faced with a challenge, I typically...",
        options: [
          { id: nanoid(), text: "Tackle it head-on and find a quick solution", category: "acting" },
          { id: nanoid(), text: "Talk it through with others to understand their perspectives", category: "feeling" },
          { id: nanoid(), text: "Create a detailed plan to overcome it systematically", category: "planning" },
          { id: nanoid(), text: "Analyze the root cause and consider multiple solutions", category: "thinking" }
        ],
        category: "problem-solving"
      },
      {
        text: "In team discussions, I am most likely to...",
        options: [
          { id: nanoid(), text: "Push for decisions and action steps", category: "acting" },
          { id: nanoid(), text: "Ensure everyone's voices and feelings are considered", category: "feeling" },
          { id: nanoid(), text: "Keep the conversation focused on our goals and timeline", category: "planning" },
          { id: nanoid(), text: "Ask questions and explore implications of different ideas", category: "thinking" }
        ],
        category: "communication"
      },
      // Add more questions to reach 22 total...
      {
        text: "I am most motivated by...",
        options: [
          { id: nanoid(), text: "Seeing tangible results of my work", category: "acting" },
          { id: nanoid(), text: "Creating positive experiences for others", category: "feeling" },
          { id: nanoid(), text: "Achieving milestones and completing goals", category: "planning" },
          { id: nanoid(), text: "Learning new concepts and gaining insights", category: "thinking" }
        ],
        category: "motivation"
      },
      {
        text: "When making decisions, I tend to...",
        options: [
          { id: nanoid(), text: "Go with my gut and decide quickly", category: "acting" },
          { id: nanoid(), text: "Consider how it will affect people involved", category: "feeling" },
          { id: nanoid(), text: "Evaluate options against our objectives", category: "planning" },
          { id: nanoid(), text: "Gather all available information before deciding", category: "thinking" }
        ],
        category: "decision-making"
      }
    ];

    // Only adding 5 sample questions for brevity, but in a real implementation would have all 22
    sampleQuestions.forEach((question) => {
      const id = this.currentQuestionId++;
      const newQuestion: Question = { ...question, id };
      this.questions.set(id, newQuestion);
    });
  }
}

export class DatabaseStorage implements IStorage {
  public sessionStore: any;

  constructor() {
    // Create session store backed by PostgreSQL
    const PgStore = connectPg(session);
    this.sessionStore = new PgStore({
      pool: new Pool({ connectionString: process.env.DATABASE_URL }),
      tableName: 'session'
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(schema.users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(schema.users)
      .set(userData)
      .where(eq(schema.users.id, id))
      .returning();
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(schema.users);
  }

  async createTestUsers(): Promise<void> {
    // Create 5 test users with different profiles
    const testUsers = [
      {
        username: 'user1',
        password: 'password',
        name: 'Test User 1',
        title: 'Software Engineer',
        organization: 'Tech Company',
        progress: 0
      },
      {
        username: 'user2',
        password: 'password',
        name: 'Test User 2',
        title: 'Product Manager',
        organization: 'Innovation Inc',
        progress: 0
      },
      {
        username: 'user3',
        password: 'password',
        name: 'Test User 3',
        title: 'Data Scientist',
        organization: 'Analytics Co',
        progress: 0
      },
      {
        username: 'user4',
        password: 'password',
        name: 'Test User 4',
        title: 'UX Designer',
        organization: 'Design Studio',
        progress: 0
      },
      {
        username: 'user5',
        password: 'password',
        name: 'Test User 5',
        title: 'Marketing Director',
        organization: 'Brand Agency',
        progress: 0
      }
    ];
    
    // First, check if these users already exist
    for (const userData of testUsers) {
      const existingUser = await this.getUserByUsername(userData.username);
      if (!existingUser) {
        await this.createUser(userData);
      }
    }
  }

  async getTestUsers(): Promise<User[]> {
    // Get all test users by querying the database directly
    try {
      const allUsers = await db
        .select()
        .from(schema.users);
      
      // Filter users with names starting with "Test" in JavaScript
      return allUsers.filter(user => 
        user.name && user.name.startsWith('Test')
      );
    } catch (error) {
      console.error("Error in getTestUsers:", error);
      return [];
    }
  }

  async getQuestions(): Promise<Question[]> {
    return await db.select().from(schema.questions);
  }

  async getAssessment(userId: number): Promise<Assessment | undefined> {
    const [assessment] = await db
      .select()
      .from(schema.assessments)
      .where(eq(schema.assessments.userId, userId));
    return assessment || undefined;
  }

  async createAssessment(assessment: InsertAssessment): Promise<Assessment> {
    const [createdAssessment] = await db
      .insert(schema.assessments)
      .values(assessment)
      .returning();
    return createdAssessment;
  }

  async updateAssessment(id: number, assessmentData: Partial<Assessment>): Promise<Assessment | undefined> {
    const [assessment] = await db
      .update(schema.assessments)
      .set(assessmentData)
      .where(eq(schema.assessments.id, id))
      .returning();
    return assessment || undefined;
  }

  async deleteAssessment(userId: number): Promise<void> {
    await db
      .delete(schema.assessments)
      .where(eq(schema.assessments.userId, userId));
  }

  async saveAnswer(answer: InsertAnswer): Promise<Answer> {
    const [savedAnswer] = await db
      .insert(schema.answers)
      .values(answer)
      .returning();
    return savedAnswer;
  }

  async getAnswers(userId: number): Promise<Answer[]> {
    return await db
      .select()
      .from(schema.answers)
      .where(eq(schema.answers.userId, userId));
  }

  async deleteAnswers(userId: number): Promise<void> {
    await db
      .delete(schema.answers)
      .where(eq(schema.answers.userId, userId));
  }

  async getStarCard(userId: number): Promise<StarCard | undefined> {
    const [starCard] = await db
      .select()
      .from(schema.starCards)
      .where(eq(schema.starCards.userId, userId));
    return starCard || undefined;
  }

  async createStarCard(starCard: InsertStarCard): Promise<StarCard> {
    const [createdStarCard] = await db
      .insert(schema.starCards)
      .values(starCard)
      .returning();
    return createdStarCard;
  }

  async updateStarCard(id: number, starCardData: Partial<StarCard>): Promise<StarCard | undefined> {
    const [starCard] = await db
      .update(schema.starCards)
      .set(starCardData)
      .where(eq(schema.starCards.id, id))
      .returning();
    return starCard || undefined;
  }

  async deleteStarCard(userId: number): Promise<void> {
    await db
      .delete(schema.starCards)
      .where(eq(schema.starCards.userId, userId));
  }

  async getFlowAttributes(userId: number): Promise<FlowAttributes | undefined> {
    const [flowAttributes] = await db
      .select()
      .from(schema.flowAttributes)
      .where(eq(schema.flowAttributes.userId, userId));
    return flowAttributes || undefined;
  }

  async createFlowAttributes(flowAttributes: InsertFlowAttributes): Promise<FlowAttributes> {
    // Set current timestamps
    const now = new Date();
    const attributesWithTimestamps = {
      ...flowAttributes,
      createdAt: now,
      updatedAt: now
    };
    
    const [createdFlowAttributes] = await db
      .insert(schema.flowAttributes)
      .values(attributesWithTimestamps)
      .returning();
    return createdFlowAttributes;
  }

  async updateFlowAttributes(id: number, flowAttributesData: Partial<FlowAttributes>): Promise<FlowAttributes | undefined> {
    const updateData = {
      ...flowAttributesData,
      updatedAt: new Date()
    };
    
    const [flowAttributes] = await db
      .update(schema.flowAttributes)
      .set(updateData)
      .where(eq(schema.flowAttributes.id, id))
      .returning();
    return flowAttributes || undefined;
  }

  async deleteFlowAttributes(userId: number): Promise<void> {
    await db
      .delete(schema.flowAttributes)
      .where(eq(schema.flowAttributes.userId, userId));
  }

  async getVisualization(userId: number): Promise<Visualization | undefined> {
    try {
      const [visualization] = await db
        .select()
        .from(schema.visualizations)
        .where(eq(schema.visualizations.userId, userId));
      return visualization || undefined;
    } catch (error) {
      console.error('Error getting visualization from database:', error);
      return undefined;
    }
  }

  async createVisualization(visualization: InsertVisualization): Promise<Visualization> {
    try {
      // Set current timestamps
      const now = new Date();
      const visualizationWithTimestamps = {
        ...visualization,
        createdAt: now,
        updatedAt: now
      };
      
      const [createdVisualization] = await db
        .insert(schema.visualizations)
        .values(visualizationWithTimestamps)
        .returning();
      return createdVisualization;
    } catch (error) {
      console.error('Error creating visualization in database:', error);
      throw error;
    }
  }

  async updateVisualization(id: number, visualizationData: Partial<Visualization>): Promise<Visualization | undefined> {
    try {
      const updateData = {
        ...visualizationData,
        updatedAt: new Date()
      };
      
      const [visualization] = await db
        .update(schema.visualizations)
        .set(updateData)
        .where(eq(schema.visualizations.id, id))
        .returning();
      return visualization || undefined;
    } catch (error) {
      console.error('Error updating visualization in database:', error);
      return undefined;
    }
  }

  async resetUserData(userId: number): Promise<void> {
    // Reset progress to 0
    await this.updateUser(userId, { progress: 0 });
    
    // Delete all user data
    await this.deleteAssessment(userId);
    await this.deleteAnswers(userId);
    await this.deleteStarCard(userId);
    await this.deleteFlowAttributes(userId);
    // Note: Visualization delete functionality is not implemented yet
    // await this.deleteVisualization(userId);
  }
}

// Use the database storage implementation
export const storage = new DatabaseStorage();
