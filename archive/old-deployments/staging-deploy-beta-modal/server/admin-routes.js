import { Router } from 'express';
import { storage } from './storage.js';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { db } from './db.js';
import { users, userAssessments, navigationProgress } from '../shared/schema.js';
import { eq, and } from 'drizzle-orm';
import * as schema from '../shared/schema.js';
const adminRouter = Router();
const logAdminAction = (adminId, action, targetUserId, details = '', req) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        adminId,
        action,
        targetUserId,
        details,
        ipAddress: req?.ip || req?.connection?.remoteAddress || 'unknown'
    };
    console.log('ADMIN_ACTION:', JSON.stringify(logEntry));
};
const resetUserWorkshopData = async (userId) => {
    try {
        const deletedAssessments = await db.delete(userAssessments)
            .where(eq(userAssessments.userId, userId));
        const deletedNavProgress = await db.delete(navigationProgress)
            .where(eq(navigationProgress.userId, userId));
        await db.update(users)
            .set({
            navigationProgress: null
        })
            .where(eq(users.id, userId));
        console.log(`Successfully reset all workshop data for user ${userId} - Assessments cleared: ${Array.isArray(deletedAssessments) ? deletedAssessments.length : 0}, Navigation cleared: ${Array.isArray(deletedNavProgress) ? deletedNavProgress.length : 0}`);
        return { success: true, message: 'Workshop data reset successfully' };
    }
    catch (error) {
        console.error(`Error resetting workshop data for user ${userId}:`, error);
        throw new Error('Failed to reset user data');
    }
};
const requireAdmin = async (req, res, next) => {
    try {
        const userId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
        if (!userId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        const user = await storage.getUser(userId);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        const isAdmin = userId === 1;
        if (!isAdmin) {
            return res.status(403).json({ message: 'Access denied: Admin role required' });
        }
        next();
    }
    catch (error) {
        console.error('Error in admin authentication:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
adminRouter.use(requireAdmin);
adminRouter.get('/users', async (req, res) => {
    try {
        const allUsers = await storage.getAllUsers();
        const usersWithProgress = await Promise.all(allUsers.map(async (user) => {
            let astProgress = null;
            try {
                const astProgressRecords = await db
                    .select()
                    .from(navigationProgress)
                    .where(and(eq(navigationProgress.userId, user.id), eq(navigationProgress.appType, 'ast')));
                if (astProgressRecords.length > 0) {
                    const astRecord = astProgressRecords[0];
                    astProgress = {
                        completedSteps: JSON.parse(astRecord.completedSteps),
                        currentStepId: astRecord.currentStepId,
                        appType: astRecord.appType,
                        lastVisitedAt: astRecord.lastVisitedAt,
                        unlockedSteps: astRecord.unlockedSteps ? JSON.parse(astRecord.unlockedSteps) : [],
                        videoProgress: astRecord.videoProgress ? JSON.parse(astRecord.videoProgress) : {}
                    };
                }
            }
            catch (e) {
                console.error(`Failed to fetch AST navigation progress for user ${user.id}:`, e);
            }
            let iaProgress = null;
            try {
                const iaProgressRecords = await db
                    .select()
                    .from(navigationProgress)
                    .where(and(eq(navigationProgress.userId, user.id), eq(navigationProgress.appType, 'ia')));
                if (iaProgressRecords.length > 0) {
                    const iaRecord = iaProgressRecords[0];
                    iaProgress = {
                        completedSteps: JSON.parse(iaRecord.completedSteps),
                        currentStepId: iaRecord.currentStepId,
                        appType: iaRecord.appType,
                        lastVisitedAt: iaRecord.lastVisitedAt,
                        unlockedSteps: iaRecord.unlockedSteps ? JSON.parse(iaRecord.unlockedSteps) : [],
                        videoProgress: iaRecord.videoProgress ? JSON.parse(iaRecord.videoProgress) : {}
                    };
                }
            }
            catch (e) {
                console.error(`Failed to fetch IA navigation progress for user ${user.id}:`, e);
            }
            let role = 'participant';
            if (user.id === 1) {
                role = 'admin';
            }
            else if (user.id === 2 || user.id === 3) {
                role = 'facilitator';
            }
            return {
                ...user,
                role: role,
                astProgress,
                iaProgress
            };
        }));
        res.status(200).json({
            message: 'Users retrieved successfully',
            users: usersWithProgress
        });
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
adminRouter.get('/facilitators', async (req, res) => {
    try {
        const users = await storage.getAllUsers();
        const facilitators = users.filter(user => user.id === 2 || user.id === 3);
        const facilitatorsWithRoles = facilitators.map(user => ({
            ...user,
            role: 'facilitator'
        }));
        res.status(200).json(facilitatorsWithRoles);
    }
    catch (error) {
        console.error('Error fetching facilitators:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
adminRouter.post('/users', async (req, res) => {
    try {
        const UserSchema = z.object({
            name: z.string().min(2, 'Name must be at least 2 characters'),
            username: z.string().min(3, 'Username must be at least 3 characters').optional(),
            firstName: z.string().optional(),
            lastName: z.string().optional(),
            email: z.string().email('Invalid email address').optional(),
            title: z.string().optional(),
            organization: z.string().optional(),
            userType: z.string().default('participant'),
            password: z.string().optional(),
            generatePassword: z.boolean().optional(),
        });
        const parsedData = UserSchema.parse(req.body);
        if (!parsedData.username) {
            const nameParts = parsedData.name.toLowerCase().split(' ');
            const baseUsername = nameParts.join('.');
            parsedData.username = `${baseUsername}-${nanoid(4)}`;
        }
        const generatePassword = parsedData.generatePassword !== false;
        const password = parsedData.password || nanoid(10);
        const newUser = await storage.createUser({
            name: parsedData.name,
            username: parsedData.username,
            firstName: parsedData.firstName,
            lastName: parsedData.lastName,
            email: parsedData.email,
            title: parsedData.title,
            organization: parsedData.organization,
            password: password,
        });
        res.status(201).json({
            ...newUser,
            role: parsedData.userType === 'admin' ? 'admin' :
                parsedData.userType === 'facilitator' ? 'facilitator' :
                    'participant',
            temporaryPassword: generatePassword ? password : undefined,
        });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Invalid input', errors: error.errors });
        }
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
adminRouter.put('/users/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        const existingUser = await storage.getUser(userId);
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        const UserUpdateSchema = z.object({
            name: z.string().min(2, 'Name must be at least 2 characters').optional(),
            username: z.string().min(3, 'Username must be at least 3 characters').optional(),
            firstName: z.string().optional(),
            lastName: z.string().optional(),
            email: z.string().email('Invalid email address').optional(),
            title: z.string().optional(),
            organization: z.string().optional(),
            userType: z.string().optional(),
            password: z.string().optional(),
        });
        const parsedData = UserUpdateSchema.parse(req.body);
        const updateData = {};
        if (parsedData.name)
            updateData.name = parsedData.name;
        if (parsedData.username)
            updateData.username = parsedData.username;
        if (parsedData.firstName)
            updateData.firstName = parsedData.firstName;
        if (parsedData.lastName)
            updateData.lastName = parsedData.lastName;
        if (parsedData.email)
            updateData.email = parsedData.email;
        if (parsedData.title)
            updateData.title = parsedData.title;
        if (parsedData.organization)
            updateData.organization = parsedData.organization;
        if (parsedData.password)
            updateData.password = parsedData.password;
        const updatedUser = await storage.updateUser(userId, updateData);
        let role = 'participant';
        if (userId === 1) {
            role = 'admin';
        }
        else if (userId === 2 || userId === 3) {
            role = 'facilitator';
        }
        res.status(200).json({
            ...updatedUser,
            role: role
        });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Invalid input', errors: error.errors });
        }
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
adminRouter.get('/cohorts', async (req, res) => {
    try {
        res.status(200).json([
            {
                id: 1,
                name: 'AllStarTeams Workshop - Spring 2025',
                description: 'Spring 2025 workshop for leadership teams',
                startDate: '2025-05-01',
                endDate: '2025-06-30',
                status: 'active',
                facilitatorId: 2,
                facilitatorName: 'Test User 2',
                memberCount: 12
            },
            {
                id: 2,
                name: 'Imaginal Agility Workshop - Summer 2025',
                description: 'Summer 2025 workshop focusing on agility training',
                startDate: '2025-07-15',
                endDate: '2025-08-30',
                status: 'upcoming',
                facilitatorId: 2,
                facilitatorName: 'Test User 2',
                memberCount: 8
            }
        ]);
    }
    catch (error) {
        console.error('Error fetching cohorts:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
adminRouter.get('/videos', async (req, res) => {
    try {
        const videos = await storage.getAllVideos();
        res.status(200).json(videos);
    }
    catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
adminRouter.get('/videos/workshop/:workshopType', async (req, res) => {
    try {
        const { workshopType } = req.params;
        const videos = await storage.getVideosByWorkshop(workshopType);
        res.status(200).json(videos);
    }
    catch (error) {
        console.error('Error fetching videos by workshop:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
adminRouter.get('/videos/:id', async (req, res) => {
    try {
        const videoId = parseInt(req.params.id);
        if (isNaN(videoId)) {
            return res.status(400).json({ message: 'Invalid video ID' });
        }
        const video = await storage.getVideo(videoId);
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }
        res.status(200).json(video);
    }
    catch (error) {
        console.error('Error fetching video:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
adminRouter.post('/videos', async (req, res) => {
    try {
        const VideoSchema = z.object({
            title: z.string().min(2, 'Title must be at least 2 characters'),
            description: z.string().optional(),
            url: z.string().url('Invalid URL format'),
            editableId: z.string().optional(),
            workshopType: z.string(),
            section: z.string(),
            sortOrder: z.number().default(0)
        });
        const parsedData = VideoSchema.parse(req.body);
        const newVideo = await storage.createVideo(parsedData);
        res.status(201).json(newVideo);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Invalid input', errors: error.errors });
        }
        console.error('Error creating video:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
adminRouter.put('/videos/:id', async (req, res) => {
    try {
        const videoId = parseInt(req.params.id);
        if (isNaN(videoId)) {
            return res.status(400).json({ message: 'Invalid video ID' });
        }
        const existingVideo = await storage.getVideo(videoId);
        if (!existingVideo) {
            return res.status(404).json({ message: 'Video not found' });
        }
        const VideoUpdateSchema = z.object({
            title: z.string().min(2, 'Title must be at least 2 characters').optional(),
            description: z.string().optional(),
            url: z.string().url('Invalid URL format').optional(),
            editableId: z.string().optional(),
            workshopType: z.string().optional(),
            section: z.string().optional(),
            sortOrder: z.number().optional()
        });
        const parsedData = VideoUpdateSchema.parse(req.body);
        const updatedVideo = await storage.updateVideo(videoId, parsedData);
        res.status(200).json(updatedVideo);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Invalid input', errors: error.errors });
        }
        console.error('Error updating video:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
adminRouter.delete('/users/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        await db.delete(schema.userAssessments).where(eq(schema.userAssessments.userId, userId));
        await db.delete(schema.navigationProgress).where(eq(schema.navigationProgress.userId, userId));
        await db.delete(schema.users).where(eq(schema.users.id, userId));
        res.status(200).json({ message: 'User deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
adminRouter.delete('/videos/:id', async (req, res) => {
    try {
        const videoId = parseInt(req.params.id);
        if (isNaN(videoId)) {
            return res.status(400).json({ message: 'Invalid video ID' });
        }
        const result = await storage.deleteVideo(videoId);
        if (!result) {
            return res.status(404).json({ message: 'Video not found' });
        }
        res.status(200).json({ message: 'Video deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
adminRouter.post('/reset-user-data/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const adminId = req.cookies.userId ? parseInt(req.cookies.userId) : 1;
        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID'
            });
        }
        const targetUser = await db.select().from(users).where(eq(users.id, userId));
        if (!targetUser.length) {
            logAdminAction(adminId, 'RESET_USER_DATA_FAILED', userId, 'User not found', req);
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        await resetUserWorkshopData(userId);
        logAdminAction(adminId, 'RESET_USER_DATA', userId, `Reset workshop data for user ${targetUser[0].username}`, req);
        res.json({
            success: true,
            message: `Workshop data reset for user ${targetUser[0].username}`
        });
    }
    catch (error) {
        const adminId = req.cookies.userId ? parseInt(req.cookies.userId) : 1;
        const userId = parseInt(req.params.userId);
        logAdminAction(adminId, 'RESET_USER_DATA_FAILED', userId, error.message, req);
        res.status(500).json({
            success: false,
            error: 'Failed to reset user data'
        });
    }
});
adminRouter.get('/validate-user-data/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID'
            });
        }
        const assessments = await db.select()
            .from(userAssessments)
            .where(eq(userAssessments.userId, userId));
        const user = await db.select({
            navigationProgress: users.navigationProgress,
            username: users.username
        })
            .from(users)
            .where(eq(users.id, userId));
        const validation = {
            userId,
            username: user[0]?.username || 'unknown',
            assessmentCount: assessments.length,
            assessmentTypes: assessments.map(a => a.assessmentType),
            hasNavigationProgress: !!user[0]?.navigationProgress,
            dataIntegrity: 'valid',
            lastUpdate: assessments.length > 0 ? Math.max(...assessments.map(a => new Date(a.createdAt).getTime())) : null
        };
        res.json({ success: true, validation });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Validation failed' });
    }
});
export { adminRouter };
