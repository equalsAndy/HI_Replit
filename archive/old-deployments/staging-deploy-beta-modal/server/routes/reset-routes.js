import { Router } from 'express';
import { ResetService } from '../services/reset-service';
import { workshopStepData, users } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
const resetRouter = Router();
resetRouter.post('/user/:userId', async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }
        let currentUserId = req.session?.userId;
        if (!currentUserId && req.cookies?.userId) {
            currentUserId = parseInt(req.cookies.userId);
        }
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
        try {
            const { db } = await import('../db');
            const { sql } = await import('drizzle-orm');
            await db.execute(sql `DELETE FROM user_assessments WHERE user_id = ${userId}`);
            console.log(`Deleted from user_assessments for user ${userId}`);
            try {
                await db.execute(sql `DELETE FROM star_cards WHERE user_id = ${userId}`);
                console.log(`Deleted from star_cards for user ${userId}`);
            }
            catch (err) {
                console.log(`No star_cards data or table for user ${userId}`);
            }
            try {
                await db.execute(sql `DELETE FROM flow_attributes WHERE user_id = ${userId}`);
                console.log(`Deleted from flow_attributes for user ${userId}`);
            }
            catch (err) {
                console.log(`No flow_attributes data or table for user ${userId}`);
            }
            try {
                await db.execute(sql `DELETE FROM workshop_participation WHERE user_id = ${userId}`);
                console.log(`Deleted from workshop_participation for user ${userId}`);
            }
            catch (err) {
                console.log(`No workshop participation to reset for user ${userId}`);
            }
            console.log(`=== STARTING HYBRID RESET for user ${userId} ===`);
            try {
                console.log(`=== IMPORTS SUCCESSFUL ===`);
                const user = await db.select({ isTestUser: users.isTestUser })
                    .from(users)
                    .where(eq(users.id, userId))
                    .limit(1);
                if (user.length === 0) {
                    console.error(`User ${userId} not found for workshop data reset`);
                }
                else {
                    const isTestUser = user[0].isTestUser;
                    console.log(`=== RESET STRATEGY: User ${userId} isTestUser: ${isTestUser} ===`);
                    if (isTestUser) {
                        console.log(`=== ATTEMPTING HARD DELETE for test user ${userId} ===`);
                        const result = await db.delete(workshopStepData)
                            .where(eq(workshopStepData.userId, userId));
                        console.log(`=== HARD DELETE: Permanently deleted workshop data for test user ${userId} ===`);
                        console.log(`Hard deletion result:`, result);
                    }
                    else {
                        console.log(`=== ATTEMPTING SOFT DELETE for production user ${userId} ===`);
                        const result = await db.update(workshopStepData)
                            .set({
                            deletedAt: new Date(),
                            updatedAt: new Date()
                        })
                            .where(eq(workshopStepData.userId, userId));
                        console.log(`=== SOFT DELETE: Marked workshop data as deleted for production user ${userId} ===`);
                        console.log(`Soft deletion result:`, result);
                    }
                }
            }
            catch (err) {
                console.error(`ERROR resetting workshop data for user ${userId}:`, err);
            }
            try {
                await db.execute(sql `UPDATE users SET navigation_progress = NULL, updated_at = NOW() WHERE id = ${userId}`);
                console.log(`Cleared navigation progress for user ${userId}`);
            }
            catch (err) {
                console.log(`Error clearing navigation progress for user ${userId}:`, err);
            }
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            console.log(`=== RESET: Successfully deleted all data for user ${userId} ===`);
            return res.status(200).json({
                success: true,
                message: 'User data reset successfully',
                userId: userId,
                deletedData: {
                    starCard: true,
                    flowAttributes: true,
                    userProgress: true
                }
            });
        }
        catch (error) {
            console.error(`Error in direct SQL reset for user ${userId}:`, error);
            const resetResult = await ResetService.resetAllUserData(userId);
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            if (resetResult.success) {
                return res.status(200).json(resetResult);
            }
            else {
                return res.status(500).json(resetResult);
            }
        }
    }
    catch (error) {
        console.error('Error in reset endpoint:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to reset user data',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
resetRouter.post('/user/:userId/starcard', async (req, res) => {
    try {
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
        const success = await ResetService.resetStarCard(userId);
        return res.status(200).json({
            success,
            message: success ? 'Star card reset successfully' : 'Failed to reset star card'
        });
    }
    catch (error) {
        console.error('Error resetting star card:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to reset star card',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
resetRouter.post('/user/:userId/flow', async (req, res) => {
    try {
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
        const success = await ResetService.resetFlowAttributes(userId);
        return res.status(200).json({
            success,
            message: success ? 'Flow attributes reset successfully' : 'Failed to reset flow attributes'
        });
    }
    catch (error) {
        console.error('Error resetting flow attributes:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to reset flow attributes',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
resetRouter.post('/all-users', async (req, res) => {
    try {
        const currentUserId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
        if (!currentUserId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        if (currentUserId !== 1) {
            return res.status(403).json({
                success: false,
                message: 'Only admin users can reset all user data'
            });
        }
        return res.status(501).json({
            success: false,
            message: 'Reset all users functionality not yet implemented'
        });
    }
    catch (error) {
        console.error('Error resetting all users:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to reset all users',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
export { resetRouter };
