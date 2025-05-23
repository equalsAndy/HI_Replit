import { db } from './db';
import { eq } from 'drizzle-orm';
import * as schema from '../shared/schema';
import { debugLog } from './middlewares/debug-logger';

/**
 * DirectReset utility for ensuring complete data deletion during reset operations
 */
export class DirectReset {
  /**
   * Completely reset all data for a specific user ID
   * @param userId The user ID to reset data for
   * @returns Result of reset operation
   */
  public static async resetUserData(userId: number): Promise<ResetResult> {
    if (isNaN(userId) || userId <= 0) {
      throw new Error('Invalid user ID');
    }
    
    const result: ResetResult = {
      success: false,
      userId,
      operations: {
        starCard: false,
        flowAttributes: false,
        userProgress: false
      }
    };
    
    try {
      // 1. Delete star card
      result.operations.starCard = await this.resetStarCard(userId);
      
      // 2. Delete flow attributes
      result.operations.flowAttributes = await this.resetFlowAttributes(userId);
      
      // 3. Reset user progress
      result.operations.userProgress = await this.resetUserProgress(userId);
      
      // Determine overall success
      result.success = Object.values(result.operations).every(v => v === true);
      
      return result;
    } catch (error) {
      debugLog(`Error in DirectReset.resetUserData: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.error = error instanceof Error ? error.message : 'Unknown error';
      return result;
    }
  }
  
  /**
   * Reset star card data for a user
   */
  private static async resetStarCard(userId: number): Promise<boolean> {
    try {
      debugLog(`Directly resetting star card data for user ${userId}`);
      
      // Execute direct SQL to ensure deletion works
      await db.execute(`
        DELETE FROM "star_cards" 
        WHERE "user_id" = ${userId}
      `);
      
      // Verify deletion
      const [checkCard] = await db
        .select()
        .from(schema.starCards)
        .where(eq(schema.starCards.userId, userId));
        
      if (checkCard) {
        debugLog(`VERIFICATION FAILED: Star card still exists after deletion for user ${userId}`);
        return false;
      }
      
      debugLog(`Star card data successfully reset for user ${userId}`);
      return true;
    } catch (error) {
      debugLog(`Error resetting star card data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }
  
  /**
   * Reset flow attributes data for a user
   */
  private static async resetFlowAttributes(userId: number): Promise<boolean> {
    try {
      debugLog(`Directly resetting flow attributes data for user ${userId}`);
      
      // Execute direct SQL to ensure deletion works
      await db.execute(`
        DELETE FROM "flow_attributes"
        WHERE "user_id" = ${userId}
      `);
      
      // Verify deletion
      const [checkAttrs] = await db
        .select()
        .from(schema.flowAttributes)
        .where(eq(schema.flowAttributes.userId, userId));
        
      if (checkAttrs) {
        debugLog(`VERIFICATION FAILED: Flow attributes still exist after deletion for user ${userId}`);
        return false;
      }
      
      debugLog(`Flow attributes data successfully reset for user ${userId}`);
      return true;
    } catch (error) {
      debugLog(`Error resetting flow attributes data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }
  
  /**
   * Reset user progress
   */
  private static async resetUserProgress(userId: number): Promise<boolean> {
    try {
      debugLog(`Directly resetting user progress for user ${userId}`);
      
      // Execute direct SQL to ensure update works
      await db.execute(`
        UPDATE "users"
        SET "progress" = 0
        WHERE "id" = ${userId}
      `);
      
      // Verify progress is reset
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, userId));
        
      if (!user || user.progress !== 0) {
        debugLog(`VERIFICATION FAILED: User progress was not reset for user ${userId}`);
        return false;
      }
      
      debugLog(`User progress successfully reset for user ${userId}`);
      return true;
    } catch (error) {
      debugLog(`Error resetting user progress: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }
}

/**
 * Interface for reset operation result
 */
export interface ResetResult {
  success: boolean;
  userId: number;
  operations: {
    starCard: boolean;
    flowAttributes: boolean;
    userProgress: boolean;
  };
  error?: string;
}