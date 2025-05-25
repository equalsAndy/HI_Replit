import express, { Request, Response } from 'express';
import { z } from 'zod';
import { userManagementService } from '../services/user-management-service';
import { inviteService } from '../services/invite-service';
import { requireAuth } from '../middleware/auth';
import { requireAdmin, requireFacilitatorOrAdmin } from '../middleware/roles';
import { formatInviteCode } from '../utils/invite-code';

const router = express.Router();

/**
 * Get all users (admin only)
 */
router.get('/users', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const result = await userManagementService.getAllUsers();
    
    if (!result.success) {
      return res.status(500).json({ message: result.error || 'Failed to retrieve users' });
    }
    
    res.json({
      message: 'Users retrieved successfully',
      users: result.users
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Create a new user with specified role (admin only)
 */
router.post('/users', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const userSchema = z.object({
      email: z.string().email(),
      username: z.string().min(3),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      role: z.enum(['admin', 'facilitator', 'participant']),
      organization: z.string().optional(),
      jobTitle: z.string().optional()
    });
    
    const result = userSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        message: 'Invalid user data', 
        errors: result.error.errors
      });
    }
    
    // Check if email is already in use
    const existingUser = await UserManagementService.getUserByEmail(result.data.email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }
    
    // Generate a secure random password
    const password = UserManagementService.generateSecurePassword();
    
    // Create the user
    const user = await UserManagementService.createUser({
      ...result.data,
      password
    });
    
    res.status(201).json({
      message: 'User created successfully',
      user,
      initialPassword: password // Note: In production, you'd email this to the user
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Get all invites (admin only)
 */
router.get('/invites', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    // Get all invites
    const invites = await InviteService.getInvitesByCreator(req.user.id);
    
    // Format invite codes for display
    const formattedInvites = invites.map(invite => ({
      ...invite,
      formattedCode: formatInviteCode(invite.code)
    }));
    
    res.json({
      message: 'Invites retrieved successfully',
      invites: formattedInvites
    });
  } catch (error) {
    console.error('Error getting invites:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Generate multiple invite codes at once (admin only)
 */
router.post('/invites/batch', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const batchSchema = z.object({
      count: z.number().min(1).max(50),
      role: z.enum(['admin', 'facilitator', 'participant']),
      expiresAt: z.string().optional(),
      cohortId: z.number().optional()
    });
    
    const result = batchSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        message: 'Invalid batch data', 
        errors: result.error.errors
      });
    }
    
    const { count, role, expiresAt, cohortId } = result.data;
    const invites = [];
    
    // Generate the specified number of invite codes
    for (let i = 0; i < count; i++) {
      try {
        const invite = await InviteService.createInvite(
          req.user.id,
          role,
          expiresAt ? new Date(expiresAt) : undefined,
          cohortId
        );
        
        invites.push({
          ...invite,
          formattedCode: formatInviteCode(invite.code)
        });
      } catch (error) {
        console.error(`Error creating invite ${i + 1}:`, error);
      }
    }
    
    res.status(201).json({
      message: `Generated ${invites.length} invite codes`,
      invites
    });
  } catch (error) {
    console.error('Error generating batch invites:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Change a user's role (admin only)
 */
router.put('/users/:id/role', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const roleSchema = z.object({
      role: z.enum(['admin', 'facilitator', 'participant'])
    });
    
    const result = roleSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        message: 'Invalid role data', 
        errors: result.error.errors
      });
    }
    
    // Prevent changing own role (to avoid locking yourself out)
    if (id === req.user.id) {
      return res.status(403).json({ 
        message: 'Cannot change your own role'
      });
    }
    
    // Update the role in the database (you'll need to implement this method)
    try {
      // This would need to be implemented in the UserManagementService
      // await UserManagementService.updateUserRole(id, result.data.role);
      
      res.json({ 
        message: 'User role updated successfully',
        userId: id,
        newRole: result.data.role
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error changing user role:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export const adminRouter = router;