import { eq, and, inArray } from "drizzle-orm";
import { db } from "./db";
import * as schema from "../shared/schema";
import { User, UserRole, Cohort, StarCard, FlowAttributesRecord } from "../shared/types";
import { IStorage } from "./storage";
import bcrypt from "bcryptjs";

// Role management helper functions
async function getUserRoles(userId: number): Promise<UserRole[]> {
  const userRoles = await db
    .select({ role: schema.userRoles.role })
    .from(schema.userRoles)
    .where(eq(schema.userRoles.userId, userId));
  
  return userRoles.map(r => r.role);
}

async function setUserRole(userId: number, role: UserRole): Promise<void> {
  // First delete any existing roles (in case we're changing the role)
  await db.delete(schema.userRoles)
    .where(eq(schema.userRoles.userId, userId));
  
  // Insert the new role
  await db.insert(schema.userRoles)
    .values({ userId, role });
}

// Database Storage class implementation
export class DatabaseStorage implements IStorage {
  
  // User management methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id));
    
    if (!user) return undefined;
    
    // Get user roles
    const roles = await getUserRoles(id);
    
    return {
      ...user,
      role: roles.length > 0 ? roles[0] : UserRole.Participant // Default to participant
    };
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username));
    
    if (!user) return undefined;
    
    // Get user roles
    const roles = await getUserRoles(user.id);
    
    return {
      ...user,
      role: roles.length > 0 ? roles[0] : UserRole.Participant // Default to participant
    };
  }
  
  async createUser(userData: Partial<User>): Promise<User> {
    // Hash password if provided
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    // Remove role before inserting (will be added separately)
    const { role, ...userDataWithoutRole } = userData;
    
    // Insert user
    const [user] = await db
      .insert(schema.users)
      .values(userDataWithoutRole)
      .returning();
    
    // Add role if specified
    if (role) {
      await setUserRole(user.id, role);
    }
    
    return { ...user, role: role || UserRole.Participant };
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    // Hash password if provided
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    // Remove role before updating (will be updated separately)
    const { role, ...userDataWithoutRole } = userData;
    
    // Update user
    const [updatedUser] = await db
      .update(schema.users)
      .set({ ...userDataWithoutRole, updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();
    
    if (!updatedUser) return undefined;
    
    // Update role if provided
    if (role) {
      await setUserRole(id, role);
    }
    
    // Get current roles
    const roles = await getUserRoles(id);
    
    return { ...updatedUser, role: roles.length > 0 ? roles[0] : UserRole.Participant };
  }
  
  async getAllUsers(): Promise<User[]> {
    const users = await db
      .select()
      .from(schema.users);
    
    // Get all users' roles
    const userIds = users.map(user => user.id);
    const allRoles = await db
      .select()
      .from(schema.userRoles)
      .where(inArray(schema.userRoles.userId, userIds));
    
    // Map roles to users
    return users.map(user => {
      const userRoles = allRoles.filter(r => r.userId === user.id);
      return {
        ...user,
        role: userRoles.length > 0 ? userRoles[0].role : UserRole.Participant // Default to participant
      };
    });
  }

  // Authentication method
  async authenticateUser(username: string, password: string): Promise<User | undefined> {
    const user = await this.getUserByUsername(username);
    
    if (!user) return undefined;
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) return undefined;
    
    return user;
  }
  
  // Cohort management methods
  async getCohort(id: number): Promise<Cohort | undefined> {
    const [cohort] = await db
      .select()
      .from(schema.cohorts)
      .where(eq(schema.cohorts.id, id));
    
    if (!cohort) return undefined;
    
    // Get facilitators
    const facilitators = await db
      .select({
        facilitatorId: schema.cohortFacilitators.facilitatorId
      })
      .from(schema.cohortFacilitators)
      .where(eq(schema.cohortFacilitators.cohortId, id));
    
    // Get participant count
    const [{ count }] = await db
      .select({ count: db.fn.count() })
      .from(schema.cohortParticipants)
      .where(eq(schema.cohortParticipants.cohortId, id));
    
    return {
      ...cohort,
      facilitatorId: facilitators.length > 0 ? facilitators[0].facilitatorId : undefined,
      memberCount: Number(count) || 0
    };
  }
  
  async getAllCohorts(): Promise<Cohort[]> {
    const cohorts = await db
      .select()
      .from(schema.cohorts);
    
    // Get all facilitators for these cohorts
    const cohortIds = cohorts.map(cohort => cohort.id);
    
    const facilitators = await db
      .select()
      .from(schema.cohortFacilitators)
      .where(inArray(schema.cohortFacilitators.cohortId, cohortIds));
    
    // Get participant counts for all cohorts
    const participantCounts = await db
      .select({
        cohortId: schema.cohortParticipants.cohortId,
        count: db.fn.count()
      })
      .from(schema.cohortParticipants)
      .where(inArray(schema.cohortParticipants.cohortId, cohortIds))
      .groupBy(schema.cohortParticipants.cohortId);
    
    // Map data to cohorts
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
  
  async createCohort(cohortData: Partial<Cohort>): Promise<Cohort> {
    // Extract facilitatorId and memberCount, which are not part of the cohort table
    const { facilitatorId, memberCount, ...cohortTableData } = cohortData;
    
    // Insert cohort
    const [cohort] = await db
      .insert(schema.cohorts)
      .values(cohortTableData)
      .returning();
    
    // Add facilitator if provided
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
  
  async updateCohort(id: number, cohortData: Partial<Cohort>): Promise<Cohort | undefined> {
    // Extract facilitatorId and memberCount, which are not part of the cohort table
    const { facilitatorId, memberCount, ...cohortTableData } = cohortData;
    
    // Update cohort
    const [updatedCohort] = await db
      .update(schema.cohorts)
      .set({ ...cohortTableData, updatedAt: new Date() })
      .where(eq(schema.cohorts.id, id))
      .returning();
    
    if (!updatedCohort) return undefined;
    
    // Update facilitator if provided
    if (facilitatorId !== undefined) {
      // First remove existing facilitators
      await db
        .delete(schema.cohortFacilitators)
        .where(eq(schema.cohortFacilitators.cohortId, id));
      
      // Then add new facilitator if specified
      if (facilitatorId) {
        await db
          .insert(schema.cohortFacilitators)
          .values({
            cohortId: id,
            facilitatorId
          });
      }
    }
    
    // Get participant count
    const [{ count }] = await db
      .select({ count: db.fn.count() })
      .from(schema.cohortParticipants)
      .where(eq(schema.cohortParticipants.cohortId, id));
    
    return {
      ...updatedCohort,
      facilitatorId,
      memberCount: Number(count) || 0
    };
  }
  
  // Participant management methods
  async getCohortParticipants(cohortId: number): Promise<User[]> {
    const participants = await db
      .select({
        user: schema.users
      })
      .from(schema.cohortParticipants)
      .innerJoin(
        schema.users,
        eq(schema.cohortParticipants.participantId, schema.users.id)
      )
      .where(eq(schema.cohortParticipants.cohortId, cohortId));
    
    // Get user roles
    const userIds = participants.map(p => p.user.id);
    const allRoles = await db
      .select()
      .from(schema.userRoles)
      .where(inArray(schema.userRoles.userId, userIds));
    
    // Map roles to users
    return participants.map(p => {
      const userRoles = allRoles.filter(r => r.userId === p.user.id);
      return {
        ...p.user,
        role: userRoles.length > 0 ? userRoles[0].role : UserRole.Participant
      };
    });
  }
  
  async addParticipantToCohort(cohortId: number, userId: number): Promise<void> {
    // Check if already a participant
    const existing = await db
      .select()
      .from(schema.cohortParticipants)
      .where(
        and(
          eq(schema.cohortParticipants.cohortId, cohortId),
          eq(schema.cohortParticipants.participantId, userId)
        )
      );
    
    // Only add if not already a participant
    if (existing.length === 0) {
      await db
        .insert(schema.cohortParticipants)
        .values({
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
  
  // Star Card methods
  async getStarCard(userId: number): Promise<StarCard | undefined> {
    const [starCard] = await db
      .select()
      .from(schema.starCards)
      .where(eq(schema.starCards.userId, userId));
    
    return starCard;
  }
  
  async createStarCard(starCardData: Partial<StarCard>): Promise<StarCard> {
    const [starCard] = await db
      .insert(schema.starCards)
      .values(starCardData)
      .returning();
    
    return starCard;
  }
  
  async updateStarCard(userId: number, starCardData: Partial<StarCard>): Promise<StarCard | undefined> {
    const [updatedStarCard] = await db
      .update(schema.starCards)
      .set({ ...starCardData, updatedAt: new Date() })
      .where(eq(schema.starCards.userId, userId))
      .returning();
    
    return updatedStarCard;
  }
  
  // Flow attributes methods
  async getFlowAttributes(userId: number): Promise<FlowAttributesRecord | undefined> {
    const [flowAttributes] = await db
      .select()
      .from(schema.flowAttributes)
      .where(eq(schema.flowAttributes.userId, userId));
    
    return flowAttributes;
  }
  
  async createFlowAttributes(flowAttributesData: { userId: number, attributes: any[] }): Promise<FlowAttributesRecord> {
    const [flowAttributes] = await db
      .insert(schema.flowAttributes)
      .values(flowAttributesData)
      .returning();
    
    return flowAttributes;
  }
  
  async updateFlowAttributes(userId: number, attributes: any[]): Promise<FlowAttributesRecord | undefined> {
    const [updatedFlowAttributes] = await db
      .update(schema.flowAttributes)
      .set({ attributes, updatedAt: new Date() })
      .where(eq(schema.flowAttributes.userId, userId))
      .returning();
    
    return updatedFlowAttributes;
  }
}

// Export an instance of the database storage
export const dbStorage = new DatabaseStorage();