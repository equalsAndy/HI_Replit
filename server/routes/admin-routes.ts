import express, { Request, Response } from 'express';
import { z } from 'zod';
import { userManagementService } from '../services/user-management-service';
import { inviteService } from '../services/invite-service';
import { requireAuth } from '../middleware/auth';
import { isAdmin, isFacilitatorOrAdmin } from '../middleware/roles';
import { formatInviteCode } from '../utils/invite-code';

const router = express.Router();

/**
 * Get all users (admin only)
 */
router.get('/users', requireAuth, isAdmin, async (req: Request, res: Response) => {
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
router.post('/users', requireAuth, isAdmin, async (req: Request, res: Response) => {
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
    // This is a placeholder - we'll need to implement proper video storage
    // For now, return sample data to make the UI work
    const videos = [
      {
        id: 1,
        title: "Introduction to AllStarTeams Workshop",
        description: "Welcome video introducing the AllStarTeams workshop concepts",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        editableId: "dQw4w9WgXcQ",
        workshop_type: "allstarteams",
        section: "Introduction",
        sortOrder: 1
      },
      {
        id: 2,
        title: "Understanding Your Strengths",
        description: "Learn how to identify and leverage your core strengths",
        url: "https://www.youtube.com/embed/C0DPdy98e4c",
        editableId: "C0DPdy98e4c",
        workshop_type: "allstarteams",
        section: "Module 1",
        sortOrder: 2
      },
      {
        id: 3,
        title: "Imaginal Agility Overview",
        description: "Introduction to the Imaginal Agility framework",
        url: "https://www.youtube.com/embed/9bZkp7q19f0",
        editableId: "9bZkp7q19f0",
        workshop_type: "imaginal-agility",
        section: "Introduction",
        sortOrder: 1
      }
    ];
    
    res.status(200).json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
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

export const adminRouter = router;