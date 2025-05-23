import { db } from './db';

/**
 * Special reset utility that uses direct SQL to ensure data deletion
 */
export class SQLReset {
  /**
   * Reset all user data completely using direct SQL
   * @param userId The user ID to reset data for
   * @returns Results of the operation
   */
  public static async resetAllUserData(userId: number) {
    if (isNaN(userId) || userId <= 0) {
      throw new Error('Invalid user ID');
    }
    
    console.log(`=== SQL RESET: Beginning direct SQL reset for user ${userId} ===`);
    
    const starCardResult = await this.deleteStarCardData(userId);
    const flowResult = await this.deleteFlowAttributes(userId);
    const progressResult = await this.resetUserProgress(userId);
    
    return {
      success: starCardResult.success && flowResult.success && progressResult.success,
      operations: {
        starCard: starCardResult,
        flowAttributes: flowResult,
        userProgress: progressResult
      }
    };
  }
  
  /**
   * Delete star card data using direct SQL
   */
  private static async deleteStarCardData(userId: number) {
    try {
      console.log(`SQL RESET: Deleting star_cards for user ${userId}`);
      
      // Check if data exists first
      const result = await db.execute(
        `SELECT EXISTS(SELECT 1 FROM star_cards WHERE user_id = ${userId})`
      );
      const exists = result.rows && result.rows[0] && result.rows[0].exists;
      
      if (!exists) {
        console.log(`SQL RESET: No star card found for user ${userId}`);
        return { success: true, deleted: false, message: 'No data to delete' };
      }
      
      // Delete the data
      await db.execute(
        `DELETE FROM star_cards WHERE user_id = $1`,
        [userId]
      );
      
      // Verify deletion
      const verifyResult = await db.execute(
        `SELECT EXISTS(SELECT 1 FROM star_cards WHERE user_id = $1)`,
        [userId]
      );
      const stillExists = verifyResult.rows && verifyResult.rows[0] && verifyResult.rows[0].exists;
      
      if (stillExists) {
        console.error(`SQL RESET: Failed to delete star card for user ${userId}`);
        return { success: false, deleted: false, message: 'Failed to delete data' };
      }
      
      console.log(`SQL RESET: Successfully deleted star card for user ${userId}`);
      return { success: true, deleted: true, message: 'Data deleted successfully' };
    } catch (error) {
      console.error(`SQL RESET: Error deleting star card: ${error}`);
      return { 
        success: false, 
        deleted: false, 
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  /**
   * Delete flow attributes using direct SQL
   */
  private static async deleteFlowAttributes(userId: number) {
    try {
      console.log(`SQL RESET: Deleting flow_attributes for user ${userId}`);
      
      // Check if data exists first
      const result = await db.execute(
        `SELECT EXISTS(SELECT 1 FROM flow_attributes WHERE user_id = $1)`,
        [userId]
      );
      const exists = result.rows && result.rows[0] && result.rows[0].exists;
      
      if (!exists) {
        console.log(`SQL RESET: No flow attributes found for user ${userId}`);
        return { success: true, deleted: false, message: 'No data to delete' };
      }
      
      // Delete the data
      await db.execute(
        `DELETE FROM flow_attributes WHERE user_id = $1`,
        [userId]
      );
      
      // Verify deletion
      const verifyResult = await db.execute(
        `SELECT EXISTS(SELECT 1 FROM flow_attributes WHERE user_id = $1)`,
        [userId]
      );
      const stillExists = verifyResult.rows && verifyResult.rows[0] && verifyResult.rows[0].exists;
      
      if (stillExists) {
        console.error(`SQL RESET: Failed to delete flow attributes for user ${userId}`);
        return { success: false, deleted: false, message: 'Failed to delete data' };
      }
      
      console.log(`SQL RESET: Successfully deleted flow attributes for user ${userId}`);
      return { success: true, deleted: true, message: 'Data deleted successfully' };
    } catch (error) {
      console.error(`SQL RESET: Error deleting flow attributes: ${error}`);
      return { 
        success: false, 
        deleted: false, 
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  /**
   * Reset user progress using direct SQL
   */
  private static async resetUserProgress(userId: number) {
    try {
      console.log(`SQL RESET: Resetting user progress for user ${userId}`);
      
      // Reset the progress
      await db.execute(
        `UPDATE users SET progress = 0 WHERE id = $1`,
        [userId]
      );
      
      // Verify reset
      const result = await db.execute(
        `SELECT progress FROM users WHERE id = $1`,
        [userId]
      );
      
      if (!result.rows || !result.rows[0] || result.rows[0].progress !== 0) {
        console.error(`SQL RESET: Failed to reset progress for user ${userId}`);
        return { success: false, reset: false, message: 'Failed to reset progress' };
      }
      
      console.log(`SQL RESET: Successfully reset progress for user ${userId}`);
      return { success: true, reset: true, message: 'Progress reset successfully' };
    } catch (error) {
      console.error(`SQL RESET: Error resetting user progress: ${error}`);
      return { 
        success: false, 
        reset: false, 
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}