import { Router, Request, Response } from 'express';
import { ResetService } from '../services/reset-service.ts';
import { workshopStepData, users } from '../../shared/schema.js';
import { eq, isNull } from 'drizzle-orm';

console.log('🔴 RESET ROUTES FILE LOADED!');

// Create a router for data reset operations
const resetRouter = Router();

// Test route to verify the reset router is working
resetRouter.get('/test', (req, res) => {
  res.json({ message: 'Reset router is working!', timestamp: new Date().toISOString() });
});

/**
 * Reset all user data - API endpoint
 * This endpoint handles complete data reset for a user,
 * deleting star card data, flow attributes, and resetting progress
 */
resetRouter.post('/user/:userId', async (req: Request, res: Response) => {
  try {
    console.log('🔴 RESET ROUTE CALLED for userId:', req.params.userId);
    console.log('🔴 Request session:', req.session);
    console.log('🔴 Request cookies:', req.cookies);
    
    // Force content type to JSON
    res.setHeader('Content-Type', 'application/json');
    
    const userId = parseInt(req.params.userId);
    console.log('🔴 Parsed userId:', userId);
    
    if (isNaN(userId)) {
      console.log('🔴 Invalid userId, returning 400');
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
    console.log('🔴 Current user ID:', currentUserId);
    
    if (!currentUserId) {
      console.log('🔴 No currentUserId, returning 401');
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    console.log('🔴 Checking permissions: currentUserId:', currentUserId, 'userId:', userId);
    if (currentUserId !== userId && currentUserId !== 1) {
      console.log('🔴 Permission denied, returning 403');
      return res.status(403).json({
        success: false,
        message: 'You can only reset your own data'
      });
    }
    console.log('🔴 Permission check passed, proceeding with reset');
    
    // Use direct SQL for guaranteed deletion
    try {
      // Import DB connection and SQL helpers
      const { db } = await import('../db');
      const { sql } = await import('drizzle-orm');
      
      // Delete data from all relevant tables for complete reset
      
      // 1. Delete from user_assessments
      console.log('🔴 STARTING database deletion for user:', userId);
      const userAssessmentsResult = await db.execute(sql`DELETE FROM user_assessments WHERE user_id = ${userId}`);
      console.log(`🔴 Deleted from user_assessments for user ${userId}, result:`, userAssessmentsResult);
      
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
      
      // 5. Delete from reflection_responses table
      try {
        await db.execute(sql`DELETE FROM reflection_responses WHERE user_id = ${userId}`);
        console.log(`Deleted from reflection_responses for user ${userId}`);
      } catch (err) {
        console.log(`No reflection_responses data or table for user ${userId}`);
      }
      
      // 6. Reset workshop step data (hybrid approach: hard delete for test users, soft delete for production)
      console.log(`=== STARTING HYBRID RESET for user ${userId} ===`);
      try {
        console.log(`=== IMPORTS SUCCESSFUL ===`);
        
        // Get user info to determine reset strategy
        const user = await db.select({ isTestUser: users.isTestUser })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        
        if (user.length === 0) {
          console.error(`User ${userId} not found for workshop data reset`);
        } else {
          const isTestUser = user[0].isTestUser;
          console.log(`=== RESET STRATEGY: User ${userId} isTestUser: ${isTestUser} ===`);
          
          if (isTestUser) {
            // Hard delete for test users (no recovery needed)
            console.log(`=== ATTEMPTING HARD DELETE for test user ${userId} ===`);
            const result = await db.delete(workshopStepData)
              .where(eq(workshopStepData.userId, userId));
            console.log(`=== HARD DELETE: Permanently deleted workshop data for test user ${userId} ===`);
            console.log(`Hard deletion result:`, result);
          } else {
            // Soft delete for production users (recovery possible)
            console.log(`=== ATTEMPTING SOFT DELETE for production user ${userId} ===`);
            const result = await db.update(workshopStepData)
              .set({ 
                deletedAt: new Date(),
                updatedAt: new Date()
              })
              .where(eq(workshopStepData.userId, userId));
            console.log(`=== SOFT DELETE: Marked workshop data as deleted for production user ${userId} ===`);
            console.log(`Soft deletion result:`, result);
          }
        }
      } catch (err) {
        console.error(`ERROR resetting workshop data for user ${userId}:`, err);
      }
      
      // 7. Clear navigation progress from users table
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