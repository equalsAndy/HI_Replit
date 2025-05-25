import express, { Request, Response } from 'express';
import { z } from 'zod';
import { InviteService } from '../services/invite-service';
import { isAuthenticated } from '../middleware/auth';
import { isAdmin, isFacilitatorOrAdmin } from '../middleware/roles';
import { formatInviteCode, isValidInviteCodeFormat } from '../utils/invite-code';

const router = express.Router();

/**
 * Verify an invite code
 * This is a public endpoint that doesn't require authentication
 */
router.post('/invites/verify', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      inviteCode: z.string().min(12).max(12)
    });
    
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        message: 'Invalid request body',
        errors: result.error.errors
      });
    }
    
    const { inviteCode } = result.data;
    
    // Validate invite code format
    if (!isValidInviteCodeFormat(inviteCode)) {
      return res.status(400).json({ message: 'Invalid invite code format' });
    }
    
    // Validate invite
    const validation = await InviteService.validateInvite(inviteCode);
    
    if (!validation.valid) {
      return res.status(400).json({ 
        message: validation.message,
        valid: false
      });
    }
    
    // Return validated invite data
    res.json({
      valid: true,
      message: 'Valid invite code',
      role: validation.invite?.role,
      formattedCode: formatInviteCode(inviteCode)
    });
  } catch (error) {
    console.error('Error verifying invite:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Create a new invite code
 * Requires authentication and admin or facilitator role
 */
router.post('/invites', isAuthenticated, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      role: z.enum(['admin', 'facilitator', 'participant']),
      expiresAt: z.string().optional(),
      cohortId: z.number().optional()
    });
    
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        message: 'Invalid request body',
        errors: result.error.errors
      });
    }
    
    const { role, expiresAt, cohortId } = result.data;
    
    // Only admins can create admin or facilitator invites
    if ((role === 'admin' || role === 'facilitator') && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Only admins can create admin or facilitator invites'
      });
    }
    
    // Create the invite
    const invite = await InviteService.createInvite(
      req.user.id,
      role,
      expiresAt ? new Date(expiresAt) : undefined,
      cohortId
    );
    
    res.status(201).json({
      message: 'Invite code created successfully',
      invite: {
        ...invite,
        formattedCode: formatInviteCode(invite.code)
      }
    });
  } catch (error) {
    console.error('Error creating invite:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Get all invites created by the authenticated user
 * Requires authentication
 */
router.get('/invites', isAuthenticated, async (req: Request, res: Response) => {
  try {
    let invites;
    
    // Admins can see all invites
    if (req.user.role === 'admin') {
      invites = await InviteService.getInvitesByCreator(req.user.id);
    }
    // Facilitators can see their own invites
    else if (req.user.role === 'facilitator') {
      invites = await InviteService.getInvitesByCreator(req.user.id);
    }
    // Participants can't see invites
    else {
      return res.status(403).json({ message: 'Access denied' });
    }
    
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
 * Delete an invite
 * Requires authentication and ownership of the invite
 */
router.delete('/invites/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid invite ID' });
    }
    
    // Only admins and facilitators can delete invites
    if (req.user.role !== 'admin' && req.user.role !== 'facilitator') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Delete the invite
    const deleted = await InviteService.deleteInvite(id, req.user.id);
    
    if (!deleted) {
      return res.status(404).json({ 
        message: 'Invite not found or cannot be deleted (already used)'
      });
    }
    
    res.json({ message: 'Invite deleted successfully' });
  } catch (error) {
    console.error('Error deleting invite:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;