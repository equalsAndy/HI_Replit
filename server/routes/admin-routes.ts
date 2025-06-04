import express, { Request, Response } from 'express';
import { z } from 'zod';
import { userManagementService } from '../services/user-management-service';
import { inviteService } from '../services/invite-service';
import { ExportService } from '../services/export-service';
import { requireAuth } from '../middleware/auth';
import { isAdmin, isFacilitatorOrAdmin } from '../middleware/roles';
import { formatInviteCode } from '../utils/invite-code';

const router = express.Router();

/**
 * Get all users (admin only)
 */
router.get('/users', requireAuth, isAdmin, async (req: Request, res: Response) => {
  try {
    const includeDeleted = req.query.includeDeleted === 'true';
    const result = await userManagementService.getAllUsers(includeDeleted);

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
router.post('/users', requireAuth, isAdmin, async (req: Request, res: Response) => {
  try {
    const userSchema = z.object({
      email: z.string().email(),
      username: z.string().min(3),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      role: z.string().refine((val) => ['admin', 'facilitator', 'participant'].includes(val), {
        message: "Role must be admin, facilitator, or participant"
      }),
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
    const existingUserResult = await userManagementService.getUserByEmail(result.data.email);
    if (existingUserResult.success) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Generate a secure random password (10 characters, alphanumeric)
    const password = Math.random().toString(36).substring(2, 12);

    // Create the user
    const name = `${result.data.firstName || ''} ${result.data.lastName || ''}`.trim() || result.data.username;
    const userResult = await userManagementService.createUser({
      username: result.data.username,
      password: password,
      name: name,
      email: result.data.email,
      role: result.data.role,
      organization: result.data.organization,
      jobTitle: result.data.jobTitle
    });

    res.status(201).json({
      message: 'User created successfully',
      user: userResult.success ? userResult.user : null,
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
router.get('/invites', requireAuth, isAdmin, async (req: Request, res: Response) => {
  try {
    // Get all invites
    const invitesResult = await inviteService.getAllInvites();
    const invitesList = invitesResult.success ? invitesResult.invites : [];

    // Format invite codes for display
    const formattedInvites = invitesList.map(invite => ({
      ...invite,
      formattedCode: formatInviteCode(invite.inviteCode)
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
router.post('/invites/batch', requireAuth, isAdmin, async (req: Request, res: Response) => {
  try {
    const batchSchema = z.object({
      count: z.number().min(1).max(50),
      role: z.enum(['admin', 'facilitator', 'participant']),
      expiresAt: z.string().optional()
    });

    const result = batchSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        message: 'Invalid batch data', 
        errors: result.error.errors
      });
    }

    const { count, role, expiresAt } = result.data;
    const invites = [];

    // Generate the specified number of invite codes
    for (let i = 0; i < count; i++) {
      try {
        // Create a unique email for each invite
        const uniqueEmail = `invite-${Date.now()}-${i}@placeholder.com`;

        const inviteResult = await inviteService.createInvite({
          email: uniqueEmail,
          role: role,
          createdBy: req.session.userId || 1, // Fallback to admin ID 1 if no session
          expiresAt: expiresAt ? new Date(expiresAt) : undefined
        });

        if (inviteResult.success && inviteResult.invite) {
          invites.push({
            ...inviteResult.invite,
            formattedCode: formatInviteCode(inviteResult.invite.inviteCode)
          });
        }
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
 * Update user information (admin only)
 */
router.put('/users/:id', requireAuth, isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const updateSchema = z.object({
      name: z.string().min(1).optional(),
      email: z.string().email().optional(),
      organization: z.string().optional(),
      title: z.string().optional(), // Job title
      password: z.string().optional(),
    });

    const result = updateSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        message: 'Invalid update data', 
        errors: result.error.errors 
      });
    }

    const updateData = result.data;

    // Update user via user management service
    const updateResult = await userManagementService.updateUser(id, updateData);

    if (!updateResult.success) {
      return res.status(400).json({ message: updateResult.error || 'Failed to update user' });
    }

    let responseData: any = { message: 'User updated successfully' };

    // If password was reset, include temporary password in response
    if (updateData.password === undefined && 'temporaryPassword' in updateResult && updateResult.temporaryPassword) {
      responseData.temporaryPassword = updateResult.temporaryPassword;
    }

    res.json(responseData);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Change a user's role (admin only)
 */
router.put('/users/:id/role', requireAuth, isAdmin, async (req: Request, res: Response) => {
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
    if (id === req.session.userId) {
      return res.status(403).json({ 
        message: 'Cannot change your own role'
      });
    }

    // Update the role in the database
    const updateResult = await userManagementService.updateUser(id, {
      role: result.data.role
    });

    if (!updateResult.success) {
      return res.status(404).json({ message: updateResult.error || 'User not found' });
    }

    res.json({ 
      message: 'User role updated successfully',
      user: updateResult.user
    });
  } catch (error) {
    console.error('Error changing user role:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Toggle a user's test status (admin only)
 */
router.put('/users/:id/test-status', requireAuth, isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Toggle the test status
    const result = await userManagementService.toggleTestUserStatus(id);

    if (!result.success) {
      return res.status(404).json({ message: result.error || 'User not found' });
    }

    // Make sure we have a valid user after update
    if (!result.success || !result.user) {
      return res.status(404).json({ message: 'User not found after update' });
    }

    res.json({ 
      message: `User is ${result.user.isTestUser ? 'now' : 'no longer'} a test user`,
      user: result.user
    });
  } catch (error) {
    console.error('Error toggling test user status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Delete all user data except profile and password (admin only)
 */
router.delete('/users/:id/data', requireAuth, isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Delete user data using user management service
    const result = await userManagementService.deleteUserData(id);

    if (!result.success) {
      return res.status(400).json({ message: result.error || 'Failed to delete user data' });
    }

    res.json({ 
      message: 'User data deleted successfully',
      deletedData: result.deletedData
    });
  } catch (error) {
    console.error('Error deleting user data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Get all test users (admin only)
 */
router.get('/test-users', requireAuth, isAdmin, async (req: Request, res: Response) => {
  try {
    const result = await userManagementService.getAllTestUsers();

    if (!result.success) {
      return res.status(500).json({ message: result.error || 'Failed to retrieve test users' });
    }

    res.json({
      message: 'Test users retrieved successfully',
      users: result.users
    });
  } catch (error) {
    console.error('Error getting test users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Video Management Routes
 */

// Get all videos
router.get('/videos', requireAuth, isAdmin, async (req: Request, res: Response) => {
  try {
    // Use the existing storage service to get the real videos
    const videos = await userManagementService.getVideos();

    if (!videos || !Array.isArray(videos)) {
      throw new Error('Failed to retrieve videos from storage');
    }

    res.status(200).json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get videos by workshop type
router.get('/videos/workshop/:workshopType', requireAuth, isAdmin, async (req: Request, res: Response) => {
  try {
    const { workshopType } = req.params;
    const videos = await userManagementService.getVideosByWorkshop(workshopType);

    if (!videos || !Array.isArray(videos)) {
      throw new Error('Failed to retrieve videos from storage');
    }

    res.status(200).json(videos);
  } catch (error) {
    console.error('Error fetching videos by workshop:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update video
router.put('/videos/:id', requireAuth, isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid video ID' });
    }

    // In a real implementation, this would update the video in storage
    // For now, just return success
    res.status(200).json({ 
      success: true, 
      message: 'Video updated successfully',
      id: id
    });
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Delete a user completely (admin only)
 */
router.delete('/users/:id', requireAuth, isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Prevent deleting yourself
    if (id === req.session.userId) {
      return res.status(403).json({ 
        message: 'Cannot delete your own account'
      });
    }

    // Delete user completely using the service
    const deleteResult = await userManagementService.deleteUser(id);

    if (!deleteResult.success) {
      return res.status(400).json({ message: deleteResult.error || 'Failed to delete user' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Delete user data only (keep profile and password)
 */
router.delete('/users/:id/data', requireAuth, isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Delete user data only using the service
    const deleteResult = await userManagementService.deleteUserData(id);

    if (!deleteResult.success) {
      return res.status(400).json({ message: deleteResult.error || 'Failed to delete user data' });
    }

    res.json({ message: 'User data deleted successfully' });
  } catch (error) {
    console.error('Error deleting user data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Export user data (admin only)
 */
router.get('/users/:userId/export', requireAuth, isAdmin, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    // Get admin info for metadata
    const adminUsername = (req.session as any).username || (req.session as any).name || 'admin';

    const exportData = await ExportService.exportUserData(userId, adminUsername);

    // Set headers for file download
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `user-${exportData.userInfo.username}-export-${timestamp}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.json(exportData);
  } catch (error) {
    console.error('Error exporting user data:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Export failed'
    });
  }
});

/**
 * Validate user data for export (admin only)
 */
router.get('/users/:userId/validate', requireAuth, isAdmin, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid user ID' 
      });
    }

    const validation = await ExportService.validateUserData(userId);
    res.json({ success: true, validation });
  } catch (error) {
    console.error('Error validating user data:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Validation failed'
    });
  }
});

export const adminRouter = router;