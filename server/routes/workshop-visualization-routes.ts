import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { eq, and } from 'drizzle-orm';
import * as schema from '../../shared/schema.js';
import { authenticateUser, checkWorkshopLocked } from './workshop-data-shared.js';

const router = Router();

/**
 * Upload visualization image to photo storage
 * POST /api/workshop-data/upload-visualization-image
 */
router.post('/upload-visualization-image', authenticateUser, checkWorkshopLocked, async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);

    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { imageData, filename } = req.body;

    if (!imageData || typeof imageData !== 'string') {
      return res.status(400).json({ success: false, error: 'Image data is required', code: 'VALIDATION_ERROR' });
    }

    const { photoStorageService } = await import('../services/photo-storage-service.js');
    const photoId = await photoStorageService.storePhoto(imageData, userId, true, `Workshop-StarCard-user-${userId}-${Date.now()}.png`);
    const imageUrl = `/api/photos/${photoId}`;

    res.json({ success: true, photoId, imageUrl, filename: filename || 'uploaded-image', message: 'Image uploaded successfully' });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Upload failed', code: 'UPLOAD_ERROR' });
  }
});

/**
 * Visualizing Potential (Images) endpoints
 */
// POST /api/workshop-data/visualizing-potential
router.post('/visualizing-potential', authenticateUser, checkWorkshopLocked, async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);

    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { selectedImages, imageMeaning } = req.body;
    console.log('VisualizingPotential: Saving data for user', userId, { selectedImages, imageMeaning });

    if (!selectedImages || !Array.isArray(selectedImages) || selectedImages.length === 0) {
      return res.status(400).json({ success: false, error: 'Selected images are required and must be a non-empty array', code: 'VALIDATION_ERROR', details: { selectedImages: 'Required field, must be non-empty array' } });
    }

    if (selectedImages.length > 5) {
      return res.status(400).json({ success: false, error: 'Maximum 5 images allowed', code: 'VALIDATION_ERROR', details: { selectedImages: 'Maximum 5 images allowed' } });
    }

    if (imageMeaning && (typeof imageMeaning !== 'string' || imageMeaning.length > 2000)) {
      return res.status(400).json({ success: false, error: 'Image meaning must be a string with maximum 2000 characters', code: 'VALIDATION_ERROR', details: { imageMeaning: 'Optional field, maximum 2000 characters' } });
    }

    const assessmentData = { selectedImages, imageMeaning: imageMeaning ? imageMeaning.trim() : '' };

    const existingAssessment = await db
      .select()
      .from(schema.userAssessments)
      .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'visualizingPotential')));

    if (existingAssessment.length > 0) {
      await db.update(schema.userAssessments).set({ results: JSON.stringify(assessmentData) }).where(eq(schema.userAssessments.id, existingAssessment[0].id));
      console.log('VisualizingPotential: Updated existing data for user', userId);
    } else {
      await db.insert(schema.userAssessments).values({ userId, assessmentType: 'visualizingPotential', results: JSON.stringify(assessmentData) });
      console.log('VisualizingPotential: Created new data for user', userId);
    }

    res.json({ success: true, data: assessmentData, meta: { saved_at: new Date().toISOString(), assessmentType: 'visualizingPotential' } });
  } catch (error) {
    console.error('VisualizingPotential save error:', error);
    res.status(400).json({ success: false, error: error instanceof Error ? (error as Error).message : 'Save failed', code: 'SAVE_ERROR' });
  }
});

// GET /api/workshop-data/visualizing-potential
router.get('/visualizing-potential', async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);

    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    console.log('VisualizingPotential: Loading data for user', userId);

    const assessment = await db
      .select()
      .from(schema.userAssessments)
      .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'visualizingPotential')));

    if (!assessment || assessment.length === 0) {
      console.log('VisualizingPotential: No existing data found for user', userId);
      return res.json({ success: true, data: null });
    }

    const results = JSON.parse(assessment[0].results);
    console.log('VisualizingPotential: Found existing data for user', userId, results);
    res.json({ success: true, data: results, meta: { assessmentType: 'visualizingPotential' } });
  } catch (error) {
    console.error('VisualizingPotential fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve assessment', code: 'FETCH_ERROR' });
  }
});

// DEBUG endpoint to test step 1-1 video fetching
router.get('/debug/step-1-1', async (req: Request, res: Response) => {
  try {
    console.log('=== DEBUG ENDPOINT: Testing step 1-1 video ===');

    const allVideos = await db.select().from(schema.videos);
    console.log(`Total videos in database: ${allVideos.length}`);

    const stepVideos = await db.select().from(schema.videos).where(eq(schema.videos.stepId, '1-1'));
    console.log('Videos with stepId "1-1":', stepVideos);

    const allstarVideos = await db.select().from(schema.videos).where(eq(schema.videos.workshopType, 'allstarteams'));
    console.log('AllStarTeams videos:', allstarVideos.length);

    const combinedVideos = await db.select().from(schema.videos).where(and(eq(schema.videos.stepId, '1-1'), eq(schema.videos.workshopType, 'allstarteams')));
    console.log('Combined filter result:', combinedVideos);

    res.json({ success: true, totalVideos: allVideos.length, stepVideos, allstarVideosCount: allstarVideos.length, combinedVideos });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

/**
 * Visualization/Well-being endpoints for Cantril Ladder
 */
// POST /api/visualization
router.post('/visualization', async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);

    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { wellBeingLevel, futureWellBeingLevel } = req.body;

    if (wellBeingLevel !== undefined && (typeof wellBeingLevel !== 'number' || wellBeingLevel < 0 || wellBeingLevel > 10)) {
      return res.status(400).json({ success: false, error: 'wellBeingLevel must be a number between 0 and 10', code: 'VALIDATION_ERROR' });
    }

    if (futureWellBeingLevel !== undefined && (typeof futureWellBeingLevel !== 'number' || futureWellBeingLevel < 0 || futureWellBeingLevel > 10)) {
      return res.status(400).json({ success: false, error: 'futureWellBeingLevel must be a number between 0 and 10', code: 'VALIDATION_ERROR' });
    }

    const assessmentData = { wellBeingLevel: wellBeingLevel || 5, futureWellBeingLevel: futureWellBeingLevel || 5 };

    const existingAssessment = await db
      .select()
      .from(schema.userAssessments)
      .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'cantrilLadder')));

    if (existingAssessment.length > 0) {
      await db.update(schema.userAssessments).set({ results: JSON.stringify(assessmentData) }).where(eq(schema.userAssessments.id, existingAssessment[0].id));
    } else {
      await db.insert(schema.userAssessments).values({ userId, assessmentType: 'cantrilLadder', results: JSON.stringify(assessmentData) });
    }

    res.json({ success: true, data: assessmentData, meta: { saved_at: new Date().toISOString(), assessmentType: 'cantrilLadder' } });
  } catch (error) {
    res.status(400).json({ success: false, error: error instanceof Error ? (error as Error).message : 'Save failed', code: 'SAVE_ERROR' });
  }
});

// GET /api/visualization
router.get('/visualization', async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);

    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const assessment = await db
      .select()
      .from(schema.userAssessments)
      .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'cantrilLadder')));

    if (!assessment || assessment.length === 0) {
      return res.json({ success: true, data: null, wellBeingLevel: 5, futureWellBeingLevel: 5 });
    }

    const results = JSON.parse(assessment[0].results);
    res.json({ success: true, data: results, wellBeingLevel: results.wellBeingLevel || 5, futureWellBeingLevel: results.futureWellBeingLevel || 5, meta: { assessmentType: 'cantrilLadder' } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve assessment', code: 'FETCH_ERROR' });
  }
});

/**
 * Store visualization image from workshop (with attribution)
 * POST /api/workshop-data/store-visualization-image
 */
router.post('/store-visualization-image', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { imageUrl, attribution, context = 'workshop_visualization' } = req.body;
    const userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!imageUrl || !attribution) {
      return res.status(400).json({ error: 'Image URL and attribution are required' });
    }

    console.log(`🖼️ Storing visualization image for user ${userId}: ${imageUrl}`);

    const { photoStorageService } = await import('../services/photo-storage-service.js');
    const photoId = await photoStorageService.storeVisualizationImage(userId, imageUrl, attribution, context);

    res.json({ success: true, photoId, message: 'Visualization image stored successfully', imageUrl: `/api/photos/${photoId}` });
  } catch (error) {
    console.error('Error storing visualization image:', error);
    res.status(500).json({ error: 'Failed to store visualization image' });
  }
});

export default router;
