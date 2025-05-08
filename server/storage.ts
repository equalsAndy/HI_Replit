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
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, userData: Partial<User>): Promise<User | undefined>;
  upsertUser(userData: { 
    id: string;
    username: string;
    email?: string; 
    firstName?: string;
    lastName?: string;
    bio?: string;
    profileImageUrl?: string;
  }): Promise<User>;
  
  // Assessment operations
  getQuestions(): Promise<Question[]>;
  getAssessment(userId: number): Promise<Assessment | undefined>;
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  updateAssessment(id: number, assessmentData: Partial<Assessment>): Promise<Assessment | undefined>;
  
  // Answer operations
  saveAnswer(answer: InsertAnswer): Promise<Answer>;
  getAnswers(userId: number): Promise<Answer[]>;
  
  // Star Card operations
  getStarCard(userId: number): Promise<StarCard | undefined>;
  createStarCard(starCard: InsertStarCard): Promise<StarCard>;
  updateStarCard(id: number, starCardData: Partial<StarCard>): Promise<StarCard | undefined>;
  
  // Flow Attributes operations
  getFlowAttributes(userId: number): Promise<FlowAttributes | undefined>;
  createFlowAttributes(flowAttributes: InsertFlowAttributes): Promise<FlowAttributes>;
  updateFlowAttributes(id: number, flowAttributesData: Partial<FlowAttributes>): Promise<FlowAttributes | undefined>;
  
  // Visualization operations
  getVisualization(userId: number): Promise<Visualization | undefined>;
  createVisualization(visualization: InsertVisualization): Promise<Visualization>;
  updateVisualization(id: number, visualizationData: Partial<Visualization>): Promise<Visualization | undefined>;
}

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
  }

  async getUser(id: string): Promise<User | undefined> {
    const numId = parseInt(id, 10);
    return this.users.get(numId);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id: id.toString() };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | undefined> {
    const numId = parseInt(id, 10);
    const user = this.users.get(numId);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(numId, updatedUser);
    return updatedUser;
  }
  
  async upsertUser(userData: { 
    id: string;
    username: string;
    email?: string; 
    firstName?: string;
    lastName?: string;
    bio?: string;
    profileImageUrl?: string;
  }): Promise<User> {
    const numId = parseInt(userData.id, 10);
    const existingUser = this.users.get(numId);
    
    if (existingUser) {
      const updatedUser = { 
        ...existingUser,
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        bio: userData.bio,
        profileImageUrl: userData.profileImageUrl,
      };
      this.users.set(numId, updatedUser);
      return updatedUser;
    } else {
      // Create a new user
      const newUser: User = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        bio: userData.bio,
        profileImageUrl: userData.profileImageUrl,
        // Default values for other required fields
        progress: 0
      };
      this.users.set(numId, newUser);
      return newUser;
    }
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

export const storage = new MemStorage();
