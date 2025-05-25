import express from 'express';
import { inviteService } from '../services/invite-service';
import { isAdmin, isFacilitator } from '../middleware/auth';
import { z } from 'zod';

export const inviteRouter = express.Router();

// Create a new invite - accessible by admins and facilitators
inviteRouter.post('/create', isFacilitator, async (req, res) => {
  try {
    // Define validation schema for invite creation
    const createInviteSchema = z.object({
      email: z.string().email(),
      role: z.enum(['admin', 'facilitator', 'participant']),
      name: z.string().optional(),
      cohortId: z.number().optional(),
      expiresAt: z.string().optional().transform(val => val ? new Date(val) : undefined),
    });
    
    // Validate the request body
    const validation = createInviteSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Invalid invite data', 
        details: validation.error.format() 
      });
    }
    
    const inviteData = validation.data;
    
    // Only admins can create admin invites
    if (inviteData.role === 'admin' && req.session.userRole !== 'admin') {
      return res.status(403).json({ 
        error: 'Only administrators can create admin invites' 
      });
    }
    
    // Only admins can create facilitator invites
    if (inviteData.role === 'facilitator' && req.session.userRole !== 'admin') {
      return res.status(403).json({ 
        error: 'Only administrators can create facilitator invites' 
      });
    }
    
    // Create the invite
    const invite = await inviteService.createInvite({
      email: inviteData.email,
      role: inviteData.role,
      createdBy: req.session.userId,
      name: inviteData.name,
      cohortId: inviteData.cohortId,
      expiresAt: inviteData.expiresAt,
    });
    
    return res.status(201).json({
      message: 'Invitation created successfully',
      invite,
    });
  } catch (error) {
    console.error('Invite creation error:', error);
    return res.status(500).json({ error: 'An error occurred while creating the invitation' });
  }
});

// Get all invites - admin only
inviteRouter.get('/all', isAdmin, async (req, res) => {
  try {
    const invites = await inviteService.getAllInvites();
    return res.status(200).json(invites);
  } catch (error) {
    console.error('Get all invites error:', error);
    return res.status(500).json({ error: 'An error occurred while retrieving invites' });
  }
});

// Get invites created by the current user - facilitators and admins
inviteRouter.get('/my-invites', isFacilitator, async (req, res) => {
  try {
    const invites = await inviteService.getInvitesByCreator(req.session.userId);
    return res.status(200).json(invites);
  } catch (error) {
    console.error('Get user invites error:', error);
    return res.status(500).json({ error: 'An error occurred while retrieving your invites' });
  }
});

// Verify an invite code - public endpoint
inviteRouter.post('/verify', async (req, res) => {
  try {
    const { inviteCode } = req.body;
    
    if (!inviteCode) {
      return res.status(400).json({ error: 'Invite code is required' });
    }
    
    const verification = await inviteService.verifyInviteCode(inviteCode);
    
    return res.status(200).json(verification);
  } catch (error) {
    console.error('Invite verification error:', error);
    return res.status(500).json({ error: 'An error occurred while verifying the invite code' });
  }
});

// Delete an invite - admin only
inviteRouter.delete('/:id', isAdmin, async (req, res) => {
  try {
    const inviteId = parseInt(req.params.id);
    
    if (isNaN(inviteId)) {
      return res.status(400).json({ error: 'Invalid invite ID' });
    }
    
    const result = await inviteService.deleteInvite(inviteId);
    
    if (!result) {
      return res.status(404).json({ error: 'Invite not found' });
    }
    
    return res.status(200).json({ 
      message: 'Invite deleted successfully',
      invite: result,
    });
  } catch (error) {
    console.error('Invite deletion error:', error);
    return res.status(500).json({ error: 'An error occurred while deleting the invite' });
  }
});