import express from 'express';
import { inviteService } from '../services/invite-service';
import { requireAuth } from '../middleware/auth';
import { isAdmin, isFacilitatorOrAdmin } from '../middleware/roles';
import { validateInviteCode, formatInviteCode } from '../utils/invite-code';

const router = express.Router();

/**
 * Create a new invite (admins and facilitators with role restrictions)
 */
router.post('/', requireAuth, isFacilitatorOrAdmin, async (req, res) => {
  try {
    const { email, role, name, expiresAt } = req.body;
    const userRole = (req.session as any).userRole;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }
    
    if (!role || !['admin', 'facilitator', 'participant', 'student'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Valid role is required'
      });
    }
    
    // Restrict facilitators to participant/student roles only
    if (userRole === 'facilitator') {
      const allowedRoles = ['participant', 'student'];
      if (!allowedRoles.includes(role)) {
        return res.status(403).json({ 
          success: false,
          error: 'Facilitators can only create participant and student invites' 
        });
      }
    }
    
    const result = await inviteService.createInvite({
      email,
      role: role as 'admin' | 'facilitator' | 'participant' | 'student',
      name,
      createdBy: req.session.userId!,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    // Format the invite code for display
    const formattedInvite = {
      ...result.invite,
      formattedCode: formatInviteCode((result.invite as any)?.invite_code || (result.invite as any)?.inviteCode || '')
    };
    
    res.json({
      success: true,
      invite: formattedInvite
    });
  } catch (error) {
    console.error('Error creating invite:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create invite'
    });
  }
});

/**
 * Get invites (role-based filtering)
 */
router.get('/', requireAuth, isFacilitatorOrAdmin, async (req, res) => {
  try {
    const userRole = (req.session as any).userRole;
    const userId = (req.session as any).userId;
    
    let result;
    if (userRole === 'facilitator') {
      // Facilitators only see invites they created
      result = await inviteService.getInvitesByCreatorWithInfo(userId);
    } else {
      // Admins see all invites with creator information
      result = await inviteService.getAllInvites();
    }
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    // Format invite codes for display
    const formattedInvites = result.invites.map(invite => ({
      ...invite,
      formattedCode: formatInviteCode(invite.inviteCode || invite.invite_code)
    }));
    
    res.json({
      success: true,
      invites: formattedInvites
    });
  } catch (error) {
    console.error('Error getting invites:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get invites'
    });
  }
});

/**
 * Get invite details by code (public, used for verification)
 */
router.get('/code/:code', async (req, res) => {
  try {
    const code = req.params.code;
    
    if (!validateInviteCode(code)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid invite code format'
      });
    }
    
    const result = await inviteService.getInviteByCode(code.replace(/-/g, '').toUpperCase());
    
    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: 'Invalid invite code'
      });
    }
    
    // Check if the invite code has already been used
    if (result.invite?.usedAt) {
      return res.status(400).json({
        success: false,
        error: 'This invite code has already been used'
      });
    }
    
    // Return limited info for security
    res.json({
      success: true,
      invite: {
        email: result.invite.email,
        role: result.invite.role,
        name: result.invite.name,
        expiresAt: result.invite.expiresAt
      }
    });
  } catch (error) {
    console.error('Error getting invite by code:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get invite'
    });
  }
});

/**
 * Delete an invite (admin only)
 */
router.delete('/:id', requireAuth, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID'
      });
    }
    
    const result = await inviteService.deleteInvite(id);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error deleting invite:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete invite'
    });
  }
});

export default router;