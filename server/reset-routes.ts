import { Router, Request, Response } from 'express';
import { db } from './db';
import { eq, and, sql } from 'drizzle-orm';
import * as schema from '../shared/schema';

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
    
    // Track what was deleted for response
    const deletedData = {
      starCard: false,
      flowAttributes: false,
      userProgress: false
    };
    
    console.log(`=== RESET: Starting data reset for user ${userId} ===`);
    
    // Step 1: Delete star card assessment
    try {
      // Check if star card exists in userAssessments
      const starCards = await db
        .select()
        .from(schema.userAssessments)
        .where(
          and(
            eq(schema.userAssessments.userId, userId),
            eq(schema.userAssessments.assessmentType, 'starCard')
          )
        );
      
      if (starCards && starCards.length > 0) {
        console.log(`Found ${starCards.length} star card assessments for user ${userId}, deleting them`);
        
        // Delete the star card assessments
        await db
          .delete(schema.userAssessments)
          .where(
            and(
              eq(schema.userAssessments.userId, userId),
              eq(schema.userAssessments.assessmentType, 'starCard')
            )
          );
        
        // Verify deletion
        const verifyCards = await db
          .select()
          .from(schema.userAssessments)
          .where(
            and(
              eq(schema.userAssessments.userId, userId),
              eq(schema.userAssessments.assessmentType, 'starCard')
            )
          );
        
        if (!verifyCards || verifyCards.length === 0) {
          deletedData.starCard = true;
          console.log(`Successfully deleted star card assessments for user ${userId}`);
        } else {
          console.error(`Failed to delete star card assessments for user ${userId}`);
        }
      } else {
        console.log(`No star card assessments found for user ${userId}`);
        deletedData.starCard = true; // Count as success if nothing to delete
      }
    } catch (error) {
      console.error(`Error deleting star card assessments for user ${userId}:`, error);
    }
    
    // Step 2: Delete flow attributes assessment
    try {
      // Check if flow attributes exist in userAssessments
      const flowAttrs = await db
        .select()
        .from(schema.userAssessments)
        .where(
          and(
            eq(schema.userAssessments.userId, userId),
            eq(schema.userAssessments.assessmentType, 'flowAttributes')
          )
        );
      
      if (flowAttrs && flowAttrs.length > 0) {
        console.log(`Found ${flowAttrs.length} flow attribute assessments for user ${userId}, deleting them`);
        
        // Delete the flow attributes assessments
        await db
          .delete(schema.userAssessments)
          .where(
            and(
              eq(schema.userAssessments.userId, userId),
              eq(schema.userAssessments.assessmentType, 'flowAttributes')
            )
          );
        
        // Verify deletion
        const verifyAttrs = await db
          .select()
          .from(schema.userAssessments)
          .where(
            and(
              eq(schema.userAssessments.userId, userId),
              eq(schema.userAssessments.assessmentType, 'flowAttributes')
            )
          );
        
        if (!verifyAttrs || verifyAttrs.length === 0) {
          deletedData.flowAttributes = true;
          console.log(`Successfully deleted flow attribute assessments for user ${userId}`);
        } else {
          console.error(`Failed to delete flow attribute assessments for user ${userId}`);
        }
      } else {
        console.log(`No flow attribute assessments found for user ${userId}`);
        deletedData.flowAttributes = true; // Count as success if nothing to delete
      }
    } catch (error) {
      console.error(`Error deleting flow attribute assessments for user ${userId}:`, error);
    }
    
    // Step 3: Reset user progress and navigation
    try {
      // Clear navigation progress and update timestamp
      await db
        .update(schema.users)
        .set({ 
          navigationProgress: null,
          updatedAt: new Date() 
        })
        .where(eq(schema.users.id, userId));
      
      deletedData.userProgress = true;
      console.log(`Cleared navigation progress and updated timestamp for user ${userId}`);
      
      // If workshop participation data exists, delete that too
      try {
        // Try to reset workshop participation data
        await db.execute(sql`DELETE FROM workshop_participation WHERE user_id = ${userId}`);
        console.log(`Deleted workshop participation for user ${userId}`);
      } catch (err) {
        console.log(`No workshop participation found for user ${userId} or table does not exist`);
      }
    } catch (error) {
      console.error(`Error resetting progress for user ${userId}:`, error);
    }
    
    console.log(`=== RESET: Completed data reset for user ${userId} ===`);
    
    // Return success response with details about what was deleted
    return res.status(200).json({
      success: true,
      message: 'User data reset successfully',
      userId: userId,
      deletedData: deletedData
    });
  } catch (error) {
    console.error('Error in reset endpoint:', error);
    
    // Force content type to JSON
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(500).json({
      success: false,
      message: 'Failed to reset user data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Reset just the star card for a user
 */
resetRouter.post('/user/:userId/starcard', async (req: Request, res: Response) => {
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
    
    // Check if star card exists in userAssessments
    const starCards = await db
      .select()
      .from(schema.userAssessments)
      .where(
        and(
          eq(schema.userAssessments.userId, userId),
          eq(schema.userAssessments.assessmentType, 'starCard')
        )
      );
    
    let success = false;
    
    if (starCards && starCards.length > 0) {
      // Delete star card assessments
      await db
        .delete(schema.userAssessments)
        .where(
          and(
            eq(schema.userAssessments.userId, userId),
            eq(schema.userAssessments.assessmentType, 'starCard')
          )
        );
      
      // Verify deletion
      const verifyCards = await db
        .select()
        .from(schema.userAssessments)
        .where(
          and(
            eq(schema.userAssessments.userId, userId),
            eq(schema.userAssessments.assessmentType, 'starCard')
          )
        );
      
      success = !verifyCards || verifyCards.length === 0;
    } else {
      // Nothing to delete
      success = true;
    }
    
    return res.status(200).json({
      success,
      message: success ? 'Star card reset successfully' : 'Failed to reset star card'
    });
  } catch (error) {
    console.error('Error resetting star card:', error);
    
    // Force content type to JSON
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(500).json({
      success: false,
      message: 'Failed to reset star card',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Reset just the flow attributes for a user
 */
resetRouter.post('/user/:userId/flow', async (req: Request, res: Response) => {
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
    
    // Check if flow attributes exist in userAssessments
    const flowAttrs = await db
      .select()
      .from(schema.userAssessments)
      .where(
        and(
          eq(schema.userAssessments.userId, userId),
          eq(schema.userAssessments.assessmentType, 'flowAttributes')
        )
      );
    
    let success = false;
    
    if (flowAttrs && flowAttrs.length > 0) {
      // Delete flow attributes assessments
      await db
        .delete(schema.userAssessments)
        .where(
          and(
            eq(schema.userAssessments.userId, userId),
            eq(schema.userAssessments.assessmentType, 'flowAttributes')
          )
        );
      
      // Verify deletion
      const verifyAttrs = await db
        .select()
        .from(schema.userAssessments)
        .where(
          and(
            eq(schema.userAssessments.userId, userId),
            eq(schema.userAssessments.assessmentType, 'flowAttributes')
          )
        );
      
      success = !verifyAttrs || verifyAttrs.length === 0;
    } else {
      // Nothing to delete
      success = true;
    }
    
    return res.status(200).json({
      success,
      message: success ? 'Flow attributes reset successfully' : 'Failed to reset flow attributes'
    });
  } catch (error) {
    console.error('Error resetting flow attributes:', error);
    
    // Force content type to JSON
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(500).json({
      success: false,
      message: 'Failed to reset flow attributes',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { resetRouter };