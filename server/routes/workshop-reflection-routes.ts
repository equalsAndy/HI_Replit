import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { eq, and, isNull } from 'drizzle-orm';
import * as schema from '../../shared/schema.js';
import { workshopStepData } from '../../shared/schema.js';
import { authenticateUser, checkWorkshopLocked } from './workshop-data-shared.js';

const router = Router();

/**
 * Rounding Out Reflection endpoints
 */
// POST /api/workshop-data/rounding-out
router.post('/rounding-out', authenticateUser, checkWorkshopLocked, async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);

    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { strengths, values, passions, growthAreas } = req.body;

    if (!strengths || typeof strengths !== 'string' || strengths.trim().length === 0 || strengths.length > 1000) {
      return res.status(400).json({ success: false, error: 'Strengths is required and must be 1-1000 characters', code: 'VALIDATION_ERROR', details: { strengths: 'Required field, 1-1000 characters' } });
    }

    if (!values || typeof values !== 'string' || values.trim().length === 0 || values.length > 1000) {
      return res.status(400).json({ success: false, error: 'Values is required and must be 1-1000 characters', code: 'VALIDATION_ERROR', details: { values: 'Required field, 1-1000 characters' } });
    }

    if (!passions || typeof passions !== 'string' || passions.trim().length === 0 || passions.length > 1000) {
      return res.status(400).json({ success: false, error: 'Passions is required and must be 1-1000 characters', code: 'VALIDATION_ERROR', details: { passions: 'Required field, 1-1000 characters' } });
    }

    if (!growthAreas || typeof growthAreas !== 'string' || growthAreas.trim().length === 0 || growthAreas.length > 1000) {
      return res.status(400).json({ success: false, error: 'Growth Areas is required and must be 1-1000 characters', code: 'VALIDATION_ERROR', details: { growthAreas: 'Required field, 1-1000 characters' } });
    }

    const assessmentData = { strengths: strengths.trim(), values: values.trim(), passions: passions.trim(), growthAreas: growthAreas.trim() };

    const existingAssessment = await db.select().from(schema.userAssessments).where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'roundingOutReflection')));

    if (existingAssessment.length > 0) {
      await db.update(schema.userAssessments).set({ results: JSON.stringify(assessmentData) }).where(eq(schema.userAssessments.id, existingAssessment[0].id));
    } else {
      await db.insert(schema.userAssessments).values({ userId, assessmentType: 'roundingOutReflection', results: JSON.stringify(assessmentData) });
    }

    res.json({ success: true, data: assessmentData, meta: { saved_at: new Date().toISOString(), assessmentType: 'roundingOutReflection' } });
  } catch (error) {
    res.status(400).json({ success: false, error: error instanceof Error ? (error as Error).message : 'Save failed', code: 'SAVE_ERROR' });
  }
});

// GET /api/workshop-data/rounding-out
router.get('/rounding-out', async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);

    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const assessment = await db.select().from(schema.userAssessments).where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'roundingOutReflection')));

    if (!assessment || assessment.length === 0) {
      return res.json({ success: true, data: null });
    }

    const results = JSON.parse(assessment[0].results);
    res.json({ success: true, data: results, meta: { assessmentType: 'roundingOutReflection' } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve assessment', code: 'FETCH_ERROR' });
  }
});

/**
 * Future Self Reflection endpoints
 */
// POST /api/workshop-data/future-self
router.post('/future-self', authenticateUser, checkWorkshopLocked, async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);

    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { flowOptimizedLife, futureSelfDescription, visualizationNotes, additionalNotes, imageData } = req.body;

    const hasTextContent = (
      (flowOptimizedLife && flowOptimizedLife.trim().length >= 10) ||
      (futureSelfDescription && futureSelfDescription.trim().length >= 10) ||
      (visualizationNotes && visualizationNotes.trim().length >= 10)
    );

    const hasMinimalImageContent = (imageData && Array.isArray(imageData.selectedImages) && imageData.selectedImages.length > 0);

    console.log('🔍 Future Self validation check:', { hasTextContent, hasMinimalImageContent, imageDataExists: !!imageData, selectedImagesCount: imageData?.selectedImages?.length || 0, imageMeaningLength: imageData?.imageMeaning?.trim().length || 0 });

    if (!hasTextContent && !hasMinimalImageContent) {
      return res.status(400).json({ success: false, error: 'At least one reflection field must contain at least 10 characters, or at least one image must be selected', code: 'VALIDATION_ERROR', debug: { hasTextContent, hasMinimalImageContent, imageDataStructure: imageData ? Object.keys(imageData) : null, hint: 'Select at least one image or provide meaningful text content' } });
    }

    const validateField = (field: string, value: string, maxLength: number = 2000) => {
      if (value && (typeof value !== 'string' || value.length > maxLength)) {
        throw new Error(`${field} must be a string with maximum ${maxLength} characters`);
      }
    };

    try {
      validateField('flowOptimizedLife', flowOptimizedLife);
      validateField('futureSelfDescription', futureSelfDescription, 1000);
      validateField('visualizationNotes', visualizationNotes, 1000);
      validateField('additionalNotes', additionalNotes, 1000);
    } catch (validationError) {
      return res.status(400).json({ success: false, error: (validationError as Error).message, code: 'VALIDATION_ERROR' });
    }

    const assessmentData = {
      flowOptimizedLife: flowOptimizedLife ? flowOptimizedLife.trim() : '',
      futureSelfDescription: futureSelfDescription ? futureSelfDescription.trim() : '',
      visualizationNotes: visualizationNotes ? visualizationNotes.trim() : '',
      additionalNotes: additionalNotes ? additionalNotes.trim() : '',
      imageData: imageData || null,
      completedAt: new Date().toISOString()
    };

    console.log('💾 Future Self data being saved:', { userId, hasImageData: !!imageData, imageDataStructure: imageData ? { selectedImages: imageData.selectedImages?.length || 0, imageMeaning: imageData.imageMeaning?.length || 0 } : null, assessmentDataKeys: Object.keys(assessmentData) });

    const existingAssessment = await db.select().from(schema.userAssessments).where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'futureSelfReflection')));

    if (existingAssessment.length > 0) {
      await db.update(schema.userAssessments).set({ results: JSON.stringify(assessmentData) }).where(eq(schema.userAssessments.id, existingAssessment[0].id));
    } else {
      await db.insert(schema.userAssessments).values({ userId, assessmentType: 'futureSelfReflection', results: JSON.stringify(assessmentData) });
    }

    res.json({ success: true, data: assessmentData, meta: { saved_at: new Date().toISOString(), assessmentType: 'futureSelfReflection' } });
  } catch (error) {
    res.status(400).json({ success: false, error: error instanceof Error ? (error as Error).message : 'Save failed', code: 'SAVE_ERROR' });
  }
});

// GET /api/workshop-data/future-self
router.get('/future-self', async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);

    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const assessment = await db.select().from(schema.userAssessments).where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'futureSelfReflection')));

    if (!assessment || assessment.length === 0) {
      return res.json({ success: true, data: null });
    }

    const results = JSON.parse(assessment[0].results);
    res.json({ success: true, data: results, meta: { assessmentType: 'futureSelfReflection' } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve assessment', code: 'FETCH_ERROR' });
  }
});

/**
 * Cantril Ladder (Well-being) Reflection endpoints
 */
// POST /api/workshop-data/cantril-ladder
router.post('/cantril-ladder', authenticateUser, checkWorkshopLocked, async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);

    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { currentFactors, futureImprovements, specificChanges, quarterlyProgress, quarterlyActions, wellBeingLevel, futureWellBeingLevel } = req.body;

    const reflectionData = { currentFactors: currentFactors || '', futureImprovements: futureImprovements || '', specificChanges: specificChanges || '', quarterlyProgress: quarterlyProgress || '', quarterlyActions: quarterlyActions || '' };

    if (wellBeingLevel !== undefined && futureWellBeingLevel !== undefined) {
      const ladderData = { wellBeingLevel: Number(wellBeingLevel), futureWellBeingLevel: Number(futureWellBeingLevel) };

      const existingLadder = await db.select().from(schema.userAssessments).where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'cantrilLadder')));

      if (existingLadder.length > 0) {
        await db.update(schema.userAssessments).set({ results: JSON.stringify(ladderData) }).where(eq(schema.userAssessments.id, existingLadder[0].id));
      } else {
        await db.insert(schema.userAssessments).values({ userId, assessmentType: 'cantrilLadder', results: JSON.stringify(ladderData) });
      }

      console.log('Cantril Ladder values saved for export:', ladderData);
    }

    const existingReflection = await db.select().from(schema.userAssessments).where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'cantrilLadderReflection')));

    if (existingReflection.length > 0) {
      await db.update(schema.userAssessments).set({ results: JSON.stringify(reflectionData) }).where(eq(schema.userAssessments.id, existingReflection[0].id));
    } else {
      await db.insert(schema.userAssessments).values({ userId, assessmentType: 'cantrilLadderReflection', results: JSON.stringify(reflectionData) });
    }

    res.json({ success: true, data: reflectionData, meta: { saved_at: new Date().toISOString(), assessmentType: 'cantrilLadderReflection' } });
  } catch (error) {
    console.error('Cantril ladder save error:', error);
    res.status(400).json({ success: false, error: error instanceof Error ? (error as Error).message : 'Save failed', code: 'SAVE_ERROR', details: error instanceof Error ? error.stack : 'Unknown error' });
  }
});

// GET /api/workshop-data/cantril-ladder
router.get('/cantril-ladder', async (req: Request, res: Response) => {
  console.log('=== CANTRIL LADDER GET ENDPOINT HIT ===');
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);

    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }

    console.log('Cantril ladder GET - userId from session/cookie:', userId);

    if (!userId) {
      console.log('Cantril ladder GET - No userId, returning 401');
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const ladderAssessment = await db.select().from(schema.userAssessments).where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'cantrilLadder')));
    const reflectionAssessment = await db.select().from(schema.userAssessments).where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'cantrilLadderReflection')));

    console.log('Cantril ladder assessment found:', ladderAssessment.length > 0 ? 'YES' : 'NO');
    console.log('Cantril reflection assessment found:', reflectionAssessment.length > 0 ? 'YES' : 'NO');

    let combinedData: any = { wellBeingLevel: 5, futureWellBeingLevel: 5, currentFactors: '', futureImprovements: '', specificChanges: '', quarterlyProgress: '', quarterlyActions: '' };

    if (ladderAssessment.length > 0) {
      const ladderResults = JSON.parse(ladderAssessment[0].results);
      combinedData.wellBeingLevel = ladderResults.wellBeingLevel || 5;
      combinedData.futureWellBeingLevel = ladderResults.futureWellBeingLevel || 5;
      console.log('Ladder values found:', { wellBeingLevel: combinedData.wellBeingLevel, futureWellBeingLevel: combinedData.futureWellBeingLevel });
    }

    if (reflectionAssessment.length > 0) {
      const reflectionResults = JSON.parse(reflectionAssessment[0].results);
      combinedData.currentFactors = reflectionResults.currentFactors || '';
      combinedData.futureImprovements = reflectionResults.futureImprovements || '';
      combinedData.specificChanges = reflectionResults.specificChanges || '';
      combinedData.quarterlyProgress = reflectionResults.quarterlyProgress || '';
      combinedData.quarterlyActions = reflectionResults.quarterlyActions || '';
      console.log('Reflection values found');
    }

    console.log('Combined cantril ladder data being returned:', combinedData);
    res.json({ success: true, data: combinedData, meta: { assessmentType: 'cantrilLadder', hasLadderData: ladderAssessment.length > 0, hasReflectionData: reflectionAssessment.length > 0 } });
  } catch (error) {
    console.error('Cantril ladder GET error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve assessment', code: 'FETCH_ERROR' });
  }
});

/**
 * Final Insights Reflection endpoints
 */
// POST /api/workshop-data/final-insights
router.post('/final-insights', authenticateUser, checkWorkshopLocked, async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);

    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { keyInsights, actionSteps, commitments } = req.body;

    if (!keyInsights || typeof keyInsights !== 'string' || keyInsights.trim().length === 0 || keyInsights.length > 1000) {
      return res.status(400).json({ success: false, error: 'Key Insights is required and must be 1-1000 characters', code: 'VALIDATION_ERROR', details: { keyInsights: 'Required field, 1-1000 characters' } });
    }

    if (!actionSteps || typeof actionSteps !== 'string' || actionSteps.trim().length === 0 || actionSteps.length > 1000) {
      return res.status(400).json({ success: false, error: 'Action Steps is required and must be 1-1000 characters', code: 'VALIDATION_ERROR', details: { actionSteps: 'Required field, 1-1000 characters' } });
    }

    if (!commitments || typeof commitments !== 'string' || commitments.trim().length === 0 || commitments.length > 1000) {
      return res.status(400).json({ success: false, error: 'Commitments is required and must be 1-1000 characters', code: 'VALIDATION_ERROR', details: { commitments: 'Required field, 1-1000 characters' } });
    }

    const assessmentData = { keyInsights: keyInsights.trim(), actionSteps: actionSteps.trim(), commitments: commitments.trim() };

    const existingAssessment = await db.select().from(schema.userAssessments).where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'finalReflection')));

    if (existingAssessment.length > 0) {
      await db.update(schema.userAssessments).set({ results: JSON.stringify(assessmentData) }).where(eq(schema.userAssessments.id, existingAssessment[0].id));
    } else {
      await db.insert(schema.userAssessments).values({ userId, assessmentType: 'finalReflection', results: JSON.stringify(assessmentData) });
    }

    res.json({ success: true, data: assessmentData, meta: { saved_at: new Date().toISOString(), assessmentType: 'finalReflection' } });
  } catch (error) {
    res.status(400).json({ success: false, error: error instanceof Error ? (error as Error).message : 'Save failed', code: 'SAVE_ERROR' });
  }
});

// GET /api/workshop-data/final-insights
router.get('/final-insights', async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);

    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const assessment = await db.select().from(schema.userAssessments).where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'finalReflection')));

    if (!assessment || assessment.length === 0) {
      return res.json({ success: true, data: null });
    }

    const results = JSON.parse(assessment[0].results);
    res.json({ success: true, data: results, meta: { assessmentType: 'finalReflection' } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve assessment', code: 'FETCH_ERROR' });
  }
});

/**
 * Step-by-Step Reflection endpoints
 */
// POST /api/workshop-data/step-by-step-reflection
router.post('/step-by-step-reflection', authenticateUser, checkWorkshopLocked, async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);

    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { strength1, strength2, strength3, strength4, imaginationReflection, teamValues, uniqueContribution } = req.body;

    const reflectionData = { strength1: strength1 || '', strength2: strength2 || '', strength3: strength3 || '', strength4: strength4 || '', imaginationReflection: imaginationReflection || '', teamValues: teamValues || '', uniqueContribution: uniqueContribution || '' };

    const existingReflection = await db.select().from(schema.userAssessments).where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'stepByStepReflection')));

    if (existingReflection.length > 0) {
      await db.update(schema.userAssessments).set({ results: JSON.stringify(reflectionData) }).where(eq(schema.userAssessments.id, existingReflection[0].id));
    } else {
      await db.insert(schema.userAssessments).values({ userId, assessmentType: 'stepByStepReflection', results: JSON.stringify(reflectionData) });
    }

    res.json({ success: true, data: reflectionData, meta: { saved_at: new Date().toISOString(), assessmentType: 'stepByStepReflection' } });
  } catch (error) {
    res.status(400).json({ success: false, error: error instanceof Error ? (error as Error).message : 'Save failed', code: 'SAVE_ERROR' });
  }
});

// GET /api/workshop-data/step-by-step-reflection
router.get('/step-by-step-reflection', async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);

    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const assessment = await db.select().from(schema.userAssessments).where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'stepByStepReflection')));

    if (!assessment || assessment.length === 0) {
      return res.json({ success: true, data: null });
    }

    const results = JSON.parse(assessment[0].results);
    res.json({ success: true, data: results, meta: { assessmentType: 'stepByStepReflection' } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve assessment', code: 'FETCH_ERROR' });
  }
});

/**
 * Final Reflection endpoints
 */
// POST /api/workshop-data/final-reflection
router.post('/final-reflection', authenticateUser, checkWorkshopLocked, async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);

    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { futureLetterText } = req.body;

    if (!futureLetterText || typeof futureLetterText !== 'string' || futureLetterText.trim().length === 0 || futureLetterText.length > 1000) {
      return res.status(400).json({ success: false, error: 'Future Letter Text is required and must be 1-1000 characters', code: 'VALIDATION_ERROR', details: { futureLetterText: 'Required field, 1-1000 characters' } });
    }

    const assessmentData = { futureLetterText: futureLetterText.trim() };

    const existingAssessment = await db.select().from(schema.userAssessments).where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'finalReflection')));

    if (existingAssessment.length > 0) {
      await db.update(schema.userAssessments).set({ results: JSON.stringify(assessmentData) }).where(eq(schema.userAssessments.id, existingAssessment[0].id));
    } else {
      await db.insert(schema.userAssessments).values({ userId, assessmentType: 'finalReflection', results: JSON.stringify(assessmentData) });
    }

    console.log(`✅ Final reflection saved for user ${userId}`);

    res.json({ success: true, data: assessmentData, meta: { saved_at: new Date().toISOString(), assessmentType: 'finalReflection' } });
  } catch (error) {
    res.status(400).json({ success: false, error: error instanceof Error ? (error as Error).message : 'Save failed', code: 'SAVE_ERROR' });
  }
});

// GET /api/workshop-data/final-reflection
router.get('/final-reflection', async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);

    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const assessment = await db.select().from(schema.userAssessments).where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'finalReflection')));

    if (!assessment || assessment.length === 0) {
      return res.json({ success: true, data: null });
    }

    const results = JSON.parse(assessment[0].results);
    res.json({ success: true, data: results, meta: { assessmentType: 'finalReflection' } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve assessment', code: 'FETCH_ERROR' });
  }
});

/**
 * Generic step data endpoints
 */

// GET /api/workshop-data/step/:workshopType/:stepId
router.get('/step/:workshopType/:stepId', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { workshopType, stepId } = req.params;
    const userId = (req.session as any).userId;

    if (!['ast', 'ia', 'pm'].includes(workshopType)) {
      return res.status(400).json({ success: false, error: 'Invalid workshop type. Must be "ast", "ia", or "pm"' });
    }

    if (!stepId || typeof stepId !== 'string') {
      return res.status(400).json({ success: false, error: 'Step ID is required' });
    }

    const result = await db
      .select()
      .from(workshopStepData)
      .where(and(eq(workshopStepData.userId, userId), eq(workshopStepData.workshopType, workshopType), eq(workshopStepData.stepId, stepId), isNull(workshopStepData.deletedAt)))
      .limit(1);

    if (result.length === 0) {
      return res.json({ success: true, data: null, stepId, workshopType });
    }

    res.json({ success: true, data: result[0].data, stepId, workshopType, lastUpdated: result[0].updatedAt });
  } catch (error) {
    console.error('Error loading workshop step data:', error);
    res.status(500).json({ success: false, error: 'Failed to load step data' });
  }
});

// POST /api/workshop-data/step
router.post('/step', authenticateUser, checkWorkshopLocked, async (req: Request, res: Response) => {
  try {
    const { workshopType, stepId, data } = req.body;
    const userId = (req.session as any).userId;

    console.log('🔍 POST /step - Request details:', { workshopType, stepId, userId, hasData: !!data, dataKeys: data ? Object.keys(data) : [], sessionExists: !!(req.session), userIdType: typeof userId });

    if (!['ast', 'ia', 'pm'].includes(workshopType)) {
      return res.status(400).json({ success: false, error: 'Invalid workshop type. Must be "ast", "ia", or "pm"' });
    }

    if (!stepId || typeof stepId !== 'string') {
      return res.status(400).json({ success: false, error: 'Step ID is required' });
    }

    if (!data || typeof data !== 'object') {
      return res.status(400).json({ success: false, error: 'Data object is required' });
    }

    console.log('🔍 Attempting to save workshop data:', { userId, workshopType, stepId, dataKeys: Object.keys(data) });

    if (!userId || typeof userId !== 'number') {
      console.error('❌ Invalid userId:', { userId, type: typeof userId });
      return res.status(401).json({ success: false, error: 'Authentication required - invalid user ID' });
    }

    console.log('🔍 About to execute UPSERT with:', { userId, workshopType, stepId, hasData: !!data, dataSize: JSON.stringify(data).length });

    const result = await db
      .insert(workshopStepData)
      .values({ userId, workshopType, stepId, data: data, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: [workshopStepData.userId, workshopStepData.workshopType, workshopStepData.stepId],
        set: { data: data, updatedAt: new Date(), deletedAt: null }
      })
      .returning();

    console.log('✅ Workshop data saved successfully:', result[0]);

    res.json({ success: true, stepId, workshopType, saved: true, lastUpdated: result[0].updatedAt });
  } catch (error) {
    console.error('❌ Error saving workshop step data:', error);
    console.error('❌ Error details:', { message: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : 'No stack trace' });
    res.status(500).json({ success: false, error: 'Failed to save step data', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// GET /api/workshop-data/steps/:workshopType
router.get('/steps/:workshopType', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { workshopType } = req.params;
    const userId = (req.session as any).userId;

    if (!['ast', 'ia', 'pm'].includes(workshopType)) {
      return res.status(400).json({ success: false, error: 'Invalid workshop type. Must be "ast", "ia", or "pm"' });
    }

    const results = await db
      .select()
      .from(workshopStepData)
      .where(and(eq(workshopStepData.userId, userId), eq(workshopStepData.workshopType, workshopType), isNull(workshopStepData.deletedAt)))
      .orderBy(workshopStepData.stepId);

    const stepData = results.reduce((acc, row) => {
      acc[row.stepId] = row.data;
      return acc;
    }, {} as Record<string, any>);

    res.json({ success: true, workshopType, stepData, totalSteps: results.length });
  } catch (error) {
    console.error('Error loading workshop steps data:', error);
    res.status(500).json({ success: false, error: 'Failed to load workshop data' });
  }
});

export default router;
