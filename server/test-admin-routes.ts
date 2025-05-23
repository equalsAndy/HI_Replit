import { Router, Request, Response } from 'express';
import { storage } from './new-storage';
import { db } from './db';
import { eq } from 'drizzle-orm';
import * as schema from '../shared/schema';
import { ResetService } from './services/reset-service';

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
    
    console.log(`=== RESET ENDPOINT: Starting data reset for user ${userId} ===`);
    
    // Set response content type to JSON
    res.setHeader('Content-Type', 'application/json');
    
    // Manually reset the data since the service approach appears to have issues
    let deletedStarCard = false;
    let deletedFlowAttrs = false;
    let resetUserProgress = false;
    
    // 1. Reset star card data
    try {
      const [starCard] = await db
        .select()
        .from(schema.starCards)
        .where(eq(schema.starCards.userId, userId));
      
      if (starCard) {
        console.log(`Found star card for user ${userId}:`, starCard);
        
        await db
          .delete(schema.starCards)
          .where(eq(schema.starCards.userId, userId));
          
        // Verify deletion
        const [checkCard] = await db
          .select()
          .from(schema.starCards)
          .where(eq(schema.starCards.userId, userId));
          
        if (!checkCard) {
          deletedStarCard = true;
          console.log(`Star card deleted successfully for user ${userId}`);
        } else {
          console.error(`Failed to delete star card for user ${userId}`);
        }
      } else {
        deletedStarCard = true; // Nothing to delete
        console.log(`No star card found for user ${userId}`);
      }
    } catch (error) {
      console.error(`Error deleting star card:`, error);
    }
    
    // 2. Reset flow attributes
    try {
      const [flowAttrs] = await db
        .select()
        .from(schema.flowAttributes)
        .where(eq(schema.flowAttributes.userId, userId));
      
      if (flowAttrs) {
        console.log(`Found flow attributes for user ${userId}:`, flowAttrs);
        
        await db
          .delete(schema.flowAttributes)
          .where(eq(schema.flowAttributes.userId, userId));
          
        // Verify deletion
        const [checkAttrs] = await db
          .select()
          .from(schema.flowAttributes)
          .where(eq(schema.flowAttributes.userId, userId));
          
        if (!checkAttrs) {
          deletedFlowAttrs = true;
          console.log(`Flow attributes deleted successfully for user ${userId}`);
        } else {
          console.error(`Failed to delete flow attributes for user ${userId}`);
        }
      } else {
        deletedFlowAttrs = true; // Nothing to delete
        console.log(`No flow attributes found for user ${userId}`);
      }
    } catch (error) {
      console.error(`Error deleting flow attributes:`, error);
    }
    
    // 3. Reset user progress
    try {
      await db
        .update(schema.users)
        .set({ progress: 0 })
        .where(eq(schema.users.id, userId));
        
      // Verify reset
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, userId));
        
      if (user && user.progress === 0) {
        resetUserProgress = true;
        console.log(`User progress reset successfully for user ${userId}`);
      } else {
        console.error(`Failed to reset progress for user ${userId}`);
      }
    } catch (error) {
      console.error(`Error resetting user progress:`, error);
    }
    
    // Determine overall success
    const success = deletedStarCard && deletedFlowAttrs && resetUserProgress;
    
    console.log(`Reset operation completed for user ${userId}. Success: ${success}`);
    
    return res.status(200).json({ 
      success: success,
      message: success ? 'User data reset successfully' : 'User data reset partially failed',
      userId: userId,
      deletions: {
        starCard: deletedStarCard,
        flowAttributes: deletedFlowAttrs,
        userProgress: resetUserProgress
      }
    });
  } catch (error) {
    console.error('Error in reset endpoint:', error);
    
    // Set content type to ensure JSON response
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(500).json({ 
      success: false,
      message: 'Error resetting user data',
      error: error instanceof Error ? error.message : 'Unknown error'
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
    
    console.log(`=== RESET ENDPOINT: Starting data reset for user ${userId} via GET ===`);
    
    // Set proper content type header
    res.setHeader('Content-Type', 'application/json');
    
    // Manually reset the data since the service approach appears to have issues
    let deletedStarCard = false;
    let deletedFlowAttrs = false;
    let resetUserProgress = false;
    
    // 1. Reset star card data
    try {
      const [starCard] = await db
        .select()
        .from(schema.starCards)
        .where(eq(schema.starCards.userId, userId));
      
      if (starCard) {
        console.log(`Found star card for user ${userId}:`, starCard);
        
        await db
          .delete(schema.starCards)
          .where(eq(schema.starCards.userId, userId));
          
        // Verify deletion
        const [checkCard] = await db
          .select()
          .from(schema.starCards)
          .where(eq(schema.starCards.userId, userId));
          
        if (!checkCard) {
          deletedStarCard = true;
          console.log(`Star card deleted successfully for user ${userId}`);
        } else {
          console.error(`Failed to delete star card for user ${userId}`);
        }
      } else {
        deletedStarCard = true; // Nothing to delete
        console.log(`No star card found for user ${userId}`);
      }
    } catch (error) {
      console.error(`Error deleting star card:`, error);
    }
    
    // 2. Reset flow attributes
    try {
      const [flowAttrs] = await db
        .select()
        .from(schema.flowAttributes)
        .where(eq(schema.flowAttributes.userId, userId));
      
      if (flowAttrs) {
        console.log(`Found flow attributes for user ${userId}:`, flowAttrs);
        
        await db
          .delete(schema.flowAttributes)
          .where(eq(schema.flowAttributes.userId, userId));
          
        // Verify deletion
        const [checkAttrs] = await db
          .select()
          .from(schema.flowAttributes)
          .where(eq(schema.flowAttributes.userId, userId));
          
        if (!checkAttrs) {
          deletedFlowAttrs = true;
          console.log(`Flow attributes deleted successfully for user ${userId}`);
        } else {
          console.error(`Failed to delete flow attributes for user ${userId}`);
        }
      } else {
        deletedFlowAttrs = true; // Nothing to delete
        console.log(`No flow attributes found for user ${userId}`);
      }
    } catch (error) {
      console.error(`Error deleting flow attributes:`, error);
    }
    
    // 3. Reset user progress
    try {
      await db
        .update(schema.users)
        .set({ progress: 0 })
        .where(eq(schema.users.id, userId));
        
      // Verify reset
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, userId));
        
      if (user && user.progress === 0) {
        resetUserProgress = true;
        console.log(`User progress reset successfully for user ${userId}`);
      } else {
        console.error(`Failed to reset progress for user ${userId}`);
      }
    } catch (error) {
      console.error(`Error resetting user progress:`, error);
    }
    
    // Determine overall success
    const success = deletedStarCard && deletedFlowAttrs && resetUserProgress;
    
    console.log(`Reset operation completed for user ${userId}. Success: ${success}`);
    
    return res.status(200).json({ 
      success: success,
      message: success ? 'User data reset successfully' : 'User data reset partially failed',
      userId: userId,
      deletions: {
        starCard: deletedStarCard,
        flowAttributes: deletedFlowAttrs,
        userProgress: resetUserProgress
      }
    });
  } catch (error) {
    console.error('Error in reset endpoint:', error);
    
    // Set proper content type header
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(500).json({ 
      success: false,
      message: 'Error resetting user data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { testAdminRouter };