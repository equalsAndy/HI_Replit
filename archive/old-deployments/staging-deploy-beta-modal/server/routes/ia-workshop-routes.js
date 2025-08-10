import express from 'express';
import { requireAuth } from '../middleware/auth';
import { db } from '../db.js';
import { navigationProgress } from '../../shared/schema.js';
import { eq, and } from 'drizzle-orm';
const router = express.Router();
router.get('/progress', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const progress = await db.select().from(navigationProgress).where(and(eq(navigationProgress.userId, userId), eq(navigationProgress.appType, 'ia'))).limit(1);
        const result = progress[0] || {
            appType: 'ia',
            currentStepId: 'ia-1-1',
            completedSteps: '[]'
        };
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch IA workshop progress' });
    }
});
router.post('/progress', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const { currentStepId, completedSteps } = req.body;
        const existing = await db.select().from(navigationProgress).where(and(eq(navigationProgress.userId, userId), eq(navigationProgress.appType, 'ia'))).limit(1);
        let progress;
        if (existing.length > 0) {
            progress = await db.update(navigationProgress)
                .set({
                currentStepId,
                completedSteps: JSON.stringify(completedSteps),
                unlockedSteps: JSON.stringify(completedSteps),
                updatedAt: new Date()
            })
                .where(and(eq(navigationProgress.userId, userId), eq(navigationProgress.appType, 'ia')))
                .returning();
        }
        else {
            progress = await db.insert(navigationProgress)
                .values({
                userId,
                appType: 'ia',
                currentStepId,
                completedSteps: JSON.stringify(completedSteps),
                unlockedSteps: JSON.stringify(completedSteps),
            })
                .returning();
        }
        res.json(progress[0]);
    }
    catch (error) {
        console.error('Error updating IA workshop progress:', error);
        res.status(500).json({ error: 'Failed to update IA workshop progress' });
    }
});
export default router;
