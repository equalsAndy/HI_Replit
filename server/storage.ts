import { 
  User, InsertUser, 
  Assessment, InsertAssessment,
  Question, InsertQuestion,
  Answer, InsertAnswer,
  StarCard, InsertStarCard,
  AssessmentResult, QuadrantData,
  FlowAttributes, InsertFlowAttributes,
  Visualization, InsertVisualization
} from "@shared/schema";
import { nanoid } from 'nanoid';
import { db } from './db';
import { eq, and, sql } from 'drizzle-orm';
import * as schema from '@shared/schema';
import connectPg from 'connect-pg-simple';
import session from 'express-session';
import { Pool } from '@neondatabase/serverless';
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
  
  // Test user operations
  createTestUsers(): Promise<void>;
  getTestUsers(): Promise<User[]>;
  resetUserData(userId: number): Promise<void>;
  
  // Assessment operations
  getQuestions(): Promise<Question[]>;
  getAssessment(userId: number): Promise<Assessment | undefined>;
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  updateAssessment(id: number, assessmentData: Partial<Assessment>): Promise<Assessment | undefined>;
  deleteAssessment(userId: number): Promise<void>;
  
  // Answer operations
  saveAnswer(answer: InsertAnswer): Promise<Answer>;
  getAnswers(userId: number): Promise<Answer[]>;
  deleteAnswers(userId: number): Promise<void>;
  
  // Star Card operations
  getStarCard(userId: number): Promise<StarCard | undefined>;
  createStarCard(starCard: InsertStarCard): Promise<StarCard>;
  updateStarCard(id: number, starCardData: Partial<StarCard>): Promise<StarCard | undefined>;
  deleteStarCard(userId: number): Promise<void>;
  
  // Flow Attributes operations
  getFlowAttributes(userId: number): Promise<FlowAttributes | undefined>;
  createFlowAttributes(flowAttributes: InsertFlowAttributes): Promise<FlowAttributes>;
  updateFlowAttributes(id: number, flowAttributesData: Partial<FlowAttributes>): Promise<FlowAttributes | undefined>;
  deleteFlowAttributes(userId: number): Promise<void>;
  
  // Visualization operations
  getVisualization(userId: number): Promise<Visualization | undefined>;
  createVisualization(visualization: InsertVisualization): Promise<Visualization>;
  updateVisualization(id: number, visualizationData: Partial<Visualization>): Promise<Visualization | undefined>;
}

// Import statements removed to fix duplicate declarations

export class MemStorage implements IStorage {
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
    await this.deleteVisualization(userId);
  }
}

// Use the database storage implementation
export const storage = new DatabaseStorage();
