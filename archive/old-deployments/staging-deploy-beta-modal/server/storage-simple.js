import { db } from "./db";
import { eq } from "drizzle-orm";
import * as schema from "../shared/schema";
import connectPg from "connect-pg-simple";
import session from "express-session";
export class DatabaseStorage {
    sessionStore;
    constructor() {
        const pgSession = connectPg(session);
        this.sessionStore = new pgSession({
            pool: db.pool || db,
            tableName: 'sessions',
            createTableIfMissing: true
        });
    }
    async getUser(id) {
        const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
        return user || undefined;
    }
    async getUserByUsername(username) {
        const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));
        return user || undefined;
    }
    async createUser(userData) {
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
    async updateUser(id, userData) {
        const [user] = await db
            .update(schema.users)
            .set(userData)
            .where(eq(schema.users.id, id))
            .returning();
        return user || undefined;
    }
    async getAllUsers() {
        const users = await db.select().from(schema.users);
        return users.map(user => ({
            ...user,
            progress: 0,
            hasAssessment: false,
            hasStarCard: false,
            hasFlowAttributes: false
        }));
    }
    async getUsersByRole(role) {
        const users = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.role, role));
        return users;
    }
    async deleteUser(id) {
        await db.delete(schema.users).where(eq(schema.users.id, id));
    }
    async getAllVideos() {
        return await db.select().from(schema.videos);
    }
    async getVideosByWorkshop(workshopType) {
        return await db
            .select()
            .from(schema.videos)
            .where(eq(schema.videos.workshopType, workshopType));
    }
    async createVideo(videoData) {
        const [video] = await db
            .insert(schema.videos)
            .values(videoData)
            .returning();
        return video;
    }
    async updateVideo(id, videoData) {
        const [video] = await db
            .update(schema.videos)
            .set(videoData)
            .where(eq(schema.videos.id, id))
            .returning();
        return video || undefined;
    }
    async deleteVideo(id) {
        await db.delete(schema.videos).where(eq(schema.videos.id, id));
    }
}
export const storage = new DatabaseStorage();
