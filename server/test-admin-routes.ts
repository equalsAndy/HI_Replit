import { Router, Request, Response } from 'express';
import { storage } from './storage.js';
import { db } from './db.js';
import { eq } from 'drizzle-orm';
import * as schema from '../shared/schema.js';

// Create a router for test admin routes
const testAdminRouter = Router();

// This endpoint is for development/testing purposes only
// It allows us to log in as a specific test user
testAdminRouter.get('/login-as/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId) || userId < 1 || userId > 5) {
      return res.status(400).json({ message: 'Invalid user ID. Must be between 1 and 5.' });
    }
    
    // Check if the user exists
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Set a cookie to "log in" as this user
    res.cookie('userId', userId.toString(), {
      httpOnly: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax',
      secure: false // Allow cookies on non-HTTPS for development
    });
    
    // Set noAutoLogin to make sure we stay logged in as this user
    res.cookie('noAutoLogin', 'true', {
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.status(200).json({
      message: `Logged in as ${user.name}`,
      user: {
        id: user.id,
        name: user.name,
        isAdmin: user.id === 1 // User with ID 1 is considered admin
      }
    });
  } catch (error) {
    console.error('Error in login-as route:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset user data endpoint - for development testing
testAdminRouter.post('/reset/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    console.log(`=== RESET START: Resetting data for user ${userId} ===`);
    
    // Set response content type to JSON
    res.setHeader('Content-Type', 'application/json');
    
    let deletedStarCard = false;
    let deletedFlowAttrs = false;
    
    // Step 1: Completely delete star card data
    try {
      const [starCard] = await db
        .select()
        .from(schema.starCards)
        .where(eq(schema.starCards.userId, userId));
        
      if (starCard) {
        console.log(`Found star card for user ${userId}:`, starCard);
        
        const deleteResult = await db
          .delete(schema.starCards)
          .where(eq(schema.starCards.userId, userId));
          
        console.log(`Delete star card result:`, deleteResult);
        
        // Verify deletion by checking if record still exists
        const [verifyStarCard] = await db
          .select()
          .from(schema.starCards)
          .where(eq(schema.starCards.userId, userId));
          
        if (verifyStarCard) {
          console.error(`ERROR: Star card still exists after delete for user ${userId}:`, verifyStarCard);
          throw new Error('Star card deletion failed - record still exists');
        } else {
          deletedStarCard = true;
          console.log(`Successfully verified star card deletion for user ${userId}`);
        }
      } else {
        console.log(`No star card found for user ${userId}`);
      }
    } catch (error) {
      console.error(`Error deleting star card for user ${userId}:`, error);
      throw error;
    }
    
    // Step 2: Completely delete flow attributes
    try {
      const [flowAttrs] = await db
        .select()
        .from(schema.flowAttributes)
        .where(eq(schema.flowAttributes.userId, userId));
        
      if (flowAttrs) {
        console.log(`Found flow attributes for user ${userId}:`, flowAttrs);
        
        const deleteResult = await db
          .delete(schema.flowAttributes)
          .where(eq(schema.flowAttributes.userId, userId));
          
        console.log(`Delete flow attributes result:`, deleteResult);
        
        // Verify deletion by checking if record still exists
        const [verifyFlowAttrs] = await db
          .select()
          .from(schema.flowAttributes)
          .where(eq(schema.flowAttributes.userId, userId));
          
        if (verifyFlowAttrs) {
          console.error(`ERROR: Flow attributes still exist after delete for user ${userId}:`, verifyFlowAttrs);
          throw new Error('Flow attributes deletion failed - record still exists');
        } else {
          deletedFlowAttrs = true;
          console.log(`Successfully verified flow attributes deletion for user ${userId}`);
        }
      } else {
        console.log(`No flow attributes found for user ${userId}`);
      }
    } catch (error) {
      console.error(`Error deleting flow attributes for user ${userId}:`, error);
      throw error;
    }
    
    // Step 3: Reset user progress
    await db
      .update(schema.users)
      .set({ progress: 0 })
      .where(eq(schema.users.id, userId));
    
    console.log(`Reset complete for user ${userId}`);
    
    return res.status(200).json({ 
      success: true,
      message: 'User data reset successfully',
      userId: userId,
      deletedData: {
        starCard: deletedStarCard,
        flowAttributes: deletedFlowAttrs,
        userProgress: true
      }
    });
  } catch (error) {
    console.error('Error resetting user data:', error);
    
    // Set content type to ensure JSON response
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(500).json({ 
      success: false,
      message: 'Error resetting user data',
      error: error instanceof Error ? (error as Error).message : 'Unknown error'
    });
  }
});

// Direct reset API endpoint with proper headers
testAdminRouter.get('/reset-data/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    console.log(`Resetting data for user ${userId} via GET`);
    
    // First check if star card exists
    const [starCard] = await db
      .select()
      .from(schema.starCards)
      .where(eq(schema.starCards.userId, userId));
      
    if (starCard) {
      console.log(`Found and deleting star card for user ${userId}:`, starCard);
      // Delete star card data
      await db
        .delete(schema.starCards)
        .where(eq(schema.starCards.userId, userId));
    } else {
      console.log(`No star card found for user ${userId}`);
    }
    
    // Check if flow attributes exist
    const [flowAttrs] = await db
      .select()
      .from(schema.flowAttributes)
      .where(eq(schema.flowAttributes.userId, userId));
      
    if (flowAttrs) {
      console.log(`Found and deleting flow attributes for user ${userId}:`, flowAttrs);
      // Delete flow attributes data
      await db
        .delete(schema.flowAttributes)
        .where(eq(schema.flowAttributes.userId, userId));
    } else {
      console.log(`No flow attributes found for user ${userId}`);
    }
    
    // Reset user progress
    await db
      .update(schema.users)
      .set({ progress: 0 })
      .where(eq(schema.users.id, userId));
    
    // Set proper content type header
    res.setHeader('Content-Type', 'application/json');
    
    // Return JSON response
    return res.status(200).json({ 
      success: true,
      message: 'User data reset successfully',
      userId: userId
    });
  } catch (error) {
    console.error('Error resetting user data:', error);
    
    // Set proper content type header
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(500).json({ 
      success: false,
      message: 'Error resetting user data',
      error: error instanceof Error ? (error as Error).message : 'Unknown error'
    });
  }
});

export { testAdminRouter };