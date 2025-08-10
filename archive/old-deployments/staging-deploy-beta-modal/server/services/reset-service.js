import { db } from '../db.js';
import * as schema from '../../shared/schema.js';
export class ResetService {
    static async resetAllUserData(userId) {
        console.log(`=== RESET SERVICE: Starting complete data reset for user ${userId} ===`);
        const deletedData = {
            starCard: false,
            flowAttributes: false,
            userProgress: false
        };
        try {
            const { sql } = await import('drizzle-orm');
            const { eq } = await import('drizzle-orm');
            console.log(`Starting comprehensive data reset for user ${userId}`);
            try {
                await db.execute(sql `DELETE FROM user_assessments WHERE user_id = ${userId}`);
                console.log(`Deleted all assessment data for user ${userId} using direct SQL`);
                deletedData.starCard = true;
                deletedData.flowAttributes = true;
                const remainingAssessments = await db
                    .select()
                    .from(schema.userAssessments)
                    .where(eq(schema.userAssessments.userId, userId));
                if (remainingAssessments.length > 0) {
                    console.error(`ERROR: Some assessments remain for user ${userId} after deletion attempt`);
                }
                else {
                    console.log(`Successfully verified all assessments deleted for user ${userId}`);
                }
            }
            catch (error) {
                console.error(`Error deleting user assessments for user ${userId}:`, error);
            }
            try {
                await db.execute(sql `DELETE FROM workshop_participation WHERE user_id = ${userId}`);
                console.log(`Deleted workshop participation data for user ${userId}`);
                deletedData.userProgress = true;
            }
            catch (error) {
                console.error(`Error deleting workshop participation for user ${userId}:`, error);
            }
            try {
                await db.execute(sql `
          DELETE FROM user_reflections 
          WHERE user_id = ${userId}
        `);
                console.log(`Attempted to delete user reflections for user ${userId}`);
            }
            catch (error) {
                console.log(`No reflections table to clear for user ${userId}`);
            }
            try {
                await db
                    .update(schema.users)
                    .set({ updatedAt: new Date() })
                    .where(eq(schema.users.id, userId));
                console.log(`Updated user timestamp for user ${userId}`);
            }
            catch (error) {
                console.error(`Error updating user timestamp for user ${userId}:`, error);
            }
            console.log(`=== RESET: Completed data reset for user ${userId} ===`);
            return {
                success: true,
                message: 'User data reset successfully',
                userId,
                deletedData
            };
        }
        catch (error) {
            console.error('Error in resetAllUserData:', error);
            return {
                success: false,
                message: 'Failed to reset all user data',
                userId,
                deletedData,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async resetStarCard(userId) {
        try {
            console.log(`Resetting star card for user ${userId}`);
            const { eq, and } = await import('drizzle-orm');
            const assessments = await db
                .select()
                .from(schema.userAssessments)
                .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'starCard')));
            if (assessments.length === 0) {
                console.log(`No star card found for user ${userId}, nothing to delete`);
                return true;
            }
            console.log(`Found ${assessments.length} star card assessments for user ${userId}`);
            await db
                .delete(schema.userAssessments)
                .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'starCard')));
            const verifyAssessments = await db
                .select()
                .from(schema.userAssessments)
                .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'starCard')));
            if (verifyAssessments.length > 0) {
                console.error(`ERROR: Star card assessments still exist after deletion for user ${userId}`);
                return false;
            }
            console.log(`Successfully deleted all star card assessments for user ${userId}`);
            return true;
        }
        catch (error) {
            console.error(`Error in resetStarCard for user ${userId}:`, error);
            throw error;
        }
    }
    static async resetFlowAttributes(userId) {
        try {
            console.log(`Resetting flow attributes for user ${userId}`);
            const { eq, and } = await import('drizzle-orm');
            const assessments = await db
                .select()
                .from(schema.userAssessments)
                .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'flowAttributes')));
            if (assessments.length === 0) {
                console.log(`No flow attributes found for user ${userId}, nothing to delete`);
                return true;
            }
            console.log(`Found ${assessments.length} flow attribute assessments for user ${userId}`);
            await db
                .delete(schema.userAssessments)
                .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'flowAttributes')));
            const verifyAssessments = await db
                .select()
                .from(schema.userAssessments)
                .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'flowAttributes')));
            if (verifyAssessments.length > 0) {
                console.error(`ERROR: Flow attribute assessments still exist after deletion for user ${userId}`);
                return false;
            }
            console.log(`Successfully deleted all flow attribute assessments for user ${userId}`);
            return true;
        }
        catch (error) {
            console.error(`Error in resetFlowAttributes for user ${userId}:`, error);
            throw error;
        }
    }
    static async resetUserProgress(userId) {
        try {
            console.log(`Resetting progress for user ${userId}`);
            try {
                const { eq } = await import('drizzle-orm');
                await db.update(schema.users)
                    .set({
                    navigationProgress: null
                })
                    .where(eq(schema.users.id, userId));
                console.log(`Reset navigation progress for user ${userId}`);
            }
            catch (err) {
                console.error(`Error resetting progress for user ${userId}:`, err);
            }
            return true;
        }
        catch (error) {
            console.error(`Error in resetUserProgress for user ${userId}:`, error);
            throw error;
        }
    }
}
