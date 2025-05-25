import express, { Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { isAdmin } from '../middleware/roles';
import { inviteService } from '../services/invite-service';
import { formatInviteCode } from '../utils/invite-code';

const router = express.Router();

/**
 * Create a new invite code
 */
router.post('/create', requireAuth, isAdmin, async (req: Request, res: Response) => {
  try {
    const inviteSchema = z.object({
      email: z.string().email(),
      role: z.enum(['admin', 'facilitator', 'participant']),
      name: z.string().optional()
    });
    
    const result = inviteSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid invite data',
        details: result.error.errors
      });
    }
    
    // Check if session exists and has user ID
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    // Create the invite using the service
    const inviteResult = await inviteService.createInvite({
      email: result.data.email,
      role: result.data.role,
      name: result.data.name,
      createdBy: req.session.userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });
    
    if (!inviteResult.success) {
      return res.status(500).json({
        success: false,
        error: inviteResult.error || 'Failed to create invite'
      });
    }
    
    // Return the created invite with formatted code
    res.status(201).json({
      success: true,
      message: 'Invite created successfully',
      invite: {
        ...inviteResult.invite,
        formattedCode: formatInviteCode(inviteResult.invite.inviteCode)
      }
    });
  } catch (error) {
    console.error('Error creating invite:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

/**
 * Get all invites
 */
router.get('/', requireAuth, isAdmin, async (req: Request, res: Response) => {
  try {
    const result = await inviteService.getAllInvites();
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to retrieve invites'
      });
    }
    
    res.json({
      success: true,
      invites: result.invites
    });
  } catch (error) {
    console.error('Error getting invites:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

/**
 * Delete an invite
 */
router.delete('/:id', requireAuth, isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid invite ID'
      });
    }
    
    const result = await inviteService.deleteInvite(id);
    
    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: result.error || 'Invite not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Invite deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting invite:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

export const inviteRouter = router;