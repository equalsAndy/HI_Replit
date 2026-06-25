import express from 'express';
import { Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { isFacilitatorOrAdmin } from '../middleware/roles.js';
import { db } from '../db.js';
import { organizations, cohorts, users } from '../../shared/schema.js';
import { eq, sql } from 'drizzle-orm';
import { inviteService } from '../services/invite-service.js';

const router = express.Router();

/**
 * Get facilitator's organizations
 */
router.get('/organizations', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId;
    
    // Get organizations created by this facilitator
    const result = await db.execute(sql`
      SELECT id, name, description, created_at
      FROM organizations 
      WHERE created_by = ${userId}
      ORDER BY name ASC
    `);
    
    const organizationsData = result || [];
    
    res.json({
      success: true,
      organizations: organizationsData
    });
  } catch (error) {
    console.error('Error fetching facilitator organizations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch organizations'
    });
  }
});

/**
 * Get facilitator's cohorts
 */
router.get('/cohorts', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId;
    
    // Get cohorts where this user is the facilitator
    const result = await db.execute(sql`
      SELECT
        c.id,
        c.name,
        c.description,
        c.start_date,
        c.end_date,
        c.status,
        c.ast_access,
        c.ia_access,
        o.name as organization_name,
        (SELECT COUNT(*) FROM cohort_participants cp WHERE cp.cohort_id = c.id)::int as participant_count
      FROM cohorts c
      LEFT JOIN organizations o ON c.organization_id = o.id
      WHERE c.facilitator_id = ${userId}
      ORDER BY c.name ASC
    `);
    
    const cohortsData = result || [];
    
    res.json({
      success: true,
      cohorts: cohortsData
    });
  } catch (error) {
    console.error('Error fetching facilitator cohorts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cohorts'
    });
  }
});

/**
 * Create a new organization for the facilitator
 */
router.post('/organizations', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId;
    const { name, description } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Organization name is required'
      });
    }
    
    const result = await db.execute(sql`
      INSERT INTO organizations (name, description, created_by, created_at, updated_at)
      VALUES (${name.trim()}, ${description || null}, ${userId}, NOW(), NOW())
      RETURNING *
    `);
    
    const organizationData = (result as any)[0] || (result as any).rows?.[0];
    
    res.json({
      success: true,
      organization: organizationData
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create organization'
    });
  }
});

/**
 * Create a new cohort for the facilitator
 */
router.post('/cohorts', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId;
    const { 
      name, 
      description, 
      organizationId, 
      astAccess = true,
      iaAccess = true,
      pmAccess = false,
      startDate,
      endDate
    } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cohort name is required'
      });
    }
    
    const result = await db.execute(sql`
      INSERT INTO cohorts (
        name, 
        description, 
        facilitator_id, 
        organization_id, 
        ast_access,
        ia_access,
        pm_access,
        start_date,
        end_date,
        status,
        created_at, 
        updated_at
      )
      VALUES (
        ${name.trim()}, 
        ${description || null}, 
        ${userId}, 
        ${organizationId || null}, 
        ${astAccess},
        ${iaAccess},
        ${pmAccess},
        ${startDate || null},
        ${endDate || null},
        'active',
        NOW(), 
        NOW()
      )
      RETURNING *
    `);
    
    const cohortData = (result as any)[0] || (result as any).rows?.[0];
    
    res.json({
      success: true,
      cohort: cohortData
    });
  } catch (error) {
    console.error('Error creating cohort:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create cohort'
    });
  }
});

// ── Cohort Detail ────────────────────────────────────────────────────────────

/**
 * Helper: verify cohort belongs to requesting facilitator (or user is admin)
 */
async function verifyCohortOwnership(cohortId: number, req: Request, res: Response) {
  const userId = (req.session as any).userId;
  const userRole = (req.session as any).userRole;

  const result = await db.execute(sql`
    SELECT c.*, o.name as organization_name
    FROM cohorts c
    LEFT JOIN organizations o ON c.organization_id = o.id
    WHERE c.id = ${cohortId}
  `);

  const rows = (result as any).rows ?? result;
  const cohort = rows?.[0];

  if (!cohort) {
    res.status(404).json({ success: false, error: 'Cohort not found' });
    return null;
  }

  if (userRole !== 'admin' && cohort.facilitator_id !== userId) {
    res.status(403).json({ success: false, error: 'You do not have access to this cohort' });
    return null;
  }

  return cohort;
}

/**
 * Get cohort detail
 */
router.get('/cohorts/:cohortId', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const cohortId = parseInt(req.params.cohortId);
    const cohort = await verifyCohortOwnership(cohortId, req, res);
    if (!cohort) return;

    res.json({ success: true, cohort });
  } catch (error) {
    console.error('Error fetching cohort detail:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch cohort detail' });
  }
});

/**
 * Update cohort fields. Propagates ast_access/ia_access changes to all members.
 */
router.patch('/cohorts/:cohortId', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const cohortId = parseInt(req.params.cohortId);
    const cohort = await verifyCohortOwnership(cohortId, req, res);
    if (!cohort) return;

    const { name, description, organizationId, startDate, endDate, astAccess, iaAccess } = req.body;

    // Check at least one field is provided
    if (name === undefined && description === undefined && organizationId === undefined &&
        startDate === undefined && endDate === undefined && astAccess === undefined && iaAccess === undefined) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    // Use individual updates — drizzle sql`` doesn't support dynamic SET clauses
    // Resolve final values: use provided value or fall back to current
    const finalName = name !== undefined ? name.trim() : cohort.name;
    const finalDescription = description !== undefined ? (description || null) : cohort.description;
    const finalOrgId = organizationId !== undefined ? (organizationId || null) : cohort.organization_id;
    const finalStartDate = startDate !== undefined ? (startDate || null) : cohort.start_date;
    const finalEndDate = endDate !== undefined ? (endDate || null) : cohort.end_date;
    const finalAstAccess = astAccess !== undefined ? !!astAccess : cohort.ast_access;
    const finalIaAccess = iaAccess !== undefined ? !!iaAccess : cohort.ia_access;

    await db.execute(sql`
      UPDATE cohorts SET
        name = ${finalName},
        description = ${finalDescription},
        organization_id = ${finalOrgId},
        start_date = ${finalStartDate},
        end_date = ${finalEndDate},
        ast_access = ${finalAstAccess},
        ia_access = ${finalIaAccess},
        updated_at = NOW()
      WHERE id = ${cohortId}
    `);

    // If access flags changed, propagate to all current cohort members
    let propagatedCount = 0;
    if (astAccess !== undefined || iaAccess !== undefined) {
      const propagateResult = await db.execute(sql`
        UPDATE users
        SET ast_access = ${finalAstAccess},
            ia_access = ${finalIaAccess},
            updated_at = NOW()
        WHERE id IN (
          SELECT participant_id FROM cohort_participants WHERE cohort_id = ${cohortId}
        )
      `);
      propagatedCount = (propagateResult as any).rowCount ?? 0;
      console.log(`✅ Propagated access flags to ${propagatedCount} members of cohort ${cohortId}`);
    }

    // Return updated cohort
    const updatedResult = await db.execute(sql`
      SELECT c.*, o.name as organization_name
      FROM cohorts c
      LEFT JOIN organizations o ON c.organization_id = o.id
      WHERE c.id = ${cohortId}
    `);
    const updatedRows = (updatedResult as any).rows ?? updatedResult;
    const updated = updatedRows?.[0];

    res.json({ success: true, cohort: updated, propagatedCount });
  } catch (error) {
    console.error('Error updating cohort:', error);
    res.status(500).json({ success: false, error: 'Failed to update cohort' });
  }
});

/**
 * Get cohort participants with workshop completion status
 */
router.get('/cohorts/:cohortId/participants', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const cohortId = parseInt(req.params.cohortId);
    const cohort = await verifyCohortOwnership(cohortId, req, res);
    if (!cohort) return;

    const result = await db.execute(sql`
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        CONCAT(u.first_name, ' ', COALESCE(u.last_name, '')) as name,
        u.email,
        u.username,
        u.job_title,
        u.organization,
        u.ast_access,
        u.ia_access,
        u.ast_workshop_completed,
        u.ia_workshop_completed,
        u.last_login_at,
        u.disabled_at,
        cp.joined_at,
        np_ast.completed_steps as ast_completed_steps,
        np_ia.completed_steps as ia_completed_steps,
        (SELECT used_at FROM invites
           WHERE email = u.email AND cohort_id = ${cohortId}
           ORDER BY created_at DESC LIMIT 1) as invite_used_at
      FROM cohort_participants cp
      JOIN users u ON cp.participant_id = u.id
      LEFT JOIN navigation_progress np_ast ON np_ast.user_id = u.id AND np_ast.app_type = 'ast'
      LEFT JOIN navigation_progress np_ia ON np_ia.user_id = u.id AND np_ia.app_type = 'ia'
      WHERE cp.cohort_id = ${cohortId}
      ORDER BY u.first_name ASC
    `);

    const rows = (result as any).rows ?? result ?? [];

    const participants = (rows as any[]).map((row: any) => {
      const astSteps = row.ast_completed_steps;
      const iaSteps = row.ia_completed_steps;
      const hasAstProgress = astSteps && astSteps !== '[]' && astSteps !== '';
      const hasIaProgress = iaSteps && iaSteps !== '[]' && iaSteps !== '';

      let astStepCount = 0;
      let iaStepCount = 0;
      try { astStepCount = hasAstProgress ? JSON.parse(astSteps).length : 0; } catch {}
      try { iaStepCount = hasIaProgress ? JSON.parse(iaSteps).length : 0; } catch {}

      return {
        id: row.id,
        firstName: row.first_name || '',
        lastName: row.last_name || '',
        name: row.name?.trim() || row.username,
        email: row.email,
        jobTitle: row.job_title || '',
        organization: row.organization || '',
        joinedAt: row.joined_at,
        lastLoginAt: row.last_login_at || null,
        disabledAt: row.disabled_at || null,
        astAccess: row.ast_access ?? true,
        iaAccess: row.ia_access ?? true,
        astStatus: row.ast_workshop_completed ? 'complete' : hasAstProgress ? 'in_progress' : 'not_started',
        iaStatus: row.ia_workshop_completed ? 'complete' : hasIaProgress ? 'in_progress' : 'not_started',
        astStepCount,
        iaStepCount,
        inviteUsed: !!row.invite_used_at,
      };
    });

    res.json({ success: true, participants, count: participants.length });
  } catch (error) {
    console.error('Error fetching cohort participants:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch participants' });
  }
});

/**
 * Remove participant from cohort
 */
router.delete('/cohorts/:cohortId/participants/:userId', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const cohortId = parseInt(req.params.cohortId);
    const participantId = parseInt(req.params.userId);
    const cohort = await verifyCohortOwnership(cohortId, req, res);
    if (!cohort) return;

    await db.execute(sql`
      DELETE FROM cohort_participants
      WHERE cohort_id = ${cohortId} AND participant_id = ${participantId}
    `);

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing participant:', error);
    res.status(500).json({ success: false, error: 'Failed to remove participant' });
  }
});

/**
 * Disable or re-enable a participant account
 */
router.patch('/cohorts/:cohortId/participants/:userId/disable', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const cohortId = parseInt(req.params.cohortId);
    const participantId = parseInt(req.params.userId);
    const cohort = await verifyCohortOwnership(cohortId, req, res);
    if (!cohort) return;

    // Confirm participant is in this cohort
    const membership = await db.execute(sql`
      SELECT 1 FROM cohort_participants
      WHERE cohort_id = ${cohortId} AND participant_id = ${participantId}
    `);
    const memberRows = (membership as any).rows ?? membership ?? [];
    if (!memberRows.length) {
      return res.status(404).json({ success: false, error: 'Participant not in this cohort' });
    }

    const { disabled } = req.body; // true = disable, false = re-enable
    if (disabled) {
      await db.execute(sql`UPDATE users SET disabled_at = NOW() WHERE id = ${participantId} AND disabled_at IS NULL`);
    } else {
      await db.execute(sql`UPDATE users SET disabled_at = NULL WHERE id = ${participantId}`);
    }

    res.json({ success: true, disabled: !!disabled });
  } catch (error) {
    console.error('Error toggling participant disable:', error);
    res.status(500).json({ success: false, error: 'Failed to update account status' });
  }
});

/**
 * Update a participant's profile fields
 */
router.patch('/cohorts/:cohortId/participants/:userId/profile', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const cohortId = parseInt(req.params.cohortId);
    const participantId = parseInt(req.params.userId);
    const cohort = await verifyCohortOwnership(cohortId, req, res);
    if (!cohort) return;

    const membership = await db.execute(sql`
      SELECT 1 FROM cohort_participants
      WHERE cohort_id = ${cohortId} AND participant_id = ${participantId}
    `);
    const memberRows = (membership as any).rows ?? membership ?? [];
    if (!memberRows.length) {
      return res.status(404).json({ success: false, error: 'Participant not in this cohort' });
    }

    const { firstName, lastName, email, jobTitle, organization } = req.body;
    const updateObj: Record<string, any> = { updatedAt: new Date() };
    if (firstName !== undefined) updateObj.firstName = firstName;
    if (lastName !== undefined) updateObj.lastName = lastName;
    if (email !== undefined) updateObj.email = email;
    if (jobTitle !== undefined) updateObj.jobTitle = jobTitle;
    if (organization !== undefined) updateObj.organization = organization;

    if (Object.keys(updateObj).length <= 1) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    await db.update(users).set(updateObj).where(eq(users.id, participantId));

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating participant profile:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

// ── Cohort Invites ───────────────────────────────────────────────────────────

/**
 * Create invite assigned to a cohort
 */
router.post('/cohorts/:cohortId/invites', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const cohortId = parseInt(req.params.cohortId);
    const userId = (req.session as any).userId;
    const cohort = await verifyCohortOwnership(cohortId, req, res);
    if (!cohort) return;

    const { email, name, expiresAt } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const expiration = expiresAt
      ? new Date(expiresAt)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days default

    const result = await inviteService.createInviteWithAssignment({
      email: email.trim(),
      name: name?.trim() || undefined,
      role: 'participant',
      cohortId,
      organizationId: cohort.organization_id ? String(cohort.organization_id) : null,
      createdBy: userId,
      expiresAt: expiration,
      astAccess: cohort.ast_access ?? true,
      iaAccess: cohort.ia_access ?? true,
    });

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({
      success: true,
      invite: result.invite,
    });
  } catch (error) {
    console.error('Error creating cohort invite:', error);
    res.status(500).json({ success: false, error: 'Failed to create invite' });
  }
});

/**
 * Bulk create invites for a cohort
 */
router.post('/cohorts/:cohortId/invites/bulk', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const cohortId = parseInt(req.params.cohortId);
    const userId = (req.session as any).userId;
    const cohort = await verifyCohortOwnership(cohortId, req, res);
    if (!cohort) return;

    const { invitees } = req.body; // [{ email, name, jobTitle?, organization? }]
    if (!Array.isArray(invitees) || invitees.length === 0) {
      return res.status(400).json({ success: false, error: 'invitees array is required' });
    }

    const expiration = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const results: any[] = [];
    const errors: string[] = [];

    for (const invitee of invitees) {
      if (!invitee.email?.trim()) {
        errors.push(`Skipped row with missing email`);
        continue;
      }
      const result = await inviteService.createInviteWithAssignment({
        email: invitee.email.trim(),
        name: invitee.name?.trim() || undefined,
        jobTitle: invitee.jobTitle?.trim() || undefined,
        organization: invitee.organization?.trim() || undefined,
        role: 'participant',
        cohortId,
        organizationId: cohort.organization_id ? String(cohort.organization_id) : null,
        createdBy: userId,
        expiresAt: expiration,
        astAccess: cohort.ast_access ?? true,
        iaAccess: cohort.ia_access ?? true,
      });
      if (result.success) {
        results.push(result.invite);
      } else {
        errors.push(`${invitee.email}: ${result.error}`);
      }
    }

    res.json({ success: true, invites: results, errors });
  } catch (error) {
    console.error('Error bulk creating cohort invites:', error);
    res.status(500).json({ success: false, error: 'Failed to create invites' });
  }
});

/**
 * List pending invites for a cohort
 */
router.get('/cohorts/:cohortId/invites', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const cohortId = parseInt(req.params.cohortId);
    const cohort = await verifyCohortOwnership(cohortId, req, res);
    if (!cohort) return;

    const result = await db.execute(sql`
      SELECT
        i.id,
        i.invite_code,
        i.email,
        i.name,
        i.created_at,
        i.expires_at,
        i.used_at
      FROM invites i
      WHERE i.cohort_id = ${cohortId} AND i.used_at IS NULL
      ORDER BY i.created_at DESC
    `);

    const rows = (result as any).rows ?? result ?? [];

    res.json({ success: true, invites: rows });
  } catch (error) {
    console.error('Error fetching cohort invites:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch invites' });
  }
});

export const facilitatorRouter = router;