import { Router } from 'express';
import { db } from './db.js';
import { eq, and, sql } from 'drizzle-orm';
import * as schema from '../shared/schema.js';
import { requireTestUser } from './middleware/test-user-auth.js';
const resetRouter = Router();
resetRouter.post('/user/:userId', requireTestUser, async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }
        const currentUserId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
        if (!currentUserId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        if (currentUserId !== userId && currentUserId !== 1) {
            return res.status(403).json({
                success: false,
                message: 'You can only reset your own data'
            });
        }
        const deletedData = {
            starCard: false,
            flowAttributes: false,
            userProgress: false
        };
        console.log(`=== RESET: Starting data reset for user ${userId} ===`);
        try {
            const starCards = await db
                .select()
                .from(schema.userAssessments)
                .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'starCard')));
            if (starCards && starCards.length > 0) {
                console.log(`Found ${starCards.length} star card assessments for user ${userId}, deleting them`);
                await db
                    .delete(schema.userAssessments)
                    .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'starCard')));
                const verifyCards = await db
                    .select()
                    .from(schema.userAssessments)
                    .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'starCard')));
                if (!verifyCards || verifyCards.length === 0) {
                    deletedData.starCard = true;
                    console.log(`Successfully deleted star card assessments for user ${userId}`);
                }
                else {
                    console.error(`Failed to delete star card assessments for user ${userId}`);
                }
            }
            else {
                console.log(`No star card assessments found for user ${userId}`);
                deletedData.starCard = true;
            }
        }
        catch (error) {
            console.error(`Error deleting star card assessments for user ${userId}:`, error);
        }
        try {
            const flowAttrs = await db
                .select()
                .from(schema.userAssessments)
                .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'flowAttributes')));
            if (flowAttrs && flowAttrs.length > 0) {
                console.log(`Found ${flowAttrs.length} flow attribute assessments for user ${userId}, deleting them`);
                await db
                    .delete(schema.userAssessments)
                    .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'flowAttributes')));
                const verifyAttrs = await db
                    .select()
                    .from(schema.userAssessments)
                    .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'flowAttributes')));
                if (!verifyAttrs || verifyAttrs.length === 0) {
                    deletedData.flowAttributes = true;
                    console.log(`Successfully deleted flow attribute assessments for user ${userId}`);
                }
                else {
                    console.error(`Failed to delete flow attribute assessments for user ${userId}`);
                }
            }
            else {
                console.log(`No flow attribute assessments found for user ${userId}`);
                deletedData.flowAttributes = true;
            }
        }
        catch (error) {
            console.error(`Error deleting flow attribute assessments for user ${userId}:`, error);
        }
        try {
            const iaAssessments = await db
                .select()
                .from(schema.userAssessments)
                .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'iaCoreCapabilities')));
            if (iaAssessments && iaAssessments.length > 0) {
                console.log(`Found ${iaAssessments.length} IA assessments for user ${userId}, deleting them`);
                await db
                    .delete(schema.userAssessments)
                    .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'iaCoreCapabilities')));
                console.log(`Successfully deleted IA assessments for user ${userId}`);
            }
            else {
                console.log(`No IA assessments found for user ${userId}`);
            }
        }
        catch (error) {
            console.error(`Error deleting IA assessments for user ${userId}:`, error);
        }
        try {
            const initialProgress = {
                completedSteps: [],
                currentStepId: "1-1",
                appType: "ast",
                lastVisitedAt: new Date().toISOString(),
                unlockedSteps: ["1-1"],
                videoProgress: {},
                unlockedSections: ["1"],
                videoPositions: {}
            };
            await db.execute(sql `
        UPDATE users 
        SET navigation_progress = ${JSON.stringify(initialProgress)}, 
            "workshopStepData" = NULL,
            updated_at = NOW() 
        WHERE id = ${userId}
      `);
            deletedData.userProgress = true;
            console.log(`Reset navigation progress to initial state and cleared workshop step data for user ${userId}`);
            try {
                await db.execute(sql `DELETE FROM navigationProgress WHERE user_id = ${userId}`);
                console.log(`Deleted navigationProgress table entries for user ${userId}`);
            }
            catch (err) {
                console.log(`No navigationProgress entries found for user ${userId} or table does not exist`);
            }
            try {
                await db.execute(sql `DELETE FROM workshop_participation WHERE user_id = ${userId}`);
                console.log(`Deleted workshop participation for user ${userId}`);
            }
            catch (err) {
                console.log(`No workshop participation found for user ${userId} or table does not exist`);
            }
        }
        catch (error) {
            console.error(`Error resetting progress for user ${userId}:`, error);
        }
        console.log(`=== RESET: Completed data reset for user ${userId} ===`);
        return res.status(200).json({
            success: true,
            message: 'User data reset successfully',
            userId: userId,
            deletedData: deletedData
        });
    }
    catch (error) {
        console.error('Error in reset endpoint:', error);
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({
            success: false,
            message: 'Failed to reset user data',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
resetRouter.post('/user/:userId/starcard', requireTestUser, async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }
        const currentUserId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
        if (!currentUserId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        if (currentUserId !== userId && currentUserId !== 1) {
            return res.status(403).json({
                success: false,
                message: 'You can only reset your own data'
            });
        }
        const starCards = await db
            .select()
            .from(schema.userAssessments)
            .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'starCard')));
        let success = false;
        if (starCards && starCards.length > 0) {
            await db
                .delete(schema.userAssessments)
                .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'starCard')));
            const verifyCards = await db
                .select()
                .from(schema.userAssessments)
                .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'starCard')));
            success = !verifyCards || verifyCards.length === 0;
        }
        else {
            success = true;
        }
        return res.status(200).json({
            success,
            message: success ? 'Star card reset successfully' : 'Failed to reset star card'
        });
    }
    catch (error) {
        console.error('Error resetting star card:', error);
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({
            success: false,
            message: 'Failed to reset star card',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
resetRouter.post('/user/:userId/flow', requireTestUser, async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }
        const currentUserId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
        if (!currentUserId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        if (currentUserId !== userId && currentUserId !== 1) {
            return res.status(403).json({
                success: false,
                message: 'You can only reset your own data'
            });
        }
        const flowAttrs = await db
            .select()
            .from(schema.userAssessments)
            .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'flowAttributes')));
        let success = false;
        if (flowAttrs && flowAttrs.length > 0) {
            await db
                .delete(schema.userAssessments)
                .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'flowAttributes')));
            const verifyAttrs = await db
                .select()
                .from(schema.userAssessments)
                .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'flowAttributes')));
            success = !verifyAttrs || verifyAttrs.length === 0;
        }
        else {
            success = true;
        }
        return res.status(200).json({
            success,
            message: success ? 'Flow attributes reset successfully' : 'Failed to reset flow attributes'
        });
    }
    catch (error) {
        console.error('Error resetting flow attributes:', error);
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({
            success: false,
            message: 'Failed to reset flow attributes',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
export { resetRouter };
