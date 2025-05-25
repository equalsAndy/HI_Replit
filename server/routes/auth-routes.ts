import express, { Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import * as schema from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { UserManagementService } from '../services/user-management-service';
import { InviteService } from '../services/invite-service';
import { isAuthenticated } from '../middleware/auth';
import { isValidInviteCodeFormat } from '../utils/invite-code';

const router = express.Router();

/**
 * Login route
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const loginSchema = z.object({
      email: z.string().email(),
      password: z.string().min(8)
    });
    
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        message: 'Invalid login data', 
        errors: result.error.errors
      });
    }
    
    const { email, password } = result.data;
    
    // Check if user exists
    const user = await UserManagementService.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Verify password
    const isPasswordValid = await UserManagementService.verifyPassword(user, password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Get user role
    const [userRole] = await db
      .select()
      .from(schema.userRoles)
      .where(eq(schema.userRoles.userId, user.id));
    
    // Set session cookie
    res.cookie('userId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Login successful',
      user: {
        ...userWithoutPassword,
        role: userRole?.role || 'participant'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Logout route
 */
router.post('/logout', (req: Request, res: Response) => {
  // Clear the session cookie
  res.clearCookie('userId');
  
  res.json({ message: 'Logout successful' });
});

/**
 * Register with invite code route
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const registerSchema = z.object({
      email: z.string().email(),
      username: z.string().min(3),
      password: z.string().min(8),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      organization: z.string().optional(),
      jobTitle: z.string().optional(),
      inviteCode: z.string().length(12)
    });
    
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        message: 'Invalid registration data', 
        errors: result.error.errors
      });
    }
    
    const { inviteCode } = result.data;
    
    // Validate invite code format
    if (!isValidInviteCodeFormat(inviteCode)) {
      return res.status(400).json({ message: 'Invalid invite code format' });
    }
    
    // Validate the invite
    const validation = await InviteService.validateInvite(inviteCode);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }
    
    // Check if email is already in use
    const existingUser = await UserManagementService.getUserByEmail(result.data.email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }
    
    // Register the user with the invite code
    const user = await UserManagementService.registerWithInviteCode(result.data);
    
    // Set session cookie
    res.cookie('userId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.status(201).json({
      message: 'Registration successful',
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

/**
 * Get current user route
 */
router.get('/me', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Get updated user data
    const user = await UserManagementService.getUserById(req.user.id);
    
    if (!user) {
      res.clearCookie('userId');
      return res.status(401).json({ message: 'User not found' });
    }
    
    res.json({
      user
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Update user profile route
 */
router.put('/profile', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const profileSchema = z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      organization: z.string().optional(),
      jobTitle: z.string().optional(),
      profilePicture: z.string().optional()
    });
    
    const result = profileSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        message: 'Invalid profile data', 
        errors: result.error.errors
      });
    }
    
    // Update user profile
    const updatedUser = await UserManagementService.updateProfile(req.user.id, result.data);
    
    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

/**
 * Change password route
 */
router.put('/change-password', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const passwordSchema = z.object({
      currentPassword: z.string().min(8),
      newPassword: z.string().min(8)
    });
    
    const result = passwordSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        message: 'Invalid password data', 
        errors: result.error.errors
      });
    }
    
    const { currentPassword, newPassword } = result.data;
    
    // Change the password
    const success = await UserManagementService.changePassword(
      req.user.id,
      currentPassword,
      newPassword
    );
    
    if (!success) {
      return res.status(400).json({ message: 'Failed to change password' });
    }
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

export const authRouter = router;