import { db } from '../db.js';
import { users, userAssessments } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
export class NavigationSyncService {
    static determineCurrentStepFromAssessments(assessments) {
        const completedSteps = [];
        let currentStep = '1-1';
        let appType = 'ast';
        const hasStarCard = assessments.some(a => a.assessmentType === 'star_card');
        const hasStepReflection = assessments.some(a => a.assessmentType === 'step_by_step_reflection');
        const hasFlowAssessment = assessments.some(a => a.assessmentType === 'flow_assessment');
        const hasRoundingOut = assessments.some(a => a.assessmentType === 'rounding_out_reflection');
        const hasFlowAttributes = assessments.some(a => a.assessmentType === 'flow_attributes');
        if (hasStarCard || hasStepReflection || hasFlowAssessment || hasRoundingOut || hasFlowAttributes) {
            completedSteps.push('1-1');
            completedSteps.push('2-1');
            if (hasStarCard) {
                completedSteps.push('2-2');
                currentStep = '2-3';
                if (hasStepReflection) {
                    completedSteps.push('2-3');
                    completedSteps.push('2-4');
                    currentStep = '3-1';
                    if (hasFlowAssessment) {
                        completedSteps.push('3-1');
                        completedSteps.push('3-2');
                        currentStep = '3-3';
                        if (hasRoundingOut) {
                            completedSteps.push('3-3');
                            currentStep = '3-4';
                            if (hasFlowAttributes) {
                                completedSteps.push('3-4');
                                currentStep = '4-1';
                            }
                        }
                    }
                }
            }
        }
        return {
            currentStep,
            completedSteps,
            appType
        };
    }
    static async syncUserProgress(userId) {
        try {
            console.log(`[NavigationSync] Syncing progress for user ${userId}`);
            const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
            if (!user.length) {
                console.log(`[NavigationSync] User ${userId} not found`);
                return false;
            }
            const assessments = await db.select().from(userAssessments).where(eq(userAssessments.userId, userId));
            if (assessments.length === 0) {
                console.log(`[NavigationSync] No assessments found for user ${userId}`);
                return true;
            }
            console.log(`[NavigationSync] Found ${assessments.length} assessments for user ${userId}`);
            const { currentStep, completedSteps, appType } = this.determineCurrentStepFromAssessments(assessments);
            let existingProgress;
            try {
                existingProgress = user[0].navigationProgress ? JSON.parse(user[0].navigationProgress) : null;
            }
            catch (e) {
                existingProgress = null;
            }
            const updatedProgress = {
                completedSteps,
                currentStepId: currentStep,
                appType,
                lastVisitedAt: new Date().toISOString(),
                unlockedSections: this.calculateUnlockedSections(completedSteps),
                videoProgress: existingProgress?.videoProgress || {}
            };
            const hasChanged = !existingProgress ||
                existingProgress.currentStepId !== currentStep ||
                existingProgress.completedSteps.length !== completedSteps.length ||
                existingProgress.appType !== appType;
            if (hasChanged) {
                console.log(`[NavigationSync] Updating progress for user ${userId}: ${currentStep} (${completedSteps.length} completed)`);
                await db.update(users)
                    .set({
                    navigationProgress: JSON.stringify(updatedProgress),
                    updatedAt: new Date()
                })
                    .where(eq(users.id, userId));
                console.log(`[NavigationSync] Successfully updated navigation progress for user ${userId}`);
            }
            else {
                console.log(`[NavigationSync] No changes needed for user ${userId}`);
            }
            return true;
        }
        catch (error) {
            console.error(`[NavigationSync] Error syncing progress for user ${userId}:`, error);
            return false;
        }
    }
    static calculateUnlockedSections(completedSteps) {
        const unlocked = ['1'];
        if (completedSteps.some(step => step.startsWith('1-'))) {
            unlocked.push('2');
        }
        if (completedSteps.some(step => step.startsWith('2-'))) {
            unlocked.push('3');
        }
        if (completedSteps.some(step => step.startsWith('3-'))) {
            unlocked.push('4');
        }
        return unlocked;
    }
    static async syncAllUsersProgress() {
        try {
            console.log('[NavigationSync] Starting bulk sync for all users');
            const usersWithAssessments = await db.select({
                userId: userAssessments.userId
            })
                .from(userAssessments)
                .groupBy(userAssessments.userId);
            console.log(`[NavigationSync] Found ${usersWithAssessments.length} users with assessment data`);
            let syncedCount = 0;
            for (const userRecord of usersWithAssessments) {
                const success = await this.syncUserProgress(userRecord.userId);
                if (success)
                    syncedCount++;
            }
            console.log(`[NavigationSync] Bulk sync completed: ${syncedCount}/${usersWithAssessments.length} users synced`);
            return syncedCount;
        }
        catch (error) {
            console.error('[NavigationSync] Error during bulk sync:', error);
            return 0;
        }
    }
}
