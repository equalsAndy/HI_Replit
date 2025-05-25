import express, { Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import * as schema from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { inviteService } from '../services/invite-service';
import { userManagementService } from '../services/user-management-service';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

// Register with invite code
router.post('/register', async (req: Request, res: Response) => {
  try {
    // Define validation schema for registration with invite code
    const registerSchema = z.object({
      username: z.string().min(3, 'Username must be at least 3 characters'),
      email: z.string().email('Valid email is required'),
      password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
          'Password must include at least one uppercase letter, one lowercase letter, and one number'
        ),
      inviteCode: z.string().min(12).max(12),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      organization: z.string().optional(),
      jobTitle: z.string().optional(),
    });

    const data = registerSchema.parse(req.body);
    
    // Verify invite code is valid and unused
    const inviteData = await inviteService.verifyInviteCode(data.inviteCode);
    if (!inviteData) {
      return res.status(400).json({ error: 'Invalid or expired invite code' });
    }

    // Check if username or email already exists
    const existingUser = await db.query.users.findFirst({
      where: (users) => {
        return eq(users.username, data.username);
      },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const existingEmail = await db.query.users.findFirst({
      where: (users) => {
        return eq(users.email, data.email);
      },
    });

    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    // Create user with role from invite
    const newUser = await userManagementService.createUser({
      username: data.username,
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      organization: data.organization || null,
      jobTitle: data.jobTitle || null,
      role: inviteData.role,
      cohortId: inviteData.cohortId,
    });

    // Mark invite as used
    await inviteService.markInviteAsUsed(data.inviteCode, newUser.id);

    // Set up session
    req.session.userId = newUser.id;
    req.session.userRole = newUser.role;
    req.session.username = newUser.username;

    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      organization: newUser.organization,
      jobTitle: newUser.jobTitle,
      role: newUser.role,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Registration failed',
    });
  }
});

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const loginSchema = z.object({
      username: z.string(),
      password: z.string(),
    });

    const { username, password } = loginSchema.parse(req.body);

    // Find user by username
    const user = await db.query.users.findFirst({
      where: (users) => {
        return eq(users.username, username);
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Set up session
    req.session.userId = user.id;
    req.session.userRole = user.role;
    req.session.username = user.username;

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      organization: user.organization,
      jobTitle: user.jobTitle,
      role: user.role,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Login failed',
    });
  }
});

// Logout endpoint
router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logged out successfully' });
  });
});

// Get current user
router.get('/me', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await db.query.users.findFirst({
      where: (users) => {
        return eq(users.id, userId);
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      organization: user.organization,
      jobTitle: user.jobTitle,
      role: user.role,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get user',
    });
  }
});

// Change password
router.post('/change-password', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const passwordSchema = z.object({
      currentPassword: z.string(),
      newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
          'Password must include at least one uppercase letter, one lowercase letter, and one number'
        ),
    });

    const { currentPassword, newPassword } = passwordSchema.parse(req.body);
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Find user
    const user = await db.query.users.findFirst({
      where: (users) => {
        return eq(users.id, userId);
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await db
      .update(schema.users)
      .set({ password: hashedPassword })
      .where(eq(schema.users.id, userId));

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to change password',
    });
  }
});

export { router as authRouter };