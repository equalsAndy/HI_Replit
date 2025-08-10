import { db } from "./db.js";
import { eq, and, inArray } from "drizzle-orm";
import * as schema from "../shared/schema.js";
import bcrypt from "bcryptjs";
import connectPg from "connect-pg-simple";
import session from "express-session";
async function getUserRoles(userId) {
    const userRoles = await db
        .select({ role: schema.users.role })
        .from(schema.users)
        .where(eq(schema.users.id, userId));
    return userRoles.map(ur => ur.role);
}
async function setUserRole(userId, role) {
    await db.update(schema.users)
        .set({ role })
        .where(eq(schema.users.id, userId));
}
export class DatabaseStorage {
    sessionStore;
    constructor() {
        const sessionTtl = 7 * 24 * 60 * 60 * 1000;
        const pgStore = connectPg(session);
        this.sessionStore = new pgStore({
            conString: process.env.DATABASE_URL,
            createTableIfMissing: true,
            ttl: sessionTtl,
            tableName: 'sessions'
        });
    }
    async getUser(id) {
        const user = await db.query.users.findFirst({
            where: eq(schema.users.id, id)
        });
        return user;
    }
    async getUserByUsername(username) {
        const user = await db.query.users.findFirst({
            where: eq(schema.users.username, username)
        });
        return user;
    }
    async createUser(userData) {
        if (userData.password) {
            userData.password = await bcrypt.hash(userData.password, 10);
        }
        const dataToInsert = {
            ...userData,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const [user] = await db.insert(schema.users).values(dataToInsert).returning();
        return user;
    }
    async updateUser(id, userData) {
        const existingUser = await this.getUser(id);
        if (!existingUser) {
            return undefined;
        }
        if (userData.password) {
            userData.password = await bcrypt.hash(userData.password, 10);
        }
        userData.updatedAt = new Date();
        const [updatedUser] = await db
            .update(schema.users)
            .set(userData)
            .where(eq(schema.users.id, id))
            .returning();
        return updatedUser;
    }
    async getAllUsers() {
        const users = await db.query.users.findMany();
        return users;
    }
    async authenticateUser(username, password) {
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
    async getUsersByRole(role) {
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
    async assignRole(userId, role) {
        await db.update(schema.users).set({ role }).where(eq(schema.users.id, userId));
    }
    async removeRole(userId, role) {
        await db
            .update(schema.users)
            .set({ role: 'participant' })
            .where(eq(schema.users.id, userId));
    }
    async getUserRoles(userId) {
        const userRoles = await db.query.users.findMany({
            where: eq(schema.users.id, userId)
        });
        return userRoles.map(ur => ur.role || 'participant');
    }
    async createTestUsers() {
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
                if (i === 1) {
                    await this.assignRole(user.id, 'facilitator');
                }
                else {
                    await this.assignRole(user.id, 'participant');
                }
            }
        }
    }
    async getTestUsers() {
        const testUsers = await db.query.users.findMany();
        return testUsers.filter(user => user.username.startsWith('user'));
    }
    async createCohort(cohortData) {
        cohortData.createdAt = new Date();
        cohortData.updatedAt = new Date();
        const [cohort] = await db.insert(schema.cohorts).values(cohortData).returning();
        return cohort;
    }
    async getCohort(id) {
        const cohort = await db.query.cohorts.findFirst({
            where: eq(schema.cohorts.id, id)
        });
        return cohort;
    }
    async updateCohort(id, cohortData) {
        const existingCohort = await this.getCohort(id);
        if (!existingCohort) {
            return undefined;
        }
        cohortData.updatedAt = new Date();
        const [updatedCohort] = await db
            .update(schema.cohorts)
            .set(cohortData)
            .where(eq(schema.cohorts.id, id))
            .returning();
        return updatedCohort;
    }
    async getAllCohorts() {
        const cohorts = await db.query.cohorts.findMany();
        return cohorts;
    }
    async getCohortsByFacilitator(facilitatorId) {
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
    async getCohortParticipants(cohortId) {
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
    async addParticipantToCohort(cohortId, userId) {
        const existingParticipant = await db.query.cohortParticipants.findFirst({
            where: and(eq(schema.cohortParticipants.cohortId, cohortId), eq(schema.cohortParticipants.participantId, userId))
        });
        if (!existingParticipant) {
            await db.insert(schema.cohortParticipants).values({
                cohortId,
                participantId: userId
            });
        }
    }
    async removeParticipantFromCohort(cohortId, userId) {
        await db
            .delete(schema.cohortParticipants)
            .where(and(eq(schema.cohortParticipants.cohortId, cohortId), eq(schema.cohortParticipants.participantId, userId)));
    }
    async getParticipantCohorts(participantId) {
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
    async getStarCard(userId) {
        const starCard = await db.query.starCards.findFirst({
            where: eq(schema.starCards.userId, userId)
        });
        return starCard;
    }
    async createStarCard(starCardData) {
        starCardData.createdAt = new Date();
        starCardData.updatedAt = new Date();
        const [starCard] = await db.insert(schema.starCards).values(starCardData).returning();
        return starCard;
    }
    async updateStarCard(userId, starCardData) {
        const existingStarCard = await this.getStarCard(userId);
        if (!existingStarCard) {
            return undefined;
        }
        starCardData.updatedAt = new Date();
        const [updatedStarCard] = await db
            .update(schema.starCards)
            .set(starCardData)
            .where(eq(schema.starCards.userId, userId))
            .returning();
        return updatedStarCard;
    }
    async getFlowAttributes(userId) {
        const flowAttributes = await db.query.flowAttributes.findFirst({
            where: eq(schema.flowAttributes.userId, userId)
        });
        return flowAttributes;
    }
    async createFlowAttributes(flowAttributesData) {
        flowAttributesData.createdAt = new Date();
        flowAttributesData.updatedAt = new Date();
        const [flowAttributes] = await db.insert(schema.flowAttributes).values(flowAttributesData).returning();
        return flowAttributes;
    }
    async updateFlowAttributes(userId, flowAttributesData) {
        const existingFlowAttributes = await this.getFlowAttributes(userId);
        if (!existingFlowAttributes) {
            return undefined;
        }
        flowAttributesData.updatedAt = new Date();
        const [updatedFlowAttributes] = await db
            .update(schema.flowAttributes)
            .set(flowAttributesData)
            .where(eq(schema.flowAttributes.userId, userId))
            .returning();
        return updatedFlowAttributes;
    }
    async getAllVideos() {
        const videos = await db.query.videos.findMany({
            orderBy: [schema.videos.workshopType, schema.videos.sortOrder]
        });
        return videos;
    }
    async getVideosByWorkshop(workshopType) {
        const videos = await db.query.videos.findMany({
            where: eq(schema.videos.workshopType, workshopType),
            orderBy: [schema.videos.section, schema.videos.sortOrder]
        });
        return videos;
    }
    async getVideo(id) {
        const video = await db.query.videos.findFirst({
            where: eq(schema.videos.id, id)
        });
        return video;
    }
    async createVideo(videoData) {
        const dataWithDates = {
            ...videoData,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const [video] = await db.insert(schema.videos).values(dataWithDates).returning();
        return video;
    }
    async updateVideo(id, videoData) {
        const existingVideo = await this.getVideo(id);
        if (!existingVideo) {
            return undefined;
        }
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
    async deleteVideo(id) {
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
export const storage = new DatabaseStorage();
