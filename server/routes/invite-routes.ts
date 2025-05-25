import express from 'express';
import { inviteService } from '../services/invite-service';
import { userManagementService } from '../services/user-management-service';
import { isValidInviteCodeFormat } from '../utils/invite-code';
import { z } from 'zod';

// Create a router
export const inviteRouter = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Middleware to check if user is an admin
const isAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const user = await userManagementService.getUserById(req.session.userId);
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
};

// Middleware to check if user is an admin or facilitator
const isAdminOrFacilitator = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const user = await userManagementService.getUserById(req.session.userId);
  
  if (!user || (user.role !== 'admin' && user.role !== 'facilitator')) {
    return res.status(403).json({ error: 'Admin or facilitator access required' });
  }
  
  next();
};

// Verify an invite code
inviteRouter.post('/verify', async (req, res) => {
  const { inviteCode } = req.body;
  
  if (!inviteCode || !isValidInviteCodeFormat(inviteCode)) {
    return res.status(400).json({ error: 'Invalid invite code format' });
  }
  
  try {
    const verification = await inviteService.verifyInvite(inviteCode);
    
    if (!verification.valid) {
      return res.status(400).json({ error: verification.error || 'Invalid invite code' });
    }
    
    return res.status(200).json({
      valid: true,
      invite: {
        id: verification.invite?.id,
        email: verification.invite?.email,
        name: verification.invite?.name,
        role: verification.invite?.role,
        inviteCode: inviteCode
      }
    });
  } catch (error) {
    console.error('Error verifying invite:', error);
    return res.status(500).json({ error: 'An error occurred while verifying the invite code' });
  }
});

// Create a new invite (admin or facilitator only)
inviteRouter.post('/create', isAdminOrFacilitator, async (req, res) => {
  // Validate request body
  const createInviteSchema = z.object({
    email: z.string().email('Invalid email address'),
    name: z.string().optional(),
    role: z.enum(['admin', 'facilitator', 'participant']),
    expiresAt: z.string().optional(),
  });

  try {
    const validatedData = createInviteSchema.parse(req.body);
    
    // Only admins can create admin or facilitator invites
    if ((validatedData.role === 'admin' || validatedData.role === 'facilitator') && 
        req.session.userRole !== 'admin') {
      return res.status(403).json({ 
        error: 'Only administrators can create admin or facilitator invites' 
      });
    }
    
    // Create the invite
    const invite = await inviteService.createInvite({
      email: validatedData.email,
      name: validatedData.name || null,
      role: validatedData.role,
      createdBy: req.session.userId as number,
      expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null
    });
    
    return res.status(201).json({
      message: 'Invite created successfully',
      invite: {
        id: invite.id,
        email: invite.email,
        name: invite.name,
        role: invite.role,
        inviteCode: invite.inviteCode,
        expiresAt: invite.expiresAt
      }
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
inviteRouter.get('/all', isAdmin, async (req, res) => {
  try {
    const invites = await inviteService.getAllInvites();
    return res.status(200).json({ invites });
  } catch (error) {
    console.error('Error getting invites:', error);
    return res.status(500).json({ error: 'An error occurred while fetching invites' });
  }
});

// Get all unused invites (admin or facilitator only)
inviteRouter.get('/unused', isAdminOrFacilitator, async (req, res) => {
  try {
    const invites = await inviteService.getUnusedInvites();
    return res.status(200).json({ invites });
  } catch (error) {
    console.error('Error getting unused invites:', error);
    return res.status(500).json({ error: 'An error occurred while fetching unused invites' });
  }
});

// Get invites created by the current user (admin or facilitator only)
inviteRouter.get('/my-invites', isAdminOrFacilitator, async (req, res) => {
  try {
    const invites = await inviteService.getInvitesByCreator(req.session.userId as number);
    return res.status(200).json({ invites });
  } catch (error) {
    console.error('Error getting user invites:', error);
    return res.status(500).json({ error: 'An error occurred while fetching your invites' });
  }
});

// Delete an invite (admin only)
inviteRouter.delete('/:id', isAdmin, async (req, res) => {
  const inviteId = parseInt(req.params.id);
  
  if (isNaN(inviteId)) {
    return res.status(400).json({ error: 'Invalid invite ID' });
  }
  
  try {
    const success = await inviteService.deleteInvite(inviteId);
    
    if (!success) {
      return res.status(400).json({ error: 'Failed to delete invite. It may already be used.' });
    }
    
    return res.status(200).json({ message: 'Invite deleted successfully' });
  } catch (error) {
    console.error('Error deleting invite:', error);
    return res.status(500).json({ error: 'An error occurred while deleting the invite' });
  }
});