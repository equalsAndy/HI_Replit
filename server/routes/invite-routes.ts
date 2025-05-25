import express from 'express';
import { inviteService } from '../services/invite-service';
import { isAdmin, isFacilitator, isAuthenticated } from '../middleware/auth';
import { z } from 'zod';

export const inviteRouter = express.Router();

// Verify invite code
inviteRouter.post('/verify', async (req, res) => {
  try {
    const { inviteCode } = req.body;
    
    if (!inviteCode) {
      return res.status(400).json({ error: 'Invite code is required' });
    }
    
    const verification = await inviteService.verifyInviteCode(inviteCode);
    
    if (verification.valid) {
      return res.status(200).json({
        inviteCode,
        name: verification.invite?.name,
        email: verification.invite?.email,
        role: verification.invite?.role,
        cohortId: verification.invite?.cohortId,
      });
    } else {
      return res.status(400).json({ error: verification.error });
    }
  } catch (error) {
    console.error('Invite verification error:', error);
    return res.status(500).json({ error: 'An error occurred while verifying the invite code' });
  }
});

// Create invite - Admin only
inviteRouter.post('/create', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const inviteSchema = z.object({
      name: z.string().optional(),
      email: z.string().email(),
      role: z.enum(['admin', 'facilitator', 'participant']),
      cohortId: z.number().optional(),
      expiresAt: z.string().optional(), // ISO date string
    });
    
    const validation = inviteSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Invalid invite data', 
        details: validation.error.format() 
      });
    }
    
    const inviteData = validation.data;
    
    // Add created by info
    const createdBy = req.session.userId!;
    
    const invite = await inviteService.createInvite({
      ...inviteData,
      createdBy,
    });
    
    return res.status(201).json(invite);
  } catch (error) {
    console.error('Invite creation error:', error);
    return res.status(500).json({ error: 'An error occurred while creating the invite' });
  }
});

// Get all invites - Admin only
inviteRouter.get('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const invites = await inviteService.getAllInvites();
    return res.status(200).json(invites);
  } catch (error) {
    console.error('Get invites error:', error);
    return res.status(500).json({ error: 'An error occurred while fetching invites' });
  }
});

// Get invites created by current user - Admin or Facilitator
inviteRouter.get('/my-invites', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const invites = await inviteService.getInvitesByCreator(userId);
    return res.status(200).json(invites);
  } catch (error) {
    console.error('Get my invites error:', error);
    return res.status(500).json({ error: 'An error occurred while fetching your invites' });
  }
});

// Revoke invite - Admin only or the creator of the invite
inviteRouter.post('/revoke/:id', isAuthenticated, async (req, res) => {
  try {
    const inviteId = Number(req.params.id);
    
    if (isNaN(inviteId)) {
      return res.status(400).json({ error: 'Invalid invite ID' });
    }
    
    const userId = req.session.userId!;
    const userRole = req.session.userRole!;
    
    // Check if user is admin or the creator of the invite
    const invite = await inviteService.getInviteById(inviteId);
    
    if (!invite) {
      return res.status(404).json({ error: 'Invite not found' });
    }
    
    if (userRole !== 'admin' && invite.createdBy !== userId) {
      return res.status(403).json({ error: 'You do not have permission to revoke this invite' });
    }
    
    const revoked = await inviteService.revokeInvite(inviteId);
    
    if (revoked) {
      return res.status(200).json({ message: 'Invite revoked successfully' });
    } else {
      return res.status(400).json({ error: 'Failed to revoke invite' });
    }
  } catch (error) {
    console.error('Revoke invite error:', error);
    return res.status(500).json({ error: 'An error occurred while revoking the invite' });
  }
});