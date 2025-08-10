import { Router } from 'express';
import { eq, and } from 'drizzle-orm';
import { db } from '../db.js';
import { growthPlans } from '../../shared/schema.js';
const router = Router();
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
            .where(and(eq(growthPlans.userId, userId), eq(growthPlans.quarter, quarter), eq(growthPlans.year, parseInt(year))));
        if (!plan) {
            return res.json({ success: true, data: null });
        }
        const parsedPlan = {
            ...plan,
            strengthsExamples: plan.strengthsExamples ? JSON.parse(plan.strengthsExamples) : {},
            flowPeakHours: plan.flowPeakHours ? JSON.parse(plan.flowPeakHours) : [],
            keyPriorities: plan.keyPriorities ? JSON.parse(plan.keyPriorities) : []
        };
        res.json({ success: true, data: parsedPlan });
    }
    catch (error) {
        console.error('Error fetching growth plan:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch growth plan' });
    }
});
router.post('/', async (req, res) => {
    try {
        const userId = req.session?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Not authenticated' });
        }
        console.log('Growth plan POST - Request body:', req.body);
        if (!req.body.quarter || !req.body.year) {
            return res.status(400).json({ success: false, error: 'Quarter and year are required' });
        }
        const planData = {
            userId,
            quarter: req.body.quarter || 'Q2',
            year: req.body.year || 2025,
            starPowerReflection: req.body.starPowerReflection || null,
            ladderCurrentLevel: req.body.ladderCurrentLevel || null,
            ladderTargetLevel: req.body.ladderTargetLevel || null,
            ladderReflections: req.body.ladderReflections || null,
            strengthsExamples: JSON.stringify(req.body.strengthsExamples || {}),
            flowPeakHours: JSON.stringify(req.body.flowPeakHours || []),
            flowCatalysts: req.body.flowCatalysts || null,
            visionStart: req.body.visionStart || null,
            visionNow: req.body.visionNow || null,
            visionNext: req.body.visionNext || null,
            progressWorking: req.body.progressWorking || null,
            progressNeedHelp: req.body.progressNeedHelp || null,
            teamFlowStatus: req.body.teamFlowStatus || null,
            teamEnergySource: req.body.teamEnergySource || null,
            teamNextCheckin: req.body.teamNextCheckin || null,
            keyPriorities: JSON.stringify(req.body.keyPriorities || []),
            successLooksLike: req.body.successLooksLike || null,
            keyDates: req.body.keyDates || null
        };
        const [existingPlan] = await db
            .select()
            .from(growthPlans)
            .where(and(eq(growthPlans.userId, userId), eq(growthPlans.quarter, planData.quarter), eq(growthPlans.year, planData.year)));
        let result;
        if (existingPlan) {
            [result] = await db
                .update(growthPlans)
                .set(planData)
                .where(eq(growthPlans.id, existingPlan.id))
                .returning();
        }
        else {
            [result] = await db
                .insert(growthPlans)
                .values(planData)
                .returning();
        }
        const parsedResult = {
            ...result,
            strengthsExamples: result.strengthsExamples ? JSON.parse(result.strengthsExamples) : {},
            flowPeakHours: result.flowPeakHours ? JSON.parse(result.flowPeakHours) : [],
            keyPriorities: result.keyPriorities ? JSON.parse(result.keyPriorities) : []
        };
        res.json({ success: true, data: parsedResult });
    }
    catch (error) {
        console.error('Error saving growth plan:', error);
        res.status(500).json({ success: false, error: 'Failed to save growth plan' });
    }
});
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
        const parsedPlans = plans.map(plan => ({
            ...plan,
            strengthsExamples: plan.strengthsExamples ? JSON.parse(plan.strengthsExamples) : {},
            flowPeakHours: plan.flowPeakHours ? JSON.parse(plan.flowPeakHours) : [],
            keyPriorities: plan.keyPriorities ? JSON.parse(plan.keyPriorities) : []
        }));
        res.json({ success: true, data: parsedPlans });
    }
    catch (error) {
        console.error('Error fetching growth plans:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch growth plans' });
    }
});
export default router;
