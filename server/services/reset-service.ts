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
    deletedItems: {
      starCard: boolean;
      flowAttributes: boolean;
      userProgress: boolean;
    };
    message: string;
    error?: string;
  }> {
    console.log(`=== RESET SERVICE: Starting complete data reset for user ${userId} ===`);
    
    const deletedItems = {
      starCard: false,
      flowAttributes: false,
      userProgress: false
    };
    
    try {
      // Step 1: Reset star card data
      await this.resetStarCard(userId)
        .then(success => { deletedItems.starCard = success; })
        .catch(error => { 
          console.error(`Error resetting star card: ${error.message}`);
          throw error;
        });
      
      // Step 2: Reset flow attributes
      await this.resetFlowAttributes(userId)
        .then(success => { deletedItems.flowAttributes = success; })
        .catch(error => {
          console.error(`Error resetting flow attributes: ${error.message}`);
          throw error;
        });
      
      // Step 3: Reset user progress
      await this.resetUserProgress(userId)
        .then(success => { deletedItems.userProgress = success; })
        .catch(error => {
          console.error(`Error resetting user progress: ${error.message}`);
          throw error;
        });
      
      // All operations completed successfully
      return {
        success: true,
        deletedItems,
        message: 'All user data reset successfully'
      };
    } catch (error) {
      // Log the error for server-side debugging
      console.error('Error in resetAllUserData:', error);
      
      // Return failure response with details
      return {
        success: false,
        deletedItems,
        message: 'Failed to reset all user data',
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
      
      // First check the original starCards table
      const [starCard] = await db
        .select()
        .from(schema.starCards)
        .where(eq(schema.starCards.userId, userId));
      
      // Also check userAssessments table where star card data is now stored
      const assessments = await db
        .select()
        .from(schema.userAssessments)
        .where(
          eq(schema.userAssessments.userId, userId)
        );
      
      const starCardAssessment = assessments.find(a => a.assessmentType === 'starCard');
      
      let deletedStarCard = false;
      let deletedAssessment = false;
      
      // Delete from starCards table if exists
      if (starCard) {
        console.log(`Found existing star card in starCards table for user ${userId}:`, starCard);
        
        await db
          .delete(schema.starCards)
          .where(eq(schema.starCards.userId, userId));
        
        // Verify deletion
        const [verifyStarCard] = await db
          .select()
          .from(schema.starCards)
          .where(eq(schema.starCards.userId, userId));
        
        if (verifyStarCard) {
          console.error(`ERROR: Star card still exists after deletion for user ${userId}`);
        } else {
          deletedStarCard = true;
          console.log(`Successfully deleted star card from starCards table for user ${userId}`);
        }
      }
      
      // Delete from userAssessments table if exists
      if (starCardAssessment) {
        console.log(`Found existing star card in userAssessments table for user ${userId}, ID ${starCardAssessment.id}`);
        
        await db
          .delete(schema.userAssessments)
          .where(
            eq(schema.userAssessments.id, starCardAssessment.id)
          );
        
        // Verify deletion
        const verifyAssessment = await db
          .select()
          .from(schema.userAssessments)
          .where(
            eq(schema.userAssessments.id, starCardAssessment.id)
          );
        
        if (verifyAssessment.length > 0) {
          console.error(`ERROR: Star card assessment still exists after deletion for user ${userId}`);
        } else {
          deletedAssessment = true;
          console.log(`Successfully deleted star card from userAssessments table for user ${userId}`);
        }
      }
      
      if (!starCard && !starCardAssessment) {
        console.log(`No star card found in any table for user ${userId}, nothing to delete`);
        return true;
      }
      
      return deletedStarCard || deletedAssessment;
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
      
      // Check original flowAttributes table
      const [flowAttributes] = await db
        .select()
        .from(schema.flowAttributes)
        .where(eq(schema.flowAttributes.userId, userId));
      
      // Also check userAssessments table where flow attributes are now stored
      const assessments = await db
        .select()
        .from(schema.userAssessments)
        .where(
          eq(schema.userAssessments.userId, userId)
        );
      
      const flowAssessment = assessments.find(a => a.assessmentType === 'flowAttributes');
      
      let deletedFlowAttributes = false;
      let deletedAssessment = false;
      
      // Delete from flowAttributes table if exists
      if (flowAttributes) {
        console.log(`Found existing flow attributes in flowAttributes table for user ${userId}:`, flowAttributes);
        
        await db
          .delete(schema.flowAttributes)
          .where(eq(schema.flowAttributes.userId, userId));
        
        // Verify deletion
        const [verifyFlowAttributes] = await db
          .select()
          .from(schema.flowAttributes)
          .where(eq(schema.flowAttributes.userId, userId));
        
        if (verifyFlowAttributes) {
          console.error(`ERROR: Flow attributes still exist after deletion for user ${userId}`);
        } else {
          deletedFlowAttributes = true;
          console.log(`Successfully deleted flow attributes from flowAttributes table for user ${userId}`);
        }
      }
      
      // Delete from userAssessments table if exists
      if (flowAssessment) {
        console.log(`Found existing flow attributes in userAssessments table for user ${userId}, ID ${flowAssessment.id}`);
        
        await db
          .delete(schema.userAssessments)
          .where(
            eq(schema.userAssessments.id, flowAssessment.id)
          );
        
        // Verify deletion
        const verifyAssessment = await db
          .select()
          .from(schema.userAssessments)
          .where(
            eq(schema.userAssessments.id, flowAssessment.id)
          );
        
        if (verifyAssessment.length > 0) {
          console.error(`ERROR: Flow attributes assessment still exists after deletion for user ${userId}`);
        } else {
          deletedAssessment = true;
          console.log(`Successfully deleted flow attributes from userAssessments table for user ${userId}`);
        }
      }
      
      if (!flowAttributes && !flowAssessment) {
        console.log(`No flow attributes found in any table for user ${userId}, nothing to delete`);
        return true;
      }
      
      return deletedFlowAttributes || deletedAssessment;
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
      
      // Update the user's progress to 0
      await db
        .update(schema.users)
        .set({ progress: 0 })
        .where(eq(schema.users.id, userId));
      
      // Verify the update
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, userId));
      
      if (!user || user.progress !== 0) {
        console.error(`ERROR: User progress was not reset to 0 for user ${userId}`);
        throw new Error('User progress reset verification failed');
      }
      
      console.log(`Successfully reset progress for user ${userId}`);
      return true;
    } catch (error) {
      console.error(`Error in resetUserProgress for user ${userId}:`, error);
      throw error;
    }
  }
}