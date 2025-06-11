import express from 'express';
import { attachUser } from './middleware/auth';
import { db } from './db';
import { eq, and, desc } from 'drizzle-orm';
import * as schema from '../shared/schema';

// Import route modules
import authRoutes from './routes/auth-routes';
import inviteRoutes from './routes/invite-routes';
import fixedInviteRoutes from './routes/fixed-invite-routes';
import userRoutes from './routes/user-routes';
import workshopDataRoutes from './routes/workshop-data-routes';
import growthPlanRoutes from './routes/growth-plan-routes';
import { resetRouter } from './reset-routes';
import { adminRouter } from './routes/admin-routes';

// Create a router
export const router = express.Router();

// Attach user to request if authenticated
router.use(attachUser);

// Use route modules
router.use('/auth', authRoutes);
router.use('/invites', inviteRoutes);
router.use('/admin/invites', fixedInviteRoutes);
router.use('/admin', adminRouter);
router.use('/user', userRoutes);
router.use('/test-users/reset', resetRouter);
router.use('/workshop-data', workshopDataRoutes);
router.use('/growth-plan', growthPlanRoutes);

// Add visualization endpoints directly at the API root level
router.use('/', workshopDataRoutes);

// Assessment API routes
router.post('/assessments', async (req, res) => {
  try {
    const userId = req.session?.userId || (req.cookies?.userId ? parseInt(req.cookies.userId) : null);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const { assessmentType, results } = req.body;

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
    console.error('Error saving assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save assessment'
    });
  }
});

router.get('/assessments/:type', async (req, res) => {
  try {
    const userId = req.session?.userId || (req.cookies?.userId ? parseInt(req.cookies.userId) : null);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const { type } = req.params;
    
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
    console.error('Error fetching assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assessment'
    });
  }
});

// Final Reflection API routes
router.get('/final-reflection', async (req, res) => {
  try {
    const userId = req.session?.userId || (req.cookies?.userId ? parseInt(req.cookies.userId) : null);
    
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
    console.error('Error fetching final reflection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch final reflection'
    });
  }
});

router.post('/final-reflection', async (req, res) => {
  try {
    const userId = req.session?.userId || (req.cookies?.userId ? parseInt(req.cookies.userId) : null);
    
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
          insight,
          updatedAt: new Date()
        })
        .where(eq(schema.finalReflections.userId, userId));
    } else {
      // Create new reflection
      await db.insert(schema.finalReflections).values({
        userId,
        insight,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Final reflection saved successfully'
    });
  } catch (error) {
    console.error('Error saving final reflection:', error);
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