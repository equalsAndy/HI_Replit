import { eq, and, inArray, count } from "drizzle-orm";
import './types.js';
import { db } from "./db.js";
import * as schema from "../shared/schema.js";
import bcrypt from "bcryptjs";
import connectPg from "connect-pg-simple";
import session from "express-session";
async function getUserRoles(userId) {
    const userRoles = await db
        .select({ role: schema.users.role })
        .from(schema.users)
        .where(eq(schema.users.id, userId));
    return userRoles.map(r => r.role);
}
async function setUserRole(userId, role) {
    await db.update(schema.users)
        .set({ role })
        .where(eq(schema.users.id, userId));
}
export class DatabaseStorage {
    sessionStore;
    constructor() {
        const PgSession = connectPg(session);
        this.sessionStore = new PgSession({
            conString: process.env.DATABASE_URL,
            createTableIfMissing: true,
            tableName: 'sessions',
            ttl: 7 * 24 * 60 * 60 * 1000
        });
    }
    async getUser(id) {
        const [user] = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.id, id));
        if (!user)
            return undefined;
        const roles = await getUserRoles(id);
        return {
            ...user,
            role: (roles.length > 0 ? roles[0] : 'participant')
        };
    }
    async getUserByUsername(username) {
        const [user] = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.username, username));
        if (!user)
            return undefined;
        const roles = await getUserRoles(user.id);
        return {
            ...user,
            role: (roles.length > 0 ? roles[0] : 'participant')
        };
    }
    async createUser(userData) {
        let hashedPassword = undefined;
        if (userData.password) {
            hashedPassword = await bcrypt.hash(userData.password, 10);
        }
        const [user] = await db
            .insert(schema.users)
            .values({
            ...userData,
            password: hashedPassword,
            role: userData.role || 'participant'
        })
            .returning();
        return { ...user, role: user.role || 'participant' };
    }
    async updateUser(id, userData) {
        let hashedPassword = undefined;
        if (userData.password) {
            hashedPassword = await bcrypt.hash(userData.password, 10);
        }
        const [updatedUser] = await db
            .update(schema.users)
            .set({
            ...userData,
            password: hashedPassword || userData.password,
            updatedAt: new Date()
        })
            .where(eq(schema.users.id, id))
            .returning();
        if (!updatedUser)
            return undefined;
        return { ...updatedUser, role: updatedUser.role || 'participant' };
    }
    async getAllUsers() {
        const users = await db
            .select()
            .from(schema.users);
        return users.map(user => ({
            ...user,
            role: user.role || 'participant'
        }));
    }
    async authenticateUser(username, password) {
        const user = await this.getUserByUsername(username);
        if (!user)
            return undefined;
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch)
            return undefined;
        return user;
    }
    async getUsersByRole(role) {
        const users = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.role, role));
        return users.map(user => ({
            ...user,
            role: user.role
        }));
    }
    async assignRole(userId, role) {
        await setUserRole(userId, role);
    }
    async removeRole(userId, role) {
        await db
            .update(schema.users)
            .set({ role: 'participant' })
            .where(eq(schema.users.id, userId));
    }
    async getUserRoles(userId) {
        return getUserRoles(userId);
    }
    async createTestUsers() {
        const adminUsername = 'admin';
        const existingAdmin = await this.getUserByUsername(adminUsername);
        if (!existingAdmin) {
            await this.createUser({
                username: adminUsername,
                password: await bcrypt.hash('admin123', 10),
                name: 'Administrator',
                email: 'admin@example.com',
                role: 'admin'
            });
        }
        const testUserCount = 5;
        const hashedPassword = await bcrypt.hash('password', 10);
        for (let i = 1; i <= testUserCount; i++) {
            const username = `user${i}`;
            const existingUser = await this.getUserByUsername(username);
            if (!existingUser) {
                await this.createUser({
                    username,
                    password: hashedPassword,
                    name: `Test User ${i}`,
                    email: `user${i}@example.com`,
                    role: 'participant'
                });
            }
        }
    }
    async getTestUsers() {
        const testUsers = await db
            .select()
            .from(schema.users)
            .where(inArray(schema.users.username, ['user1', 'user2', 'user3', 'user4', 'user5', 'admin']));
        return testUsers.map(user => ({
            ...user,
            role: user.role || 'participant'
        }));
    }
    async createCohort(cohortData) {
        const { facilitatorId, memberCount, ...cohortTableData } = cohortData;
        const [cohort] = await db
            .insert(schema.cohorts)
            .values(cohortTableData)
            .returning();
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
    async getCohort(id) {
        const [cohort] = await db
            .select()
            .from(schema.cohorts)
            .where(eq(schema.cohorts.id, id));
        if (!cohort)
            return undefined;
        const facilitators = await db
            .select({
            facilitatorId: schema.cohortFacilitators.facilitatorId
        })
            .from(schema.cohortFacilitators)
            .where(eq(schema.cohortFacilitators.cohortId, id));
        const participantCount = await db
            .select({ value: count() })
            .from(schema.cohortParticipants)
            .where(eq(schema.cohortParticipants.cohortId, id));
        return {
            ...cohort,
            facilitatorId: facilitators.length > 0 ? facilitators[0].facilitatorId : undefined,
            memberCount: Number(participantCount[0]?.value) || 0
        };
    }
    async updateCohort(id, cohortData) {
        const { facilitatorId, memberCount, ...cohortTableData } = cohortData;
        const [updatedCohort] = await db
            .update(schema.cohorts)
            .set({ ...cohortTableData, updatedAt: new Date() })
            .where(eq(schema.cohorts.id, id))
            .returning();
        if (!updatedCohort)
            return undefined;
        if (facilitatorId !== undefined) {
            await db
                .delete(schema.cohortFacilitators)
                .where(eq(schema.cohortFacilitators.cohortId, id));
            if (facilitatorId) {
                await db
                    .insert(schema.cohortFacilitators)
                    .values({
                    cohortId: id,
                    facilitatorId
                });
            }
        }
        const participantCount = await db
            .select({ value: count() })
            .from(schema.cohortParticipants)
            .where(eq(schema.cohortParticipants.cohortId, id));
        return {
            ...updatedCohort,
            facilitatorId,
            memberCount: Number(participantCount[0]?.value) || 0
        };
    }
    async getAllCohorts() {
        const cohorts = await db
            .select()
            .from(schema.cohorts);
        const cohortIds = cohorts.map(cohort => cohort.id).filter(id => id !== null);
        if (cohortIds.length === 0) {
            return cohorts.map(cohort => ({
                ...cohort,
                facilitatorId: undefined,
                memberCount: 0
            }));
        }
        const facilitators = await db
            .select()
            .from(schema.cohortFacilitators)
            .where(inArray(schema.cohortFacilitators.cohortId, cohortIds));
        const participantCounts = await db
            .select({
            cohortId: schema.cohortParticipants.cohortId,
            count: count()
        })
            .from(schema.cohortParticipants)
            .where(inArray(schema.cohortParticipants.cohortId, cohortIds))
            .groupBy(schema.cohortParticipants.cohortId);
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
    async getCohortsByFacilitator(facilitatorId) {
        const cohortFacilitators = await db
            .select({
            cohortId: schema.cohortFacilitators.cohortId
        })
            .from(schema.cohortFacilitators)
            .where(eq(schema.cohortFacilitators.facilitatorId, facilitatorId));
        const cohortIds = cohortFacilitators.map(cf => cf.cohortId).filter(id => id !== null);
        if (cohortIds.length === 0) {
            return [];
        }
        const cohorts = await db
            .select()
            .from(schema.cohorts)
            .where(inArray(schema.cohorts.id, cohortIds));
        const participantCounts = await db
            .select({
            cohortId: schema.cohortParticipants.cohortId,
            count: count()
        })
            .from(schema.cohortParticipants)
            .where(inArray(schema.cohortParticipants.cohortId, cohortIds))
            .groupBy(schema.cohortParticipants.cohortId);
        return cohorts.map(cohort => {
            const participantCountRecord = participantCounts.find(pc => pc.cohortId === cohort.id);
            return {
                ...cohort,
                facilitatorId: facilitatorId,
                memberCount: participantCountRecord ? Number(participantCountRecord.count) : 0
            };
        });
    }
    async getCohortParticipants(cohortId) {
        const participants = await db
            .select({
            user: schema.users
        })
            .from(schema.cohortParticipants)
            .innerJoin(schema.users, eq(schema.cohortParticipants.participantId, schema.users.id))
            .where(eq(schema.cohortParticipants.cohortId, cohortId));
        return participants.map(p => ({
            ...p.user,
            role: p.user.role || 'participant'
        }));
    }
    async addParticipantToCohort(cohortId, userId) {
        const existing = await db
            .select()
            .from(schema.cohortParticipants)
            .where(and(eq(schema.cohortParticipants.cohortId, cohortId), eq(schema.cohortParticipants.participantId, userId)));
        if (existing.length === 0) {
            await db
                .insert(schema.cohortParticipants)
                .values({
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
        const cohortParticipants = await db
            .select({
            cohortId: schema.cohortParticipants.cohortId
        })
            .from(schema.cohortParticipants)
            .where(eq(schema.cohortParticipants.participantId, participantId));
        const cohortIds = cohortParticipants.map(cp => cp.cohortId).filter(id => id !== null);
        if (cohortIds.length === 0) {
            return [];
        }
        const cohorts = await db
            .select()
            .from(schema.cohorts)
            .where(inArray(schema.cohorts.id, cohortIds));
        const facilitators = await db
            .select()
            .from(schema.cohortFacilitators)
            .where(inArray(schema.cohortFacilitators.cohortId, cohortIds));
        const participantCounts = await db
            .select({
            cohortId: schema.cohortParticipants.cohortId,
            count: count()
        })
            .from(schema.cohortParticipants)
            .where(inArray(schema.cohortParticipants.cohortId, cohortIds))
            .groupBy(schema.cohortParticipants.cohortId);
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
    async getStarCard(userId) {
        const [starCard] = await db
            .select()
            .from(schema.starCards)
            .where(eq(schema.starCards.userId, userId));
        return starCard;
    }
    async createStarCard(starCardData) {
        const [starCard] = await db
            .insert(schema.starCards)
            .values(starCardData)
            .returning();
        return starCard;
    }
    async updateStarCard(userId, starCardData) {
        const [updatedStarCard] = await db
            .update(schema.starCards)
            .set({ ...starCardData })
            .where(eq(schema.starCards.userId, userId))
            .returning();
        return updatedStarCard;
    }
    async getFlowAttributes(userId) {
        const [flowAttributes] = await db
            .select()
            .from(schema.flowAttributes)
            .where(eq(schema.flowAttributes.userId, userId));
        return flowAttributes;
    }
    async createFlowAttributes(flowAttributesData) {
        const [flowAttributes] = await db
            .insert(schema.flowAttributes)
            .values(flowAttributesData)
            .returning();
        return flowAttributes;
    }
    async updateFlowAttributes(userId, attributes) {
        const [updatedFlowAttributes] = await db
            .update(schema.flowAttributes)
            .set({ attributes })
            .where(eq(schema.flowAttributes.userId, userId))
            .returning();
        return updatedFlowAttributes;
    }
}
export const dbStorage = new DatabaseStorage();
