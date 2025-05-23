import { db } from '../db';
import { eq } from 'drizzle-orm';
import * as schema from '../../shared/schema';

/**
 * Service that handles all user data reset operations
 */
export class ResetService {
  /**
   * Reset all user data completely, deleting records from the database
   * @param userId The user ID to reset data for
   * @returns Object with results of reset operations 
   */
  public async resetAllUserData(userId: number): Promise<ResetResult> {
    if (isNaN(userId) || userId <= 0) {
      throw new Error('Invalid user ID');
    }

    console.log(`=== RESET SERVICE: Starting complete data reset for user ${userId} ===`);
    
    // Initialize the reset result
    const result: ResetResult = {
      success: false,
      userId: userId,
      deletions: {
        starCard: false,
        flowAttributes: false,
        userProgress: false
      },
      dataRemaining: {}
    };

    // Wrap everything in try/catch for proper error handling
    try {
      // 1. Reset star card data
      await this.resetStarCard(userId, result);
      
      // 2. Reset flow attributes
      await this.resetFlowAttributes(userId, result);
      
      // 3. Reset user progress
      await this.resetUserProgress(userId, result);
      
      // 4. Perform final verification to ensure all data is reset
      await this.verifyReset(userId, result);
      
      // If we got here without errors and all checks passed, the reset was successful
      result.success = !Object.values(result.deletions).includes(false);
      
      console.log(`=== RESET SERVICE: Reset completed for user ${userId} ===`);
      console.log('Reset result:', result);
      
      return result;
    } catch (error) {
      console.error(`=== RESET SERVICE: Error during reset for user ${userId} ===`, error);
      
      // Include the error in the result
      result.error = error instanceof Error ? error.message : 'Unknown error';
      
      return result;
    }
  }
  
  /**
   * Reset the star card data for a user
   */
  private async resetStarCard(userId: number, result: ResetResult): Promise<void> {
    console.log(`Resetting star card for user ${userId}`);
    
    try {
      // Check if star card exists
      const [starCard] = await db
        .select()
        .from(schema.starCards)
        .where(eq(schema.starCards.userId, userId));
        
      if (starCard) {
        console.log(`Found star card for user ${userId}:`, starCard);
        
        // Delete the star card
        const deleteResult = await db
          .delete(schema.starCards)
          .where(eq(schema.starCards.userId, userId));
          
        console.log(`Star card delete result:`, deleteResult);
        
        // Verify deletion by checking if record still exists
        const [verifyCard] = await db
          .select()
          .from(schema.starCards)
          .where(eq(schema.starCards.userId, userId));
          
        if (verifyCard) {
          console.error(`VERIFICATION FAILED: Star card still exists after deletion:`, verifyCard);
          result.deletions.starCard = false;
          result.dataRemaining.starCard = verifyCard;
        } else {
          // Successfully deleted
          result.deletions.starCard = true;
          console.log(`Star card deletion verified for user ${userId}`);
        }
      } else {
        // No record found, so nothing to delete
        console.log(`No star card found for user ${userId}`);
        result.deletions.starCard = true;
      }
    } catch (error) {
      console.error(`Error resetting star card for user ${userId}:`, error);
      result.deletions.starCard = false;
      result.error = `Star card reset error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      throw error;
    }
  }
  
  /**
   * Reset the flow attributes for a user
   */
  private async resetFlowAttributes(userId: number, result: ResetResult): Promise<void> {
    console.log(`Resetting flow attributes for user ${userId}`);
    
    try {
      // Check if flow attributes exist
      const [flowAttrs] = await db
        .select()
        .from(schema.flowAttributes)
        .where(eq(schema.flowAttributes.userId, userId));
        
      if (flowAttrs) {
        console.log(`Found flow attributes for user ${userId}:`, flowAttrs);
        
        // Delete the flow attributes
        const deleteResult = await db
          .delete(schema.flowAttributes)
          .where(eq(schema.flowAttributes.userId, userId));
          
        console.log(`Flow attributes delete result:`, deleteResult);
        
        // Verify deletion by checking if record still exists
        const [verifyAttrs] = await db
          .select()
          .from(schema.flowAttributes)
          .where(eq(schema.flowAttributes.userId, userId));
          
        if (verifyAttrs) {
          console.error(`VERIFICATION FAILED: Flow attributes still exist after deletion:`, verifyAttrs);
          result.deletions.flowAttributes = false;
          result.dataRemaining.flowAttributes = verifyAttrs;
        } else {
          // Successfully deleted
          result.deletions.flowAttributes = true;
          console.log(`Flow attributes deletion verified for user ${userId}`);
        }
      } else {
        // No record found, so nothing to delete
        console.log(`No flow attributes found for user ${userId}`);
        result.deletions.flowAttributes = true;
      }
    } catch (error) {
      console.error(`Error resetting flow attributes for user ${userId}:`, error);
      result.deletions.flowAttributes = false;
      result.error = `Flow attributes reset error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      throw error;
    }
  }
  
  /**
   * Reset the user progress
   */
  private async resetUserProgress(userId: number, result: ResetResult): Promise<void> {
    console.log(`Resetting progress for user ${userId}`);
    
    try {
      // Reset user progress
      const updateResult = await db
        .update(schema.users)
        .set({ progress: 0 })
        .where(eq(schema.users.id, userId));
      
      console.log(`User progress update result:`, updateResult);
      
      // Verify that progress was reset to 0
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, userId));
        
      if (user && user.progress === 0) {
        result.deletions.userProgress = true;
        console.log(`User progress reset verified for user ${userId}`);
      } else {
        console.error(`VERIFICATION FAILED: User progress was not reset to 0:`, user?.progress);
        result.deletions.userProgress = false;
        result.dataRemaining.userProgress = user?.progress;
      }
    } catch (error) {
      console.error(`Error resetting user progress for user ${userId}:`, error);
      result.deletions.userProgress = false;
      result.error = `User progress reset error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      throw error;
    }
  }
  
  /**
   * Do a final verification that all data was actually deleted/reset
   */
  private async verifyReset(userId: number, result: ResetResult): Promise<void> {
    console.log(`Performing final verification for user ${userId}`);
    
    // Get current state of all data related to this user
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));
      
    const [starCard] = await db
      .select()
      .from(schema.starCards)
      .where(eq(schema.starCards.userId, userId));
      
    const [flowAttrs] = await db
      .select()
      .from(schema.flowAttributes)
      .where(eq(schema.flowAttributes.userId, userId));
    
    // Log the verification results
    console.log(`Verification results for user ${userId}:`);
    console.log(`- User progress: ${user?.progress === 0 ? 'RESET ✓' : 'NOT RESET ✗'}`);
    console.log(`- Star card: ${!starCard ? 'DELETED ✓' : 'STILL EXISTS ✗'}`);
    console.log(`- Flow attributes: ${!flowAttrs ? 'DELETED ✓' : 'STILL EXISTS ✗'}`);
    
    // Update the result with verification data
    if (starCard) {
      result.deletions.starCard = false;
      result.dataRemaining.starCard = starCard;
    }
    
    if (flowAttrs) {
      result.deletions.flowAttributes = false;
      result.dataRemaining.flowAttributes = flowAttrs;
    }
    
    if (user && user.progress !== 0) {
      result.deletions.userProgress = false;
      result.dataRemaining.userProgress = user.progress;
    }
  }
}

/**
 * Interface defining the structure of a reset operation result
 */
export interface ResetResult {
  success: boolean;
  userId: number;
  deletions: {
    starCard: boolean;
    flowAttributes: boolean;
    userProgress: boolean;
  };
  dataRemaining: Record<string, any>;
  error?: string;
}