import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { UserRole } from '../../shared/types';
import { db } from '../db';
import * as schema from '../../shared/schema';
import { eq, inArray } from 'drizzle-orm';
import { isValidInviteCodeFormat } from '../utils/invite-code';
import { InviteService } from '../services/invite-service';
import { UserManagementService } from '../services/user-management-service';

// Create router for authentication routes
const authRouter = Router();

// Username validation pattern
const usernamePattern = /^[a-z0-9][a-z0-9_\-]*[a-z0-9]$/i;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

// Reserved usernames
const RESERVED_USERNAMES = [
  'admin', 'system', 'test', 'support', 'help', 'api', 'root'
];

// User login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const loginSchema = z.object({
      identifier: z.string().min(1, 'Username or email is required'),
      password: z.string().min(1, 'Password is required'),
    });
    
    const { identifier, password } = loginSchema.parse(req.body);
    
    console.log(`Login attempt for identifier: ${identifier}`);
    
    // Try to find user by username or email
    const isEmail = identifier.includes('@');
    
    // Get user from database based on identifier (username or email)
    const [user] = isEmail 
      ? await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.email, identifier))
      : await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.username, identifier));
    
    if (!user) {
      console.log(`User not found: ${identifier}`);
      return res.status(401).json({ message: 'Invalid username/email or password' });
    }
    
    // Check if user has been soft-deleted
    if (user.deletedAt) {
      return res.status(401).json({ message: 'Account has been deactivated' });
    }
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      console.log(`Invalid password for user: ${identifier}`);
      return res.status(401).json({ message: 'Invalid username/email or password' });
    }
    
    // Get user roles
    const roles = await db
      .select({ role: schema.userRoles.role })
      .from(schema.userRoles)
      .where(eq(schema.userRoles.userId, user.id));
    
    console.log(`Found roles for user:`, roles);
    
    // Add role to user object
    const userWithRole = {
      ...user,
      role: roles.length > 0 ? roles[0].role : UserRole.Participant
    };
    
    // Set cookie with user ID
    res.cookie('userId', user.id.toString(), {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'strict',
    });
    
    // Return user data (excluding password)
    const { password: _, ...userDataWithoutPassword } = userWithRole;
    
    console.log(`Login successful for user with role: ${userDataWithoutPassword.role}`);
    res.status(200).json(userDataWithoutPassword);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify invite code
authRouter.post('/verify-invite', async (req: Request, res: Response) => {
  try {
    const inviteSchema = z.object({
      inviteCode: z.string().min(12, 'Invalid invite code format').max(12),
    });
    
    const { inviteCode } = inviteSchema.parse(req.body);
    
    // Validate invite code format
    if (!isValidInviteCodeFormat(inviteCode)) {
      return res.status(400).json({ message: 'Invalid invite code format' });
    }
    
    // Get invite details
    const invite = await InviteService.getInviteByCode(inviteCode);
    
    if (!invite) {
      return res.status(404).json({ message: 'Invite code not found' });
    }
    
    if (invite.isExpired) {
      return res.status(400).json({ message: 'Invite code has expired' });
    }
    
    // Return invite details (for profile creation)
    res.status(200).json({
      valid: true,
      invite: {
        name: invite.name,
        email: invite.email,
        expiresAt: invite.expiresAt
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error('Error verifying invite code:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register with invite code
authRouter.post('/register-with-invite', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const registerSchema = z.object({
      inviteCode: z.string().min(12, 'Invalid invite code').max(12),
      username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username cannot exceed 20 characters')
        .regex(usernamePattern, 'Username must start and end with letter or number, and contain only letters, numbers, underscores, and hyphens')
        .refine(value => !RESERVED_USERNAMES.includes(value.toLowerCase()), 'This username is reserved'),
      password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(passwordPattern, 'Password must include uppercase, lowercase, number, and special character'),
      name: z.string().min(1, 'Name is required'),
      organization: z.string().max(30).optional(),
      jobTitle: z.string().max(30).optional(),
      profilePicture: z.string().optional(),
    });
    
    const userData = registerSchema.parse(req.body);
    
    // Check if username already exists
    const isAvailable = await UserManagementService.isUsernameAvailable(userData.username);
    
    if (!isAvailable) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Register user with invite code
    const newUser = await UserManagementService.registerWithInviteCode(
      userData.inviteCode,
      {
        username: userData.username,
        password: userData.password,
        name: userData.name,
        organization: userData.organization,
        jobTitle: userData.jobTitle,
        profilePicture: userData.profilePicture
      }
    );
    
    // Set cookie with user ID
    res.cookie('userId', newUser.id.toString(), {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'strict',
    });
    
    // Return user data (excluding password)
    const { password: _, ...userDataWithoutPassword } = newUser;
    
    res.status(201).json(userDataWithoutPassword);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error('Error registering user with invite:', error);
    
    // Provide more specific error messages
    if (error.message === 'Invalid invite code' || error.message === 'Invite code has expired') {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// User logout
authRouter.post('/logout', (req: Request, res: Response) => {
  // Clear user ID cookie
  res.clearCookie('userId');
  
  res.status(200).json({ message: 'Logged out successfully' });
});

// Get current user
authRouter.get('/profile', async (req: Request, res: Response) => {
  try {
    // Get user ID from cookie
    const userId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
    
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Get user details
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has been soft-deleted
    if (user.deletedAt) {
      return res.status(401).json({ message: 'Account has been deactivated' });
    }
    
    // Get user roles
    const [userRole] = await db
      .select()
      .from(schema.userRoles)
      .where(eq(schema.userRoles.userId, userId));
    
    // Return user data (excluding password)
    const { password: _, ...userDataWithoutPassword } = user;
    
    res.status(200).json({
      ...userDataWithoutPassword,
      role: userRole?.role || UserRole.Participant
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
authRouter.put('/profile', async (req: Request, res: Response) => {
  try {
    // Get user ID from cookie
    const userId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
    
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Validate request body
    const updateSchema = z.object({
      name: z.string().min(1, 'Name is required').optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      organization: z.string().max(30).optional(),
      jobTitle: z.string().max(30).optional(),
      profilePicture: z.string().optional(),
    });
    
    const updateData = updateSchema.parse(req.body);
    
    // Update profile
    const updatedUser = await UserManagementService.updateUserProfile(userId, updateData);
    
    // Return updated user data
    res.status(200).json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
authRouter.put('/change-password', async (req: Request, res: Response) => {
  try {
    // Get user ID from cookie
    const userId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
    
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Validate request body
    const passwordSchema = z.object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(passwordPattern, 'Password must include uppercase, lowercase, number, and special character'),
    });
    
    const { currentPassword, newPassword } = passwordSchema.parse(req.body);
    
    // Change password
    await UserManagementService.changePassword(userId, currentPassword, newPassword);
    
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    
    if (error.message === 'Current password is incorrect') {
      return res.status(400).json({ message: error.message });
    }
    
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Validate username
authRouter.post('/validate-username', async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ valid: false, message: 'Username is required' });
    }
    
    // Check length
    if (username.length < 3 || username.length > 20) {
      return res.status(200).json({ 
        valid: false, 
        message: 'Username must be between 3 and 20 characters' 
      });
    }
    
    // Check format
    if (!usernamePattern.test(username)) {
      return res.status(200).json({ 
        valid: false, 
        message: 'Username must start and end with letter or number, and contain only letters, numbers, underscores, and hyphens' 
      });
    }
    
    // Check if reserved
    if (RESERVED_USERNAMES.includes(username.toLowerCase())) {
      return res.status(200).json({ valid: false, message: 'This username is reserved' });
    }
    
    // Check if already exists
    const isAvailable = await UserManagementService.isUsernameAvailable(username);
    
    if (!isAvailable) {
      return res.status(200).json({ valid: false, message: 'Username already exists' });
    }
    
    res.status(200).json({ valid: true });
  } catch (error) {
    console.error('Error validating username:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available test users (for development purposes)
authRouter.get('/test-users', async (req, res) => {
  try {
    // Get all test users directly from the database
    const users = await db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        name: schema.users.name
      })
      .from(schema.users)
      .where(inArray(schema.users.username, ['admin', 'facilitator', 'user1', 'user2', 'user3', 'user4', 'user5']));
    
    // Get all roles
    const userIds = users.map(user => user.id);
    const roles = await db
      .select()
      .from(schema.userRoles)
      .where(inArray(schema.userRoles.userId, userIds));
    
    // Map users with their roles
    const simplifiedUsers = users.map(user => {
      const userRole = roles.find(role => role.userId === user.id);
      return {
        username: user.username,
        role: userRole ? userRole.role : 'participant',
        name: user.name
      };
    });
    
    res.json(simplifiedUsers);
  } catch (error) {
    console.error('Error fetching test users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export { authRouter };