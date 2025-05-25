import { Router } from 'express';
import { InviteService } from '../services/invite-service';
import { UserManagementService } from '../services/user-management-service';
import { isAuthenticated } from '../middleware/auth';
import { hasRole } from '../middleware/roles';
import { UserRole } from '@shared/schema';
import { generateInviteCodeNode } from '../utils/invite-code';

const router = Router();

/**
 * Verify if an invite code is valid
 * POST /api/verify-invite
 * Public - No authentication required
 */
router.post('/verify-invite', async (req, res) => {
  try {
    const { inviteCode } = req.body;
    
    if (!inviteCode) {
      return res.status(400).json({ message: 'Invite code is required' });
    }
    
    // Verify the invite code
    const invite = await InviteService.verifyInvite(inviteCode);
    
    if (!invite) {
      return res.status(404).json({ message: 'Invalid or expired invite code' });
    }
    
    // Return basic invite information
    return res.status(200).json({
      id: invite.id,
      email: invite.email,
      name: invite.name,
      role: invite.role
    });
  } catch (error) {
    console.error('Error verifying invite code:', error);
    return res.status(500).json({ message: 'Failed to verify invite code' });
  }
});

/**
 * Create a new invite code
 * POST /api/invites
 * Authenticated + Admin/Facilitator role required
 */
router.post('/invites', isAuthenticated, hasRole([UserRole.Admin, UserRole.Facilitator]), async (req, res) => {
  try {
    const { email, name, role, cohortId } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User ID not found in session' });
    }
    
    // Check if email is provided
    if (!email || !name) {
      return res.status(400).json({ message: 'Email and name are required' });
    }
    
    // Check if role is valid
    if (!role || !Object.values(UserRole).includes(role as UserRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    // Check if user has permission to create this role
    // Facilitators can only create participants
    if (req.user?.role === UserRole.Facilitator && role !== UserRole.Participant) {
      return res.status(403).json({ message: 'Facilitators can only invite participants' });
    }
    
    // Generate invite code
    const inviteCode = generateInviteCodeNode();
    
    // Create the invite
    const invite = await InviteService.createInvite({
      email,
      name,
      role: role as UserRole,
      inviteCode,
      createdBy: userId,
      cohortId: cohortId || null
    });
    
    return res.status(201).json(invite);
  } catch (error) {
    console.error('Error creating invite:', error);
    return res.status(500).json({ message: 'Failed to create invite' });
  }
});

/**
 * Get all invites for current user's created invites
 * GET /api/invites
 * Authenticated + Admin/Facilitator role required
 */
router.get('/invites', isAuthenticated, hasRole([UserRole.Admin, UserRole.Facilitator]), async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User ID not found in session' });
    }
    
    // Admin can see all invites, facilitators only see their own
    const invites = req.user?.role === UserRole.Admin
      ? await InviteService.getAllInvites()
      : await InviteService.getFacilitatorInvites(userId);
    
    return res.status(200).json(invites);
  } catch (error) {
    console.error('Error fetching invites:', error);
    return res.status(500).json({ message: 'Failed to fetch invites' });
  }
});

/**
 * Regenerate an invite code
 * POST /api/invites/:id/regenerate
 * Authenticated + Admin/Facilitator role required
 */
router.post('/invites/:id/regenerate', isAuthenticated, hasRole([UserRole.Admin, UserRole.Facilitator]), async (req, res) => {
  try {
    const inviteId = parseInt(req.params.id);
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User ID not found in session' });
    }
    
    // Check if invite exists
    const invite = await InviteService.getInviteById(inviteId);
    
    if (!invite) {
      return res.status(404).json({ message: 'Invite not found' });
    }
    
    // Check if user has permission to regenerate this invite
    // Facilitators can only regenerate their own invites
    if (req.user?.role === UserRole.Facilitator && invite.createdBy !== userId) {
      return res.status(403).json({ message: 'You can only regenerate your own invites' });
    }
    
    // Regenerate the invite code
    const updatedInvite = await InviteService.regenerateInviteCode(inviteId);
    
    return res.status(200).json(updatedInvite);
  } catch (error) {
    console.error('Error regenerating invite code:', error);
    return res.status(500).json({ message: 'Failed to regenerate invite code' });
  }
});

/**
 * Delete an invite
 * DELETE /api/invites/:id
 * Authenticated + Admin/Facilitator role required
 */
router.delete('/invites/:id', isAuthenticated, hasRole([UserRole.Admin, UserRole.Facilitator]), async (req, res) => {
  try {
    const inviteId = parseInt(req.params.id);
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User ID not found in session' });
    }
    
    // Check if invite exists
    const invite = await InviteService.getInviteById(inviteId);
    
    if (!invite) {
      return res.status(404).json({ message: 'Invite not found' });
    }
    
    // Check if user has permission to delete this invite
    // Facilitators can only delete their own invites
    if (req.user?.role === UserRole.Facilitator && invite.createdBy !== userId) {
      return res.status(403).json({ message: 'You can only delete your own invites' });
    }
    
    // Delete the invite
    const success = await InviteService.deleteInvite(inviteId);
    
    if (!success) {
      return res.status(500).json({ message: 'Failed to delete invite' });
    }
    
    return res.status(200).json({ message: 'Invite deleted successfully' });
  } catch (error) {
    console.error('Error deleting invite:', error);
    return res.status(500).json({ message: 'Failed to delete invite' });
  }
});

export default router;