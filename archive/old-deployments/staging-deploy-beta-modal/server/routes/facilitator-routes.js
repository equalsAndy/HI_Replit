import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { isFacilitator } from '../middleware/roles.js';
import { db } from '../db.js';
import { sql } from 'drizzle-orm';
const router = express.Router();
router.get('/organizations', requireAuth, isFacilitator, async (req, res) => {
    try {
        const userId = req.session.userId;
        const result = await db.execute(sql `
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
    }
    catch (error) {
        console.error('Error fetching facilitator organizations:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch organizations'
        });
    }
});
router.get('/cohorts', requireAuth, isFacilitator, async (req, res) => {
    try {
        const userId = req.session.userId;
        const result = await db.execute(sql `
      SELECT 
        c.id, 
        c.name, 
        c.description, 
        c.start_date, 
        c.end_date, 
        c.status,
        c.ast_access,
        c.ia_access,
        o.name as organization_name
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
    }
    catch (error) {
        console.error('Error fetching facilitator cohorts:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch cohorts'
        });
    }
});
router.post('/organizations', requireAuth, isFacilitator, async (req, res) => {
    try {
        const userId = req.session.userId;
        const { name, description } = req.body;
        if (!name || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Organization name is required'
            });
        }
        const result = await db.execute(sql `
      INSERT INTO organizations (name, description, created_by, created_at, updated_at)
      VALUES (${name.trim()}, ${description || null}, ${userId}, NOW(), NOW())
      RETURNING *
    `);
        const organizationData = result[0] || result.rows?.[0];
        res.json({
            success: true,
            organization: organizationData
        });
    }
    catch (error) {
        console.error('Error creating organization:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create organization'
        });
    }
});
router.post('/cohorts', requireAuth, isFacilitator, async (req, res) => {
    try {
        const userId = req.session.userId;
        const { name, description, organizationId, astAccess = true, iaAccess = true, startDate, endDate } = req.body;
        if (!name || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Cohort name is required'
            });
        }
        const result = await db.execute(sql `
      INSERT INTO cohorts (
        name, 
        description, 
        facilitator_id, 
        organization_id, 
        ast_access, 
        ia_access,
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
        ${startDate || null},
        ${endDate || null},
        'active',
        NOW(), 
        NOW()
      )
      RETURNING *
    `);
        const cohortData = result[0] || result.rows?.[0];
        res.json({
            success: true,
            cohort: cohortData
        });
    }
    catch (error) {
        console.error('Error creating cohort:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create cohort'
        });
    }
});
export const facilitatorRouter = router;
