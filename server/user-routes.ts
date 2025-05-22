import { Router, Request, Response } from 'express';
import { storage } from './storage';
import { z } from 'zod';

export const userRouter = Router();

// Get current user profile
userRouter.get('/profile', async (req: Request, res: Response) => {
  try {
    // Get user ID from cookie
    const userId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
    
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Get user details
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user roles
    const roles = await storage.getUserRoles(userId);
    
    // Return user with roles
    return res.json({
      ...user,
      role: roles.length > 0 ? roles[0] : null
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user profile
userRouter.put('/update', async (req: Request, res: Response) => {
  try {
    // Get user ID from cookie
    const userId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
    
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Validate request body
    const updateProfileSchema = z.object({
      name: z.string().optional(),
      email: z.string().email().nullish(),
      title: z.string().nullish(),
      organization: z.string().nullish(),
    });
    
    const updateData = updateProfileSchema.parse(req.body);
    
    // Update user
    const updatedUser = await storage.updateUser(userId, updateData);
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return updated user
    return res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Invalid input data', 
        errors: error.errors 
      });
    }
    
    return res.status(500).json({ message: 'Internal server error' });
  }
});