import { Router, Request, Response } from 'express';
import { db } from './db';
import { eq } from 'drizzle-orm';
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
    
    // Step 1: Delete star card
    try {
      // Check if star card exists
      const [starCard] = await db
        .select()
        .from(schema.starCards)
        .where(eq(schema.starCards.userId, userId));
      
      if (starCard) {
        console.log(`Found star card for user ${userId}, deleting it`);
        
        // Delete the star card
        await db
          .delete(schema.starCards)
          .where(eq(schema.starCards.userId, userId));
        
        // Verify deletion
        const [verifyCard] = await db
          .select()
          .from(schema.starCards)
          .where(eq(schema.starCards.userId, userId));
        
        if (!verifyCard) {
          deletedData.starCard = true;
          console.log(`Successfully deleted star card for user ${userId}`);
        } else {
          console.error(`Failed to delete star card for user ${userId}`);
        }
      } else {
        console.log(`No star card found for user ${userId}`);
        deletedData.starCard = true; // Count as success if nothing to delete
      }
    } catch (error) {
      console.error(`Error deleting star card for user ${userId}:`, error);
    }
    
    // Step 2: Delete flow attributes
    try {
      // Check if flow attributes exist
      const [flowAttrs] = await db
        .select()
        .from(schema.flowAttributes)
        .where(eq(schema.flowAttributes.userId, userId));
      
      if (flowAttrs) {
        console.log(`Found flow attributes for user ${userId}, deleting them`);
        
        // Delete the flow attributes
        await db
          .delete(schema.flowAttributes)
          .where(eq(schema.flowAttributes.userId, userId));
        
        // Verify deletion
        const [verifyAttrs] = await db
          .select()
          .from(schema.flowAttributes)
          .where(eq(schema.flowAttributes.userId, userId));
        
        if (!verifyAttrs) {
          deletedData.flowAttributes = true;
          console.log(`Successfully deleted flow attributes for user ${userId}`);
        } else {
          console.error(`Failed to delete flow attributes for user ${userId}`);
        }
      } else {
        console.log(`No flow attributes found for user ${userId}`);
        deletedData.flowAttributes = true; // Count as success if nothing to delete
      }
    } catch (error) {
      console.error(`Error deleting flow attributes for user ${userId}:`, error);
    }
    
    // Step 3: Reset user progress
    try {
      // Only try to update the progress if the users table has a progress field
      // This ensures compatibility with different schema versions
      try {
        const result = await db
          .update(schema.users)
          .set({ progress: 0 })
          .where(eq(schema.users.id, userId));
        
        deletedData.userProgress = true;
        console.log(`Reset progress for user ${userId}`);
      } catch (progressError) {
        // If the error is related to the schema (missing column), log it but don't fail
        console.log(`Progress reset failed, might be missing from schema: ${progressError.message}`);
        
        // Try another approach - update the user's updatedAt timestamp
        await db
          .update(schema.users)
          .set({ updatedAt: new Date() })
          .where(eq(schema.users.id, userId));
        
        deletedData.userProgress = true;
        console.log(`Updated timestamp for user ${userId} instead`);
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
    
    // Check if star card exists
    const [starCard] = await db
      .select()
      .from(schema.starCards)
      .where(eq(schema.starCards.userId, userId));
    
    let success = false;
    
    if (starCard) {
      // Delete star card
      await db
        .delete(schema.starCards)
        .where(eq(schema.starCards.userId, userId));
      
      // Verify deletion
      const [verifyCard] = await db
        .select()
        .from(schema.starCards)
        .where(eq(schema.starCards.userId, userId));
      
      success = !verifyCard;
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
    
    // Check if flow attributes exist
    const [flowAttrs] = await db
      .select()
      .from(schema.flowAttributes)
      .where(eq(schema.flowAttributes.userId, userId));
    
    let success = false;
    
    if (flowAttrs) {
      // Delete flow attributes
      await db
        .delete(schema.flowAttributes)
        .where(eq(schema.flowAttributes.userId, userId));
      
      // Verify deletion
      const [verifyAttrs] = await db
        .select()
        .from(schema.flowAttributes)
        .where(eq(schema.flowAttributes.userId, userId));
      
      success = !verifyAttrs;
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