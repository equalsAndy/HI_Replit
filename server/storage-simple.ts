// Simplified storage implementation for current application needs
import { db } from "./db";
import { eq } from "drizzle-orm";
import * as schema from "../shared/schema";
import bcrypt from "bcryptjs";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { User, InsertUser, Video, InsertVideo } from "@shared/schema";

// Define UserRole type locally
type UserRole = 'admin' | 'facilitator' | 'participant';

// Simplified storage interface
export interface IStorage {
  sessionStore: any;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: Partial<User>): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: UserRole): Promise<User[]>;
  deleteUser(id: number): Promise<void>;
  
  // Video operations
  getAllVideos(): Promise<Video[]>;
  getVideosByWorkshop(workshopType: string): Promise<Video[]>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: number, videoData: Partial<Video>): Promise<Video | undefined>;
  deleteVideo(id: number): Promise<void>;
}

// Simple database storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    // Session store setup
    const pgSession = connectPg(session);
    this.sessionStore = new pgSession({
      pool: (db as any).pool || db,
      tableName: 'sessions',
      createTableIfMissing: true
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

  async createUser(userData: Partial<User>): Promise<User> {
    const requiredFields = {
      username: userData.username || '',
      password: userData.password || '',
      name: userData.name || '',
      email: userData.email || '',
      role: userData.role || 'participant',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const [user] = await db
      .insert(schema.users)
      .values({
        ...requiredFields,
        ...userData
      })
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
    const users = await db.select().from(schema.users);
    return users.map(user => ({
      ...user,
      progress: 0,
      hasAssessment: false,
      hasStarCard: false,
      hasFlowAttributes: false
    })) as User[];
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    const users = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.role, role));
    return users as User[];
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(schema.users).where(eq(schema.users.id, id));
  }

  // Video operations
  async getAllVideos(): Promise<Video[]> {
    return await db.select().from(schema.videos) as Video[];
  }

  async getVideosByWorkshop(workshopType: string): Promise<Video[]> {
    return await db
      .select()
      .from(schema.videos)
      .where(eq(schema.videos.workshopType, workshopType)) as Video[];
  }

  async createVideo(videoData: InsertVideo): Promise<Video> {
    const [video] = await db
      .insert(schema.videos)
      .values({
        ...videoData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return video;
  }

  async updateVideo(id: number, videoData: Partial<Video>): Promise<Video | undefined> {
    const [video] = await db
      .update(schema.videos)
      .set({
        ...videoData,
        updatedAt: new Date()
      })
      .where(eq(schema.videos.id, id))
      .returning();
    
    return video || undefined;
  }

  async deleteVideo(id: number): Promise<void> {
    await db.delete(schema.videos).where(eq(schema.videos.id, id));
  }
}

export const storage = new DatabaseStorage();