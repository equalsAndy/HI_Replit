import { db } from '../db.js';
import * as schema from '../../shared/schema.js';
import { eq, and, ne } from 'drizzle-orm';
export class CheckpointService {
    static async createCheckpoint(userId, name, description) {
        try {
            console.log(`Creating checkpoint for user ${userId}: ${name}`);
            const userAssessments = await db
                .select()
                .from(schema.userAssessments)
                .where(eq(schema.userAssessments.userId, userId));
            const navigationProgress = await db
                .select()
                .from(schema.navigationProgress)
                .where(eq(schema.navigationProgress.userId, userId));
            const userDiscernmentProgress = await db
                .select()
                .from(schema.userDiscernmentProgress)
                .where(eq(schema.userDiscernmentProgress.userId, userId));
            const finalReflections = await db
                .select()
                .from(schema.finalReflections)
                .where(eq(schema.finalReflections.userId, userId));
            const growthPlans = await db
                .select()
                .from(schema.growthPlans)
                .where(eq(schema.growthPlans.userId, userId));
            const workshopParticipation = await db
                .select()
                .from(schema.workshopParticipation)
                .where(eq(schema.workshopParticipation.userId, userId));
            const [user] = await db
                .select({ progress: schema.users.progress })
                .from(schema.users)
                .where(eq(schema.users.id, userId));
            const checkpointId = `checkpoint_${userId}_${Date.now()}`;
            const checkpoint = {
                id: checkpointId,
                userId,
                name,
                description,
                createdAt: new Date().toISOString(),
                data: {
                    userAssessments,
                    navigationProgress,
                    userDiscernmentProgress,
                    finalReflections,
                    growthPlans,
                    workshopParticipation,
                    userProgress: user?.progress || 0
                }
            };
            await db.insert(schema.userAssessments).values({
                userId,
                assessmentType: 'checkpoint',
                results: JSON.stringify(checkpoint)
            });
            console.log(`Checkpoint created successfully: ${checkpointId}`);
            return checkpoint;
        }
        catch (error) {
            console.error('Error creating checkpoint:', error);
            throw new Error('Failed to create checkpoint');
        }
    }
    static async getUserCheckpoints(userId) {
        try {
            const checkpointRecords = await db
                .select()
                .from(schema.userAssessments)
                .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'checkpoint')));
            return checkpointRecords.map(record => {
                const checkpoint = JSON.parse(record.results);
                return {
                    ...checkpoint,
                    createdAt: record.createdAt.toISOString()
                };
            }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        catch (error) {
            console.error('Error getting user checkpoints:', error);
            throw new Error('Failed to retrieve checkpoints');
        }
    }
    static async restoreCheckpoint(userId, checkpointId) {
        try {
            console.log(`Restoring checkpoint ${checkpointId} for user ${userId}`);
            const [checkpointRecord] = await db
                .select()
                .from(schema.userAssessments)
                .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'checkpoint')));
            if (!checkpointRecord) {
                throw new Error('Checkpoint not found');
            }
            const checkpoint = JSON.parse(checkpointRecord.results);
            if (checkpoint.id !== checkpointId) {
                const allCheckpoints = await this.getUserCheckpoints(userId);
                const targetCheckpoint = allCheckpoints.find(cp => cp.id === checkpointId);
                if (!targetCheckpoint) {
                    throw new Error('Checkpoint not found');
                }
                checkpoint.data = targetCheckpoint.data;
            }
            await CheckpointService.clearUserDataExceptCheckpoints(userId);
            const { data } = checkpoint;
            if (data.userAssessments && data.userAssessments.length > 0) {
                const assessmentsToRestore = data.userAssessments.filter((assessment) => assessment.assessmentType !== 'checkpoint');
                for (const assessment of assessmentsToRestore) {
                    await db.insert(schema.userAssessments).values({
                        userId: assessment.userId,
                        assessmentType: assessment.assessmentType,
                        results: assessment.results
                    });
                }
            }
            if (data.navigationProgress && data.navigationProgress.length > 0) {
                for (const progress of data.navigationProgress) {
                    await db.insert(schema.navigationProgress).values({
                        userId: progress.userId,
                        appType: progress.appType,
                        completedSteps: progress.completedSteps,
                        currentStepId: progress.currentStepId,
                        unlockedSteps: progress.unlockedSteps,
                        videoProgress: progress.videoProgress,
                        lastVisitedAt: new Date(progress.lastVisitedAt)
                    });
                }
            }
            if (data.userDiscernmentProgress && data.userDiscernmentProgress.length > 0) {
                for (const progress of data.userDiscernmentProgress) {
                    await db.insert(schema.userDiscernmentProgress).values(progress);
                }
            }
            if (data.finalReflections && data.finalReflections.length > 0) {
                for (const reflection of data.finalReflections) {
                    await db.insert(schema.finalReflections).values(reflection);
                }
            }
            if (data.growthPlans && data.growthPlans.length > 0) {
                for (const plan of data.growthPlans) {
                    await db.insert(schema.growthPlans).values(plan);
                }
            }
            if (data.workshopParticipation && data.workshopParticipation.length > 0) {
                for (const participation of data.workshopParticipation) {
                    await db.insert(schema.workshopParticipation).values(participation);
                }
            }
            await db
                .update(schema.users)
                .set({ progress: data.userProgress })
                .where(eq(schema.users.id, userId));
            console.log(`Checkpoint ${checkpointId} restored successfully for user ${userId}`);
            return true;
        }
        catch (error) {
            console.error('Error restoring checkpoint:', error);
            throw new Error(`Failed to restore checkpoint: ${error.message}`);
        }
    }
    static async deleteCheckpoint(userId, checkpointId) {
        try {
            const checkpoints = await this.getUserCheckpoints(userId);
            const checkpointToDelete = checkpoints.find(cp => cp.id === checkpointId);
            if (!checkpointToDelete) {
                throw new Error('Checkpoint not found');
            }
            const checkpointRecords = await db
                .select()
                .from(schema.userAssessments)
                .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'checkpoint')));
            for (const record of checkpointRecords) {
                const checkpoint = JSON.parse(record.results);
                if (checkpoint.id === checkpointId) {
                    await db
                        .delete(schema.userAssessments)
                        .where(eq(schema.userAssessments.id, record.id));
                    break;
                }
            }
            console.log(`Checkpoint ${checkpointId} deleted successfully`);
            return true;
        }
        catch (error) {
            console.error('Error deleting checkpoint:', error);
            throw new Error('Failed to delete checkpoint');
        }
    }
    static async clearUserDataExceptCheckpoints(userId) {
        try {
            await db
                .delete(schema.userAssessments)
                .where(and(eq(schema.userAssessments.userId, userId), ne(schema.userAssessments.assessmentType, 'checkpoint')));
            await db
                .delete(schema.navigationProgress)
                .where(eq(schema.navigationProgress.userId, userId));
            await db
                .delete(schema.userDiscernmentProgress)
                .where(eq(schema.userDiscernmentProgress.userId, userId));
            await db
                .delete(schema.finalReflections)
                .where(eq(schema.finalReflections.userId, userId));
            await db
                .delete(schema.growthPlans)
                .where(eq(schema.growthPlans.userId, userId));
            await db
                .delete(schema.workshopParticipation)
                .where(eq(schema.workshopParticipation.userId, userId));
            console.log(`User data cleared for user ${userId} (except checkpoints)`);
        }
        catch (error) {
            console.error('Error clearing user data:', error);
            throw new Error('Failed to clear user data');
        }
    }
    static async clearUserData(userId) {
        try {
            await db
                .delete(schema.userAssessments)
                .where(and(eq(schema.userAssessments.userId, userId), ne(schema.userAssessments.assessmentType, 'checkpoint')));
            await db
                .delete(schema.navigationProgress)
                .where(eq(schema.navigationProgress.userId, userId));
            await db
                .delete(schema.userDiscernmentProgress)
                .where(eq(schema.userDiscernmentProgress.userId, userId));
            await db
                .delete(schema.finalReflections)
                .where(eq(schema.finalReflections.userId, userId));
            await db
                .delete(schema.growthPlans)
                .where(eq(schema.growthPlans.userId, userId));
            await db
                .delete(schema.workshopParticipation)
                .where(eq(schema.workshopParticipation.userId, userId));
            await db
                .update(schema.users)
                .set({ progress: 0 })
                .where(eq(schema.users.id, userId));
        }
        catch (error) {
            console.error('Error clearing user data:', error);
            throw error;
        }
    }
}
