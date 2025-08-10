import express from 'express';
import multer from 'multer';
import { userManagementService } from '../services/user-management-service.js';
import { convertUserToPhotoReference, sanitizeUserForNetwork } from '../utils/user-photo-utils.js';
import { NavigationSyncService } from '../services/navigation-sync-service.js';
import { requireAuth } from '../middleware/auth.js';
import { isAdmin } from '../middleware/roles.js';
import { db } from '../db.js';
import * as schema from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    },
});
router.get('/me', async (req, res) => {
    try {
        console.log('Me request - Session data:', req.session);
        console.log('Me request - Cookies:', req.cookies);
        let userId = req.session?.userId;
        console.log('Session userId:', req.session?.userId);
        console.log('Cookie userId:', req.cookies?.userId);
        if (!userId && req.cookies?.userId) {
            userId = parseInt(req.cookies.userId);
            console.log('Using cookie fallback, userId:', userId);
        }
        else if (userId) {
            console.log('Using session userId:', userId);
        }
        console.log(`Me request - Resolved user ID: ${userId}`);
        if (!userId) {
            console.log('Me request - No user ID found, authentication failed');
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        console.log(`Fetching user info for user ID: ${userId}`);
        const result = await userManagementService.getUserById(userId);
        if (!result.success) {
            console.log(`User info not found for ID: ${userId}`);
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        console.log(`Raw user data from service:`, result.user);
        const userWithPhotoRef = convertUserToPhotoReference(result.user);
        const userInfo = {
            id: userWithPhotoRef.id,
            name: userWithPhotoRef.name,
            email: userWithPhotoRef.email,
            role: userWithPhotoRef.role,
            username: userWithPhotoRef.username,
            organization: userWithPhotoRef.organization,
            jobTitle: userWithPhotoRef.jobTitle,
            profilePictureUrl: userWithPhotoRef.profilePictureUrl,
            hasProfilePicture: userWithPhotoRef.hasProfilePicture
        };
        console.log(`Final user info being returned:`, sanitizeUserForNetwork(userInfo));
        res.json(userInfo);
    }
    catch (error) {
        console.error('Error getting user info:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load user info. Please try again later.'
        });
    }
});
router.get('/profile', async (req, res) => {
    try {
        console.log('Profile request - Session data:', req.session);
        console.log('Profile request - Cookies:', req.cookies);
        let userId = req.session?.userId;
        console.log('Session userId:', req.session?.userId);
        console.log('Cookie userId:', req.cookies?.userId);
        if (!userId && req.cookies?.userId) {
            userId = parseInt(req.cookies.userId);
            console.log('Using cookie fallback, userId:', userId);
        }
        else if (userId) {
            console.log('Using session userId:', userId);
        }
        console.log(`Profile request - Resolved user ID: ${userId}`);
        if (!userId) {
            console.log('Profile request - No user ID found, authentication failed');
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        console.log(`Fetching user profile for user ID: ${userId}`);
        const result = await userManagementService.getUserById(userId);
        if (!result.success) {
            console.log(`User profile not found for ID: ${userId}`);
            return res.status(404).json({
                success: false,
                error: 'User profile not found'
            });
        }
        console.log(`Raw user data from service:`, sanitizeUserForNetwork(result.user));
        const userWithPhotoRef = convertUserToPhotoReference(result.user);
        const userProfile = {
            ...userWithPhotoRef,
            progress: 0,
            title: userWithPhotoRef.jobTitle || '',
        };
        console.log(`Final user profile being returned:`, sanitizeUserForNetwork(userProfile));
        res.json({
            success: true,
            user: userProfile
        });
    }
    catch (error) {
        console.error('Error getting user profile:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load user profile. Please try again later.'
        });
    }
});
router.put('/profile', requireAuth, async (req, res) => {
    try {
        if (!req.session?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        const { name, email, organization, jobTitle, profilePicture } = req.body;
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (email !== undefined)
            updateData.email = email;
        if (organization !== undefined)
            updateData.organization = organization;
        if (jobTitle !== undefined)
            updateData.jobTitle = jobTitle;
        if (profilePicture !== undefined)
            updateData.profilePicture = profilePicture;
        const result = await userManagementService.updateUser(req.session.userId, updateData);
        if (!result.success) {
            return res.status(404).json({
                success: false,
                error: 'Failed to update user profile'
            });
        }
        res.json({
            success: true,
            user: result.user
        });
    }
    catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update user profile. Please try again later.'
        });
    }
});
router.get('/assessments', requireAuth, async (req, res) => {
    try {
        const sessionUserId = req.session.userId;
        if (!sessionUserId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        const cookieUserId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
        const { eq } = await import('drizzle-orm');
        const allAssessments = await db
            .select()
            .from(schema.userAssessments);
        const formattedAssessments = allAssessments.map(assessment => {
            try {
                let parsedResults = {};
                try {
                    parsedResults = JSON.parse(assessment.results);
                }
                catch (e) {
                    parsedResults = { error: "Failed to parse results JSON" };
                }
                return {
                    id: assessment.id,
                    userId: assessment.userId,
                    type: assessment.assessmentType,
                    created: assessment.createdAt,
                    formattedResults: parsedResults
                };
            }
            catch (e) {
                return {
                    id: assessment.id,
                    userId: assessment.userId,
                    error: "Failed to process assessment record"
                };
            }
        });
        const assessmentsByUser = {};
        formattedAssessments.forEach(assessment => {
            const userId = assessment.userId;
            if (!assessmentsByUser[userId]) {
                assessmentsByUser[userId] = [];
            }
            assessmentsByUser[userId].push(assessment);
        });
        const currentUserAssessments = formattedAssessments
            .filter(a => a.userId === sessionUserId)
            .reduce((result, assessment) => {
            const type = assessment.type;
            if (type) {
                result[type] = assessment;
            }
            return result;
        }, {});
        const starCardData = currentUserAssessments.starCard?.formattedResults || null;
        res.json({
            success: true,
            userInfo: {
                sessionUserId,
                cookieUserId
            },
            currentUser: {
                assessments: currentUserAssessments,
                starCard: starCardData
            },
            allUsers: { [sessionUserId]: assessmentsByUser[sessionUserId] || [] },
            raw: {
                assessmentCount: formattedAssessments.filter(a => a.userId === sessionUserId).length,
                allAssessments: formattedAssessments.filter(a => a.userId === sessionUserId)
            }
        });
    }
    catch (error) {
        console.error('Error getting user assessments:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load user assessments. Please try again later.'
        });
    }
});
router.post('/assessments', requireAuth, async (req, res) => {
    try {
        if (!req.session?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        const { assessmentType, results } = req.body;
        if (!assessmentType || !results) {
            return res.status(400).json({
                success: false,
                error: 'Assessment type and results are required'
            });
        }
        const newAssessment = await db.insert(schema.userAssessments).values({
            userId: req.session.userId,
            assessmentType,
            results: JSON.stringify(results)
        }).returning();
        console.log(`Saved ${assessmentType} assessment for user ${req.session.userId}:`, results);
        res.json({
            success: true,
            assessment: newAssessment[0]
        });
    }
    catch (error) {
        console.error('Error saving user assessment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save assessment. Please try again later.'
        });
    }
});
router.get('/navigation-progress', requireAuth, async (req, res) => {
    try {
        if (!req.session?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        const result = await userManagementService.getUserById(req.session.userId);
        if (!result.success) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        res.json({
            success: true,
            progress: result.user?.navigationProgress || null
        });
    }
    catch (error) {
        console.error('Error getting navigation progress:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load navigation progress. Please try again later.'
        });
    }
});
router.post('/navigation-progress', requireAuth, async (req, res) => {
    try {
        if (!req.session?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        const { navigationProgress } = req.body;
        if (!navigationProgress || typeof navigationProgress !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Navigation progress must be a valid JSON string'
            });
        }
        let incomingData;
        try {
            incomingData = JSON.parse(navigationProgress);
        }
        catch (parseError) {
            return res.status(400).json({
                success: false,
                error: 'Invalid JSON in navigation progress'
            });
        }
        const currentUserResult = await userManagementService.getUserById(req.session.userId);
        if (!currentUserResult.success) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        let currentProgress = {
            completedSteps: [],
            currentStepId: '1-1',
            appType: 'ast',
            lastVisitedAt: new Date().toISOString(),
            unlockedSteps: ['1-1'],
            videoProgress: {}
        };
        if (currentUserResult.user?.navigationProgress) {
            try {
                let progressData = currentUserResult.user.navigationProgress;
                let parsed;
                for (let i = 0; i < 5; i++) {
                    try {
                        parsed = JSON.parse(progressData);
                        if (parsed.navigationProgress && typeof parsed.navigationProgress === 'string') {
                            progressData = parsed.navigationProgress;
                        }
                        else if (parsed.completedSteps || parsed.currentStepId) {
                            currentProgress = { ...currentProgress, ...parsed };
                            break;
                        }
                        else {
                            currentProgress = { ...currentProgress, ...parsed };
                            break;
                        }
                    }
                    catch (innerError) {
                        console.log('Parse failed at level', i);
                        break;
                    }
                }
            }
            catch (e) {
                console.log('Using default progress due to parse error');
            }
        }
        const mergedProgress = {
            ...currentProgress,
            ...incomingData,
            videoProgress: {
                ...currentProgress.videoProgress,
                ...incomingData.videoProgress
            }
        };
        Object.keys(incomingData.videoProgress || {}).forEach(stepId => {
            const currentValue = currentProgress.videoProgress[stepId] || 0;
            const newValue = incomingData.videoProgress[stepId] || 0;
            mergedProgress.videoProgress[stepId] = Math.max(currentValue, newValue);
        });
        console.log(`🔄 Atomic video progress merge for user ${req.session.userId}:`);
        console.log(`   Current:`, currentProgress.videoProgress);
        console.log(`   Incoming:`, incomingData.videoProgress);
        console.log(`   Merged:`, mergedProgress.videoProgress);
        const result = await userManagementService.updateUser(req.session.userId, {
            navigationProgress: JSON.stringify(mergedProgress)
        });
        if (!result.success) {
            console.error(`Failed to update navigation progress for user ${req.session.userId}:`, result.error);
            return res.status(404).json({
                success: false,
                error: 'Failed to update navigation progress'
            });
        }
        console.log(`✅ Atomic progress saved for user ${req.session.userId}`);
        res.json({
            success: true,
            message: 'Navigation progress updated atomically',
            progress: mergedProgress,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error(`Error updating navigation progress for user ${req.session?.userId}:`, error);
        res.status(500).json({
            success: false,
            error: 'Failed to update navigation progress. Please try again later.'
        });
    }
});
router.put('/navigation-progress', requireAuth, async (req, res) => {
    try {
        if (!req.session?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        const { navigationProgress } = req.body;
        if (!navigationProgress || typeof navigationProgress !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Navigation progress must be a valid JSON string'
            });
        }
        let progressData;
        try {
            progressData = JSON.parse(navigationProgress);
        }
        catch (parseError) {
            console.error('Invalid navigation progress JSON:', parseError);
            return res.status(400).json({
                success: false,
                error: 'Navigation progress must be valid JSON'
            });
        }
        console.log(`Updating navigation progress for user ${req.session.userId}:`, {
            completedSteps: progressData.completedSteps?.length || 0,
            currentStep: progressData.currentStepId,
            appType: progressData.appType,
            lastVisited: progressData.lastVisitedAt ? new Date(progressData.lastVisitedAt).toISOString() : 'unknown'
        });
        const result = await userManagementService.updateUser(req.session.userId, {
            navigationProgress
        });
        if (!result.success) {
            console.error(`Failed to update navigation progress for user ${req.session.userId}:`, result.error);
            return res.status(404).json({
                success: false,
                error: 'Failed to update navigation progress'
            });
        }
        console.log(`Successfully updated navigation progress for user ${req.session.userId}`);
        res.json({
            success: true,
            message: 'Navigation progress updated successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error(`Error updating navigation progress for user ${req.session?.userId}:`, error);
        res.status(500).json({
            success: false,
            error: 'Failed to update navigation progress. Please try again later.'
        });
    }
});
router.put('/progress', requireAuth, async (req, res) => {
    try {
        if (!req.session?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        const { progress } = req.body;
        if (typeof progress !== 'number' || progress < 0 || progress > 100) {
            return res.status(400).json({
                success: false,
                error: 'Progress must be a number between 0 and 100'
            });
        }
        res.json({
            success: true,
            message: 'Progress updated successfully',
            progress
        });
    }
    catch (error) {
        console.error('Error updating user progress:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update progress. Please try again later.'
        });
    }
});
router.post('/upload-photo', upload.single('photo'), async (req, res) => {
    try {
        let userId = req.session?.userId;
        if (!userId && req.cookies?.userId) {
            userId = parseInt(req.cookies.userId);
        }
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }
        const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        console.log(`Uploading photo for user ${userId}, size: ${req.file.size} bytes`);
        const result = await userManagementService.updateUser(userId, {
            profilePicture: base64Image
        });
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: 'Failed to save profile picture'
            });
        }
        console.log(`Photo uploaded successfully for user ${userId}`);
        res.json({
            success: true,
            profilePicture: base64Image
        });
    }
    catch (error) {
        console.error('Error uploading photo:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.post('/sync-navigation/:userId', requireAuth, isAdmin, async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID'
            });
        }
        console.log(`[API] Syncing navigation progress for user ${userId}`);
        const success = await NavigationSyncService.syncUserProgress(userId);
        if (success) {
            res.json({
                success: true,
                message: `Navigation progress synced successfully for user ${userId}`
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: 'Failed to sync navigation progress'
            });
        }
    }
    catch (error) {
        console.error('Error syncing navigation progress:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.post('/sync-navigation-all', requireAuth, isAdmin, async (req, res) => {
    try {
        console.log('[API] Starting bulk navigation progress sync');
        const syncedCount = await NavigationSyncService.syncAllUsersProgress();
        res.json({
            success: true,
            message: `Navigation progress synced for ${syncedCount} users`,
            syncedCount
        });
    }
    catch (error) {
        console.error('Error during bulk navigation sync:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.delete('/data', requireAuth, async (req, res) => {
    try {
        const sessionUserId = req.session.userId;
        if (!sessionUserId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        const result = await userManagementService.getUserById(sessionUserId);
        if (!result.success || !result.user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        if (!result.user.isTestUser) {
            return res.status(403).json({
                success: false,
                error: 'Data deletion is only available for test users'
            });
        }
        console.log(`Test user ${sessionUserId} (${result.user.name}) requesting data deletion`);
        const deleteResult = await userManagementService.deleteUserData(sessionUserId);
        if (!deleteResult.success) {
            console.error(`Data deletion failed for user ${sessionUserId}:`, deleteResult.error);
            return res.status(500).json({
                success: false,
                error: deleteResult.error || 'Failed to delete user data'
            });
        }
        console.log(`Data deletion successful for user ${sessionUserId}:`, deleteResult.summary);
        res.json({
            success: true,
            message: 'User data deleted successfully',
            summary: deleteResult.summary
        });
    }
    catch (error) {
        console.error('Error deleting user data:', error);
        res.status(500).json({
            success: false,
            error: 'Server error while deleting user data'
        });
    }
});
router.get('/export-data', requireAuth, async (req, res) => {
    try {
        const sessionUserId = req.session?.userId;
        if (!sessionUserId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        const result = await userManagementService.getUserById(sessionUserId);
        if (!result.success || !result.user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        if (!result.user.isTestUser) {
            return res.status(403).json({
                success: false,
                error: 'Data export is only available for test users'
            });
        }
        console.log(`Test user ${sessionUserId} (${result.user.name}) requesting data export`);
        const userData = {
            user: {
                id: result.user.id,
                username: result.user.username,
                name: result.user.name,
                email: result.user.email,
                role: result.user.role,
                organization: result.user.organization,
                jobTitle: result.user.jobTitle,
                isTestUser: result.user.isTestUser,
                navigationProgress: result.user.navigationProgress,
                createdAt: result.user.createdAt,
                updatedAt: result.user.updatedAt
            },
            assessments: [],
            navigationProgress: [],
            workshopParticipation: [],
            growthPlans: [],
            finalReflections: [],
            discernmentProgress: []
        };
        try {
            const assessments = await db.select()
                .from(schema.userAssessments)
                .where(eq(schema.userAssessments.userId, sessionUserId));
            userData.assessments = assessments;
            const navProgress = await db.select()
                .from(schema.navigationProgress)
                .where(eq(schema.navigationProgress.userId, sessionUserId));
            userData.navigationProgress = navProgress;
            const workshopParticipation = await db.select()
                .from(schema.workshopParticipation)
                .where(eq(schema.workshopParticipation.userId, sessionUserId));
            userData.workshopParticipation = workshopParticipation;
            const growthPlans = await db.select()
                .from(schema.growthPlans)
                .where(eq(schema.growthPlans.userId, sessionUserId));
            userData.growthPlans = growthPlans;
            const finalReflections = await db.select()
                .from(schema.finalReflections)
                .where(eq(schema.finalReflections.userId, sessionUserId));
            userData.finalReflections = finalReflections;
            const discernmentProgress = await db.select()
                .from(schema.userDiscernmentProgress)
                .where(eq(schema.userDiscernmentProgress.userId, sessionUserId));
            userData.discernmentProgress = discernmentProgress;
        }
        catch (dbError) {
            console.error('Error fetching user data for export:', dbError);
        }
        res.json({
            success: true,
            userData: userData,
            exportDate: new Date().toISOString(),
            message: 'Data exported successfully'
        });
    }
    catch (error) {
        console.error('Error exporting user data:', error);
        res.status(500).json({
            success: false,
            error: 'Server error while exporting user data'
        });
    }
});
router.post('/reset-data', requireAuth, async (req, res) => {
    try {
        const sessionUserId = req.session?.userId;
        if (!sessionUserId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        const result = await userManagementService.getUserById(sessionUserId);
        if (!result.success || !result.user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        if (!result.user.isTestUser) {
            return res.status(403).json({
                success: false,
                error: 'Data reset is only available for test users'
            });
        }
        console.log(`Test user ${sessionUserId} (${result.user.name}) requesting data reset`);
        const deleteResult = await userManagementService.deleteUserData(sessionUserId);
        if (!deleteResult.success) {
            console.error(`Data reset failed for user ${sessionUserId}:`, deleteResult.error);
            return res.status(500).json({
                success: false,
                error: deleteResult.error || 'Failed to reset user data'
            });
        }
        console.log(`Data reset successful for user ${sessionUserId}:`, deleteResult.summary);
        res.json({
            success: true,
            message: 'User data reset successfully',
            summary: deleteResult.summary
        });
    }
    catch (error) {
        console.error('Error resetting user data:', error);
        res.status(500).json({
            success: false,
            error: 'Server error while resetting user data'
        });
    }
});
router.post('/content-access', requireAuth, async (req, res) => {
    try {
        if (!req.session?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        const { contentAccess } = req.body;
        if (!contentAccess || !['student', 'professional'].includes(contentAccess)) {
            return res.status(400).json({
                success: false,
                error: 'Content access must be either "student" or "professional"'
            });
        }
        console.log(`Updating content access for user ${req.session.userId} to: ${contentAccess}`);
        const result = await userManagementService.updateUser(req.session.userId, {
            contentAccess: contentAccess
        });
        if (!result.success) {
            console.error(`Failed to update content access for user ${req.session.userId}:`, result.error);
            return res.status(500).json({
                success: false,
                error: 'Failed to update interface preference'
            });
        }
        console.log(`✅ Content access updated for user ${req.session.userId} to: ${contentAccess}`);
        res.json({
            success: true,
            message: `Interface preference updated to ${contentAccess}`,
            contentAccess: contentAccess,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error(`Error updating content access for user ${req.session?.userId}:`, error);
        res.status(500).json({
            success: false,
            error: 'Failed to update interface preference. Please try again later.'
        });
    }
});
export default router;
