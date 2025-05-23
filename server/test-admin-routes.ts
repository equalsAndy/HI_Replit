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
testAdminRouter.post('/reset-data/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    console.log(`Resetting data for user ${userId}`);
    
    // Delete star card data
    await db
      .delete(schema.starCards)
      .where(eq(schema.starCards.userId, userId));
    
    // Delete flow attributes data
    await db
      .delete(schema.flowAttributes)
      .where(eq(schema.flowAttributes.userId, userId));
    
    // Reset user progress
    await db
      .update(schema.users)
      .set({ progress: 0 })
      .where(eq(schema.users.id, userId));
    
    res.status(200).json({ 
      message: 'User data reset successfully',
      userId: userId
    });
  } catch (error) {
    console.error('Error resetting user data:', error);
    res.status(500).json({ message: 'Error resetting user data' });
  }
});

export { testAdminRouter };