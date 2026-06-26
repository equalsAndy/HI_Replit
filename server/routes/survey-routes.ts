import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { eq, and } from 'drizzle-orm';
import { workshopSurveyCompletions } from '../../shared/schema.js';
import { authenticateUser } from './workshop-data-shared.js';

const router = Router();

const VALID_SLUGS = ['ia', 'ast'] as const;
type WorkshopSlug = typeof VALID_SLUGS[number];

// GET /api/surveys/status/:workshopSlug
// Returns { submitted: boolean }
router.get('/status/:workshopSlug', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId as number;
    const { workshopSlug } = req.params;

    if (!VALID_SLUGS.includes(workshopSlug as WorkshopSlug)) {
      return res.status(400).json({ error: 'Invalid workshop slug' });
    }

    const rows = await db
      .select({ id: workshopSurveyCompletions.id })
      .from(workshopSurveyCompletions)
      .where(and(
        eq(workshopSurveyCompletions.userId, userId),
        eq(workshopSurveyCompletions.workshopSlug, workshopSlug),
      ))
      .limit(1);

    return res.json({ submitted: rows.length > 0 });
  } catch (err) {
    console.error('[survey-routes] GET /status error:', err);
    return res.status(500).json({ error: 'Failed to check survey status' });
  }
});

// POST /api/surveys/submit
// Body: { workshopSlug: string, responses: object }
// Returns { success: true }
router.post('/submit', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId as number;
    const { workshopSlug, responses } = req.body;

    if (!VALID_SLUGS.includes(workshopSlug as WorkshopSlug)) {
      return res.status(400).json({ error: 'Invalid workshop slug' });
    }
    if (!responses || typeof responses !== 'object' || Array.isArray(responses)) {
      return res.status(400).json({ error: 'responses must be a plain object' });
    }

    await db
      .insert(workshopSurveyCompletions)
      .values({ userId, workshopSlug, responses })
      .onConflictDoUpdate({
        target: [workshopSurveyCompletions.userId, workshopSurveyCompletions.workshopSlug],
        set: { responses, submittedAt: new Date() },
      });

    return res.json({ success: true });
  } catch (err) {
    console.error('[survey-routes] POST /submit error:', err);
    return res.status(500).json({ error: 'Failed to submit survey' });
  }
});

export default router;
