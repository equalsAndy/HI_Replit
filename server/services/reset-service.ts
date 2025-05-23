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
      
      // Check if star card exists
      const [starCard] = await db
        .select()
        .from(schema.starCards)
        .where(eq(schema.starCards.userId, userId));
      
      if (starCard) {
        console.log(`Found existing star card for user ${userId}:`, starCard);
        
        // Delete the star card
        await db
          .delete(schema.starCards)
          .where(eq(schema.starCards.userId, userId));
        
        // Verify deletion by checking if record still exists
        const [verifyStarCard] = await db
          .select()
          .from(schema.starCards)
          .where(eq(schema.starCards.userId, userId));
        
        if (verifyStarCard) {
          console.error(`ERROR: Star card still exists after deletion for user ${userId}`);
          throw new Error('Star card deletion verification failed');
        }
        
        console.log(`Successfully deleted star card for user ${userId}`);
        return true;
      } else {
        console.log(`No star card found for user ${userId}, nothing to delete`);
        return true; // Still counts as success since there's nothing to delete
      }
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
      
      // Check if flow attributes exist
      const [flowAttributes] = await db
        .select()
        .from(schema.flowAttributes)
        .where(eq(schema.flowAttributes.userId, userId));
      
      if (flowAttributes) {
        console.log(`Found existing flow attributes for user ${userId}:`, flowAttributes);
        
        // Delete the flow attributes
        await db
          .delete(schema.flowAttributes)
          .where(eq(schema.flowAttributes.userId, userId));
        
        // Verify deletion by checking if record still exists
        const [verifyFlowAttributes] = await db
          .select()
          .from(schema.flowAttributes)
          .where(eq(schema.flowAttributes.userId, userId));
        
        if (verifyFlowAttributes) {
          console.error(`ERROR: Flow attributes still exist after deletion for user ${userId}`);
          throw new Error('Flow attributes deletion verification failed');
        }
        
        console.log(`Successfully deleted flow attributes for user ${userId}`);
        return true;
      } else {
        console.log(`No flow attributes found for user ${userId}, nothing to delete`);
        return true; // Still counts as success since there's nothing to delete
      }
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