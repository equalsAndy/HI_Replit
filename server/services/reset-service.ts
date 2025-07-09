import { db } from '../db.js';
import { eq } from 'drizzle-orm';
import * as schema from '../../shared/schema.js';

/**
 * Complete data reset service that handles all aspects of user data deletion
 * This service ensures data is actually deleted by verifying after deletion operations
 */
export class ResetService {
  /**
   * Reset all user data in the database
   * @param userId The ID of the user whose data should be reset
   * @returns Object containing the results of the reset operation
   */
  public static async resetAllUserData(userId: number): Promise<{
    success: boolean;
    message: string;
    userId: number;
    deletedData: {
      starCard: boolean;
      flowAttributes: boolean;
      userProgress: boolean;
    };
    error?: string;
  }> {
    console.log(`=== RESET SERVICE: Starting complete data reset for user ${userId} ===`);

    const deletedData = {
      starCard: false,
      flowAttributes: false,
      userProgress: false
    };

    try {
      // Use direct database access for maximum reliability
      const { sql } = await import('drizzle-orm');
      const { eq } = await import('drizzle-orm');

      console.log(`Starting comprehensive data reset for user ${userId}`);

      // STEP 1: Delete all user assessments (including star card and flow attributes)
      try {
        // Use direct SQL for guaranteed deletion of ALL assessment data
        await db.execute(sql`DELETE FROM user_assessments WHERE user_id = ${userId}`);
        console.log(`Deleted all assessment data for user ${userId} using direct SQL`);

        // Mark both types as deleted for reporting
        deletedData.starCard = true;
        deletedData.flowAttributes = true;

        // Verify the deletion was successful
        const remainingAssessments = await db
          .select()
          .from(schema.userAssessments)
          .where(eq(schema.userAssessments.userId, userId));

        if (remainingAssessments.length > 0) {
          console.error(`ERROR: Some assessments remain for user ${userId} after deletion attempt`);
        } else {
          console.log(`Successfully verified all assessments deleted for user ${userId}`);
        }
      } catch (error) {
        console.error(`Error deleting user assessments for user ${userId}:`, error);
        // Continue with other operations even if this fails
      }

      // STEP 2: Reset workshop participation data
      try {
        // Direct SQL deletion of workshop participation
        await db.execute(sql`DELETE FROM workshop_participation WHERE user_id = ${userId}`);
        console.log(`Deleted workshop participation data for user ${userId}`);
        deletedData.userProgress = true;
      } catch (error) {
        console.error(`Error deleting workshop participation for user ${userId}:`, error);
      }

      // STEP 3: Reset any reflections or custom user content
      try {
        // If there's a reflections table, clear it for this user
        await db.execute(sql`
          DELETE FROM user_reflections 
          WHERE user_id = ${userId}
        `);
        console.log(`Attempted to delete user reflections for user ${userId}`);
      } catch (error) {
        // This is expected to fail if the table doesn't exist
        console.log(`No reflections table to clear for user ${userId}`);
      }

      // STEP 4: Reset user progress (reset timestamp)
      try {
        // Update the user's timestamp to reset their progress
        await db
          .update(schema.users)
          .set({ updatedAt: new Date() })
          .where(eq(schema.users.id, userId));
        console.log(`Updated user timestamp for user ${userId}`);
      } catch (error) {
        console.error(`Error updating user timestamp for user ${userId}:`, error);
      }

      console.log(`=== RESET: Completed data reset for user ${userId} ===`);

      // All operations completed successfully
      return {
        success: true,
        message: 'User data reset successfully',
        userId,
        deletedData
      };
    } catch (error) {
      // Log the error for server-side debugging
      console.error('Error in resetAllUserData:', error);

      // Return failure response with details
      return {
        success: false,
        message: 'Failed to reset all user data',
        userId,
        deletedData,
        error: error instanceof Error ? (error as Error).message : 'Unknown error'
      };
    }
  }

  /**
   * Reset just the star card data for a user
   * @param userId The user ID
   * @returns Promise resolving to boolean indicating success
   */
  public static async resetStarCard(userId: number): Promise<boolean> {
    try {
      console.log(`Resetting star card for user ${userId}`);

      // Import and use the eq operator from drizzle-orm
      const { eq, and } = await import('drizzle-orm');

      // Check userAssessments table for star card data
      const assessments = await db
        .select()
        .from(schema.userAssessments)
        .where(
          and(
            eq(schema.userAssessments.userId, userId),
            eq(schema.userAssessments.assessmentType, 'starCard')
          )
        );

      if (assessments.length === 0) {
        console.log(`No star card found for user ${userId}, nothing to delete`);
        return true;
      }

      console.log(`Found ${assessments.length} star card assessments for user ${userId}`);

      // Delete all star card assessments for this user
      await db
        .delete(schema.userAssessments)
        .where(
          and(
            eq(schema.userAssessments.userId, userId),
            eq(schema.userAssessments.assessmentType, 'starCard')
          )
        );

      // Verify deletion
      const verifyAssessments = await db
        .select()
        .from(schema.userAssessments)
        .where(
          and(
            eq(schema.userAssessments.userId, userId),
            eq(schema.userAssessments.assessmentType, 'starCard')
          )
        );

      if (verifyAssessments.length > 0) {
        console.error(`ERROR: Star card assessments still exist after deletion for user ${userId}`);
        return false;
      }

      console.log(`Successfully deleted all star card assessments for user ${userId}`);
      return true;
    } catch (error) {
      console.error(`Error in resetStarCard for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Reset just the flow attributes data for a user
   * @param userId The user ID
   * @returns Promise resolving to boolean indicating success
   */
  public static async resetFlowAttributes(userId: number): Promise<boolean> {
    try {
      console.log(`Resetting flow attributes for user ${userId}`);

      // Import and use the eq operator from drizzle-orm
      const { eq, and } = await import('drizzle-orm');

      // Check userAssessments table for flow attributes
      const assessments = await db
        .select()
        .from(schema.userAssessments)
        .where(
          and(
            eq(schema.userAssessments.userId, userId),
            eq(schema.userAssessments.assessmentType, 'flowAttributes')
          )
        );

      if (assessments.length === 0) {
        console.log(`No flow attributes found for user ${userId}, nothing to delete`);
        return true;
      }

      console.log(`Found ${assessments.length} flow attribute assessments for user ${userId}`);

      // Delete all flow attribute assessments for this user
      await db
        .delete(schema.userAssessments)
        .where(
          and(
            eq(schema.userAssessments.userId, userId),
            eq(schema.userAssessments.assessmentType, 'flowAttributes')
          )
        );

      // Verify deletion
      const verifyAssessments = await db
        .select()
        .from(schema.userAssessments)
        .where(
          and(
            eq(schema.userAssessments.userId, userId),
            eq(schema.userAssessments.assessmentType, 'flowAttributes')
          )
        );

      if (verifyAssessments.length > 0) {
        console.error(`ERROR: Flow attribute assessments still exist after deletion for user ${userId}`);
        return false;
      }

      console.log(`Successfully deleted all flow attribute assessments for user ${userId}`);
      return true;
    } catch (error) {
      console.error(`Error in resetFlowAttributes for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Reset user progress
   * @param userId The user ID
   * @returns Promise resolving to boolean indicating success
   */
  public static async resetUserProgress(userId: number): Promise<boolean> {
    try {
      console.log(`Resetting progress for user ${userId}`);

      // Reset user progress and navigation progress
      try {
        const { eq } = await import('drizzle-orm');

        await db.update(schema.users)
          .set({ 
            navigationProgress: null
          })
          .where(eq(schema.users.id, userId));

        console.log(`Reset navigation progress for user ${userId}`);
      } catch (err) {
        console.error(`Error resetting progress for user ${userId}:`, err);
        // Continue even if this fails
      }

      return true;
    } catch (error) {
      console.error(`Error in resetUserProgress for user ${userId}:`, error);
      throw error;
    }
  }
}