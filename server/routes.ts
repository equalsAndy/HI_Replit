import express from 'express';
import * as schema from '@shared/schema';
import { db } from './db';
import { eq, and, desc, asc, isNull, like } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { authRouter } from './routes/auth-routes';
import { authRegisterRouter } from './routes/auth-routes-register';
import { inviteRouter } from './routes/invite-routes';
import { z } from 'zod';

// Create a router
export const router = express.Router();

// Use specific route modules
router.use('/auth', authRouter);
router.use('/auth', authRegisterRouter);
router.use('/invites', inviteRouter);

// API health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Get user profile (protected route)
router.get('/user/profile', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const user = await db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        name: schema.users.name,
        email: schema.users.email,
        role: schema.users.role,
        organization: schema.users.organization,
        jobTitle: schema.users.jobTitle,
        profilePicture: schema.users.profilePicture,
        createdAt: schema.users.createdAt
      })
      .from(schema.users)
      .where(eq(schema.users.id, req.session.userId));

    if (!user || user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(user[0]);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile (protected route)
router.patch('/user/profile', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Define what fields can be updated
  const updateSchema = z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    organization: z.string().nullable().optional(),
    jobTitle: z.string().nullable().optional()
  });

  try {
    const validatedData = updateSchema.parse(req.body);
    
    // Update the user
    await db.update(schema.users)
      .set({
        ...validatedData,
        updatedAt: new Date()
      })
      .where(eq(schema.users.id, req.session.userId));
    
    // Fetch updated user
    const updatedUser = await db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        name: schema.users.name,
        email: schema.users.email,
        role: schema.users.role,
        organization: schema.users.organization,
        jobTitle: schema.users.jobTitle,
        profilePicture: schema.users.profilePicture,
        createdAt: schema.users.createdAt,
        updatedAt: schema.users.updatedAt
      })
      .from(schema.users)
      .where(eq(schema.users.id, req.session.userId));
    
    return res.status(200).json(updatedUser[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error updating user profile:', error);
    return res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Change password (protected route)
router.post('/user/change-password', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const passwordSchema = z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string()
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

  try {
    const { currentPassword, newPassword } = passwordSchema.parse(req.body);
    
    // Get current user with password
    const user = await db.select()
      .from(schema.users)
      .where(eq(schema.users.id, req.session.userId));
    
    if (!user || user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user[0].password);
    
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await db.update(schema.users)
      .set({
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(schema.users.id, req.session.userId));
    
    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error changing password:', error);
    return res.status(500).json({ error: 'Failed to change password' });
  }
});

// Update profile picture (protected route)
router.post('/user/profile-picture', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { profilePicture } = req.body;
    
    if (!profilePicture) {
      return res.status(400).json({ error: 'Profile picture is required' });
    }
    
    // Update profile picture
    await db.update(schema.users)
      .set({
        profilePicture,
        updatedAt: new Date()
      })
      .where(eq(schema.users.id, req.session.userId));
    
    return res.status(200).json({ message: 'Profile picture updated successfully' });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    return res.status(500).json({ error: 'Failed to update profile picture' });
  }
});

// Add remaining API routes below
// ...