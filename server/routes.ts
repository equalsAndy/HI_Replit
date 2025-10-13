import express from 'express';
import { attachUser } from './middleware/auth.ts';
import { db } from './db.ts';
import { eq, and, desc } from 'drizzle-orm';
import * as schema from '../shared/schema.ts';

// Import route modules
import authRoutes from './routes/auth-routes.ts';
import inviteRoutes from './routes/invite-routes.ts';
import fixedInviteRoutes from './routes/fixed-invite-routes.ts';
import userRoutes from './routes/user-routes.ts';
import workshopDataRoutes from './routes/workshop-data-routes.ts';
import growthPlanRoutes from './routes/growth-plan-routes.ts';
// import coachingChatRoutes from './routes/coaching-chat-routes.ts';
import { resetRouter } from './reset-routes.ts';
import { adminRouter } from './routes/admin-routes.ts';
import { facilitatorRouter } from './routes/facilitator-routes.ts';
import photoRoutes from './routes/photo-routes.ts';
import starCardRoutes from './routes/starcard-routes.ts';
import iaChatRoutes from './routes/ia-chat-routes.ts';
import aiRoutes from './routes/ai.ts';

// Create a router
export const router = express.Router();

// Attach user to request if authenticated
router.use(attachUser);

// Use route modules
router.use('/auth', authRoutes);
router.use('/invites', inviteRoutes);
router.use('/admin/invites', fixedInviteRoutes);
router.use('/admin', adminRouter);
router.use('/facilitator', facilitatorRouter);
// router.use('/coaching/chat', coachingChatRoutes);
router.use('/user', userRoutes);
// router.use('/coaching/chat', coachingChatRoutes);
router.use('/test-users/reset', resetRouter);
router.use('/workshop-data', workshopDataRoutes);
router.use('/growth-plan', growthPlanRoutes);
router.use('/photos', photoRoutes);
router.use('/starcard', starCardRoutes);
// AI training routes
router.use('/ai', aiRoutes);
// IA chat assistant routes
router.use('/', iaChatRoutes);

// Add visualization endpoints directly at the API root level
router.use('/', workshopDataRoutes);

// Assessment API routes
router.post('/assessments', async (req, res) => {
  let userId: number | null = null;
  let assessmentType: string | undefined;
  try {
    userId = req.session?.userId || (req.cookies?.userId ? parseInt(req.cookies.userId) : null);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const { assessmentType: incomingAssessmentType, results } = req.body;
    assessmentType = incomingAssessmentType;

    if (!assessmentType || !results) {
      return res.status(400).json({
        success: false,
        message: 'Assessment type and results are required'
      });
    }

    // Save assessment to database
    await db.insert(schema.userAssessments).values({
      userId,
      assessmentType,
      results: typeof results === 'string' ? results : JSON.stringify(results)
    });

    res.json({
      success: true,
      message: 'Assessment saved successfully'
    });
  } catch (error) {
    console.error('Error saving assessment:', {
      userId,
      assessmentType,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorName: error instanceof Error ? error.name : 'UnknownError'
    });
    res.status(500).json({
      success: false,
      message: 'Failed to save assessment'
    });
  }
});

router.get('/assessments/:type', async (req, res) => {
  let userId: number | null = null;
  const { type } = req.params;
  try {
    userId = req.session?.userId || (req.cookies?.userId ? parseInt(req.cookies.userId) : null);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    // Get assessment from database
    const assessment = await db
      .select()
      .from(schema.userAssessments)
      .where(
        and(
          eq(schema.userAssessments.userId, userId),
          eq(schema.userAssessments.assessmentType, type)
        )
      )
      .orderBy(desc(schema.userAssessments.createdAt))
      .limit(1);

    if (assessment.length === 0) {
      return res.json({
        success: true,
        data: null
      });
    }

    const results = JSON.parse(assessment[0].results);
    
    res.json({
      success: true,
      data: {
        id: assessment[0].id,
        userId: assessment[0].userId,
        assessmentType: assessment[0].assessmentType,
        results,
        createdAt: assessment[0].createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching assessment:', {
      userId,
      assessmentType: type,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorName: error instanceof Error ? error.name : 'UnknownError'
    });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assessment'
    });
  }
});

// Final Reflection API routes
router.get('/final-reflection', async (req, res) => {
  let userId: number | null = null;
  try {
    userId = req.session?.userId || (req.cookies?.userId ? parseInt(req.cookies.userId) : null);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const reflection = await db.select()
      .from(schema.finalReflections)
      .where(eq(schema.finalReflections.userId, userId))
      .limit(1);

    res.json({
      success: true,
      insight: reflection[0]?.insight || ''
    });
  } catch (error) {
    console.error('Error fetching final reflection:', {
      userId,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorName: error instanceof Error ? error.name : 'UnknownError'
    });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch final reflection'
    });
  }
});

router.post('/final-reflection', async (req, res) => {
  let userId: number | null = null;
  try {
    userId = req.session?.userId || (req.cookies?.userId ? parseInt(req.cookies.userId) : null);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const { insight } = req.body;

    if (!insight || typeof insight !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Insight text is required'
      });
    }

    // Check if reflection already exists
    const existing = await db.select()
      .from(schema.finalReflections)
      .where(eq(schema.finalReflections.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      // Update existing reflection
      await db.update(schema.finalReflections)
        .set({
          insight
        })
        .where(eq(schema.finalReflections.userId, userId));
    } else {
      // Create new reflection
      await db.insert(schema.finalReflections).values({
        userId,
        insight
      });
    }

    res.json({
      success: true,
      message: 'Final reflection saved successfully'
    });
  } catch (error) {
    console.error('Error saving final reflection:', {
      userId,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorName: error instanceof Error ? error.name : 'UnknownError'
    });
    res.status(500).json({
      success: false,
      message: 'Failed to save final reflection'
    });
  }
});

// Base API route to check if the API is running
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Heliotrope Imaginal Workshop API',
    version: '1.0.0',
    user: (req as any).user || null
  });
});
