import express, { Request, Response } from 'express';
import { z } from 'zod';
import { inviteService } from '../services/invite-service';
import { isAdmin, isFacilitatorOrAdmin } from '../middleware/roles';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

/**
 * Verify an invite code
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      inviteCode: z.string().min(12).max(12),
    });

    const { inviteCode } = schema.parse(req.body);
    const result = await inviteService.verifyInviteCode(inviteCode);

    if (result) {
      res.json({
        valid: true,
        inviteCode,
        ...result
      });
    } else {
      res.json({
        valid: false,
        message: 'Invalid or expired invite code'
      });
    }
  } catch (error) {
    console.error('Error verifying invite code:', error);
    res.status(400).json({
      valid: false,
      message: error instanceof Error ? error.message : 'Invalid invite code format'
    });
  }
});

/**
 * Get a list of all invites (admin only)
 */
router.get('/', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const invites = await inviteService.getAllInvites();
    res.json(invites);
  } catch (error) {
    console.error('Error fetching invites:', error);
    res.status(500).json({
      error: 'Failed to fetch invites'
    });
  }
});

/**
 * Create a new invite (admin or facilitator)
 */
router.post('/', isAuthenticated, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Valid email is required'),
      role: z.enum(['admin', 'facilitator', 'participant']),
      cohortId: z.number().optional(),
    });

    const data = schema.parse(req.body);
    
    // Get the creator's ID from the session
    const creatorId = req.session.userId;
    if (!creatorId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const invite = await inviteService.createInvite({
      ...data,
      createdBy: creatorId
    });

    res.status(201).json(invite);
  } catch (error) {
    console.error('Error creating invite:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to create invite'
    });
  }
});

/**
 * Generate batch invites (admin only)
 */
router.post('/batch', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      count: z.number().min(1).max(50),
      role: z.enum(['admin', 'facilitator', 'participant']),
      cohortId: z.number().optional(),
    });

    const { count, role, cohortId } = schema.parse(req.body);
    
    // Get the creator's ID from the session
    const creatorId = req.session.userId;
    if (!creatorId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const invites = await inviteService.generateBatchInvites(count, {
      role,
      createdBy: creatorId,
      cohortId
    });

    res.status(201).json(invites);
  } catch (error) {
    console.error('Error generating batch invites:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to generate batch invites'
    });
  }
});

/**
 * Delete an invite (admin only)
 */
router.delete('/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid invite ID' });
    }

    await inviteService.deleteInvite(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting invite:', error);
    res.status(500).json({
      error: 'Failed to delete invite'
    });
  }
});

export default router;