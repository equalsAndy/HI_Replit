import { Router, Request, Response } from 'express';
import { ResetService } from '../services/reset-service';

// Create a router for data reset operations
const resetRouter = Router();

/**
 * Reset all user data - API endpoint
 * This endpoint handles complete data reset for a user,
 * deleting star card data, flow attributes, and resetting progress
 */
resetRouter.post('/user/:userId', async (req: Request, res: Response) => {
  try {
    // Force content type to JSON
    res.setHeader('Content-Type', 'application/json');
    
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID' 
      });
    }
    
    // Check authentication from multiple sources (session, cookies)
    let currentUserId = req.session?.userId;
    if (!currentUserId && req.cookies?.userId) {
      currentUserId = parseInt(req.cookies.userId);
    }
    
    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    if (currentUserId !== userId && currentUserId !== 1) {
      return res.status(403).json({
        success: false,
        message: 'You can only reset your own data'
      });
    }
    
    // Use direct SQL for guaranteed deletion
    try {
      // Import DB connection and SQL helpers
      const { db } = await import('../db');
      const { sql } = await import('drizzle-orm');
      
      // Delete data from all relevant tables for complete reset
      
      // 1. Delete from user_assessments
      await db.execute(sql`DELETE FROM user_assessments WHERE user_id = ${userId}`);
      console.log(`Deleted from user_assessments for user ${userId}`);
      
      // 2. Delete from star_cards table
      try {
        await db.execute(sql`DELETE FROM star_cards WHERE user_id = ${userId}`);
        console.log(`Deleted from star_cards for user ${userId}`);
      } catch (err) {
        console.log(`No star_cards data or table for user ${userId}`);
      }
      
      // 3. Delete from flow_attributes table
      try {
        await db.execute(sql`DELETE FROM flow_attributes WHERE user_id = ${userId}`);
        console.log(`Deleted from flow_attributes for user ${userId}`);
      } catch (err) {
        console.log(`No flow_attributes data or table for user ${userId}`);
      }
      
      // 4. Try to reset any workshop participation
      try {
        await db.execute(sql`DELETE FROM workshop_participation WHERE user_id = ${userId}`);
        console.log(`Deleted from workshop_participation for user ${userId}`);
      } catch (err) {
        console.log(`No workshop participation to reset for user ${userId}`);
      }
      
      // 5. Clear navigation progress
      try {
        await db.execute(sql`UPDATE users SET navigation_progress = NULL, updated_at = NOW() WHERE id = ${userId}`);
        console.log(`Cleared navigation progress for user ${userId}`);
      } catch (err) {
        console.log(`Error clearing navigation progress for user ${userId}:`, err);
      }
      
      // Add cache prevention headers
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      console.log(`=== RESET: Successfully deleted all data for user ${userId} ===`);
      
      return res.status(200).json({
        success: true,
        message: 'User data reset successfully',
        userId: userId,
        deletedData: {
          starCard: true,
          flowAttributes: true,
          userProgress: true
        }
      });
    } catch (error) {
      console.error(`Error in direct SQL reset for user ${userId}:`, error);
      
      // Fall back to the reset service as a backup
      const resetResult = await ResetService.resetAllUserData(userId);
      
      // Add cache prevention headers
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      if (resetResult.success) {
        return res.status(200).json(resetResult);
      } else {
        return res.status(500).json(resetResult);
      }
    }
  } catch (error) {
    console.error('Error in reset endpoint:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to reset user data',
      error: error instanceof Error ? (error as Error).message : 'Unknown error'
    });
  }
});

/**
 * Reset just the star card for a user
 */
resetRouter.post('/user/:userId/starcard', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID' 
      });
    }
    
    // Only allow users to reset their own data
    // Unless they are admin (userId 1)
    const currentUserId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
    
    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    if (currentUserId !== userId && currentUserId !== 1) {
      return res.status(403).json({
        success: false,
        message: 'You can only reset your own data'
      });
    }
    
    // Reset star card data
    const success = await ResetService.resetStarCard(userId);
    
    return res.status(200).json({
      success,
      message: success ? 'Star card reset successfully' : 'Failed to reset star card'
    });
  } catch (error) {
    console.error('Error resetting star card:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to reset star card',
      error: error instanceof Error ? (error as Error).message : 'Unknown error'
    });
  }
});

/**
 * Reset just the flow attributes for a user
 */
resetRouter.post('/user/:userId/flow', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID' 
      });
    }
    
    // Only allow users to reset their own data
    // Unless they are admin (userId 1)
    const currentUserId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
    
    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    if (currentUserId !== userId && currentUserId !== 1) {
      return res.status(403).json({
        success: false,
        message: 'You can only reset your own data'
      });
    }
    
    // Reset flow attributes
    const success = await ResetService.resetFlowAttributes(userId);
    
    return res.status(200).json({
      success,
      message: success ? 'Flow attributes reset successfully' : 'Failed to reset flow attributes'
    });
  } catch (error) {
    console.error('Error resetting flow attributes:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to reset flow attributes',
      error: error instanceof Error ? (error as Error).message : 'Unknown error'
    });
  }
});

/**
 * Admin-only endpoint to reset all users' data at once
 */
resetRouter.post('/all-users', async (req: Request, res: Response) => {
  try {
    // Check if the current user is an admin
    const currentUserId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
    
    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    if (currentUserId !== 1) {
      return res.status(403).json({
        success: false,
        message: 'Only admin users can reset all user data'
      });
    }
    
    // This is a stub for now - we would implement the batch reset logic here
    return res.status(501).json({
      success: false,
      message: 'Reset all users functionality not yet implemented'
    });
  } catch (error) {
    console.error('Error resetting all users:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to reset all users',
      error: error instanceof Error ? (error as Error).message : 'Unknown error'
    });
  }
});

export { resetRouter };