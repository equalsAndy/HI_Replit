import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { UserRole } from '@shared/types';
import { db } from '../db';
import * as schema from '../../shared/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { InviteService } from '../services/invite-service';
import { UserManagementService } from '../services/user-management-service';

// Create a router for admin routes
const adminRouter = Router();

// Role-based middleware helpers
const isAuthenticated = (req: Request): boolean => {
  return !!req.cookies.userId;
};

const getUserRole = async (userId: number): Promise<UserRole | null> => {
  const [userRole] = await db
    .select()
    .from(schema.userRoles)
    .where(eq(schema.userRoles.userId, userId));
  
  return userRole?.role || null;
};

// Middleware to check if user has admin role
const requireAdmin = async (req: Request, res: Response, next: Function) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Get user ID from cookie
    const userId = parseInt(req.cookies.userId);
    
    // Get user role
    const role = await getUserRole(userId);
    
    if (role !== UserRole.Admin) {
      return res.status(403).json({ message: 'Access denied: Admin role required' });
    }
    
    // If user is admin, proceed to the next middleware/route handler
    next();
  } catch (error) {
    console.error('Error in admin authentication:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Middleware to check if user has facilitator role (or admin)
const requireFacilitator = async (req: Request, res: Response, next: Function) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Get user ID from cookie
    const userId = parseInt(req.cookies.userId);
    
    // Get user role
    const role = await getUserRole(userId);
    
    if (role !== UserRole.Admin && role !== UserRole.Facilitator) {
      return res.status(403).json({ message: 'Access denied: Facilitator or Admin role required' });
    }
    
    // Store role and userId for use in route handlers
    res.locals.userRole = role;
    res.locals.userId = userId;
    
    // Proceed to the next middleware/route handler
    next();
  } catch (error) {
    console.error('Error in facilitator authentication:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ADMIN ROUTES (accessible only to admins)
// Apply admin middleware to admin-only routes
adminRouter.use('/admin', requireAdmin);

// Get all users (admin only)
adminRouter.get('/admin/users', async (req: Request, res: Response) => {
  try {
    const includeDeleted = req.query.includeDeleted === 'true';
    
    const users = await UserManagementService.getUsers({
      includeDeleted
    });
    
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create user (admin only)
adminRouter.post('/admin/users', async (req: Request, res: Response) => {
  try {
    const userSchema = z.object({
      username: z.string().min(3, 'Username must be at least 3 characters'),
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email').optional(),
      organization: z.string().max(30).optional(),
      jobTitle: z.string().max(30).optional(),
      password: z.string().optional(),
      generatePassword: z.boolean().optional(),
      role: z.enum([UserRole.Admin, UserRole.Facilitator, UserRole.Participant])
    });
    
    const userData = userSchema.parse(req.body);
    
    // Generate password if requested
    if (userData.generatePassword || !userData.password) {
      userData.password = UserManagementService.generateSecurePassword();
    }
    
    // Create the user
    const newUser = await UserManagementService.createUser({
      username: userData.username,
      password: userData.password,
      name: userData.name,
      email: userData.email,
      organization: userData.organization,
      jobTitle: userData.jobTitle,
      role: userData.role
    });
    
    // Return the user without password
    const { password: _, ...userWithoutPassword } = newUser;
    
    // Add the generated password to the response if it was auto-generated
    const response = {
      ...userWithoutPassword,
      temporaryPassword: userData.generatePassword ? userData.password : undefined
    };
    
    res.status(201).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user (admin only)
adminRouter.put('/admin/users/:id', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const updateSchema = z.object({
      name: z.string().min(1, 'Name is required').optional(),
      email: z.string().email('Invalid email').optional(),
      organization: z.string().max(30).optional(),
      jobTitle: z.string().max(30).optional(),
      role: z.enum([UserRole.Admin, UserRole.Facilitator, UserRole.Participant]).optional(),
      resetPassword: z.boolean().optional()
    });
    
    const updateData = updateSchema.parse(req.body);
    
    // Get current user
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update profile
    const updatedUser = await UserManagementService.updateUserProfile(userId, {
      name: updateData.name,
      organization: updateData.organization,
      jobTitle: updateData.jobTitle
    });
    
    // Update email if provided (separate as it has unique constraint)
    if (updateData.email && updateData.email !== user.email) {
      await db
        .update(schema.users)
        .set({ email: updateData.email })
        .where(eq(schema.users.id, userId));
      
      updatedUser.email = updateData.email;
    }
    
    // Update role if provided
    if (updateData.role) {
      await UserManagementService.updateUserRole(userId, updateData.role);
      updatedUser.role = updateData.role;
    }
    
    // Reset password if requested
    let temporaryPassword;
    if (updateData.resetPassword) {
      temporaryPassword = UserManagementService.generateSecurePassword();
      await UserManagementService.resetPassword(userId, temporaryPassword);
    }
    
    // Return updated user with temporary password if reset
    const response = {
      ...updatedUser,
      temporaryPassword
    };
    
    res.status(200).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (admin only)
adminRouter.delete('/admin/users/:id', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Prevent deleting oneself
    const adminId = parseInt(req.cookies.userId);
    if (userId === adminId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    // Soft delete the user
    const deleted = await UserManagementService.softDeleteUser(userId);
    
    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create invite (admin only)
adminRouter.post('/admin/invites', async (req: Request, res: Response) => {
  try {
    const inviteSchema = z.object({
      email: z.string().email('Invalid email'),
      name: z.string().min(1, 'Name is required'),
      cohortId: z.number().optional(),
      role: z.enum([UserRole.Facilitator, UserRole.Participant])
    });
    
    const inviteData = inviteSchema.parse(req.body);
    const adminId = parseInt(req.cookies.userId);
    
    // Create invite
    const { inviteCode, invite } = await InviteService.createInvite(adminId, {
      email: inviteData.email,
      name: inviteData.name,
      cohortId: inviteData.cohortId,
      role: inviteData.role
    });
    
    res.status(201).json({
      inviteCode,
      invite
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error('Error creating invite:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all invites (admin only)
adminRouter.get('/admin/invites', async (req: Request, res: Response) => {
  try {
    const adminId = parseInt(req.cookies.userId);
    
    // Admins see all invites
    const invites = await InviteService.getInvitesByCreator(adminId);
    
    res.status(200).json(invites);
  } catch (error) {
    console.error('Error fetching invites:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete invite (admin only)
adminRouter.delete('/admin/invites/:id', async (req: Request, res: Response) => {
  try {
    const inviteId = parseInt(req.params.id);
    
    if (isNaN(inviteId)) {
      return res.status(400).json({ message: 'Invalid invite ID' });
    }
    
    await InviteService.deleteInvite(inviteId);
    
    res.status(200).json({ message: 'Invite deleted successfully' });
  } catch (error) {
    console.error('Error deleting invite:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Regenerate invite code (admin only)
adminRouter.post('/admin/invites/:id/regenerate', async (req: Request, res: Response) => {
  try {
    const inviteId = parseInt(req.params.id);
    
    if (isNaN(inviteId)) {
      return res.status(400).json({ message: 'Invalid invite ID' });
    }
    
    const { inviteCode, invite } = await InviteService.regenerateInviteCode(inviteId);
    
    res.status(200).json({
      inviteCode,
      invite
    });
  } catch (error) {
    console.error('Error regenerating invite code:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// FACILITATOR ROUTES (accessible to both admins and facilitators)
// Apply facilitator middleware to facilitator routes
adminRouter.use('/facilitator', requireFacilitator);

// Get users created by this facilitator
adminRouter.get('/facilitator/users', async (req: Request, res: Response) => {
  try {
    const userId = res.locals.userId;
    const userRole = res.locals.userRole;
    
    // Admins can see all users
    if (userRole === UserRole.Admin) {
      const users = await UserManagementService.getUsers();
      return res.status(200).json(users);
    }
    
    // Facilitators can only see users they created
    const users = await UserManagementService.getUsersCreatedByFacilitator(userId);
    
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users for facilitator:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create participant (facilitators can only create participants)
adminRouter.post('/facilitator/users', async (req: Request, res: Response) => {
  try {
    const userSchema = z.object({
      username: z.string().min(3, 'Username must be at least 3 characters'),
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email').optional(),
      organization: z.string().max(30).optional(),
      jobTitle: z.string().max(30).optional(),
      password: z.string().optional(),
      generatePassword: z.boolean().optional(),
      cohortId: z.number().optional()
    });
    
    const userData = userSchema.parse(req.body);
    const facilitatorId = res.locals.userId;
    
    // Generate password if requested
    if (userData.generatePassword || !userData.password) {
      userData.password = UserManagementService.generateSecurePassword();
    }
    
    // Create the user (always as participant)
    const newUser = await UserManagementService.createUser({
      username: userData.username,
      password: userData.password,
      name: userData.name,
      email: userData.email,
      organization: userData.organization,
      jobTitle: userData.jobTitle,
      role: UserRole.Participant,
      createdByFacilitator: facilitatorId
    });
    
    // Add to cohort if specified
    if (userData.cohortId) {
      await db
        .insert(schema.cohortParticipants)
        .values({
          cohortId: userData.cohortId,
          participantId: newUser.id
        });
    }
    
    // Return the user without password
    const { password: _, ...userWithoutPassword } = newUser;
    
    // Add the generated password to the response if it was auto-generated
    const response = {
      ...userWithoutPassword,
      temporaryPassword: userData.generatePassword ? userData.password : undefined
    };
    
    res.status(201).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error('Error creating participant:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create invite (facilitators can only invite participants)
adminRouter.post('/facilitator/invites', async (req: Request, res: Response) => {
  try {
    const inviteSchema = z.object({
      email: z.string().email('Invalid email'),
      name: z.string().min(1, 'Name is required'),
      cohortId: z.number().optional()
    });
    
    const inviteData = inviteSchema.parse(req.body);
    const facilitatorId = res.locals.userId;
    
    // Create invite (always for participant role)
    const { inviteCode, invite } = await InviteService.createInvite(facilitatorId, {
      email: inviteData.email,
      name: inviteData.name,
      cohortId: inviteData.cohortId,
      role: UserRole.Participant
    });
    
    res.status(201).json({
      inviteCode,
      invite
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error('Error creating invite:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get invites created by this facilitator
adminRouter.get('/facilitator/invites', async (req: Request, res: Response) => {
  try {
    const facilitatorId = res.locals.userId;
    
    const invites = await InviteService.getInvitesByCreator(facilitatorId);
    
    res.status(200).json(invites);
  } catch (error) {
    console.error('Error fetching invites for facilitator:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete invite created by this facilitator
adminRouter.delete('/facilitator/invites/:id', async (req: Request, res: Response) => {
  try {
    const inviteId = parseInt(req.params.id);
    
    if (isNaN(inviteId)) {
      return res.status(400).json({ message: 'Invalid invite ID' });
    }
    
    // Check if invite belongs to this facilitator (unless admin)
    if (res.locals.userRole !== UserRole.Admin) {
      const [invite] = await db
        .select()
        .from(schema.pendingInvites)
        .where(eq(schema.pendingInvites.id, inviteId));
      
      if (!invite || invite.createdBy !== res.locals.userId) {
        return res.status(403).json({ message: 'Access denied: You can only delete your own invites' });
      }
    }
    
    await InviteService.deleteInvite(inviteId);
    
    res.status(200).json({ message: 'Invite deleted successfully' });
  } catch (error) {
    console.error('Error deleting invite:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Regenerate invite code for this facilitator's invite
adminRouter.post('/facilitator/invites/:id/regenerate', async (req: Request, res: Response) => {
  try {
    const inviteId = parseInt(req.params.id);
    
    if (isNaN(inviteId)) {
      return res.status(400).json({ message: 'Invalid invite ID' });
    }
    
    // Check if invite belongs to this facilitator (unless admin)
    if (res.locals.userRole !== UserRole.Admin) {
      const [invite] = await db
        .select()
        .from(schema.pendingInvites)
        .where(eq(schema.pendingInvites.id, inviteId));
      
      if (!invite || invite.createdBy !== res.locals.userId) {
        return res.status(403).json({ message: 'Access denied: You can only regenerate your own invites' });
      }
    }
    
    const { inviteCode, invite } = await InviteService.regenerateInviteCode(inviteId);
    
    res.status(200).json({
      inviteCode,
      invite
    });
  } catch (error) {
    console.error('Error regenerating invite code:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export { adminRouter };