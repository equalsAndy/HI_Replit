import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { db } from '../db.js';
import { workshopStepData } from '../../shared/schema.js';
import { and, eq, sql } from 'drizzle-orm';

const router = express.Router();

function isValidIaStep(stepId: string): boolean {
  return /^ia-\d-\d$/.test(stepId);
}

// Get saved IA step data for current user
router.get('/ia/steps/:stepId', requireAuth, async (req, res) => {
  try {
    const { stepId } = req.params as { stepId: string };
    const userId = (req.session as any).userId as number;

    if (!isValidIaStep(stepId)) {
      return res.status(400).json({ error: 'Invalid IA stepId' });
    }

    const rows = await db
      .select()
      .from(workshopStepData)
      .where(and(
        eq(workshopStepData.userId, userId),
        eq(workshopStepData.workshopType, 'ia'),
        eq(workshopStepData.stepId, stepId)
      ));

    if (!rows.length) {
      return res.json({ data: null });
    }
    const row = rows[0];
    return res.json({
      data: row.data,
      version: row.version,
      updatedAt: row.updatedAt
    });
  } catch (e: any) {
    console.error('GET /ia/steps failed:', e);
    return res.status(500).json({ error: 'Failed to load step data' });
  }
});

// Upsert IA step data for current user
router.put('/ia/steps/:stepId', requireAuth, express.json(), async (req, res) => {
  try {
    const { stepId } = req.params as { stepId: string };
    const userId = (req.session as any).userId as number;
    const { data } = req.body as { data: any };

    if (!isValidIaStep(stepId)) {
      return res.status(400).json({ error: 'Invalid IA stepId' });
    }
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Missing or invalid data' });
    }
    const payload = { ...data };

    // Upsert with version bump
    await db
      .insert(workshopStepData)
      .values({
        userId,
        workshopType: 'ia',
        stepId,
        data: payload,
        version: 1
      })
      .onConflictDoUpdate({
        target: [workshopStepData.userId, workshopStepData.workshopType, workshopStepData.stepId],
        set: {
          data: sql`excluded.data`,
          version: sql`${workshopStepData.version} + 1`,
          updatedAt: sql`now()`
        }
      });

    return res.json({ success: true });
  } catch (e: any) {
    console.error('PUT /ia/steps failed:', e);
    return res.status(500).json({ error: 'Failed to save step data' });
  }
});

export default router;

