import { db } from '../db.js';
import { users, userAssessments } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

interface NavigationProgress {
  completedSteps: string[];
  currentStepId: string;
  appType: 'ast' | 'ia' | null;
  lastVisitedAt: string;
  unlockedSections: string[];
  videoProgress: { [stepId: string]: number };
}

/**
 * Navigation Sync Service
 * Updates database navigation progress to reflect actual assessment completions
 */
export class NavigationSyncService {
  
  /**
   * Determine the current step based on assessment completions
   */
  private static determineCurrentStepFromAssessments(assessments: any[]): { currentStep: string; completedSteps: string[]; appType: 'ast' | 'ia' } {
    const completedSteps: string[] = [];
    let currentStep = '1-1'; // Default starting step
    let appType: 'ast' | 'ia' = 'ast'; // Default to AllStarTeams

    // Check what assessments exist
    const hasStarCard = assessments.some(a => a.assessmentType === 'star_card');
    const hasStepReflection = assessments.some(a => a.assessmentType === 'step_by_step_reflection');
    const hasFlowAssessment = assessments.some(a => a.assessmentType === 'flow_assessment');
    const hasRoundingOut = assessments.some(a => a.assessmentType === 'rounding_out_reflection');
    const hasFlowAttributes = assessments.some(a => a.assessmentType === 'flow_attributes');

    // Progression logic for AllStarTeams workshop
    if (hasStarCard || hasStepReflection || hasFlowAssessment || hasRoundingOut || hasFlowAttributes) {
      // User has started the workshop
      completedSteps.push('1-1'); // Introduction
      completedSteps.push('2-1'); // Star Strengths Intro
      
      if (hasStarCard) {
        // User completed star card assessment
        completedSteps.push('2-2'); // Star Card Creation
        currentStep = '2-3'; // Review Your Star Card
        
        if (hasStepReflection) {
          // User completed step-by-step reflection
          completedSteps.push('2-3'); // Review Your Star Card
          completedSteps.push('2-4'); // Step-by-step reflection
          currentStep = '3-1'; // Intro to Flow
          
          if (hasFlowAssessment) {
            // User completed flow assessment
            completedSteps.push('3-1'); // Intro to Flow
            completedSteps.push('3-2'); // Flow Assessment
            currentStep = '3-3'; // Rounding Out
            
            if (hasRoundingOut) {
              // User completed rounding out reflection
              completedSteps.push('3-3'); // Rounding Out
              currentStep = '3-4'; // Final reflection or flow attributes
              
              if (hasFlowAttributes) {
                // User completed flow attributes
                completedSteps.push('3-4'); // Flow attributes completion
                currentStep = '4-1'; // Next section (Well-being)
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

  /**
   * Sync navigation progress for a specific user
   */
  static async syncUserProgress(userId: number): Promise<boolean> {
    try {
      console.log(`[NavigationSync] Syncing progress for user ${userId}`);

      // Get user's current navigation progress
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user.length) {
        console.log(`[NavigationSync] User ${userId} not found`);
        return false;
      }

      // Get user's assessments
      const assessments = await db.select().from(userAssessments).where(eq(userAssessments.userId, userId));
      
      if (assessments.length === 0) {
        console.log(`[NavigationSync] No assessments found for user ${userId}`);
        return true; // No assessments means no progress to sync
      }

      console.log(`[NavigationSync] Found ${assessments.length} assessments for user ${userId}`);

      // Determine progress based on assessments
      const { currentStep, completedSteps, appType } = this.determineCurrentStepFromAssessments(assessments);

      // Parse existing navigation progress or create new one
      let existingProgress: NavigationProgress;
      try {
        existingProgress = user[0].navigationProgress ? JSON.parse(user[0].navigationProgress) : null;
      } catch (e) {
        existingProgress = null;
      }

      // Create updated progress
      const updatedProgress: NavigationProgress = {
        completedSteps,
        currentStepId: currentStep,
        appType,
        lastVisitedAt: new Date().toISOString(),
        unlockedSections: this.calculateUnlockedSections(completedSteps),
        videoProgress: existingProgress?.videoProgress || {}
      };

      // Only update if there's a meaningful change
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
      } else {
        console.log(`[NavigationSync] No changes needed for user ${userId}`);
      }

      return true;
    } catch (error) {
      console.error(`[NavigationSync] Error syncing progress for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Calculate unlocked sections based on completed steps
   */
  private static calculateUnlockedSections(completedSteps: string[]): string[] {
    const unlocked = ['1']; // Introduction always unlocked

    // Check if any step 1 is completed to unlock section 2
    if (completedSteps.some(step => step.startsWith('1-'))) {
      unlocked.push('2');
    }

    // Check if any step 2 is completed to unlock section 3
    if (completedSteps.some(step => step.startsWith('2-'))) {
      unlocked.push('3');
    }

    // Check if any step 3 is completed to unlock section 4
    if (completedSteps.some(step => step.startsWith('3-'))) {
      unlocked.push('4');
    }

    return unlocked;
  }

  /**
   * Sync progress for all users who have assessment data but outdated navigation progress
   */
  static async syncAllUsersProgress(): Promise<number> {
    try {
      console.log('[NavigationSync] Starting bulk sync for all users');

      // Get all users who have assessments
      const usersWithAssessments = await db.select({
        userId: userAssessments.userId
      })
      .from(userAssessments)
      .groupBy(userAssessments.userId);

      console.log(`[NavigationSync] Found ${usersWithAssessments.length} users with assessment data`);

      let syncedCount = 0;
      for (const userRecord of usersWithAssessments) {
        const success = await this.syncUserProgress(userRecord.userId);
        if (success) syncedCount++;
      }

      console.log(`[NavigationSync] Bulk sync completed: ${syncedCount}/${usersWithAssessments.length} users synced`);
      return syncedCount;
    } catch (error) {
      console.error('[NavigationSync] Error during bulk sync:', error);
      return 0;
    }
  }
}