import express from 'express';
import { z } from 'zod';
import { inviteService } from '../services/invite-service.js';
import { isAdmin, isFacilitatorOrAdmin } from '../middleware/roles.js';

const router = express.Router();

/**
 * Create a new invite
 */
router.post('/', isAdmin, async (req, res) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      role: z.enum(['admin', 'facilitator', 'participant', 'student']),
      name: z.string().optional()
    });

    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid invite data',
        details: result.error.errors
      });
    }

    // Create the invite using the invite service
    const createResult = await inviteService.createInvite({
      email: result.data.email,
      role: result.data.role,
      name: result.data.name,
      createdBy: req.session.userId!
    });

    if (!createResult.success) {
      return res.status(500).json({
        success: false,
        error: createResult.error || 'Failed to create invite'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Invite created successfully',
      invite: createResult.invite
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
router.get('/', isAdmin, async (req, res) => {
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
router.delete('/:id', isAdmin, async (req, res) => {
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

export default router;