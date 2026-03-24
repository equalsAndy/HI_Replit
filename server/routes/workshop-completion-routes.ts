import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { eq, and } from 'drizzle-orm';
import * as schema from '../../shared/schema.js';
import { users } from '../../shared/schema.js';
import { getFeatureStatus } from '../middleware/feature-flags.js';
import { authenticateUser, generateAndStoreStarCard } from './workshop-data-shared.js';

const router = Router();

/**
 * Video API routes - accessible without admin authentication
 */

// Get videos by workshop type
router.get('/videos/workshop/:workshopType', async (req: Request, res: Response) => {
  try {
    const { workshopType } = req.params;

    if (workshopType === 'allstarteams') {
      console.log('=== DEBUG: Testing step 1-1 video fetch ===');
      const testVideo = await db.select()
        .from(schema.videos)
        .where(eq(schema.videos.stepId, '1-1'));
      console.log('Found video for step 1-1:', testVideo);

      const workshopVideos = await db
        .select()
        .from(schema.videos)
        .where(eq(schema.videos.workshopType, workshopType));
      console.log(`Found ${workshopVideos.length} videos for workshop ${workshopType}`);
      console.log('First few videos:', workshopVideos.slice(0, 3));
    }

    const videos = await db
      .select()
      .from(schema.videos)
      .where(eq(schema.videos.workshopType, workshopType));

    res.status(200).json(videos);
  } catch (error) {
    console.error('Error fetching videos by workshop:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get video by ID
router.get('/videos/:id', async (req: Request, res: Response) => {
  try {
    const videoId = parseInt(req.params.id);

    if (isNaN(videoId)) {
      return res.status(400).json({ message: 'Invalid video ID' });
    }

    const videos = await db
      .select()
      .from(schema.videos)
      .where(eq(schema.videos.id, videoId));

    if (videos.length === 0) {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.status(200).json(videos[0]);
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/workshop-data/navigation-progress/:appType
 */
router.get('/navigation-progress/:appType', async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    const { appType } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const progress = await db
      .select()
      .from(schema.navigationProgress)
      .where(
        and(
          eq(schema.navigationProgress.userId, userId),
          eq(schema.navigationProgress.appType, appType)
        )
      );

    if (progress.length === 0) {
      const defaultProgress = {
        completedSteps: [],
        currentStepId: appType === 'ia' ? 'ia-1-1' : appType === 'pm' ? 'pm-1-1' : '1-1',
        appType,
        lastVisitedAt: new Date().toISOString(),
        unlockedSteps: appType === 'ia' ? ['ia-1-1'] : appType === 'pm' ? ['pm-1-1'] : ['1-1'],
        videoProgress: {}
      };
      return res.status(200).json({ success: true, data: defaultProgress });
    }

    const navigationData = progress[0];
    const parsedProgress = {
      completedSteps: JSON.parse(navigationData.completedSteps),
      currentStepId: navigationData.currentStepId,
      appType: navigationData.appType,
      lastVisitedAt: navigationData.lastVisitedAt,
      unlockedSteps: JSON.parse(navigationData.unlockedSteps),
      videoProgress: navigationData.videoProgress ? JSON.parse(navigationData.videoProgress) : {}
    };

    return res.status(200).json({ success: true, data: parsedProgress });
  } catch (error) {
    console.error('Error fetching navigation progress:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch navigation progress' });
  }
});

/**
 * POST /api/workshop-data/navigation-progress
 */
router.post('/navigation-progress', async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { completedSteps, currentStepId, appType, unlockedSteps, videoProgress } = req.body;

    const hasIASteps = (completedSteps && completedSteps.some((step: string) => step.startsWith('ia-'))) ||
                       (currentStepId && currentStepId.startsWith('ia-'));
    const detectedAppType = hasIASteps ? 'ia' : 'ast';

    console.log(`Navigation Progress: Received appType: ${appType}, Detected from steps: ${detectedAppType}`);

    const existingProgress = await db
      .select()
      .from(schema.navigationProgress)
      .where(
        and(
          eq(schema.navigationProgress.userId, userId),
          eq(schema.navigationProgress.appType, detectedAppType)
        )
      );

    const progressData = {
      userId,
      appType: detectedAppType,
      completedSteps: JSON.stringify(completedSteps),
      currentStepId,
      unlockedSteps: JSON.stringify(unlockedSteps),
      videoProgress: JSON.stringify(videoProgress || {}),
      lastVisitedAt: new Date(),
      updatedAt: new Date()
    };

    if (existingProgress.length > 0) {
      await db
        .update(schema.navigationProgress)
        .set(progressData)
        .where(eq(schema.navigationProgress.id, existingProgress[0].id));
    } else {
      await db.insert(schema.navigationProgress).values(progressData);
    }

    return res.status(200).json({ success: true, message: 'Navigation progress saved' });
  } catch (error) {
    console.error('Error saving navigation progress:', error);
    return res.status(500).json({ success: false, message: 'Failed to save navigation progress' });
  }
});

/**
 * GET /api/workshop-data/feature-status
 */
router.get('/feature-status', getFeatureStatus);

/**
 * GET /api/workshop-data/completion-status
 */
router.get('/completion-status', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId;

    const user = await db.select({
      astWorkshopCompleted: users.astWorkshopCompleted,
      iaWorkshopCompleted: users.iaWorkshopCompleted,
      pmWorkshopCompleted: users.pmWorkshopCompleted,
      astCompletedAt: users.astCompletedAt,
      iaCompletedAt: users.iaCompletedAt,
      pmCompletedAt: users.pmCompletedAt
    }).from(users).where(eq(users.id, userId)).limit(1);

    if (!user[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user[0]);
  } catch (error) {
    console.error('Error fetching completion status:', error);
    res.status(500).json({ error: 'Failed to fetch completion status' });
  }
});

/**
 * POST /api/workshop-data/complete-workshop
 */
router.post('/complete-workshop', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { appType } = req.body;
    const userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);

    if (!appType || !['ast', 'ia', 'pm'].includes(appType)) {
      return res.status(400).json({ error: 'Invalid app type. Must be "ast", "ia", or "pm"' });
    }

    const navigationData = await db
      .select()
      .from(schema.navigationProgress)
      .where(
        and(
          eq(schema.navigationProgress.userId, userId),
          eq(schema.navigationProgress.appType, appType)
        )
      );

    if (navigationData.length === 0) {
      return res.status(400).json({ error: 'No navigation progress found', missingSteps: [] });
    }

    let completedSteps: string[] = [];
    try {
      completedSteps = JSON.parse(navigationData[0].completedSteps);
    } catch (e) {
      completedSteps = [];
    }

    // Note: Step 2-3 was removed from the workshop - no longer required
    const requiredSteps = appType === 'ast'
      ? ['1-1', '1-2', '1-3', '2-1', '2-2', '2-4', '3-1', '3-2', '3-3', '3-4']
      : appType === 'ia'
      ? ['ia-1-1', 'ia-2-1', 'ia-3-1', 'ia-3-7', 'ia-4-1', 'ia-4-7']
      : []; // PM: will be defined when workshop content is built

    const allCompleted = requiredSteps.every(step => completedSteps.includes(step));

    console.log(`🔍 Workshop completion check for user ${userId} (${appType.toUpperCase()}):`);
    console.log(`  📋 Required steps:`, requiredSteps);
    console.log(`  ✅ Completed steps:`, completedSteps);
    console.log(`  🎯 All completed:`, allCompleted);

    if (!allCompleted) {
      const missingSteps = requiredSteps.filter(step => !completedSteps.includes(step));
      console.log(`  ❌ Missing steps:`, missingSteps);
      return res.status(400).json({ error: 'Cannot complete workshop - not all steps finished', missingSteps });
    }

    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    const completionField = appType === 'ast' ? 'astWorkshopCompleted' : appType === 'ia' ? 'iaWorkshopCompleted' : 'pmWorkshopCompleted';
    if (user[0][completionField as keyof typeof user[0]]) {
      return res.status(400).json({ error: 'Workshop already completed' });
    }

    const timestampField = appType === 'ast' ? 'astCompletedAt' : appType === 'ia' ? 'iaCompletedAt' : 'pmCompletedAt';
    const completedAt = new Date();

    await db.update(users)
      .set({
        [completionField]: true,
        [timestampField]: completedAt
      })
      .where(eq(users.id, userId));

    if (appType === 'ast') {
      try {
        console.log(`🎯 AST workshop completed for user ${userId}, generating StarCard...`);
        await generateAndStoreStarCard(userId);
        console.log(`✅ StarCard generated for user ${userId}`);
      } catch (starCardError) {
        console.error(`⚠️ Failed to generate StarCard for user ${userId}:`, starCardError);
        // Don't fail the workshop completion, just log the error
      }
    }

    res.json({
      success: true,
      message: `${appType.toUpperCase()} workshop completed successfully`,
      completedAt: completedAt.toISOString()
    });
  } catch (error) {
    console.error('Error completing workshop:', error);
    res.status(500).json({ error: 'Failed to complete workshop' });
  }
});

export default router;
