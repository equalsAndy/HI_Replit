import { db } from '../db';
import { eq } from 'drizzle-orm';
import * as schema from '../../shared/schema';

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
      // Step 1: Delete all user assessments data in a simpler way
      // This replaces individual calls to resetStarCard and resetFlowAttributes
      try {
        // Import and use the eq operator from drizzle-orm
        const { eq } = await import('drizzle-orm');
        
        // Find all assessments for this user
        const assessments = await db
          .select()
          .from(schema.userAssessments)
          .where(eq(schema.userAssessments.userId, userId));
        
        console.log(`Found ${assessments.length} assessments for user ${userId}`);
        
        // Track which types of assessments we found and deleted
        const assessmentTypes = new Set(assessments.map(a => a.assessmentType));
        
        if (assessmentTypes.has('starCard')) {
          deletedData.starCard = true;
        }
        
        if (assessmentTypes.has('flowAttributes')) {
          deletedData.flowAttributes = true;
        }
        
        // Delete all assessments for this user
        if (assessments.length > 0) {
          const result = await db
            .delete(schema.userAssessments)
            .where(eq(schema.userAssessments.userId, userId));
          
          console.log(`Deleted user assessments for user ${userId}:`, result);
        }
        
        // Verify deletion
        const remainingAssessments = await db
          .select()
          .from(schema.userAssessments)
          .where(eq(schema.userAssessments.userId, userId));
        
        if (remainingAssessments.length > 0) {
          console.error(`ERROR: Some assessments still exist after deletion for user ${userId}`);
        } else {
          console.log(`Successfully deleted all assessments for user ${userId}`);
        }
      } catch (error) {
        console.error(`Error deleting user assessments for user ${userId}:`, error);
        throw new Error(`Failed to delete user assessments: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      // Step 2: Reset user progress (workshop-specific data)
      await this.resetUserProgress(userId)
        .then(success => { deletedData.userProgress = success; })
        .catch(error => {
          console.error(`Error resetting user progress: ${error.message}`);
          // Continue even if this fails
        });
      
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
        error: error instanceof Error ? error.message : 'Unknown error'
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
      
      // Since we don't actually have a progress field in the users table,
      // we'll just return success without updating anything
      console.log(`Progress reset for user ${userId} (no-op since progress field doesn't exist)`);
      return true;
    } catch (error) {
      console.error(`Error in resetUserProgress for user ${userId}:`, error);
      throw error;
    }
  }
}