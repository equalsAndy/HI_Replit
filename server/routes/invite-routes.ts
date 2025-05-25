import express from 'express';
import { z } from 'zod';
import { inviteService } from '../services/invite-service';
import { formatInviteCode } from '../utils/invite-code';

// Create the invite router
export const inviteRouter = express.Router();

// Define middleware to check if user is admin
const isAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  if (req.session.userRole !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }
  
  next();
};

// Define middleware to check if user is admin or facilitator
const isAdminOrFacilitator = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  if (req.session.userRole !== 'admin' && req.session.userRole !== 'facilitator') {
    return res.status(403).json({ error: 'Access denied. Admin or facilitator role required.' });
  }
  
  next();
};

// Verify an invite code (public route)
inviteRouter.post('/verify', async (req, res) => {
  const schema = z.object({
    inviteCode: z.string().min(12).max(12)
  });
  
  try {
    const { inviteCode } = schema.parse(req.body);
    
    const verification = await inviteService.verifyInvite(inviteCode);
    
    if (!verification.valid) {
      return res.status(400).json({ 
        valid: false, 
        error: verification.error || 'Invalid invite code' 
      });
    }
    
    return res.status(200).json({ 
      valid: true,
      invite: {
        email: verification.invite?.email,
        role: verification.invite?.role,
        name: verification.invite?.name
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error verifying invite code:', error);
    return res.status(500).json({ error: 'An error occurred while verifying the invite code' });
  }
});

// Create a new invite (admin or facilitator only)
inviteRouter.post('/', isAdminOrFacilitator, async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    role: z.enum(['admin', 'facilitator', 'participant']),
    name: z.string().optional(),
    expiresAt: z.date().optional()
  });
  
  try {
    const data = schema.parse(req.body);
    
    // Check if user is authorized to create invites with this role
    if (data.role === 'admin' && req.session.userRole !== 'admin') {
      return res.status(403).json({ 
        error: 'Only administrators can create admin invites' 
      });
    }
    
    // Create the invite
    const result = await inviteService.createInvite({
      email: data.email,
      role: data.role,
      name: data.name || null,
      createdBy: req.session.userId!,
      expiresAt: data.expiresAt || null
    });
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    
    // Format the invite code for display
    const formattedInviteCode = formatInviteCode(result.invite.inviteCode);
    
    return res.status(201).json({
      id: result.invite.id,
      email: result.invite.email,
      name: result.invite.name,
      role: result.invite.role,
      inviteCode: result.invite.inviteCode,
      formattedInviteCode,
      expiresAt: result.invite.expiresAt,
      createdAt: result.invite.createdAt
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error creating invite:', error);
    return res.status(500).json({ error: 'An error occurred while creating the invite' });
  }
});

// Get all invites (admin only)
inviteRouter.get('/', isAdmin, async (req, res) => {
  try {
    const invites = await inviteService.getAllInvites();
    
    // Format invite codes for display
    const formattedInvites = invites.map(invite => ({
      ...invite,
      formattedInviteCode: formatInviteCode(invite.inviteCode)
    }));
    
    return res.status(200).json(formattedInvites);
  } catch (error) {
    console.error('Error getting invites:', error);
    return res.status(500).json({ error: 'An error occurred while getting invites' });
  }
});

// Get all unused invites (admin or facilitator)
inviteRouter.get('/unused', isAdminOrFacilitator, async (req, res) => {
  try {
    const invites = await inviteService.getUnusedInvites();
    
    // Format invite codes for display
    const formattedInvites = invites.map(invite => ({
      ...invite,
      formattedInviteCode: formatInviteCode(invite.inviteCode)
    }));
    
    // If user is a facilitator, filter to only show their invites
    if (req.session.userRole === 'facilitator') {
      const filteredInvites = formattedInvites.filter(
        invite => invite.createdBy === req.session.userId
      );
      return res.status(200).json(filteredInvites);
    }
    
    return res.status(200).json(formattedInvites);
  } catch (error) {
    console.error('Error getting unused invites:', error);
    return res.status(500).json({ error: 'An error occurred while getting unused invites' });
  }
});

// Delete an invite (admin only)
inviteRouter.delete('/:id', isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid invite ID' });
    }
    
    const result = await inviteService.deleteInvite(id);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    
    return res.status(200).json({ message: 'Invite deleted successfully' });
  } catch (error) {
    console.error('Error deleting invite:', error);
    return res.status(500).json({ error: 'An error occurred while deleting the invite' });
  }
});