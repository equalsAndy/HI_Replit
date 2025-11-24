import express from 'express';
import { inviteService } from '../services/invite-service.js';
import { requireAuth } from '../middleware/auth.js';
import { isAdmin, isFacilitatorOrAdmin } from '../middleware/roles.js';
import { validateInviteCode, formatInviteCode } from '../utils/invite-code.js';

const router = express.Router();

/**
 * Create a new invite with cohort and organization assignments (admins and facilitators with role restrictions)
 */
router.post('/', requireAuth, isFacilitatorOrAdmin, async (req, res) => {
  try {
    const { email, role, name, expiresAt, cohortId, organizationId, isBetaTester, astAccess, iaAccess, showDemoDataButtons } = req.body;
    const userRole = (req.session as any).userRole;
    const userId = (req.session as any).userId;
    
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
    
    // Use enhanced invite service with cohort and organization assignment
    const result = await inviteService.createInviteWithAssignment({
      email,
      role,
      name,
      createdBy: userId,
      cohortId: cohortId || null,
      organizationId: organizationId || null,
      isBetaTester: isBetaTester || false,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      astAccess: astAccess !== undefined ? !!astAccess : true,
      iaAccess: iaAccess !== undefined ? !!iaAccess : true,
      showDemoDataButtons: showDemoDataButtons !== undefined ? !!showDemoDataButtons : false
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
 * Update a pending invite (role-based)
 */
router.put('/:id', requireAuth, isFacilitatorOrAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid invite ID' });
    }

    const { role, name, isBetaTester, astAccess, iaAccess, showDemoDataButtons } = req.body;
    const userRole = (req.session as any).userRole;
    const userId = (req.session as any).userId;

    // Fetch invite to enforce ownership/usage checks
    const inviteResult = await inviteService.getInviteById(id);
    if (!inviteResult.success || !inviteResult.invite) {
      return res.status(404).json({ success: false, error: 'Invite not found' });
    }

    // Prevent edits on used invites
    if ((inviteResult.invite as any).usedAt || (inviteResult.invite as any).used_at) {
      return res.status(400).json({ success: false, error: 'Cannot edit a used invite' });
    }

    // Facilitators can only edit their own invites
    if (userRole === 'facilitator' && (inviteResult.invite as any).createdBy !== userId && (inviteResult.invite as any).created_by !== userId) {
      return res.status(403).json({ success: false, error: 'Not authorized to edit this invite' });
    }

    // Facilitators limited to participant/student roles
    if (userRole === 'facilitator' && role && !['participant', 'student'].includes(role)) {
      return res.status(403).json({ success: false, error: 'Facilitators can only assign participant or student roles' });
    }

    const updateResult = await inviteService.updateInvite(id, {
      role,
      name,
      isBetaTester,
      astAccess,
      iaAccess,
      showDemoDataButtons
    });

    if (!updateResult.success) {
      return res.status(400).json(updateResult);
    }

    res.json({
      success: true,
      invite: {
        ...updateResult.invite,
        formattedCode: formatInviteCode((updateResult.invite as any).invite_code || (updateResult.invite as any).inviteCode || '')
      }
    });
  } catch (error) {
    console.error('Error updating invite:', error);
    res.status(500).json({ success: false, error: 'Failed to update invite' });
  }
});

/**
 * Get invites with enhanced details (role-based filtering)
 */
router.get('/', requireAuth, isFacilitatorOrAdmin, async (req, res) => {
  try {
    const userRole = (req.session as any).userRole;
    const userId = (req.session as any).userId;
    const statusParam = (req.query.status as string | undefined)?.toLowerCase();
    const status = statusParam === 'used' || statusParam === 'pending' ? (statusParam as 'used' | 'pending') : undefined;
    
    let result;
    if (userRole === 'facilitator') {
      // Facilitators only see invites they created with cohort/organization details
      result = await inviteService.getInvitesWithDetails(userId, status);
    } else {
      // Admins see all invites with full details
      result = await inviteService.getInvitesWithDetails(undefined, status);
    }
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    // Format invite codes for display and ensure consistent property names
    const formattedInvites = (result.invites || []).map((invite: any) => ({
      ...invite,
      formattedCode: formatInviteCode((invite as any).inviteCode || (invite as any).invite_code),
      createdAt: (invite as any).created_at || (invite as any).createdAt,
      inviteCode: (invite as any).invite_code || (invite as any).inviteCode,
      usedByName: (invite as any).used_by_name,
      usedByEmail: (invite as any).used_by_email,
      usedAt: (invite as any).used_at || (invite as any).usedAt
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
    if ((result.invite as any)?.usedAt) {
      return res.status(400).json({
        success: false,
        error: 'This invite code has already been used'
      });
    }
    
    // Return limited info for security
    res.json({
      success: true,
      invite: {
        email: (result.invite as any)?.email,
        role: (result.invite as any)?.role,
        name: result.invite?.name,
        expiresAt: result.invite?.expiresAt
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
 * Update a pending invite (admin and facilitator with restrictions)
 */
router.patch('/:id', requireAuth, isFacilitatorOrAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userRole = (req.session as any).userRole;

    console.log(`📝 PATCH /api/invites/${id} - User: ${(req.session as any).userId}, Role: ${userRole}`);
    console.log('📝 Request body:', JSON.stringify(req.body, null, 2));

    if (isNaN(id)) {
      console.log(`❌ Invalid ID: ${req.params.id}`);
      return res.status(400).json({
        success: false,
        error: 'Invalid ID'
      });
    }

    const {
      astAccess,
      iaAccess,
      showDemoDataButtons,
      name,
      role,
      expiresAt,
      cohortId,
      organizationId,
      isBetaTester
    } = req.body;

    // Restrict facilitators to participant/student roles only
    if (userRole === 'facilitator' && role) {
      const allowedRoles = ['participant', 'student'];
      if (!allowedRoles.includes(role)) {
        return res.status(403).json({
          success: false,
          error: 'Facilitators can only set participant and student roles'
        });
      }
    }

    const updates: any = {};
    if (astAccess !== undefined) updates.astAccess = !!astAccess;
    if (iaAccess !== undefined) updates.iaAccess = !!iaAccess;
    if (showDemoDataButtons !== undefined) updates.showDemoDataButtons = !!showDemoDataButtons;
    if (name !== undefined) updates.name = name;
    if (role !== undefined) updates.role = role;
    if (expiresAt !== undefined) updates.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (cohortId !== undefined) updates.cohortId = cohortId ? parseInt(cohortId) : null;
    if (organizationId !== undefined) updates.organizationId = organizationId || null;
    if (isBetaTester !== undefined) updates.isBetaTester = !!isBetaTester;

    console.log('📝 Updates to apply:', JSON.stringify(updates, null, 2));

    const result = await inviteService.updateInvite(id, updates);

    console.log('📝 Update result:', JSON.stringify(result, null, 2));

    if (!result.success) {
      console.log(`❌ Update failed: ${result.error}`);
      return res.status(400).json(result);
    }

    console.log(`✅ Invite ${id} updated successfully`);
    res.json(result);
  } catch (error) {
    console.error('❌ Error updating invite:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update invite'
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

/**
 * Bulk delete invites (admin only)
 */
router.post('/bulk-delete', requireAuth, isAdmin, async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.map((n: any) => parseInt(n, 10)).filter((n: any) => !isNaN(n)) : [];
    const result = await inviteService.deleteInvites(ids);
    if (!result.success) return res.status(400).json(result);
    res.json(result);
  } catch (error) {
    console.error('Error bulk deleting invites:', error);
    res.status(500).json({ success: false, error: 'Failed to bulk delete invites' });
  }
});

/**
 * Delete all used invites (admin only)
 */
router.post('/delete-used', requireAuth, isAdmin, async (_req, res) => {
  try {
    const result = await inviteService.deleteUsedInvites();
    if (!result.success) return res.status(400).json(result);
    res.json(result);
  } catch (error) {
    console.error('Error deleting used invites:', error);
    res.status(500).json({ success: false, error: 'Failed to delete used invites' });
  }
});

export default router;
