import { Router, Request, Response } from 'express';
import { storage } from './new-storage';
import { z } from 'zod';
import { db } from './db';
import * as schema from '../shared/schema';
import { eq } from 'drizzle-orm';
import { UserRole } from '@shared/types';

export const userRouter = Router();

// Get current user profile
userRouter.get('/profile', async (req: Request, res: Response) => {
  try {
    // Get user ID from cookie
    const userId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
    
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    console.log(`Getting profile for user ID: ${userId}`);
    
    // Get user details directly from database
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));
    
    if (!user) {
      console.log(`User not found with ID: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user roles directly from database
    const roles = await db
      .select({ role: schema.userRoles.role })
      .from(schema.userRoles)
      .where(eq(schema.userRoles.userId, userId));
    
    console.log(`Found roles for user ${userId}:`, roles);
    
    // Remove password from user data
    const { password, ...userWithoutPassword } = user;
    
    // Return user with roles
    return res.json({
      ...userWithoutPassword,
      role: roles.length > 0 ? roles[0].role : UserRole.Participant
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
    
    console.log(`Updating profile for user ID: ${userId}`);
    
    // Validate request body
    const updateProfileSchema = z.object({
      name: z.string().optional(),
      email: z.string().email().nullish(),
      title: z.string().nullish(),
      organization: z.string().nullish(),
    });
    
    const updateData = updateProfileSchema.parse(req.body);
    
    console.log(`Update data:`, updateData);
    
    // Update user directly in database
    const [updatedUser] = await db
      .update(schema.users)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(schema.users.id, userId))
      .returning();
    
    if (!updatedUser) {
      console.log(`Failed to update user with ID: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user roles
    const roles = await db
      .select({ role: schema.userRoles.role })
      .from(schema.userRoles)
      .where(eq(schema.userRoles.userId, userId));
    
    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    
    // Return updated user with role
    return res.json({
      ...userWithoutPassword,
      role: roles.length > 0 ? roles[0].role : UserRole.Participant
    });
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