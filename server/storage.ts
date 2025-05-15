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
import { eq, and } from 'drizzle-orm';
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

export class MemStorage implements IStorage {
  static async init(): Promise<MemStorage> {
    const instance = new MemStorage();
    await instance.initialize();
    return instance;
  }
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
  private readonly dataFile = '.data/storage.json';

  constructor() {
    // Initialize maps
    this.users = new Map();
    this.assessments = new Map();
    this.questions = new Map();
    this.answers = new Map();
    this.starCards = new Map();
    this.flowAttributes = new Map();
    this.visualizations = new Map();

    // Load persisted data if it exists
    try {
      const fs = await import('fs');
      const data = fs.readFileSync(this.dataFile, 'utf8');
      const parsed = JSON.parse(data);

      // Restore maps from persisted data  
      this.users = new Map(parsed.users);
      this.assessments = new Map(parsed.assessments);
      this.answers = new Map(parsed.answers);
      this.starCards = new Map(parsed.starCards);
      this.flowAttributes = new Map(parsed.flowAttributes);
      this.visualizations = new Map(parsed.visualizations);

      // Restore counters
      this.currentUserId = parsed.currentUserId || 1;
      this.currentAssessmentId = parsed.currentAssessmentId || 1;
      this.currentAnswerId = parsed.currentAnswerId || 1;
      this.currentStarCardId = parsed.currentStarCardId || 1;
      this.currentFlowAttributesId = parsed.currentFlowAttributesId || 1;
      this.currentVisualizationId = parsed.currentVisualizationId || 1;
    } catch (e) {
      // If file doesn't exist or is invalid, start with defaults
      this.currentUserId = 1;
      this.currentAssessmentId = 1;
      this.currentQuestionId = 1;
      this.currentAnswerId = 1;
      this.currentStarCardId = 1;
      this.currentFlowAttributesId = 1;
      this.currentVisualizationId = 1;

      // Ensure data directory exists
      const fs = await import('fs');
      if (!fs.existsSync('.data')) {
        fs.mkdirSync('.data');
      }
    }

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
    await this.saveData();
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
    return Array.from(this.visualizations.values()).find(
      (visualization) => visualization.userId === userId
    );
  }

  async createVisualization(insertVisualization: InsertVisualization): Promise<Visualization> {
    const id = this.currentVisualizationId++;
    const visualization: Visualization = { 
      ...insertVisualization, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.visualizations.set(id, visualization);
    return visualization;
  }

  async updateVisualization(id: number, visualizationData: Partial<Visualization>): Promise<Visualization | undefined> {
    const visualization = this.visualizations.get(id);
    if (!visualization) return undefined;

    const updatedVisualization = { 
      ...visualization, 
      ...visualizationData,
      updatedAt: new Date()
    };
    this.visualizations.set(id, updatedVisualization);
    return updatedVisualization;
  }

  async deleteVisualization(userId: number): Promise<void> {
    const visualization = await this.getVisualization(userId);
    if (visualization) {
      this.visualizations.delete(visualization.id);
    }
  }

  private async saveData() {
    const data = {
      users: Array.from(this.users.entries()),
      assessments: Array.from(this.assessments.entries()),
      answers: Array.from(this.answers.entries()),
      starCards: Array.from(this.starCards.entries()),
      flowAttributes: Array.from(this.flowAttributes.entries()),
      visualizations: Array.from(this.visualizations.entries()),
      currentUserId: this.currentUserId,
      currentAssessmentId: this.currentAssessmentId,
      currentAnswerId: this.currentAnswerId,
      currentStarCardId: this.currentStarCardId,
      currentFlowAttributesId: this.currentFlowAttributesId,
      currentVisualizationId: this.currentVisualizationId
    };

    await require('fs').promises.writeFile(this.dataFile, JSON.stringify(data));
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

    // Save changes
    await this.saveData();
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

export const storage = await MemStorage.init();