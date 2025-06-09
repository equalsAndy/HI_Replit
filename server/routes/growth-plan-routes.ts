import { Router } from 'express';
import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { growthPlans, insertGrowthPlanSchema } from '@shared/schema';
import { z } from 'zod';

const router = Router();

// Get growth plan by quarter and year
router.get('/', async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const { quarter, year } = req.query;
    
    if (!quarter || !year) {
      return res.status(400).json({ success: false, error: 'Quarter and year are required' });
    }

    const [plan] = await db
      .select()
      .from(growthPlans)
      .where(and(
        eq(growthPlans.userId, userId),
        eq(growthPlans.quarter, quarter as string),
        eq(growthPlans.year, parseInt(year as string))
      ));

    if (!plan) {
      return res.json({ success: true, data: null });
    }

    // Parse JSON fields
    const parsedPlan = {
      ...plan,
      strengthsExamples: plan.strengthsExamples ? JSON.parse(plan.strengthsExamples) : {},
      flowPeakHours: plan.flowPeakHours ? JSON.parse(plan.flowPeakHours) : [],
      keyPriorities: plan.keyPriorities ? JSON.parse(plan.keyPriorities) : []
    };

    res.json({ success: true, data: parsedPlan });
  } catch (error) {
    console.error('Error fetching growth plan:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch growth plan' });
  }
});

// Create or update growth plan
router.post('/', async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    // Validate and parse the request body
    const validationSchema = insertGrowthPlanSchema.omit({ id: true, createdAt: true, updatedAt: true });
    const planData = validationSchema.parse({
      ...req.body,
      userId,
      strengthsExamples: JSON.stringify(req.body.strengthsExamples || {}),
      flowPeakHours: JSON.stringify(req.body.flowPeakHours || []),
      keyPriorities: JSON.stringify(req.body.keyPriorities || [])
    });

    // Check if plan already exists for this quarter/year
    const [existingPlan] = await db
      .select()
      .from(growthPlans)
      .where(and(
        eq(growthPlans.userId, userId),
        eq(growthPlans.quarter, planData.quarter),
        eq(growthPlans.year, planData.year)
      ));

    let result;
    if (existingPlan) {
      // Update existing plan
      [result] = await db
        .update(growthPlans)
        .set({
          ...planData,
          updatedAt: new Date()
        })
        .where(eq(growthPlans.id, existingPlan.id))
        .returning();
    } else {
      // Create new plan
      [result] = await db
        .insert(growthPlans)
        .values(planData)
        .returning();
    }

    // Parse JSON fields for response
    const parsedResult = {
      ...result,
      strengthsExamples: result.strengthsExamples ? JSON.parse(result.strengthsExamples) : {},
      flowPeakHours: result.flowPeakHours ? JSON.parse(result.flowPeakHours) : [],
      keyPriorities: result.keyPriorities ? JSON.parse(result.keyPriorities) : []
    };

    res.json({ success: true, data: parsedResult });
  } catch (error) {
    console.error('Error saving growth plan:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Invalid data format', details: error.errors });
    }
    res.status(500).json({ success: false, error: 'Failed to save growth plan' });
  }
});

// Get all growth plans for user (for history/comparison)
router.get('/all', async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const plans = await db
      .select()
      .from(growthPlans)
      .where(eq(growthPlans.userId, userId))
      .orderBy(growthPlans.year, growthPlans.quarter);

    // Parse JSON fields for all plans
    const parsedPlans = plans.map(plan => ({
      ...plan,
      strengthsExamples: plan.strengthsExamples ? JSON.parse(plan.strengthsExamples) : {},
      flowPeakHours: plan.flowPeakHours ? JSON.parse(plan.flowPeakHours) : [],
      keyPriorities: plan.keyPriorities ? JSON.parse(plan.keyPriorities) : []
    }));

    res.json({ success: true, data: parsedPlans });
  } catch (error) {
    console.error('Error fetching growth plans:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch growth plans' });
  }
});

export default router;