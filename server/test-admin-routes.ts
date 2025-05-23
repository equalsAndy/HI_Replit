import { Router, Request, Response } from 'express';
import { storage } from './new-storage';
import { db } from './db';
import { eq } from 'drizzle-orm';
import * as schema from '../shared/schema';

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
    
    // Execute direct SQL deletion operations
    let starCardDeleted = false;
    let flowAttributesDeleted = false;
    let progressReset = false;
    
    try {
      // 1. Delete star card with direct SQL
      console.log(`Executing direct SQL to delete star card for user ${userId}`);
      await db.execute(`DELETE FROM star_cards WHERE user_id = ${userId}`);
      starCardDeleted = true;
    } catch (err) {
      console.error(`Error deleting star card for user ${userId}:`, err);
    }
    
    try {
      // 2. Delete flow attributes with direct SQL
      console.log(`Executing direct SQL to delete flow attributes for user ${userId}`);
      await db.execute(`DELETE FROM flow_attributes WHERE user_id = ${userId}`);
      flowAttributesDeleted = true;
    } catch (err) {
      console.error(`Error deleting flow attributes for user ${userId}:`, err);
    }
    
    try {
      // 3. Reset user progress with direct SQL
      console.log(`Executing direct SQL to reset progress for user ${userId}`);
      await db.execute(`UPDATE users SET progress = 0 WHERE id = ${userId}`);
      progressReset = true;
    } catch (err) {
      console.error(`Error resetting user progress for user ${userId}:`, err);
    }
    
    // Verify the deletion worked
    const success = starCardDeleted && flowAttributesDeleted && progressReset;
    
    console.log(`Reset operation completed for user ${userId}. Success: ${success}`);
    
    return res.status(200).json({ 
      success: success,
      message: success ? 'User data reset successfully' : 'User data reset partially failed',
      userId: userId,
      operations: {
        starCard: starCardDeleted,
        flowAttributes: flowAttributesDeleted,
        userProgress: progressReset
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
    
    // Execute direct SQL deletion operations
    let starCardDeleted = false;
    let flowAttributesDeleted = false;
    let progressReset = false;
    
    try {
      // 1. Delete star card with direct SQL
      console.log(`Executing direct SQL to delete star card for user ${userId}`);
      await db.execute(`DELETE FROM star_cards WHERE user_id = ${userId}`);
      starCardDeleted = true;
    } catch (err) {
      console.error(`Error deleting star card for user ${userId}:`, err);
    }
    
    try {
      // 2. Delete flow attributes with direct SQL
      console.log(`Executing direct SQL to delete flow attributes for user ${userId}`);
      await db.execute(`DELETE FROM flow_attributes WHERE user_id = ${userId}`);
      flowAttributesDeleted = true;
    } catch (err) {
      console.error(`Error deleting flow attributes for user ${userId}:`, err);
    }
    
    try {
      // 3. Reset user progress with direct SQL
      console.log(`Executing direct SQL to reset progress for user ${userId}`);
      await db.execute(`UPDATE users SET progress = 0 WHERE id = ${userId}`);
      progressReset = true;
    } catch (err) {
      console.error(`Error resetting user progress for user ${userId}:`, err);
    }
    
    // Verify the deletion worked
    const success = starCardDeleted && flowAttributesDeleted && progressReset;
    
    console.log(`Reset operation completed for user ${userId}. Success: ${success}`);
    
    return res.status(200).json({ 
      success: success,
      message: success ? 'User data reset successfully' : 'User data reset partially failed',
      userId: userId,
      operations: {
        starCard: starCardDeleted,
        flowAttributes: flowAttributesDeleted,
        userProgress: progressReset
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