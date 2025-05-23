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
    
    console.log(`=== RESET ENDPOINT: Resetting data for user ${userId} ===`);
    
    // Set response content type to JSON
    res.setHeader('Content-Type', 'application/json');
    
    // Use the reset service to handle all reset operations
    const resetService = new ResetService();
    const result = await resetService.resetAllUserData(userId);
    
    console.log(`Reset operation completed with result:`, result);
    
    if (result.success) {
      return res.status(200).json({ 
        success: true,
        message: 'User data reset successfully',
        userId: userId,
        deletions: result.deletions
      });
    } else {
      return res.status(500).json({ 
        success: false,
        message: 'User data reset partially failed',
        userId: userId,
        deletions: result.deletions,
        dataRemaining: result.dataRemaining,
        error: result.error
      });
    }
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
    
    console.log(`=== RESET ENDPOINT: Resetting data for user ${userId} via GET ===`);
    
    // Set proper content type header
    res.setHeader('Content-Type', 'application/json');
    
    // Use the reset service to handle all reset operations
    const resetService = new ResetService();
    const result = await resetService.resetAllUserData(userId);
    
    console.log(`Reset operation completed with result:`, result);
    
    if (result.success) {
      return res.status(200).json({ 
        success: true,
        message: 'User data reset successfully',
        userId: userId,
        deletions: result.deletions
      });
    } else {
      return res.status(500).json({ 
        success: false,
        message: 'User data reset partially failed',
        userId: userId,
        deletions: result.deletions,
        dataRemaining: result.dataRemaining,
        error: result.error
      });
    }
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