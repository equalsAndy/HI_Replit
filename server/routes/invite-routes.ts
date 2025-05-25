import express from 'express';
import { inviteService } from '../services/invite-service';
import { userManagementService } from '../services/user-management-service';
import { isFacilitatorOrAdmin } from '../middleware/roles';
import { isAuthenticated } from '../middleware/auth';
import { normalizeInviteCode } from '../utils/invite-code';

const router = express.Router();

// All invite routes require authentication
router.use(isAuthenticated);

// Get all invites (for admins/facilitators)
router.get('/invites', isFacilitatorOrAdmin, async (req, res) => {
  try {
    const invites = await inviteService.getAllInvites();
    return res.status(200).json({ invites });
  } catch (error) {
    console.error('Error fetching invites:', error);
    return res.status(500).json({ error: 'An error occurred while fetching invites' });
  }
});

// Get unused invites (for admins/facilitators)
router.get('/invites/unused', isFacilitatorOrAdmin, async (req, res) => {
  try {
    const invites = await inviteService.getUnusedInvites();
    return res.status(200).json({ invites });
  } catch (error) {
    console.error('Error fetching unused invites:', error);
    return res.status(500).json({ error: 'An error occurred while fetching unused invites' });
  }
});

// Create a new invite (for admins/facilitators)
router.post('/invites', isFacilitatorOrAdmin, async (req, res) => {
  try {
    const { name, email, role, cohortId } = req.body;
    
    // Validate required fields
    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required' });
    }
    
    // Only admins can create admin/facilitator invites
    if ((role === 'admin' || role === 'facilitator') && req.session.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create admin or facilitator invites' });
    }
    
    // Create the invite
    const invite = await inviteService.createInvite({
      name,
      email,
      role,
      createdBy: req.session.userId,
      cohortId: cohortId || null,
    });
    
    return res.status(201).json({ invite });
  } catch (error) {
    console.error('Error creating invite:', error);
    return res.status(500).json({ error: 'An error occurred while creating the invite' });
  }
});

// Generate batch invites (for admins/facilitators)
router.post('/invites/batch', isFacilitatorOrAdmin, async (req, res) => {
  try {
    const { count, role, cohortId } = req.body;
    
    // Validate required fields
    if (!count || !role) {
      return res.status(400).json({ error: 'Count and role are required' });
    }
    
    // Only admins can create admin/facilitator invites
    if ((role === 'admin' || role === 'facilitator') && req.session.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create admin or facilitator invites' });
    }
    
    // Generate batch invites
    const invites = await inviteService.generateBatchInvites(count, {
      role,
      createdBy: req.session.userId,
      cohortId: cohortId || null,
    });
    
    return res.status(201).json({ invites });
  } catch (error) {
    console.error('Error generating batch invites:', error);
    return res.status(500).json({ error: 'An error occurred while generating batch invites' });
  }
});

// Get invite by ID (for admins/facilitators)
router.get('/invites/:id', isFacilitatorOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const invite = await inviteService.getInviteById(Number(id));
    
    if (!invite) {
      return res.status(404).json({ error: 'Invite not found' });
    }
    
    return res.status(200).json({ invite });
  } catch (error) {
    console.error('Error fetching invite:', error);
    return res.status(500).json({ error: 'An error occurred while fetching the invite' });
  }
});

// Delete invite (for admins/facilitators)
router.delete('/invites/:id', isFacilitatorOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const invite = await inviteService.getInviteById(Number(id));
    
    if (!invite) {
      return res.status(404).json({ error: 'Invite not found' });
    }
    
    // Check if this user has permission to delete this invite
    if (req.session.userRole !== 'admin' && invite.createdBy !== req.session.userId) {
      return res.status(403).json({ error: 'You do not have permission to delete this invite' });
    }
    
    await inviteService.deleteInvite(Number(id));
    
    return res.status(200).json({ message: 'Invite deleted successfully' });
  } catch (error) {
    console.error('Error deleting invite:', error);
    return res.status(500).json({ error: 'An error occurred while deleting the invite' });
  }
});

export default router;