/**
 * Checkpoint Service
 * Handles creating and restoring user progress checkpoints
 */

import { db } from '../db.js';
import * as schema from '../../shared/schema.js';
import { eq, and, ne } from 'drizzle-orm';

export interface CheckpointData {
  id: string;
  userId: number;
  name: string;
  description?: string;
  createdAt: string;
  data: {
    userAssessments: any[];
    navigationProgress: any[];
    userDiscernmentProgress: any[];
    finalReflections: any[];
    growthPlans: any[];
    workshopParticipation: any[];
    userProgress: number;
  };
}

export class CheckpointService {
  /**
   * Create a new checkpoint for a user
   */
  static async createCheckpoint(
    userId: number, 
    name: string, 
    description?: string
  ): Promise<CheckpointData> {
    try {
      console.log(`Creating checkpoint for user ${userId}: ${name}`);
      
      // Collect all user data
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

      // Get user progress
      const [user] = await db
        .select({ progress: schema.users.progress })
        .from(schema.users)
        .where(eq(schema.users.id, userId));

      const checkpointId = `checkpoint_${userId}_${Date.now()}`;
      const checkpoint: CheckpointData = {
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

      // Store checkpoint in user_assessments table with special type
      await db.insert(schema.userAssessments).values({
        userId,
        assessmentType: 'checkpoint',
        results: JSON.stringify(checkpoint)
      });

      console.log(`Checkpoint created successfully: ${checkpointId}`);
      return checkpoint;

    } catch (error) {
      console.error('Error creating checkpoint:', error);
      throw new Error('Failed to create checkpoint');
    }
  }

  /**
   * Get all checkpoints for a user
   */
  static async getUserCheckpoints(userId: number): Promise<CheckpointData[]> {
    try {
      const checkpointRecords = await db
        .select()
        .from(schema.userAssessments)
        .where(
          and(
            eq(schema.userAssessments.userId, userId),
            eq(schema.userAssessments.assessmentType, 'checkpoint')
          )
        );

      return checkpointRecords.map(record => {
        const checkpoint = JSON.parse(record.results);
        return {
          ...checkpoint,
          createdAt: record.createdAt.toISOString()
        };
      }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    } catch (error) {
      console.error('Error getting user checkpoints:', error);
      throw new Error('Failed to retrieve checkpoints');
    }
  }

  /**
   * Restore a checkpoint for a user
   */
  static async restoreCheckpoint(userId: number, checkpointId: string): Promise<boolean> {
    try {
      console.log(`Restoring checkpoint ${checkpointId} for user ${userId}`);

      // Get the checkpoint data
      const [checkpointRecord] = await db
        .select()
        .from(schema.userAssessments)
        .where(
          and(
            eq(schema.userAssessments.userId, userId),
            eq(schema.userAssessments.assessmentType, 'checkpoint')
          )
        );

      if (!checkpointRecord) {
        throw new Error('Checkpoint not found');
      }

      const checkpoint: CheckpointData = JSON.parse(checkpointRecord.results);
      
      if (checkpoint.id !== checkpointId) {
        // Find the specific checkpoint if multiple exist
        const allCheckpoints = await this.getUserCheckpoints(userId);
        const targetCheckpoint = allCheckpoints.find(cp => cp.id === checkpointId);
        
        if (!targetCheckpoint) {
          throw new Error('Checkpoint not found');
        }
        
        checkpoint.data = targetCheckpoint.data;
      }

      // Clear existing data first (excluding checkpoints)
      await CheckpointService.clearUserDataExceptCheckpoints(userId);

      // Restore data from checkpoint
      const { data } = checkpoint;

      // Restore user assessments (excluding checkpoints)
      if (data.userAssessments && data.userAssessments.length > 0) {
        const assessmentsToRestore = data.userAssessments.filter(
          (assessment: any) => assessment.assessmentType !== 'checkpoint'
        );
        
        for (const assessment of assessmentsToRestore) {
          await db.insert(schema.userAssessments).values({
            userId: assessment.userId,
            assessmentType: assessment.assessmentType,
            results: assessment.results
          });
        }
      }

      // Restore navigation progress
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

      // Restore other data types
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

      // Restore user progress
      await db
        .update(schema.users)
        .set({ progress: data.userProgress })
        .where(eq(schema.users.id, userId));

      console.log(`Checkpoint ${checkpointId} restored successfully for user ${userId}`);
      return true;

    } catch (error) {
      console.error('Error restoring checkpoint:', error);
      throw new Error(`Failed to restore checkpoint: ${error.message}`);
    }
  }

  /**
   * Delete a checkpoint
   */
  static async deleteCheckpoint(userId: number, checkpointId: string): Promise<boolean> {
    try {
      // Get all checkpoints for the user
      const checkpoints = await this.getUserCheckpoints(userId);
      
      // Find the checkpoint to delete
      const checkpointToDelete = checkpoints.find(cp => cp.id === checkpointId);
      if (!checkpointToDelete) {
        throw new Error('Checkpoint not found');
      }

      // Delete from database - we need to find the specific record
      const checkpointRecords = await db
        .select()
        .from(schema.userAssessments)
        .where(
          and(
            eq(schema.userAssessments.userId, userId),
            eq(schema.userAssessments.assessmentType, 'checkpoint')
          )
        );

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

    } catch (error) {
      console.error('Error deleting checkpoint:', error);
      throw new Error('Failed to delete checkpoint');
    }
  }

  /**
   * Clear user data except checkpoints (used before restoring checkpoint)
   */
  static async clearUserDataExceptCheckpoints(userId: number): Promise<void> {
    try {
      // Delete from all tables except checkpoints
      await db
        .delete(schema.userAssessments)
        .where(
          and(
            eq(schema.userAssessments.userId, userId),
            ne(schema.userAssessments.assessmentType, 'checkpoint')
          )
        );

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
    } catch (error) {
      console.error('Error clearing user data:', error);
      throw new Error('Failed to clear user data');
    }
  }

  /**
   * Clear user data (used before restoring checkpoint)
   */
  private static async clearUserData(userId: number): Promise<void> {
    try {
      // Delete from all tables except checkpoints
      await db
        .delete(schema.userAssessments)
        .where(
          and(
            eq(schema.userAssessments.userId, userId),
            // Keep checkpoints
            schema.userAssessments.assessmentType !== 'checkpoint' as any
          )
        );

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

      // Reset user progress
      await db
        .update(schema.users)
        .set({ progress: 0 })
        .where(eq(schema.users.id, userId));

    } catch (error) {
      console.error('Error clearing user data:', error);
      throw error;
    }
  }
}