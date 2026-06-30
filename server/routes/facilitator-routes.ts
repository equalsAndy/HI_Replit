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

    const result = await db.execute(sql`
      SELECT
        o.id,
        o.name,
        o.description,
        o.created_at,
        (SELECT COUNT(*) FROM cohorts c WHERE c.organization_id = o.id AND c.facilitator_id = ${userId})::int AS cohort_count
      FROM organizations o
      WHERE o.created_by = ${userId}
      ORDER BY o.name ASC
    `);

    res.json({
      success: true,
      organizations: result || []
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
 * Get organization detail with its cohorts
 */
router.get('/organizations/:orgId', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId;
    const userRole = (req.session as any).userRole;
    const { orgId } = req.params;

    const orgRows = await db.execute(sql`
      SELECT id, name, description, created_at
      FROM organizations
      WHERE id = ${orgId}
        AND (created_by = ${userId} OR ${userRole} = 'admin')
    `);

    const rows = (orgRows as any).rows ?? orgRows;
    const org = rows?.[0];

    if (!org) {
      return res.status(404).json({ success: false, error: 'Organization not found' });
    }

    const cohortRows = await db.execute(sql`
      SELECT
        c.id,
        c.name,
        c.description,
        c.start_date,
        c.end_date,
        c.status,
        c.ast_access,
        c.ia_access,
        (SELECT COUNT(*) FROM cohort_participants cp WHERE cp.cohort_id = c.id)::int AS participant_count
      FROM cohorts c
      WHERE c.organization_id = ${orgId}
        AND (c.facilitator_id = ${userId} OR ${userRole} = 'admin')
      ORDER BY c.name ASC
    `);

    const cohortData = (cohortRows as any).rows ?? cohortRows;

    res.json({ success: true, organization: org, cohorts: cohortData || [] });
  } catch (error) {
    console.error('Error fetching organization detail:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch organization detail' });
  }
});

/**
 * Get facilitator's cohorts (primary and co-facilitated)
 */
router.get('/cohorts', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId;

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
        (SELECT COUNT(*) FROM cohort_participants cp WHERE cp.cohort_id = c.id)::int as participant_count,
        (c.facilitator_id = ${userId}) as is_primary
      FROM cohorts c
      LEFT JOIN organizations o ON c.organization_id = o.id
      WHERE c.facilitator_id = ${userId}
         OR EXISTS (
           SELECT 1 FROM cohort_facilitators cf
           WHERE cf.cohort_id = c.id AND cf.facilitator_id = ${userId}
         )
      ORDER BY c.name ASC
    `);

    res.json({ success: true, cohorts: result || [] });
  } catch (error) {
    console.error('Error fetching facilitator cohorts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch cohorts' });
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
      isTestCohort = false,
      isBetaCohort = false,
      showDemoDataButtons = false,
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
        is_test_cohort,
        is_beta_cohort,
        show_demo_data_buttons,
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
        ${!!isTestCohort},
        ${!!isBetaCohort},
        ${!!showDemoDataButtons},
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
 * Helper: verify the requesting facilitator (or admin) can access this cohort.
 * Returns { cohort, isPrimary } on success, or null (after writing the error response) on failure.
 * isPrimary is true when the caller owns the cohort (facilitator_id) or is admin.
 * Secondary facilitators pass the check but get isPrimary=false.
 */
async function verifyCohortAccess(
  cohortId: number,
  req: Request,
  res: Response,
): Promise<{ cohort: any; isPrimary: boolean } | null> {
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

  const isPrimary = userRole === 'admin' || cohort.facilitator_id === userId;
  if (!isPrimary) {
    const secRows = await db.execute(sql`
      SELECT 1 FROM cohort_facilitators
      WHERE cohort_id = ${cohortId} AND facilitator_id = ${userId}
    `);
    const sec = (secRows as any).rows ?? secRows;
    if (!sec?.length) {
      res.status(403).json({ success: false, error: 'You do not have access to this cohort' });
      return null;
    }
  }

  cohort.is_primary = isPrimary;
  return { cohort, isPrimary };
}

/**
 * Get cohort detail
 */
router.get('/cohorts/:cohortId', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const cohortId = parseInt(req.params.cohortId);
    const access = await verifyCohortAccess(cohortId, req, res);
    if (!access) return;

    res.json({ success: true, cohort: access.cohort });
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
    const access = await verifyCohortAccess(cohortId, req, res);
    if (!access) return;
    if (!access.isPrimary) return res.status(403).json({ success: false, error: 'Only the primary facilitator can edit cohort settings' });
    const cohort = access.cohort;

    const { name, description, organizationId, startDate, endDate,
            astAccess, iaAccess,
            isTestCohort, isBetaCohort, showDemoDataButtons } = req.body;

    const finalName        = name !== undefined        ? name.trim()               : cohort.name;
    const finalDescription = description !== undefined ? (description || null)      : cohort.description;
    const finalOrgId       = organizationId !== undefined ? (organizationId || null): cohort.organization_id;
    const finalStartDate   = startDate !== undefined   ? (startDate || null)        : cohort.start_date;
    const finalEndDate     = endDate !== undefined     ? (endDate || null)          : cohort.end_date;
    const finalAstAccess   = astAccess !== undefined   ? !!astAccess               : cohort.ast_access;
    const finalIaAccess    = iaAccess !== undefined    ? !!iaAccess                : cohort.ia_access;
    const finalIsTest      = isTestCohort !== undefined   ? !!isTestCohort         : (cohort.is_test_cohort ?? false);
    const finalIsBeta      = isBetaCohort !== undefined   ? !!isBetaCohort         : (cohort.is_beta_cohort ?? false);
    const finalShowDemo    = showDemoDataButtons !== undefined ? !!showDemoDataButtons : (cohort.show_demo_data_buttons ?? false);

    await db.execute(sql`
      UPDATE cohorts SET
        name = ${finalName},
        description = ${finalDescription},
        organization_id = ${finalOrgId},
        start_date = ${finalStartDate},
        end_date = ${finalEndDate},
        ast_access = ${finalAstAccess},
        ia_access = ${finalIaAccess},
        is_test_cohort = ${finalIsTest},
        is_beta_cohort = ${finalIsBeta},
        show_demo_data_buttons = ${finalShowDemo},
        updated_at = NOW()
      WHERE id = ${cohortId}
    `);

    // Propagate all access + participant flags to current members and pending invites
    let propagatedCount = 0;
    const flagsChanged = astAccess !== undefined || iaAccess !== undefined
      || isTestCohort !== undefined || isBetaCohort !== undefined || showDemoDataButtons !== undefined;

    if (flagsChanged) {
      // Update existing participants
      const propagateResult = await db.execute(sql`
        UPDATE users
        SET ast_access = ${finalAstAccess},
            ia_access = ${finalIaAccess},
            is_test_user = ${finalIsTest},
            is_beta_tester = ${finalIsBeta},
            show_demo_data_buttons = ${finalShowDemo},
            updated_at = NOW()
        WHERE id IN (
          SELECT participant_id FROM cohort_participants WHERE cohort_id = ${cohortId}
        )
      `);
      propagatedCount = (propagateResult as any).rowCount ?? 0;

      // Update pending (unused) invites
      await db.execute(sql`
        UPDATE invites
        SET ast_access = ${finalAstAccess},
            ia_access = ${finalIaAccess},
            is_test_user = ${finalIsTest},
            is_beta_tester = ${finalIsBeta},
            show_demo_data_buttons = ${finalShowDemo}
        WHERE cohort_id = ${cohortId} AND used_at IS NULL
      `);

      console.log(`✅ Propagated flags to ${propagatedCount} members + pending invites for cohort ${cohortId}`);
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
    const access = await verifyCohortAccess(cohortId, req, res);
    if (!access) return;

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
    const access = await verifyCohortAccess(cohortId, req, res);
    if (!access) return;
    if (!access.isPrimary) return res.status(403).json({ success: false, error: 'Only the primary facilitator can remove participants' });

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
    const access = await verifyCohortAccess(cohortId, req, res);
    if (!access) return;
    if (!access.isPrimary) return res.status(403).json({ success: false, error: 'Only the primary facilitator can disable participants' });

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
    const access = await verifyCohortAccess(cohortId, req, res);
    if (!access) return;
    if (!access.isPrimary) return res.status(403).json({ success: false, error: 'Only the primary facilitator can edit participant profiles' });

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
    const access = await verifyCohortAccess(cohortId, req, res);
    if (!access) return;
    if (!access.isPrimary) return res.status(403).json({ success: false, error: 'Only the primary facilitator can create invites' });
    const cohort = access.cohort;

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
    const access = await verifyCohortAccess(cohortId, req, res);
    if (!access) return;
    if (!access.isPrimary) return res.status(403).json({ success: false, error: 'Only the primary facilitator can create invites' });
    const cohort = access.cohort;

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
        isTestUser: cohort.is_test_cohort ?? false,
        isBetaTester: cohort.is_beta_cohort ?? false,
        showDemoDataButtons: cohort.show_demo_data_buttons ?? false,
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
    const access = await verifyCohortAccess(cohortId, req, res);
    if (!access) return;

    const result = await db.execute(sql`
      SELECT
        i.id,
        i.invite_code,
        i.email,
        i.name,
        i.created_by,
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

// ── Invite management (delete / remove from cohort / move) ───────────────────

/**
 * Delete a pending invite. Only the facilitator who created it may delete it.
 */
router.delete('/cohorts/:cohortId/invites/:inviteId', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const cohortId  = parseInt(req.params.cohortId);
    const inviteId  = parseInt(req.params.inviteId);
    const userId    = (req.session as any).userId;

    const access = await verifyCohortAccess(cohortId, req, res);
    if (!access) return;
    if (!access.isPrimary) return res.status(403).json({ success: false, error: 'Only the primary facilitator can delete invites' });

    const rows = (await db.execute(sql`
      SELECT id, used_at, created_by FROM invites
      WHERE id = ${inviteId} AND cohort_id = ${cohortId}
    `) as any).rows ?? (await db.execute(sql`
      SELECT id, used_at, created_by FROM invites
      WHERE id = ${inviteId} AND cohort_id = ${cohortId}
    `));
    const invite = (Array.isArray(rows) ? rows : (rows as any))[0];

    if (!invite) return res.status(404).json({ success: false, error: 'Invite not found' });
    if (invite.used_at)  return res.status(400).json({ success: false, error: 'Cannot delete a used invite' });
    if (invite.created_by !== userId) return res.status(403).json({ success: false, error: 'You can only delete invites you created' });

    await db.execute(sql`DELETE FROM invites WHERE id = ${inviteId}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting invite:', error);
    res.status(500).json({ success: false, error: 'Failed to delete invite' });
  }
});

/**
 * Remove an invite from this cohort (sets cohort_id to NULL, keeps the invite).
 */
router.patch('/cohorts/:cohortId/invites/:inviteId/remove', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const cohortId = parseInt(req.params.cohortId);
    const inviteId = parseInt(req.params.inviteId);

    const access = await verifyCohortAccess(cohortId, req, res);
    if (!access) return;
    if (!access.isPrimary) return res.status(403).json({ success: false, error: 'Only the primary facilitator can remove invites' });

    await db.execute(sql`
      UPDATE invites SET cohort_id = NULL WHERE id = ${inviteId} AND cohort_id = ${cohortId}
    `);
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing invite from cohort:', error);
    res.status(500).json({ success: false, error: 'Failed to remove invite from cohort' });
  }
});

/**
 * Move a pending invite to a different cohort (must be primary on both cohorts).
 * Body: { targetCohortId: number }
 */
router.patch('/cohorts/:cohortId/invites/:inviteId/move', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const cohortId       = parseInt(req.params.cohortId);
    const inviteId       = parseInt(req.params.inviteId);
    const targetCohortId = parseInt(req.body.targetCohortId);

    if (!targetCohortId || isNaN(targetCohortId)) {
      return res.status(400).json({ success: false, error: 'targetCohortId is required' });
    }
    if (targetCohortId === cohortId) {
      return res.status(400).json({ success: false, error: 'Target cohort must be different' });
    }

    const access = await verifyCohortAccess(cohortId, req, res);
    if (!access) return;
    if (!access.isPrimary) return res.status(403).json({ success: false, error: 'Only the primary facilitator can move invites' });

    const targetAccess = await verifyCohortAccess(targetCohortId, req, res);
    if (!targetAccess) return;
    if (!targetAccess.isPrimary) return res.status(403).json({ success: false, error: 'You must be primary facilitator on the target cohort' });

    await db.execute(sql`
      UPDATE invites SET cohort_id = ${targetCohortId}
      WHERE id = ${inviteId} AND cohort_id = ${cohortId} AND used_at IS NULL
    `);
    res.json({ success: true });
  } catch (error) {
    console.error('Error moving invite:', error);
    res.status(500).json({ success: false, error: 'Failed to move invite' });
  }
});

/**
 * Move a participant to a different cohort (must be primary on both). Also moves any invite.
 * Body: { targetCohortId: number }
 */
router.patch('/cohorts/:cohortId/participants/:userId/move', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const cohortId       = parseInt(req.params.cohortId);
    const participantId  = parseInt(req.params.userId);
    const targetCohortId = parseInt(req.body.targetCohortId);

    if (!targetCohortId || isNaN(targetCohortId)) {
      return res.status(400).json({ success: false, error: 'targetCohortId is required' });
    }
    if (targetCohortId === cohortId) {
      return res.status(400).json({ success: false, error: 'Target cohort must be different' });
    }

    const access = await verifyCohortAccess(cohortId, req, res);
    if (!access) return;
    if (!access.isPrimary) return res.status(403).json({ success: false, error: 'Only the primary facilitator can move participants' });

    const targetAccess = await verifyCohortAccess(targetCohortId, req, res);
    if (!targetAccess) return;
    if (!targetAccess.isPrimary) return res.status(403).json({ success: false, error: 'You must be primary facilitator on the target cohort' });

    // Move cohort_participants record
    await db.execute(sql`
      DELETE FROM cohort_participants WHERE cohort_id = ${cohortId} AND participant_id = ${participantId}
    `);
    await db.execute(sql`
      INSERT INTO cohort_participants (cohort_id, participant_id, joined_at)
      VALUES (${targetCohortId}, ${participantId}, NOW())
      ON CONFLICT (cohort_id, participant_id) DO NOTHING
    `);

    // Also move any associated invite (used or pending) from this cohort
    await db.execute(sql`
      UPDATE invites SET cohort_id = ${targetCohortId}
      WHERE cohort_id = ${cohortId}
        AND (used_by = ${participantId}
             OR email = (SELECT email FROM users WHERE id = ${participantId}))
    `);

    res.json({ success: true });
  } catch (error) {
    console.error('Error moving participant:', error);
    res.status(500).json({ success: false, error: 'Failed to move participant' });
  }
});

// ── Cohort Sessions ──────────────────────────────────────────────────────────

/**
 * List sessions for a cohort (primary + secondary facilitators can view).
 */
router.get('/cohorts/:cohortId/sessions', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const cohortId = parseInt(req.params.cohortId);
    const access = await verifyCohortAccess(cohortId, req, res);
    if (!access) return;

    const rows = await db.execute(sql`
      SELECT id, cohort_id, program, session_name, subtitle, format,
             session_date, start_time, end_time, meeting_link, whiteboard_link, sort_order
      FROM cohort_sessions
      WHERE cohort_id = ${cohortId}
      ORDER BY sort_order ASC, session_date ASC NULLS LAST, start_time ASC NULLS LAST
    `);

    res.json({ success: true, sessions: (rows as any).rows ?? rows ?? [] });
  } catch (error) {
    console.error('Error fetching cohort sessions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch sessions' });
  }
});

/**
 * Create a session (primary only).
 */
router.post('/cohorts/:cohortId/sessions', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const cohortId = parseInt(req.params.cohortId);
    const access = await verifyCohortAccess(cohortId, req, res);
    if (!access) return;
    if (!access.isPrimary) return res.status(403).json({ success: false, error: 'Only the primary facilitator can add sessions' });

    const { program, sessionName, subtitle, format, sessionDate, startTime, endTime, meetingLink, whiteboardLink, sortOrder } = req.body;
    if (!sessionName?.trim()) return res.status(400).json({ success: false, error: 'Session name is required' });

    // Default sort_order to next available
    const nextOrderRows = await db.execute(sql`
      SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order FROM cohort_sessions WHERE cohort_id = ${cohortId}
    `);
    const nextOrder = sortOrder ?? (((nextOrderRows as any).rows ?? nextOrderRows)?.[0]?.next_order ?? 0);

    const result = await db.execute(sql`
      INSERT INTO cohort_sessions
        (cohort_id, program, session_name, subtitle, format, session_date, start_time, end_time, meeting_link, whiteboard_link, sort_order, created_at, updated_at)
      VALUES
        (${cohortId}, ${program || null}, ${sessionName.trim()}, ${subtitle || null}, ${format || null},
         ${sessionDate || null}, ${startTime || null}, ${endTime || null},
         ${meetingLink || null}, ${whiteboardLink || null}, ${nextOrder}, NOW(), NOW())
      RETURNING *
    `);

    const session = ((result as any).rows ?? result)?.[0];
    res.json({ success: true, session });
  } catch (error) {
    console.error('Error creating cohort session:', error);
    res.status(500).json({ success: false, error: 'Failed to create session' });
  }
});

/**
 * Update a session (primary only).
 */
router.patch('/cohorts/:cohortId/sessions/:sessionId', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const cohortId = parseInt(req.params.cohortId);
    const sessionId = parseInt(req.params.sessionId);
    const access = await verifyCohortAccess(cohortId, req, res);
    if (!access) return;
    if (!access.isPrimary) return res.status(403).json({ success: false, error: 'Only the primary facilitator can edit sessions' });

    const { program, sessionName, subtitle, format, sessionDate, startTime, endTime, meetingLink, whiteboardLink, sortOrder } = req.body;

    if (!sessionName?.trim()) {
      return res.status(400).json({ success: false, error: 'Session name cannot be empty' });
    }

    await db.execute(sql`
      UPDATE cohort_sessions SET
        program         = ${program || null},
        session_name    = ${sessionName.trim()},
        subtitle        = ${subtitle || null},
        format          = ${format || null},
        session_date    = ${sessionDate || null},
        start_time      = ${startTime || null},
        end_time        = ${endTime || null},
        meeting_link    = ${meetingLink || null},
        whiteboard_link = ${whiteboardLink || null},
        sort_order      = ${sortOrder ?? 0},
        updated_at      = NOW()
      WHERE id = ${sessionId} AND cohort_id = ${cohortId}
    `);

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating cohort session:', error);
    res.status(500).json({ success: false, error: 'Failed to update session' });
  }
});

/**
 * Delete a session (primary only).
 */
router.delete('/cohorts/:cohortId/sessions/:sessionId', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const cohortId = parseInt(req.params.cohortId);
    const sessionId = parseInt(req.params.sessionId);
    const access = await verifyCohortAccess(cohortId, req, res);
    if (!access) return;
    if (!access.isPrimary) return res.status(403).json({ success: false, error: 'Only the primary facilitator can delete sessions' });

    await db.execute(sql`DELETE FROM cohort_sessions WHERE id = ${sessionId} AND cohort_id = ${cohortId}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting cohort session:', error);
    res.status(500).json({ success: false, error: 'Failed to delete session' });
  }
});

// ── Co-facilitator management ────────────────────────────────────────────────

/**
 * List all facilitators for a cohort (primary + secondary).
 */
router.get('/cohorts/:cohortId/facilitators', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const cohortId = parseInt(req.params.cohortId);
    const access = await verifyCohortAccess(cohortId, req, res);
    if (!access) return;

    const { cohort } = access;

    // Primary facilitator
    const primaryRows = await db.execute(sql`
      SELECT id, first_name, last_name, email FROM users WHERE id = ${cohort.facilitator_id}
    `);
    const primaryData = ((primaryRows as any).rows ?? primaryRows)?.[0];

    // Secondary facilitators
    const secRows = await db.execute(sql`
      SELECT u.id, u.first_name, u.last_name, u.email, cf.created_at
      FROM cohort_facilitators cf
      JOIN users u ON cf.facilitator_id = u.id
      WHERE cf.cohort_id = ${cohortId}
      ORDER BY cf.created_at ASC
    `);
    const secondaryData = (secRows as any).rows ?? secRows ?? [];

    const facilitators = [
      primaryData && {
        id: primaryData.id,
        name: `${primaryData.first_name || ''} ${primaryData.last_name || ''}`.trim() || primaryData.email,
        email: primaryData.email,
        role: 'primary' as const,
      },
      ...(secondaryData as any[]).map((r: any) => ({
        id: r.id,
        name: `${r.first_name || ''} ${r.last_name || ''}`.trim() || r.email,
        email: r.email,
        role: 'secondary' as const,
      })),
    ].filter(Boolean);

    res.json({ success: true, facilitators });
  } catch (error) {
    console.error('Error fetching cohort facilitators:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch facilitators' });
  }
});

/**
 * Add a secondary facilitator to a cohort (primary only, max 2 secondary).
 * Body: { email: string }
 */
router.post('/cohorts/:cohortId/facilitators', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const cohortId = parseInt(req.params.cohortId);
    const access = await verifyCohortAccess(cohortId, req, res);
    if (!access) return;
    if (!access.isPrimary) return res.status(403).json({ success: false, error: 'Only the primary facilitator can add co-facilitators' });

    const { email } = req.body;
    if (!email?.trim()) return res.status(400).json({ success: false, error: 'Email is required' });

    // Look up the user by email
    const userRows = await db.execute(sql`
      SELECT id, first_name, last_name, email, role FROM users WHERE LOWER(email) = LOWER(${email.trim()})
    `);
    const userData = ((userRows as any).rows ?? userRows)?.[0];

    if (!userData) return res.status(404).json({ success: false, error: 'No user found with that email address' });
    if (!['facilitator', 'admin'].includes(userData.role)) {
      return res.status(400).json({ success: false, error: 'That user does not have facilitator access' });
    }
    if (userData.id === access.cohort.facilitator_id) {
      return res.status(400).json({ success: false, error: 'That user is already the primary facilitator for this cohort' });
    }

    // Check max 2 secondary facilitators
    const countRows = await db.execute(sql`
      SELECT COUNT(*)::int as cnt FROM cohort_facilitators WHERE cohort_id = ${cohortId}
    `);
    const count = ((countRows as any).rows ?? countRows)?.[0]?.cnt ?? 0;
    if (count >= 2) {
      return res.status(400).json({ success: false, error: 'A cohort can have at most 2 co-facilitators' });
    }

    // Insert (ignore if duplicate)
    await db.execute(sql`
      INSERT INTO cohort_facilitators (cohort_id, facilitator_id, role, created_at)
      VALUES (${cohortId}, ${userData.id}, 'secondary', NOW())
      ON CONFLICT (cohort_id, facilitator_id) DO NOTHING
    `);

    res.json({
      success: true,
      facilitator: {
        id: userData.id,
        name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.email,
        email: userData.email,
        role: 'secondary',
      },
    });
  } catch (error) {
    console.error('Error adding co-facilitator:', error);
    res.status(500).json({ success: false, error: 'Failed to add co-facilitator' });
  }
});

/**
 * Remove a secondary facilitator from a cohort (primary only).
 */
router.delete('/cohorts/:cohortId/facilitators/:facilId', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const cohortId = parseInt(req.params.cohortId);
    const facilId  = parseInt(req.params.facilId);
    const access = await verifyCohortAccess(cohortId, req, res);
    if (!access) return;
    if (!access.isPrimary) return res.status(403).json({ success: false, error: 'Only the primary facilitator can remove co-facilitators' });

    await db.execute(sql`
      DELETE FROM cohort_facilitators
      WHERE cohort_id = ${cohortId} AND facilitator_id = ${facilId}
    `);

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing co-facilitator:', error);
    res.status(500).json({ success: false, error: 'Failed to remove co-facilitator' });
  }
});

// ── ZIP utilities ─────────────────────────────────────────────────────────────

function crc32(buf: Buffer): number {
  const table: number[] = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function buildZip(files: Array<{ name: string; data: Buffer }>): Buffer {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  const fileOffsets: number[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = Buffer.from(file.name, 'utf8');
    const checksum = crc32(file.data);
    const dataLen = file.data.length;

    const local = Buffer.alloc(30 + nameBytes.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(0, 8);  // stored (no compression — PNGs are already compressed)
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(checksum, 14);
    local.writeUInt32LE(dataLen, 18);
    local.writeUInt32LE(dataLen, 22);
    local.writeUInt16LE(nameBytes.length, 26);
    local.writeUInt16LE(0, 28);
    nameBytes.copy(local, 30);

    fileOffsets.push(offset);
    offset += local.length + dataLen;
    localParts.push(local, file.data);

    const central = Buffer.alloc(46 + nameBytes.length);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0, 14);
    central.writeUInt32LE(checksum, 16);
    central.writeUInt32LE(dataLen, 20);
    central.writeUInt32LE(dataLen, 24);
    central.writeUInt16LE(nameBytes.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(fileOffsets[fileOffsets.length - 1], 42);
    nameBytes.copy(central, 46);
    centralParts.push(central);
  }

  const centralDir = Buffer.concat(centralParts);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(centralDir.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDir, eocd]);
}

/**
 * Download a ZIP of all saved StarCard PNGs for a cohort
 */
router.get('/cohorts/:cohortId/starcards/download-zip', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const cohortId = parseInt(req.params.cohortId);
    const access = await verifyCohortAccess(cohortId, req, res);
    if (!access) return;

    const result = await db.execute(sql`
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.username,
        ps.photo_data,
        ps.mime_type
      FROM cohort_participants cp
      JOIN users u ON cp.participant_id = u.id
      LEFT JOIN LATERAL (
        SELECT photo_data, mime_type
        FROM photo_storage
        WHERE uploaded_by = u.id
          AND is_thumbnail = false
          AND image_type = 'starcard_generated'
        ORDER BY created_at DESC
        LIMIT 1
      ) ps ON true
      WHERE cp.cohort_id = ${cohortId}
      ORDER BY u.first_name, u.last_name
    `);

    const rows = (result as any).rows ?? result ?? [];
    const withPhotos = (rows as any[]).filter((r: any) => r.photo_data);

    if (withPhotos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No saved StarCards found for participants in this cohort'
      });
    }

    const files = withPhotos.map((row: any) => {
      const raw: string = row.photo_data;
      const base64 = raw.includes(',') ? raw.split(',')[1] : raw;
      const data = Buffer.from(base64, 'base64');
      const safeName = [row.first_name, row.last_name]
        .filter(Boolean).join('-').toLowerCase().replace(/[^a-z0-9-]/g, '-')
        || row.username || `user-${row.id}`;
      const ext = row.mime_type?.split('/')[1] || 'png';
      return { name: `${safeName}-starcard.${ext}`, data };
    });

    const cohortResult = await db.execute(sql`SELECT name FROM cohorts WHERE id = ${cohortId}`);
    const cohortRows = (cohortResult as any).rows ?? cohortResult ?? [];
    const cohortName = (cohortRows[0]?.name as string | undefined) || `cohort-${cohortId}`;
    const zipFilename = `${cohortName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-starcards.zip`;

    const zipBuffer = buildZip(files);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);
    res.setHeader('Content-Length', zipBuffer.length);
    res.send(zipBuffer);
  } catch (error) {
    console.error('Error creating StarCard ZIP:', error);
    res.status(500).json({ success: false, error: 'Failed to create StarCard download' });
  }
});

/**
 * Team matrix data: all cohort participants with their starcard scores and flow attributes
 */
router.get('/cohorts/:cohortId/team-matrix', requireAuth, isFacilitatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const cohortId = parseInt(req.params.cohortId);
    const access = await verifyCohortAccess(cohortId, req, res);
    if (!access) return;

    const result = await db.execute(sql`
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        sc.results AS starcard_data,
        fa.results AS flow_data
      FROM cohort_participants cp
      JOIN users u ON cp.participant_id = u.id
      LEFT JOIN LATERAL (
        SELECT results FROM user_assessments
        WHERE user_id = u.id AND assessment_type = 'starCard'
        ORDER BY created_at DESC LIMIT 1
      ) sc ON true
      LEFT JOIN LATERAL (
        SELECT results FROM user_assessments
        WHERE user_id = u.id AND assessment_type = 'flowAttributes'
        ORDER BY created_at DESC LIMIT 1
      ) fa ON true
      WHERE cp.cohort_id = ${cohortId}
      ORDER BY u.first_name, u.last_name
    `);

    const rows = (result as any).rows ?? result ?? [];

    const members = (rows as any[]).map((row: any) => {
      const name = [row.first_name, row.last_name].filter(Boolean).join(' ') || 'Unknown';

      let strengths: Array<{ type: string; score: number }> = [];
      if (row.starcard_data) {
        const sc = typeof row.starcard_data === 'string' ? JSON.parse(row.starcard_data) : row.starcard_data;
        strengths = [
          { type: 'thinking', score: sc.thinking || 0 },
          { type: 'feeling',  score: sc.feeling  || 0 },
          { type: 'acting',   score: sc.acting   || 0 },
          { type: 'planning', score: sc.planning  || 0 },
        ].sort((a, b) => b.score - a.score);
      }

      let flowAttributes: string[] = [];
      if (row.flow_data) {
        const fd = typeof row.flow_data === 'string' ? JSON.parse(row.flow_data) : row.flow_data;
        flowAttributes = (fd.attributes || []).slice(0, 4).map((a: any) =>
          typeof a === 'string' ? a : (a.name || a.text || String(a))
        );
      }

      return { id: row.id, name, strengths, flowAttributes, hasData: strengths.length > 0 };
    });

    res.json({ success: true, members });
  } catch (error) {
    console.error('Error fetching team matrix:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch team matrix data' });
  }
});

export const facilitatorRouter = router;