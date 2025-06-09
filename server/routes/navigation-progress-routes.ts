import express from 'express';
import { db } from '../db';
import { users, workshopParticipation } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

const router = express.Router();

// Get IA navigation progress
router.get('/ia', async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    // Get or create workshop participation record for IA
    let [participation] = await db
      .select()
      .from(workshopParticipation)
      .where(
        and(
          eq(workshopParticipation.userId, user.id),
          eq(workshopParticipation.appType, 'ia')
        )
      );

    if (!participation) {
      // Create initial participation record
      [participation] = await db
        .insert(workshopParticipation)
        .values({
          userId: user.id,
          appType: 'ia',
          navigationProgress: {
            completedSteps: [],
            currentStepId: 'ia-1-1',
            appType: 'ia',
            lastVisitedAt: new Date().toISOString(),
            unlockedSteps: ['ia-1-1'],
            videoProgress: {}
          }
        })
        .returning();
    }

    res.json({
      success: true,
      progress: participation.navigationProgress
    });
  } catch (error) {
    console.error('Error fetching IA navigation progress:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Update IA navigation progress
router.post('/ia', async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const { stepId, action } = req.body;

    if (!stepId || !action) {
      return res.status(400).json({ success: false, error: 'Missing stepId or action' });
    }

    // Get current participation record
    let [participation] = await db
      .select()
      .from(workshopParticipation)
      .where(
        and(
          eq(workshopParticipation.userId, user.id),
          eq(workshopParticipation.appType, 'ia')
        )
      );

    if (!participation) {
      // Create initial record if it doesn't exist
      [participation] = await db
        .insert(workshopParticipation)
        .values({
          userId: user.id,
          appType: 'ia',
          navigationProgress: {
            completedSteps: [],
            currentStepId: 'ia-1-1',
            appType: 'ia',
            lastVisitedAt: new Date().toISOString(),
            unlockedSteps: ['ia-1-1'],
            videoProgress: {}
          }
        })
        .returning();
    }

    const currentProgress = participation.navigationProgress as any;

    if (action === 'complete') {
      // Add step to completed steps if not already there
      const completedSteps = [...new Set([...currentProgress.completedSteps, stepId])];
      
      const updatedProgress = {
        ...currentProgress,
        completedSteps,
        currentStepId: stepId,
        lastVisitedAt: new Date().toISOString()
      };

      await db
        .update(workshopParticipation)
        .set({
          navigationProgress: updatedProgress
        })
        .where(
          and(
            eq(workshopParticipation.userId, user.id),
            eq(workshopParticipation.appType, 'ia')
          )
        );

      res.json({
        success: true,
        progress: updatedProgress
      });
    } else {
      res.status(400).json({ success: false, error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Error updating IA navigation progress:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Update IA video progress
router.post('/ia/video', async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const { stepId, progress } = req.body;

    if (!stepId || !progress) {
      return res.status(400).json({ success: false, error: 'Missing stepId or progress' });
    }

    // Get current participation record
    let [participation] = await db
      .select()
      .from(workshopParticipation)
      .where(
        and(
          eq(workshopParticipation.userId, user.id),
          eq(workshopParticipation.appType, 'ia')
        )
      );

    if (!participation) {
      return res.status(404).json({ success: false, error: 'No participation record found' });
    }

    const currentProgress = participation.navigationProgress as any;
    const updatedProgress = {
      ...currentProgress,
      videoProgress: {
        ...currentProgress.videoProgress,
        [stepId]: progress
      },
      lastVisitedAt: new Date().toISOString()
    };

    await db
      .update(workshopParticipation)
      .set({
        navigationProgress: updatedProgress
      })
      .where(
        and(
          eq(workshopParticipation.userId, user.id),
          eq(workshopParticipation.appType, 'ia')
        )
      );

    res.json({
      success: true,
      progress: updatedProgress
    });
  } catch (error) {
    console.error('Error updating IA video progress:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;