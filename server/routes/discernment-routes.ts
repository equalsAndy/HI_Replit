import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { db } from '../db.js';
import { discernmentScenarios, userDiscernmentProgress } from '../../shared/schema.js';
import { eq, and, notInArray } from 'drizzle-orm';

const router = Router();

// GET /api/discernment/scenarios/:exerciseType
// Returns all scenarios for the exercise type
router.get('/scenarios/:exerciseType', requireAuth, async (req, res) => {
  try {
    const { exerciseType } = req.params;
    const userId = req.user.id;

    console.log(`[Discernment] Fetching scenarios for ${exerciseType}, user ${userId}`);

    // Get all active scenarios of requested type
    const scenarios = await db.select()
      .from(discernmentScenarios)
      .where(
        and(
          eq(discernmentScenarios.exerciseType, exerciseType),
          eq(discernmentScenarios.active, true)
        )
      )
      .orderBy(discernmentScenarios.difficultyLevel);

    console.log(`[Discernment] Found ${scenarios.length} scenarios for ${exerciseType}`);

    if (scenarios.length === 0) {
      return res.status(404).json({ error: 'No scenarios available' });
    }

    res.json(scenarios);

  } catch (error) {
    console.error('Error fetching discernment scenarios:', error);
    res.status(500).json({ error: 'Failed to fetch scenarios' });
  }
});

// POST /api/discernment/progress
// Track user progress
router.post('/progress', requireAuth, async (req, res) => {
  try {
    const { scenarioId } = req.body;
    const userId = req.user.id;

    // Update or create user progress
    const existingProgress = await db.select()
      .from(userDiscernmentProgress)
      .where(eq(userDiscernmentProgress.userId, userId))
      .limit(1);

    if (existingProgress.length > 0) {
      const currentSeen = existingProgress[0].scenariosSeen || [];
      const newSeen = [...currentSeen, scenarioId];

      await db.update(userDiscernmentProgress)
        .set({ 
          scenariosSeen: newSeen,
          lastSessionAt: new Date(),
          totalSessions: existingProgress[0].totalSessions + 1
        })
        .where(eq(userDiscernmentProgress.userId, userId));
    } else {
      await db.insert(userDiscernmentProgress)
        .values({
          userId,
          scenariosSeen: [scenarioId],
          totalSessions: 1
        });
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Error updating discernment progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

export default router;