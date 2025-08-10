import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { db } from '../db.js';
import { discernmentScenarios } from '../../shared/schema.js';
import { eq, and } from 'drizzle-orm';
const router = Router();
router.get('/scenarios/:exerciseType', requireAuth, async (req, res) => {
    try {
        const { exerciseType } = req.params;
        const userId = req.session.userId;
        console.log(`[Discernment] Fetching scenarios for ${exerciseType}, user ${userId}`);
        const scenarios = await db.select()
            .from(discernmentScenarios)
            .where(and(eq(discernmentScenarios.exerciseType, exerciseType), eq(discernmentScenarios.active, true)))
            .orderBy(discernmentScenarios.difficultyLevel);
        console.log(`[Discernment] Found ${scenarios.length} scenarios for ${exerciseType}`);
        if (scenarios.length === 0) {
            return res.status(404).json({ error: 'No scenarios available' });
        }
        res.json(scenarios);
    }
    catch (error) {
        console.error('Error fetching discernment scenarios:', error);
        res.status(500).json({ error: 'Failed to fetch scenarios' });
    }
});
router.post('/progress', requireAuth, async (req, res) => {
    try {
        const { scenarioId } = req.body;
        const userId = req.session.userId;
        console.log(`[Discernment] Progress tracking for user ${userId}, scenario ${scenarioId} - temporarily disabled`);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error updating discernment progress:', error);
        res.status(500).json({ error: 'Failed to update progress' });
    }
});
export default router;
