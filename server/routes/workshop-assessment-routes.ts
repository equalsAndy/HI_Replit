import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { eq, and } from 'drizzle-orm';
import * as schema from '../../shared/schema.js';
import { authenticateUser, checkWorkshopLocked } from './workshop-data-shared.js';

const router = Router();

/**
 * Get star card data for the current user
 */
router.get('/starcard', async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    console.log(`StarCard: User IDs - Session: ${(req.session as any).userId}, Cookie: ${req.cookies.userId}`);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
      console.log(`Using session user ID ${userId} instead of cookie user ID 1`);
    }

    console.log(`Fetching star card for user ${userId}`);

    const starCards = await db
      .select()
      .from(schema.userAssessments)
      .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'starCard')));

    if (starCards && starCards.length > 0) {
      const starCard = starCards[0];
      console.log(`Found star card for user ${userId}:`, starCard);

      try {
        const starCardData = JSON.parse(starCard.results);
        console.log(`Parsed star card data for user ${userId}:`, starCardData);

        return res.status(200).json({ success: true, thinking: starCardData.thinking || 0, feeling: starCardData.feeling || 0, acting: starCardData.acting || 0, planning: starCardData.planning || 0, ...starCardData });
      } catch (parseError) {
        console.error(`Error parsing star card data for user ${userId}:`, parseError);
        return res.status(500).json({ success: false, message: 'Error parsing star card data' });
      }
    } else {
      console.log(`No star card found for user ${userId}`);
      return res.status(200).json({ success: true, thinking: 0, acting: 0, feeling: 0, planning: 0, isEmpty: true, source: 'no_database_data' });
    }
  } catch (error) {
    console.error('Error getting star card:', error);
    return res.status(500).json({ success: false, message: 'Failed to get star card data', error: error instanceof Error ? (error as Error).message : 'Unknown error' });
  }
});

/**
 * Get flow attributes for the current user
 */
router.get('/flow-attributes', async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    console.log(`Flow Attributes: User IDs - Session: ${(req.session as any).userId}, Cookie: ${req.cookies.userId}`);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
      console.log(`Using session user ID ${userId} instead of cookie user ID 1`);
    }

    const flowDataEntries = await db.select().from(schema.userAssessments).where(eq(schema.userAssessments.userId, userId));
    const flowData = flowDataEntries.find(a => a.assessmentType === 'flowAttributes');

    if (flowData) {
      try {
        const flowAttributes = JSON.parse(flowData.results);
        return res.status(200).json({ success: true, attributes: flowAttributes.attributes || [], flowScore: flowAttributes.flowScore || 0 });
      } catch (parseError) {
        console.error(`Error parsing flow attributes for user ${userId}:`, parseError);
        return res.status(500).json({ success: false, message: 'Error parsing flow attributes' });
      }
    } else {
      return res.status(200).json({ success: true, attributes: [], flowScore: 0, isEmpty: true });
    }
  } catch (error) {
    console.error('Error getting flow attributes:', error);
    return res.status(500).json({ success: false, message: 'Failed to get flow attributes', error: error instanceof Error ? (error as Error).message : 'Unknown error' });
  }
});

/**
 * Assessment API routes
 */

// Get assessment questions
router.get('/assessment/questions', async (req: Request, res: Response) => {
  try {
    const userId = req.cookies.userId ? parseInt(req.cookies.userId) : null;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    return res.status(200).json([
      {
        id: 1,
        text: "When starting a new project, I prefer to...",
        options: [
          { id: "opt1-1", text: "Start working right away and adjust as I go", category: "acting" },
          { id: "opt1-2", text: "Get to know my teammates and build good working relationships", category: "feeling" },
          { id: "opt1-3", text: "Break down the work into clear steps with deadlines", category: "planning" },
          { id: "opt1-4", text: "Consider different approaches before deciding how to proceed", category: "thinking" }
        ]
      },
      {
        id: 2,
        text: "When faced with a challenge, I typically...",
        options: [
          { id: "opt2-1", text: "Tackle it head-on and find a quick solution", category: "acting" },
          { id: "opt2-2", text: "Talk it through with others to understand their perspectives", category: "feeling" },
          { id: "opt2-3", text: "Create a detailed plan to overcome it systematically", category: "planning" },
          { id: "opt2-4", text: "Analyze the root cause and consider multiple solutions", category: "thinking" }
        ]
      }
    ]);
  } catch (error) {
    console.error('Error getting assessment questions:', error);
    return res.status(500).json({ success: false, message: 'Failed to get assessment questions', error: error instanceof Error ? (error as Error).message : 'Unknown error' });
  }
});

// Start assessment
router.post('/assessment/start', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const existingAssessment = await db.select().from(schema.userAssessments).where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'starCard')));

    if (existingAssessment.length > 0) {
      return res.status(409).json({ success: false, message: 'Assessment already completed' });
    }

    return res.status(200).json({ success: true, message: 'Assessment started' });
  } catch (error) {
    console.error('Error starting assessment:', error);
    return res.status(500).json({ success: false, message: 'Failed to start assessment', error: error instanceof Error ? (error as Error).message : 'Unknown error' });
  }
});

// Save answer
router.post('/assessment/answer', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    return res.status(200).json({ success: true, message: 'Answer saved' });
  } catch (error) {
    console.error('Error saving answer:', error);
    return res.status(500).json({ success: false, message: 'Failed to save answer', error: error instanceof Error ? (error as Error).message : 'Unknown error' });
  }
});

// Complete assessment
router.post('/assessment/complete', authenticateUser, checkWorkshopLocked, async (req: Request, res: Response) => {
  console.log('=== ASSESSMENT COMPLETION START ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('Session data:', req.session);
  console.log('Cookies:', req.cookies);

  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);

    console.log('Initial userId determination:', userId);

    if (!userId) {
      console.log('ERROR: No user ID found in session or cookies');
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    console.log(`Assessment: User IDs - Session: ${(req.session as any).userId}, Cookie: ${req.cookies.userId}`);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
      console.log(`Using session user ID ${userId} instead of cookie user ID 1`);
    }

    let quadrantData = req.body.quadrantData || { thinking: 28, feeling: 25, acting: 24, planning: 23 };
    const answers = req.body.answers || [];
    const results = { ...quadrantData, answers };

    console.log('Saving star card data with answers:', results);
    console.log(`Saving ${answers.length} individual answers`);

    const existingAssessment = await db.select().from(schema.userAssessments).where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'starCard')));

    let updatedId = null;

    if (existingAssessment.length > 0) {
      const updated = await db.update(schema.userAssessments).set({ results: JSON.stringify(results) }).where(eq(schema.userAssessments.id, existingAssessment[0].id)).returning();
      updatedId = updated.length > 0 ? updated[0].id : existingAssessment[0].id;
      console.log('Updated existing star card assessment with answers:', updated);
    } else {
      const inserted = await db.insert(schema.userAssessments).values({ userId: userId, assessmentType: 'starCard', results: JSON.stringify(results) }).returning();
      updatedId = inserted.length > 0 ? inserted[0].id : null;
      console.log('Created new star card assessment with answers:', inserted);
    }

    return res.status(200).json({ success: true, message: 'Assessment completed', id: updatedId, userId: userId, thinking: quadrantData.thinking, feeling: quadrantData.feeling, acting: quadrantData.acting, planning: quadrantData.planning, createdAt: new Date().toISOString() });
  } catch (error) {
    console.error('Error completing assessment:', error);
    return res.status(500).json({ success: false, message: 'Failed to complete assessment', error: error instanceof Error ? (error as Error).message : 'Unknown error' });
  }
});

/**
 * Save flow attributes for the current user
 */
router.post('/flow-attributes', authenticateUser, checkWorkshopLocked, async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');

  try {
    console.log('Flow attributes save request received:', req.body);

    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);

    console.log(`Flow Attributes POST: User IDs - Session: ${(req.session as any).userId}, Cookie: ${req.cookies.userId}`);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
      console.log(`Using session user ID ${userId} instead of cookie user ID 1`);
    }

    console.log('User ID for saving flow attributes:', userId);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { attributes } = req.body;
    console.log('Flow attributes data:', { attributes });

    if (!attributes || !Array.isArray(attributes)) {
      return res.status(400).json({ success: false, message: 'Invalid flow attributes data' });
    }

    const flowAttributesData = { attributes };

    const existingFlowAttributes = await db.select().from(schema.userAssessments).where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'flowAttributes')));

    console.log('Existing flow attributes:', existingFlowAttributes);

    if (existingFlowAttributes.length > 0) {
      const updated = await db.update(schema.userAssessments).set({ results: JSON.stringify(flowAttributesData) }).where(eq(schema.userAssessments.id, existingFlowAttributes[0].id)).returning();
      console.log('Updated flow attributes:', updated);
    } else {
      const inserted = await db.insert(schema.userAssessments).values({ userId, assessmentType: 'flowAttributes', results: JSON.stringify(flowAttributesData) }).returning();
      console.log('Inserted flow attributes:', inserted);
    }

    return res.status(200).json({ success: true, message: 'Flow attributes saved successfully', attributes });
  } catch (error) {
    console.error('Error saving flow attributes:', error);
    return res.status(500).json({ success: false, message: 'Failed to save flow attributes', error: error instanceof Error ? (error as Error).message : 'Unknown error' });
  }
});

/**
 * Save assessment data (for reflections and other assessments)
 */
router.post('/assessments', async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);

    console.log(`Assessments POST: User IDs - Session: ${(req.session as any).userId}, Cookie: ${req.cookies.userId}`);
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
      console.log(`Using session user ID ${userId} instead of cookie user ID 1`);
    }

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { assessmentType, results } = req.body;
    console.log('Saving assessment:', { userId, assessmentType, results });

    if (!assessmentType || !results) {
      return res.status(400).json({ success: false, message: 'Assessment type and results are required' });
    }

    const existingAssessment = await db.select().from(schema.userAssessments).where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, assessmentType)));

    if (existingAssessment.length > 0) {
      const updated = await db.update(schema.userAssessments).set({ results: JSON.stringify(results) }).where(eq(schema.userAssessments.id, existingAssessment[0].id)).returning();
      console.log('Updated assessment:', updated[0]);
      return res.status(200).json({ success: true, message: 'Assessment updated successfully', assessment: updated[0] });
    } else {
      const inserted = await db.insert(schema.userAssessments).values({ userId, assessmentType, results: JSON.stringify(results) }).returning();
      console.log('Created new assessment:', inserted[0]);
      return res.status(200).json({ success: true, message: 'Assessment saved successfully', assessment: inserted[0] });
    }
  } catch (error) {
    console.error('Error saving assessment:', error);
    return res.status(500).json({ success: false, message: 'Failed to save assessment', error: error instanceof Error ? (error as Error).message : 'Unknown error' });
  }
});

// GET /api/workshop-data/assessments/:prefix
router.get('/assessments/:prefix', async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);

    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { prefix } = req.params;
    const assessments = await db.select().from(schema.userAssessments).where(eq(schema.userAssessments.userId, userId));

    const result: any = {};
    assessments.forEach(assessment => {
      if (assessment.assessmentType.startsWith(prefix)) {
        const typeSuffix = assessment.assessmentType.replace(`${prefix}-`, '');
        try {
          result[typeSuffix] = JSON.parse(assessment.results);
        } catch (error) {
          console.error(`Error parsing assessment ${assessment.assessmentType}:`, error);
        }
      }
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error retrieving assessments:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve assessments', error: error instanceof Error ? (error as Error).message : 'Unknown error' });
  }
});

/**
 * Flow Assessment API endpoints
 */

// GET /api/workshop-data/flow-assessment
router.get('/flow-assessment', async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);

    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const assessment = await db.select().from(schema.userAssessments).where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'flowAssessment')));

    if (!assessment || assessment.length === 0) {
      return res.json({ success: true, data: null });
    }

    const results = JSON.parse(assessment[0].results);
    res.json({ success: true, data: results, meta: { created_at: assessment[0].createdAt, assessmentType: 'flowAssessment' } });
  } catch (error) {
    console.error('Error fetching flow assessment:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? (error as Error).message : 'Fetch failed' });
  }
});

// POST /api/workshop-data/flow-assessment
router.post('/flow-assessment', authenticateUser, checkWorkshopLocked, async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);

    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { answers, flowScore, completed = true } = req.body;

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ success: false, error: 'Answers object is required' });
    }

    if (flowScore === undefined || typeof flowScore !== 'number') {
      return res.status(400).json({ success: false, error: 'Flow score is required and must be a number' });
    }

    const assessmentData = { answers, flowScore, completed, completedAt: completed ? new Date().toISOString() : null };

    const existingAssessment = await db.select().from(schema.userAssessments).where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'flowAssessment')));

    if (existingAssessment.length > 0) {
      await db.update(schema.userAssessments).set({ results: JSON.stringify(assessmentData) }).where(eq(schema.userAssessments.id, existingAssessment[0].id));
    } else {
      await db.insert(schema.userAssessments).values({ userId, assessmentType: 'flowAssessment', results: JSON.stringify(assessmentData) });
    }

    res.json({ success: true, data: assessmentData, meta: { saved_at: new Date().toISOString(), assessmentType: 'flowAssessment' } });
  } catch (error) {
    console.error('Error saving flow assessment:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? (error as Error).message : 'Save failed' });
  }
});

// GET /api/workshop-data/userAssessments
router.get('/userAssessments', async (req: Request, res: Response) => {
  try {
    let userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);

    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && (req.session as any).userId && (req.session as any).userId !== 1) {
      userId = (req.session as any).userId;
    }

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const assessments = await db.select().from(schema.userAssessments).where(eq(schema.userAssessments.userId, userId));

    const assessmentsByType: Record<string, any> = {};
    assessments.forEach(assessment => {
      try {
        const results = JSON.parse(assessment.results);
        assessmentsByType[assessment.assessmentType] = { ...results, createdAt: assessment.createdAt, assessmentType: assessment.assessmentType };
      } catch (error) {
        console.error(`Error parsing assessment ${assessment.assessmentType}:`, error);
      }
    });

    res.json({ success: true, currentUser: { assessments: assessmentsByType } });
  } catch (error) {
    console.error('Error fetching user assessments:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? (error as Error).message : 'Fetch failed' });
  }
});

/**
 * IA Assessment API endpoints
 */

// Get IA assessment results
router.get('/ia-assessment/:userId?', async (req: Request, res: Response) => {
  try {
    const targetUserId = req.params.userId ? parseInt(req.params.userId) :
                        ((req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null));

    if (!targetUserId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const assessment = await db.select().from(schema.userAssessments).where(and(eq(schema.userAssessments.userId, targetUserId), eq(schema.userAssessments.assessmentType, 'iaCoreCapabilities')));

    if (assessment.length === 0) {
      return res.status(200).json({ success: true, data: null });
    }

    const assessmentData = assessment[0];
    let results;
    try {
      results = typeof assessmentData.results === 'string' ? JSON.parse(assessmentData.results) : assessmentData.results;
    } catch (error) {
      console.error('Error parsing IA assessment results:', error);
      return res.status(200).json({ success: true, data: null });
    }

    return res.status(200).json({ success: true, data: { id: assessmentData.id, userId: assessmentData.userId, assessmentType: assessmentData.assessmentType, results, createdAt: assessmentData.createdAt } });
  } catch (error) {
    console.error('Error fetching IA assessment:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch IA assessment' });
  }
});

// Save IA assessment results
router.post('/ia-assessment', authenticateUser, checkWorkshopLocked, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { results } = req.body;

    if (!results) {
      return res.status(400).json({ success: false, message: 'Assessment results are required' });
    }

    const existingAssessment = await db.select().from(schema.userAssessments).where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'iaCoreCapabilities')));

    if (existingAssessment.length > 0) {
      await db.update(schema.userAssessments).set({ results: typeof results === 'string' ? results : JSON.stringify(results) }).where(eq(schema.userAssessments.id, existingAssessment[0].id));
    } else {
      await db.insert(schema.userAssessments).values({ userId, assessmentType: 'iaCoreCapabilities', results: typeof results === 'string' ? results : JSON.stringify(results) });
    }

    return res.status(200).json({ success: true, message: 'IA assessment saved successfully', data: results });
  } catch (error) {
    console.error('Error saving IA assessment:', error);
    return res.status(500).json({ success: false, message: 'Failed to save IA assessment' });
  }
});

export default router;
