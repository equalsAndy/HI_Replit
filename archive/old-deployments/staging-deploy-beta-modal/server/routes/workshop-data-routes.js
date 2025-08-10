import { Router } from 'express';
import { getFeatureStatus } from '../middleware/feature-flags.js';
import { db } from '../db.js';
import { eq, and, isNull } from 'drizzle-orm';
import * as schema from '../../shared/schema.js';
import { users, workshopStepData } from '../../shared/schema.js';
const workshopDataRouter = Router();
async function generateAndStoreStarCard(userId) {
    try {
        console.log(`🎨 Generating StarCard PNG for user ${userId}...`);
        const { photoStorageService } = await import('../services/photo-storage-service.js');
        const assessments = await db
            .select()
            .from(schema.userAssessments)
            .where(eq(schema.userAssessments.userId, userId));
        const starCardAssessment = assessments.find(a => a.assessmentType === 'starCard');
        let starCardData;
        if (!starCardAssessment) {
            console.warn(`⚠️ No StarCard assessment found for user ${userId}, using default values`);
            starCardData = {
                thinking: 25,
                acting: 25,
                feeling: 25,
                planning: 25
            };
        }
        else {
            try {
                starCardData = JSON.parse(starCardAssessment.results);
                console.log(`📊 Found StarCard data for user ${userId}:`, starCardData);
            }
            catch (parseError) {
                console.warn(`⚠️ Failed to parse StarCard data for user ${userId}, using defaults:`, parseError);
                starCardData = {
                    thinking: 25,
                    acting: 25,
                    feeling: 25,
                    planning: 25
                };
            }
        }
        const starCardImageBuffer = await createStarCardImagePlaceholder(userId, starCardData);
        await photoStorageService.storeStarCard({
            userId: userId.toString(),
            imageBuffer: starCardImageBuffer,
            workshopStep: 'completion',
            imageType: 'star_card_final',
            metadata: {
                generated: 'auto_workshop_completion',
                starCardData: starCardData
            }
        });
        console.log(`✅ StarCard PNG generated and stored for user ${userId}`);
    }
    catch (error) {
        console.error(`❌ Failed to generate StarCard for user ${userId}:`, error);
        throw error;
    }
}
async function createStarCardImagePlaceholder(userId, starCardData) {
    const placeholderText = `StarCard for User ${userId}\nThinking: ${starCardData.thinking}%\nActing: ${starCardData.acting}%\nFeeling: ${starCardData.feeling}%\nPlanning: ${starCardData.planning}%`;
    const placeholderBuffer = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
        0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x0F, 0x00, 0x00,
        0x01, 0x00, 0x01, 0x5C, 0xC2, 0x5E, 0x5D, 0x00, 0x00, 0x00, 0x00, 0x49,
        0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    console.log(`📝 Created placeholder StarCard image (${placeholderBuffer.length} bytes)`);
    return placeholderBuffer;
}
const authenticateUser = (req, res, next) => {
    let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
    if (!userId) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
    if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
        userId = req.session.userId;
    }
    req.session.userId = userId;
    next();
};
const checkWorkshopLocked = async (req, res, next) => {
    try {
        const userId = req.session.userId;
        const appType = req.body.workshopType || req.body.appType || req.params.appType || 'ast';
        if (!['ast', 'ia'].includes(appType)) {
            return next();
        }
        const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (!user[0]) {
            return res.status(404).json({ error: 'User not found' });
        }
        const completionField = appType === 'ast' ? 'astWorkshopCompleted' : 'iaWorkshopCompleted';
        const isLocked = user[0][completionField];
        if (isLocked) {
            return res.status(403).json({
                error: 'Workshop is completed and locked for editing',
                workshopType: appType.toUpperCase(),
                completedAt: user[0][appType === 'ast' ? 'astCompletedAt' : 'iaCompletedAt']
            });
        }
        next();
    }
    catch (error) {
        console.error('Error checking workshop lock status:', error);
        res.status(500).json({ error: 'Failed to check workshop lock status' });
    }
};
workshopDataRouter.get('/videos/workshop/:workshopType', async (req, res) => {
    try {
        const { workshopType } = req.params;
        if (workshopType === 'allstarteams') {
            console.log('=== DEBUG: Testing step 1-1 video fetch ===');
            const testVideo = await db.select()
                .from(schema.videos)
                .where(eq(schema.videos.stepId, '1-1'));
            console.log('Found video for step 1-1:', testVideo);
            const workshopVideos = await db
                .select()
                .from(schema.videos)
                .where(eq(schema.videos.workshopType, workshopType));
            console.log(`Found ${workshopVideos.length} videos for workshop ${workshopType}`);
            console.log('First few videos:', workshopVideos.slice(0, 3));
        }
        const videos = await db
            .select()
            .from(schema.videos)
            .where(eq(schema.videos.workshopType, workshopType));
        res.status(200).json(videos);
    }
    catch (error) {
        console.error('Error fetching videos by workshop:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
workshopDataRouter.get('/videos/:id', async (req, res) => {
    try {
        const videoId = parseInt(req.params.id);
        if (isNaN(videoId)) {
            return res.status(400).json({ message: 'Invalid video ID' });
        }
        const videos = await db
            .select()
            .from(schema.videos)
            .where(eq(schema.videos.id, videoId));
        if (videos.length === 0) {
            return res.status(404).json({ message: 'Video not found' });
        }
        res.status(200).json(videos[0]);
    }
    catch (error) {
        console.error('Error fetching video:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
workshopDataRouter.get('/starcard', async (req, res) => {
    try {
        let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        console.log(`StarCard: User IDs - Session: ${req.session.userId}, Cookie: ${req.cookies.userId}`);
        if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
            userId = req.session.userId;
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
                return res.status(200).json({
                    success: true,
                    thinking: starCardData.thinking || 0,
                    feeling: starCardData.feeling || 0,
                    acting: starCardData.acting || 0,
                    planning: starCardData.planning || 0,
                    ...starCardData
                });
            }
            catch (parseError) {
                console.error(`Error parsing star card data for user ${userId}:`, parseError);
                return res.status(500).json({
                    success: false,
                    message: 'Error parsing star card data'
                });
            }
        }
        else {
            console.log(`No star card found for user ${userId}`);
            return res.status(200).json({
                success: true,
                thinking: 0,
                acting: 0,
                feeling: 0,
                planning: 0,
                isEmpty: true,
                source: 'no_database_data'
            });
        }
    }
    catch (error) {
        console.error('Error getting star card:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get star card data',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
workshopDataRouter.get('/flow-attributes', async (req, res) => {
    try {
        let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        console.log(`Flow Attributes: User IDs - Session: ${req.session.userId}, Cookie: ${req.cookies.userId}`);
        if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
            userId = req.session.userId;
            console.log(`Using session user ID ${userId} instead of cookie user ID 1`);
        }
        const flowDataEntries = await db
            .select()
            .from(schema.userAssessments)
            .where(eq(schema.userAssessments.userId, userId));
        const flowData = flowDataEntries.find(a => a.assessmentType === 'flowAttributes');
        if (flowData) {
            try {
                const flowAttributes = JSON.parse(flowData.results);
                return res.status(200).json({
                    success: true,
                    attributes: flowAttributes.attributes || [],
                    flowScore: flowAttributes.flowScore || 0
                });
            }
            catch (parseError) {
                console.error(`Error parsing flow attributes for user ${userId}:`, parseError);
                return res.status(500).json({
                    success: false,
                    message: 'Error parsing flow attributes'
                });
            }
        }
        else {
            return res.status(200).json({
                success: true,
                attributes: [],
                flowScore: 0,
                isEmpty: true
            });
        }
    }
    catch (error) {
        console.error('Error getting flow attributes:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get flow attributes',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
workshopDataRouter.get('/assessment/questions', async (req, res) => {
    try {
        const userId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
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
    }
    catch (error) {
        console.error('Error getting assessment questions:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get assessment questions',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
workshopDataRouter.post('/assessment/start', authenticateUser, async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        const existingAssessment = await db
            .select()
            .from(schema.userAssessments)
            .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'starCard')));
        if (existingAssessment.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Assessment already completed'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Assessment started'
        });
    }
    catch (error) {
        console.error('Error starting assessment:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to start assessment',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
workshopDataRouter.post('/assessment/answer', authenticateUser, async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Answer saved'
        });
    }
    catch (error) {
        console.error('Error saving answer:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to save answer',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
workshopDataRouter.post('/assessment/complete', authenticateUser, checkWorkshopLocked, async (req, res) => {
    console.log('=== ASSESSMENT COMPLETION START ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Session data:', req.session);
    console.log('Cookies:', req.cookies);
    try {
        let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
        console.log('Initial userId determination:', userId);
        if (!userId) {
            console.log('ERROR: No user ID found in session or cookies');
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        console.log(`Assessment: User IDs - Session: ${req.session.userId}, Cookie: ${req.cookies.userId}`);
        if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
            userId = req.session.userId;
            console.log(`Using session user ID ${userId} instead of cookie user ID 1`);
        }
        let quadrantData = req.body.quadrantData || {
            thinking: 28,
            feeling: 25,
            acting: 24,
            planning: 23
        };
        console.log('Saving star card data:', quadrantData);
        const existingAssessment = await db
            .select()
            .from(schema.userAssessments)
            .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'starCard')));
        let updatedId = null;
        if (existingAssessment.length > 0) {
            const updated = await db
                .update(schema.userAssessments)
                .set({
                results: JSON.stringify(quadrantData)
            })
                .where(eq(schema.userAssessments.id, existingAssessment[0].id))
                .returning();
            updatedId = updated.length > 0 ? updated[0].id : existingAssessment[0].id;
            console.log('Updated existing star card assessment:', updated);
        }
        else {
            const inserted = await db.insert(schema.userAssessments).values({
                userId: userId,
                assessmentType: 'starCard',
                results: JSON.stringify(quadrantData)
            }).returning();
            updatedId = inserted.length > 0 ? inserted[0].id : null;
            console.log('Created new star card assessment:', inserted);
        }
        return res.status(200).json({
            success: true,
            message: 'Assessment completed',
            id: updatedId,
            userId: userId,
            thinking: quadrantData.thinking,
            feeling: quadrantData.feeling,
            acting: quadrantData.acting,
            planning: quadrantData.planning,
            createdAt: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error completing assessment:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to complete assessment',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
workshopDataRouter.post('/flow-attributes', authenticateUser, checkWorkshopLocked, async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        console.log('Flow attributes save request received:', req.body);
        let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
        console.log(`Flow Attributes POST: User IDs - Session: ${req.session.userId}, Cookie: ${req.cookies.userId}`);
        if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
            userId = req.session.userId;
            console.log(`Using session user ID ${userId} instead of cookie user ID 1`);
        }
        console.log('User ID for saving flow attributes:', userId);
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        const { attributes } = req.body;
        console.log('Flow attributes data:', { attributes });
        if (!attributes || !Array.isArray(attributes)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid flow attributes data'
            });
        }
        const flowAttributesData = {
            attributes
        };
        const existingFlowAttributes = await db
            .select()
            .from(schema.userAssessments)
            .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'flowAttributes')));
        console.log('Existing flow attributes:', existingFlowAttributes);
        if (existingFlowAttributes.length > 0) {
            const updated = await db
                .update(schema.userAssessments)
                .set({
                results: JSON.stringify(flowAttributesData)
            })
                .where(eq(schema.userAssessments.id, existingFlowAttributes[0].id))
                .returning();
            console.log('Updated flow attributes:', updated);
        }
        else {
            const inserted = await db.insert(schema.userAssessments).values({
                userId,
                assessmentType: 'flowAttributes',
                results: JSON.stringify(flowAttributesData)
            }).returning();
            console.log('Inserted flow attributes:', inserted);
        }
        return res.status(200).json({
            success: true,
            message: 'Flow attributes saved successfully',
            attributes
        });
    }
    catch (error) {
        console.error('Error saving flow attributes:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to save flow attributes',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
workshopDataRouter.post('/rounding-out', authenticateUser, checkWorkshopLocked, async (req, res) => {
    try {
        let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
        if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
            userId = req.session.userId;
        }
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        const { strengths, values, passions, growthAreas } = req.body;
        if (!strengths || typeof strengths !== 'string' || strengths.trim().length === 0 || strengths.length > 1000) {
            return res.status(400).json({
                success: false,
                error: 'Strengths is required and must be 1-1000 characters',
                code: 'VALIDATION_ERROR',
                details: { strengths: 'Required field, 1-1000 characters' }
            });
        }
        if (!values || typeof values !== 'string' || values.trim().length === 0 || values.length > 1000) {
            return res.status(400).json({
                success: false,
                error: 'Values is required and must be 1-1000 characters',
                code: 'VALIDATION_ERROR',
                details: { values: 'Required field, 1-1000 characters' }
            });
        }
        if (!passions || typeof passions !== 'string' || passions.trim().length === 0 || passions.length > 1000) {
            return res.status(400).json({
                success: false,
                error: 'Passions is required and must be 1-1000 characters',
                code: 'VALIDATION_ERROR',
                details: { passions: 'Required field, 1-1000 characters' }
            });
        }
        if (!growthAreas || typeof growthAreas !== 'string' || growthAreas.trim().length === 0 || growthAreas.length > 1000) {
            return res.status(400).json({
                success: false,
                error: 'Growth Areas is required and must be 1-1000 characters',
                code: 'VALIDATION_ERROR',
                details: { growthAreas: 'Required field, 1-1000 characters' }
            });
        }
        const assessmentData = {
            strengths: strengths.trim(),
            values: values.trim(),
            passions: passions.trim(),
            growthAreas: growthAreas.trim()
        };
        const existingAssessment = await db
            .select()
            .from(schema.userAssessments)
            .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'roundingOutReflection')));
        if (existingAssessment.length > 0) {
            await db
                .update(schema.userAssessments)
                .set({
                results: JSON.stringify(assessmentData)
            })
                .where(eq(schema.userAssessments.id, existingAssessment[0].id));
        }
        else {
            await db.insert(schema.userAssessments).values({
                userId,
                assessmentType: 'roundingOutReflection',
                results: JSON.stringify(assessmentData)
            });
        }
        res.json({
            success: true,
            data: assessmentData,
            meta: {
                saved_at: new Date().toISOString(),
                assessmentType: 'roundingOutReflection'
            }
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Save failed',
            code: 'SAVE_ERROR'
        });
    }
});
workshopDataRouter.get('/rounding-out', async (req, res) => {
    try {
        let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
        if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
            userId = req.session.userId;
        }
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        const assessment = await db
            .select()
            .from(schema.userAssessments)
            .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'roundingOutReflection')));
        if (!assessment || assessment.length === 0) {
            return res.json({ success: true, data: null });
        }
        const results = JSON.parse(assessment[0].results);
        res.json({
            success: true,
            data: results,
            meta: { assessmentType: 'roundingOutReflection' }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve assessment',
            code: 'FETCH_ERROR'
        });
    }
});
workshopDataRouter.post('/future-self', authenticateUser, checkWorkshopLocked, async (req, res) => {
    try {
        let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
        if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
            userId = req.session.userId;
        }
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        const { direction, twentyYearVision, tenYearMilestone, fiveYearFoundation, flowOptimizedLife, futureSelfDescription, visualizationNotes, additionalNotes } = req.body;
        const hasContent = ((twentyYearVision && twentyYearVision.trim().length >= 10) ||
            (tenYearMilestone && tenYearMilestone.trim().length >= 10) ||
            (fiveYearFoundation && fiveYearFoundation.trim().length >= 10) ||
            (flowOptimizedLife && flowOptimizedLife.trim().length >= 10) ||
            (futureSelfDescription && futureSelfDescription.trim().length >= 10) ||
            (visualizationNotes && visualizationNotes.trim().length >= 10));
        if (!hasContent) {
            return res.status(400).json({
                success: false,
                error: 'At least one reflection field must contain at least 10 characters',
                code: 'VALIDATION_ERROR'
            });
        }
        const validateField = (field, value, maxLength = 2000) => {
            if (value && (typeof value !== 'string' || value.length > maxLength)) {
                throw new Error(`${field} must be a string with maximum ${maxLength} characters`);
            }
        };
        try {
            validateField('twentyYearVision', twentyYearVision);
            validateField('tenYearMilestone', tenYearMilestone);
            validateField('fiveYearFoundation', fiveYearFoundation);
            validateField('flowOptimizedLife', flowOptimizedLife);
            validateField('futureSelfDescription', futureSelfDescription, 1000);
            validateField('visualizationNotes', visualizationNotes, 1000);
            validateField('additionalNotes', additionalNotes, 1000);
        }
        catch (validationError) {
            return res.status(400).json({
                success: false,
                error: validationError.message,
                code: 'VALIDATION_ERROR'
            });
        }
        const assessmentData = {
            direction: direction || 'backward',
            twentyYearVision: twentyYearVision ? twentyYearVision.trim() : '',
            tenYearMilestone: tenYearMilestone ? tenYearMilestone.trim() : '',
            fiveYearFoundation: fiveYearFoundation ? fiveYearFoundation.trim() : '',
            flowOptimizedLife: flowOptimizedLife ? flowOptimizedLife.trim() : '',
            futureSelfDescription: futureSelfDescription ? futureSelfDescription.trim() : '',
            visualizationNotes: visualizationNotes ? visualizationNotes.trim() : '',
            additionalNotes: additionalNotes ? additionalNotes.trim() : '',
            completedAt: new Date().toISOString()
        };
        const existingAssessment = await db
            .select()
            .from(schema.userAssessments)
            .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'futureSelfReflection')));
        if (existingAssessment.length > 0) {
            await db
                .update(schema.userAssessments)
                .set({
                results: JSON.stringify(assessmentData)
            })
                .where(eq(schema.userAssessments.id, existingAssessment[0].id));
        }
        else {
            await db.insert(schema.userAssessments).values({
                userId,
                assessmentType: 'futureSelfReflection',
                results: JSON.stringify(assessmentData)
            });
        }
        res.json({
            success: true,
            data: assessmentData,
            meta: {
                saved_at: new Date().toISOString(),
                assessmentType: 'futureSelfReflection'
            }
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Save failed',
            code: 'SAVE_ERROR'
        });
    }
});
workshopDataRouter.get('/future-self', async (req, res) => {
    try {
        let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
        if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
            userId = req.session.userId;
        }
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        const assessment = await db
            .select()
            .from(schema.userAssessments)
            .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'futureSelfReflection')));
        if (!assessment || assessment.length === 0) {
            return res.json({ success: true, data: null });
        }
        const results = JSON.parse(assessment[0].results);
        res.json({
            success: true,
            data: results,
            meta: { assessmentType: 'futureSelfReflection' }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve assessment',
            code: 'FETCH_ERROR'
        });
    }
});
workshopDataRouter.post('/cantril-ladder', authenticateUser, checkWorkshopLocked, async (req, res) => {
    try {
        let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
        if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
            userId = req.session.userId;
        }
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        const { currentFactors, futureImprovements, specificChanges, quarterlyProgress, quarterlyActions, wellBeingLevel, futureWellBeingLevel } = req.body;
        const reflectionData = {
            currentFactors: currentFactors || '',
            futureImprovements: futureImprovements || '',
            specificChanges: specificChanges || '',
            quarterlyProgress: quarterlyProgress || '',
            quarterlyActions: quarterlyActions || ''
        };
        if (wellBeingLevel !== undefined && futureWellBeingLevel !== undefined) {
            const ladderData = {
                wellBeingLevel: Number(wellBeingLevel),
                futureWellBeingLevel: Number(futureWellBeingLevel)
            };
            const existingLadder = await db
                .select()
                .from(schema.userAssessments)
                .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'cantrilLadder')));
            if (existingLadder.length > 0) {
                await db
                    .update(schema.userAssessments)
                    .set({
                    results: JSON.stringify(ladderData)
                })
                    .where(eq(schema.userAssessments.id, existingLadder[0].id));
            }
            else {
                await db.insert(schema.userAssessments).values({
                    userId,
                    assessmentType: 'cantrilLadder',
                    results: JSON.stringify(ladderData)
                });
            }
            console.log('Cantril Ladder values saved for export:', ladderData);
        }
        const existingReflection = await db
            .select()
            .from(schema.userAssessments)
            .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'cantrilLadderReflection')));
        if (existingReflection.length > 0) {
            await db
                .update(schema.userAssessments)
                .set({
                results: JSON.stringify(reflectionData)
            })
                .where(eq(schema.userAssessments.id, existingReflection[0].id));
        }
        else {
            await db.insert(schema.userAssessments).values({
                userId,
                assessmentType: 'cantrilLadderReflection',
                results: JSON.stringify(reflectionData)
            });
        }
        res.json({
            success: true,
            data: reflectionData,
            meta: {
                saved_at: new Date().toISOString(),
                assessmentType: 'cantrilLadderReflection'
            }
        });
    }
    catch (error) {
        console.error('Cantril ladder save error:', error);
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Save failed',
            code: 'SAVE_ERROR',
            details: error instanceof Error ? error.stack : 'Unknown error'
        });
    }
});
workshopDataRouter.get('/cantril-ladder', async (req, res) => {
    console.log('=== CANTRIL LADDER GET ENDPOINT HIT ===');
    try {
        let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
        if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
            userId = req.session.userId;
        }
        console.log('Cantril ladder GET - userId from session/cookie:', userId);
        if (!userId) {
            console.log('Cantril ladder GET - No userId, returning 401');
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        console.log('Cantril ladder GET request for userId:', userId);
        const ladderAssessment = await db
            .select()
            .from(schema.userAssessments)
            .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'cantrilLadder')));
        const reflectionAssessment = await db
            .select()
            .from(schema.userAssessments)
            .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'cantrilLadderReflection')));
        console.log('Cantril ladder assessment found:', ladderAssessment.length > 0 ? 'YES' : 'NO');
        console.log('Cantril reflection assessment found:', reflectionAssessment.length > 0 ? 'YES' : 'NO');
        let combinedData = {
            wellBeingLevel: 5,
            futureWellBeingLevel: 5,
            currentFactors: '',
            futureImprovements: '',
            specificChanges: '',
            quarterlyProgress: '',
            quarterlyActions: ''
        };
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
        res.json({
            success: true,
            data: combinedData,
            meta: {
                assessmentType: 'cantrilLadder',
                hasLadderData: ladderAssessment.length > 0,
                hasReflectionData: reflectionAssessment.length > 0
            }
        });
    }
    catch (error) {
        console.error('Cantril ladder GET error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve assessment',
            code: 'FETCH_ERROR'
        });
    }
});
workshopDataRouter.post('/final-insights', async (req, res) => {
    try {
        let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
        if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
            userId = req.session.userId;
        }
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        const { keyInsights, actionSteps, commitments } = req.body;
        if (!keyInsights || typeof keyInsights !== 'string' || keyInsights.trim().length === 0 || keyInsights.length > 1000) {
            return res.status(400).json({
                success: false,
                error: 'Key Insights is required and must be 1-1000 characters',
                code: 'VALIDATION_ERROR',
                details: { keyInsights: 'Required field, 1-1000 characters' }
            });
        }
        if (!actionSteps || typeof actionSteps !== 'string' || actionSteps.trim().length === 0 || actionSteps.length > 1000) {
            return res.status(400).json({
                success: false,
                error: 'Action Steps is required and must be 1-1000 characters',
                code: 'VALIDATION_ERROR',
                details: { actionSteps: 'Required field, 1-1000 characters' }
            });
        }
        if (!commitments || typeof commitments !== 'string' || commitments.trim().length === 0 || commitments.length > 1000) {
            return res.status(400).json({
                success: false,
                error: 'Commitments is required and must be 1-1000 characters',
                code: 'VALIDATION_ERROR',
                details: { commitments: 'Required field, 1-1000 characters' }
            });
        }
        const assessmentData = {
            keyInsights: keyInsights.trim(),
            actionSteps: actionSteps.trim(),
            commitments: commitments.trim()
        };
        const existingAssessment = await db
            .select()
            .from(schema.userAssessments)
            .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'finalReflection')));
        if (existingAssessment.length > 0) {
            await db
                .update(schema.userAssessments)
                .set({
                results: JSON.stringify(assessmentData)
            })
                .where(eq(schema.userAssessments.id, existingAssessment[0].id));
        }
        else {
            await db.insert(schema.userAssessments).values({
                userId,
                assessmentType: 'finalReflection',
                results: JSON.stringify(assessmentData)
            });
        }
        res.json({
            success: true,
            data: assessmentData,
            meta: {
                saved_at: new Date().toISOString(),
                assessmentType: 'finalReflection'
            }
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Save failed',
            code: 'SAVE_ERROR'
        });
    }
});
workshopDataRouter.get('/final-insights', async (req, res) => {
    try {
        let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
        if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
            userId = req.session.userId;
        }
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        const assessment = await db
            .select()
            .from(schema.userAssessments)
            .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'finalReflection')));
        if (!assessment || assessment.length === 0) {
            return res.json({ success: true, data: null });
        }
        const results = JSON.parse(assessment[0].results);
        res.json({
            success: true,
            data: results,
            meta: { assessmentType: 'finalReflection' }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve assessment',
            code: 'FETCH_ERROR'
        });
    }
});
workshopDataRouter.post('/assessments', async (req, res) => {
    try {
        let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
        console.log(`Assessments POST: User IDs - Session: ${req.session.userId}, Cookie: ${req.cookies.userId}`);
        if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
            userId = req.session.userId;
            console.log(`Using session user ID ${userId} instead of cookie user ID 1`);
        }
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        const { assessmentType, results } = req.body;
        console.log('Saving assessment:', { userId, assessmentType, results });
        if (!assessmentType || !results) {
            return res.status(400).json({
                success: false,
                message: 'Assessment type and results are required'
            });
        }
        const existingAssessment = await db
            .select()
            .from(schema.userAssessments)
            .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, assessmentType)));
        if (existingAssessment.length > 0) {
            const updated = await db
                .update(schema.userAssessments)
                .set({
                results: JSON.stringify(results)
            })
                .where(eq(schema.userAssessments.id, existingAssessment[0].id))
                .returning();
            console.log('Updated assessment:', updated[0]);
            return res.status(200).json({
                success: true,
                message: 'Assessment updated successfully',
                assessment: updated[0]
            });
        }
        else {
            const inserted = await db.insert(schema.userAssessments).values({
                userId,
                assessmentType,
                results: JSON.stringify(results)
            }).returning();
            console.log('Created new assessment:', inserted[0]);
            return res.status(200).json({
                success: true,
                message: 'Assessment saved successfully',
                assessment: inserted[0]
            });
        }
    }
    catch (error) {
        console.error('Error saving assessment:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to save assessment',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
workshopDataRouter.post('/step-by-step-reflection', authenticateUser, checkWorkshopLocked, async (req, res) => {
    try {
        let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
        if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
            userId = req.session.userId;
        }
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        const { strength1, strength2, strength3, strength4, teamValues, uniqueContribution } = req.body;
        const reflectionData = {
            strength1: strength1 || '',
            strength2: strength2 || '',
            strength3: strength3 || '',
            strength4: strength4 || '',
            teamValues: teamValues || '',
            uniqueContribution: uniqueContribution || ''
        };
        const existingReflection = await db
            .select()
            .from(schema.userAssessments)
            .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'stepByStepReflection')));
        if (existingReflection.length > 0) {
            await db
                .update(schema.userAssessments)
                .set({
                results: JSON.stringify(reflectionData)
            })
                .where(eq(schema.userAssessments.id, existingReflection[0].id));
        }
        else {
            await db.insert(schema.userAssessments).values({
                userId,
                assessmentType: 'stepByStepReflection',
                results: JSON.stringify(reflectionData)
            });
        }
        res.json({
            success: true,
            data: reflectionData,
            meta: {
                saved_at: new Date().toISOString(),
                assessmentType: 'stepByStepReflection'
            }
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Save failed',
            code: 'SAVE_ERROR'
        });
    }
});
workshopDataRouter.get('/step-by-step-reflection', async (req, res) => {
    try {
        let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
        if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
            userId = req.session.userId;
        }
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        const assessment = await db
            .select()
            .from(schema.userAssessments)
            .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'stepByStepReflection')));
        if (!assessment || assessment.length === 0) {
            return res.json({ success: true, data: null });
        }
        const results = JSON.parse(assessment[0].results);
        res.json({
            success: true,
            data: results,
            meta: { assessmentType: 'stepByStepReflection' }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve assessment',
            code: 'FETCH_ERROR'
        });
    }
});
workshopDataRouter.post('/visualizing-potential', authenticateUser, checkWorkshopLocked, async (req, res) => {
    try {
        let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
        if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
            userId = req.session.userId;
        }
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        const { selectedImages, imageMeaning } = req.body;
        console.log('VisualizingPotential: Saving data for user', userId, { selectedImages, imageMeaning });
        if (!selectedImages || !Array.isArray(selectedImages) || selectedImages.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Selected images are required and must be a non-empty array',
                code: 'VALIDATION_ERROR',
                details: { selectedImages: 'Required field, must be non-empty array' }
            });
        }
        if (selectedImages.length > 5) {
            return res.status(400).json({
                success: false,
                error: 'Maximum 5 images allowed',
                code: 'VALIDATION_ERROR',
                details: { selectedImages: 'Maximum 5 images allowed' }
            });
        }
        if (imageMeaning && (typeof imageMeaning !== 'string' || imageMeaning.length > 2000)) {
            return res.status(400).json({
                success: false,
                error: 'Image meaning must be a string with maximum 2000 characters',
                code: 'VALIDATION_ERROR',
                details: { imageMeaning: 'Optional field, maximum 2000 characters' }
            });
        }
        const assessmentData = {
            selectedImages,
            imageMeaning: imageMeaning ? imageMeaning.trim() : ''
        };
        const existingAssessment = await db
            .select()
            .from(schema.userAssessments)
            .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'visualizingPotential')));
        if (existingAssessment.length > 0) {
            await db
                .update(schema.userAssessments)
                .set({
                results: JSON.stringify(assessmentData)
            })
                .where(eq(schema.userAssessments.id, existingAssessment[0].id));
            console.log('VisualizingPotential: Updated existing data for user', userId);
        }
        else {
            await db.insert(schema.userAssessments).values({
                userId,
                assessmentType: 'visualizingPotential',
                results: JSON.stringify(assessmentData)
            });
            console.log('VisualizingPotential: Created new data for user', userId);
        }
        res.json({
            success: true,
            data: assessmentData,
            meta: {
                saved_at: new Date().toISOString(),
                assessmentType: 'visualizingPotential'
            }
        });
    }
    catch (error) {
        console.error('VisualizingPotential save error:', error);
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Save failed',
            code: 'SAVE_ERROR'
        });
    }
});
workshopDataRouter.get('/visualizing-potential', async (req, res) => {
    try {
        let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
        if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
            userId = req.session.userId;
        }
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        console.log('VisualizingPotential: Loading data for user', userId);
        const assessment = await db
            .select()
            .from(schema.userAssessments)
            .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'visualizingPotential')));
        if (!assessment || assessment.length === 0) {
            console.log('VisualizingPotential: No existing data found for user', userId);
            return res.json({ success: true, data: null });
        }
        const results = JSON.parse(assessment[0].results);
        console.log('VisualizingPotential: Found existing data for user', userId, results);
        res.json({
            success: true,
            data: results,
            meta: { assessmentType: 'visualizingPotential' }
        });
    }
    catch (error) {
        console.error('VisualizingPotential fetch error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve assessment',
            code: 'FETCH_ERROR'
        });
    }
});
workshopDataRouter.post('/final-reflection', authenticateUser, checkWorkshopLocked, async (req, res) => {
    try {
        let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
        if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
            userId = req.session.userId;
        }
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        const { futureLetterText } = req.body;
        if (!futureLetterText || typeof futureLetterText !== 'string' || futureLetterText.trim().length === 0 || futureLetterText.length > 1000) {
            return res.status(400).json({
                success: false,
                error: 'Future Letter Text is required and must be 1-1000 characters',
                code: 'VALIDATION_ERROR',
                details: { futureLetterText: 'Required field, 1-1000 characters' }
            });
        }
        const assessmentData = {
            futureLetterText: futureLetterText.trim()
        };
        const existingAssessment = await db
            .select()
            .from(schema.userAssessments)
            .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'finalReflection')));
        if (existingAssessment.length > 0) {
            await db
                .update(schema.userAssessments)
                .set({
                results: JSON.stringify(assessmentData)
            })
                .where(eq(schema.userAssessments.id, existingAssessment[0].id));
        }
        else {
            await db.insert(schema.userAssessments).values({
                userId,
                assessmentType: 'finalReflection',
                results: JSON.stringify(assessmentData)
            });
        }
        console.log(`🎯 Final reflection saved for user ${userId}, auto-completing AST workshop...`);
        try {
            const completedAt = new Date();
            await db.update(users)
                .set({
                astWorkshopCompleted: true,
                astCompletedAt: completedAt
            })
                .where(eq(users.id, userId));
            console.log(`🎯 AST workshop completed for user ${userId}, generating StarCard and unlocking reports...`);
            const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
            let progress = {};
            try {
                progress = JSON.parse(user[0]?.navigationProgress || '{}');
            }
            catch (e) {
                progress = {};
            }
            try {
                await generateAndStoreStarCard(userId);
            }
            catch (starCardError) {
                console.error(`⚠️ StarCard generation failed for user ${userId}, continuing without it:`, starCardError);
            }
            const updatedProgress = {
                ...progress,
                ast: {
                    ...progress.ast,
                    holisticReportsUnlocked: true,
                    completedSteps: [...(progress.ast?.completedSteps || []), '5-2'].filter((step, index, arr) => arr.indexOf(step) === index)
                }
            };
            await db.update(users)
                .set({
                navigationProgress: JSON.stringify(updatedProgress)
            })
                .where(eq(users.id, userId));
            console.log(`✅ AST workshop auto-completed, StarCard generated and holistic reports unlocked for user ${userId}`);
            res.json({
                success: true,
                data: assessmentData,
                workshopCompleted: true,
                completedAt: completedAt.toISOString(),
                holisticReportsUnlocked: true,
                meta: {
                    saved_at: new Date().toISOString(),
                    assessmentType: 'finalReflection'
                }
            });
        }
        catch (workshopError) {
            console.error(`⚠️ Failed to auto-complete workshop for user ${userId}:`, workshopError);
            res.json({
                success: true,
                data: assessmentData,
                workshopCompleted: false,
                error: 'Final reflection saved but workshop completion failed',
                meta: {
                    saved_at: new Date().toISOString(),
                    assessmentType: 'finalReflection'
                }
            });
        }
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Save failed',
            code: 'SAVE_ERROR'
        });
    }
});
workshopDataRouter.get('/final-reflection', async (req, res) => {
    try {
        let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
        if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
            userId = req.session.userId;
        }
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        const assessment = await db
            .select()
            .from(schema.userAssessments)
            .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'finalReflection')));
        if (!assessment || assessment.length === 0) {
            return res.json({ success: true, data: null });
        }
        const results = JSON.parse(assessment[0].results);
        res.json({
            success: true,
            data: results,
            meta: { assessmentType: 'finalReflection' }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve assessment',
            code: 'FETCH_ERROR'
        });
    }
});
workshopDataRouter.get('/debug/step-1-1', async (req, res) => {
    try {
        console.log('=== DEBUG ENDPOINT: Testing step 1-1 video ===');
        const allVideos = await db.select().from(schema.videos);
        console.log(`Total videos in database: ${allVideos.length}`);
        const stepVideos = await db.select()
            .from(schema.videos)
            .where(eq(schema.videos.stepId, '1-1'));
        console.log('Videos with stepId "1-1":', stepVideos);
        const allstarVideos = await db.select()
            .from(schema.videos)
            .where(eq(schema.videos.workshopType, 'allstarteams'));
        console.log('AllStarTeams videos:', allstarVideos.length);
        const combinedVideos = await db.select()
            .from(schema.videos)
            .where(and(eq(schema.videos.stepId, '1-1'), eq(schema.videos.workshopType, 'allstarteams')));
        console.log('Combined filter result:', combinedVideos);
        res.json({
            success: true,
            totalVideos: allVideos.length,
            stepVideos,
            allstarVideosCount: allstarVideos.length,
            combinedVideos
        });
    }
    catch (error) {
        console.error('Debug endpoint error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
workshopDataRouter.post('/visualization', async (req, res) => {
    try {
        let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
        if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
            userId = req.session.userId;
        }
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        const { wellBeingLevel, futureWellBeingLevel } = req.body;
        if (wellBeingLevel !== undefined && (typeof wellBeingLevel !== 'number' || wellBeingLevel < 0 || wellBeingLevel > 10)) {
            return res.status(400).json({
                success: false,
                error: 'wellBeingLevel must be a number between 0 and 10',
                code: 'VALIDATION_ERROR'
            });
        }
        if (futureWellBeingLevel !== undefined && (typeof futureWellBeingLevel !== 'number' || futureWellBeingLevel < 0 || futureWellBeingLevel > 10)) {
            return res.status(400).json({
                success: false,
                error: 'futureWellBeingLevel must be a number between 0 and 10',
                code: 'VALIDATION_ERROR'
            });
        }
        const assessmentData = {
            wellBeingLevel: wellBeingLevel || 5,
            futureWellBeingLevel: futureWellBeingLevel || 5
        };
        const existingAssessment = await db
            .select()
            .from(schema.userAssessments)
            .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'cantrilLadder')));
        if (existingAssessment.length > 0) {
            await db
                .update(schema.userAssessments)
                .set({
                results: JSON.stringify(assessmentData)
            })
                .where(eq(schema.userAssessments.id, existingAssessment[0].id));
        }
        else {
            await db.insert(schema.userAssessments).values({
                userId,
                assessmentType: 'cantrilLadder',
                results: JSON.stringify(assessmentData)
            });
        }
        res.json({
            success: true,
            data: assessmentData,
            meta: {
                saved_at: new Date().toISOString(),
                assessmentType: 'cantrilLadder'
            }
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Save failed',
            code: 'SAVE_ERROR'
        });
    }
});
workshopDataRouter.get('/visualization', async (req, res) => {
    try {
        let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
        if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
            userId = req.session.userId;
        }
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        const assessment = await db
            .select()
            .from(schema.userAssessments)
            .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'cantrilLadder')));
        if (!assessment || assessment.length === 0) {
            return res.json({
                success: true,
                data: null,
                wellBeingLevel: 5,
                futureWellBeingLevel: 5
            });
        }
        const results = JSON.parse(assessment[0].results);
        res.json({
            success: true,
            data: results,
            wellBeingLevel: results.wellBeingLevel || 5,
            futureWellBeingLevel: results.futureWellBeingLevel || 5,
            meta: { assessmentType: 'cantrilLadder' }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve assessment',
            code: 'FETCH_ERROR'
        });
    }
});
workshopDataRouter.get('/flow-assessment', async (req, res) => {
    try {
        let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
        if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
            userId = req.session.userId;
        }
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        const assessment = await db
            .select()
            .from(schema.userAssessments)
            .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'flowAssessment')));
        if (!assessment || assessment.length === 0) {
            return res.json({ success: true, data: null });
        }
        const results = JSON.parse(assessment[0].results);
        res.json({
            success: true,
            data: results,
            meta: {
                created_at: assessment[0].createdAt,
                assessmentType: 'flowAssessment'
            }
        });
    }
    catch (error) {
        console.error('Error fetching flow assessment:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Fetch failed'
        });
    }
});
workshopDataRouter.post('/flow-assessment', async (req, res) => {
    try {
        let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
        if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
            userId = req.session.userId;
        }
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        const { answers, flowScore, completed = true } = req.body;
        if (!answers || typeof answers !== 'object') {
            return res.status(400).json({
                success: false,
                error: 'Answers object is required'
            });
        }
        if (flowScore === undefined || typeof flowScore !== 'number') {
            return res.status(400).json({
                success: false,
                error: 'Flow score is required and must be a number'
            });
        }
        const assessmentData = {
            answers,
            flowScore,
            completed,
            completedAt: completed ? new Date().toISOString() : null
        };
        const existingAssessment = await db
            .select()
            .from(schema.userAssessments)
            .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'flowAssessment')));
        if (existingAssessment.length > 0) {
            await db
                .update(schema.userAssessments)
                .set({
                results: JSON.stringify(assessmentData)
            })
                .where(eq(schema.userAssessments.id, existingAssessment[0].id));
        }
        else {
            await db.insert(schema.userAssessments).values({
                userId,
                assessmentType: 'flowAssessment',
                results: JSON.stringify(assessmentData)
            });
        }
        res.json({
            success: true,
            data: assessmentData,
            meta: {
                saved_at: new Date().toISOString(),
                assessmentType: 'flowAssessment'
            }
        });
    }
    catch (error) {
        console.error('Error saving flow assessment:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Save failed'
        });
    }
});
workshopDataRouter.get('/userAssessments', async (req, res) => {
    try {
        let userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
        if (req.cookies.userId && parseInt(req.cookies.userId) === 1 && req.session.userId && req.session.userId !== 1) {
            userId = req.session.userId;
        }
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        const assessments = await db
            .select()
            .from(schema.userAssessments)
            .where(eq(schema.userAssessments.userId, userId));
        const assessmentsByType = {};
        assessments.forEach(assessment => {
            try {
                const results = JSON.parse(assessment.results);
                assessmentsByType[assessment.assessmentType] = {
                    ...results,
                    createdAt: assessment.createdAt,
                    assessmentType: assessment.assessmentType
                };
            }
            catch (error) {
                console.error(`Error parsing assessment ${assessment.assessmentType}:`, error);
            }
        });
        res.json({
            success: true,
            currentUser: {
                assessments: assessmentsByType
            }
        });
    }
    catch (error) {
        console.error('Error fetching user assessments:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Fetch failed'
        });
    }
});
workshopDataRouter.get('/navigation-progress/:appType', async (req, res) => {
    try {
        const userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
        const { appType } = req.params;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        const progress = await db
            .select()
            .from(schema.navigationProgress)
            .where(and(eq(schema.navigationProgress.userId, userId), eq(schema.navigationProgress.appType, appType)));
        if (progress.length === 0) {
            const defaultProgress = {
                completedSteps: [],
                currentStepId: appType === 'ia' ? 'ia-1-1' : '1-1',
                appType,
                lastVisitedAt: new Date().toISOString(),
                unlockedSteps: appType === 'ia' ? ['ia-1-1'] : ['1-1'],
                videoProgress: {}
            };
            return res.status(200).json({
                success: true,
                data: defaultProgress
            });
        }
        const navigationData = progress[0];
        const parsedProgress = {
            completedSteps: JSON.parse(navigationData.completedSteps),
            currentStepId: navigationData.currentStepId,
            appType: navigationData.appType,
            lastVisitedAt: navigationData.lastVisitedAt,
            unlockedSteps: JSON.parse(navigationData.unlockedSteps),
            videoProgress: navigationData.videoProgress ? JSON.parse(navigationData.videoProgress) : {}
        };
        return res.status(200).json({
            success: true,
            data: parsedProgress
        });
    }
    catch (error) {
        console.error('Error fetching navigation progress:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch navigation progress'
        });
    }
});
workshopDataRouter.post('/navigation-progress', async (req, res) => {
    try {
        const userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        const { completedSteps, currentStepId, appType, unlockedSteps, videoProgress } = req.body;
        const hasIASteps = (completedSteps && completedSteps.some((step) => step.startsWith('ia-'))) ||
            (currentStepId && currentStepId.startsWith('ia-'));
        const detectedAppType = hasIASteps ? 'ia' : 'ast';
        console.log(`Navigation Progress: Received appType: ${appType}, Detected from steps: ${detectedAppType}`);
        const existingProgress = await db
            .select()
            .from(schema.navigationProgress)
            .where(and(eq(schema.navigationProgress.userId, userId), eq(schema.navigationProgress.appType, detectedAppType)));
        const progressData = {
            userId,
            appType: detectedAppType,
            completedSteps: JSON.stringify(completedSteps),
            currentStepId,
            unlockedSteps: JSON.stringify(unlockedSteps),
            videoProgress: JSON.stringify(videoProgress || {}),
            lastVisitedAt: new Date(),
            updatedAt: new Date()
        };
        if (existingProgress.length > 0) {
            await db
                .update(schema.navigationProgress)
                .set(progressData)
                .where(eq(schema.navigationProgress.id, existingProgress[0].id));
        }
        else {
            await db.insert(schema.navigationProgress).values(progressData);
        }
        return res.status(200).json({
            success: true,
            message: 'Navigation progress saved'
        });
    }
    catch (error) {
        console.error('Error saving navigation progress:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to save navigation progress'
        });
    }
});
workshopDataRouter.get('/ia-assessment/:userId?', async (req, res) => {
    try {
        const targetUserId = req.params.userId ? parseInt(req.params.userId) :
            (req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null));
        if (!targetUserId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        const assessment = await db
            .select()
            .from(schema.userAssessments)
            .where(and(eq(schema.userAssessments.userId, targetUserId), eq(schema.userAssessments.assessmentType, 'iaCoreCapabilities')));
        if (assessment.length === 0) {
            return res.status(200).json({
                success: true,
                data: null
            });
        }
        const assessmentData = assessment[0];
        let results;
        try {
            results = typeof assessmentData.results === 'string' ? JSON.parse(assessmentData.results) : assessmentData.results;
        }
        catch (error) {
            console.error('Error parsing IA assessment results:', error);
            return res.status(200).json({
                success: true,
                data: null
            });
        }
        return res.status(200).json({
            success: true,
            data: {
                id: assessmentData.id,
                userId: assessmentData.userId,
                assessmentType: assessmentData.assessmentType,
                results,
                createdAt: assessmentData.createdAt
            }
        });
    }
    catch (error) {
        console.error('Error fetching IA assessment:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch IA assessment'
        });
    }
});
workshopDataRouter.post('/ia-assessment', async (req, res) => {
    try {
        const userId = req.session.userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        const { results } = req.body;
        if (!results) {
            return res.status(400).json({
                success: false,
                message: 'Assessment results are required'
            });
        }
        const existingAssessment = await db
            .select()
            .from(schema.userAssessments)
            .where(and(eq(schema.userAssessments.userId, userId), eq(schema.userAssessments.assessmentType, 'iaCoreCapabilities')));
        if (existingAssessment.length > 0) {
            await db
                .update(schema.userAssessments)
                .set({
                results: typeof results === 'string' ? results : JSON.stringify(results),
            })
                .where(eq(schema.userAssessments.id, existingAssessment[0].id));
        }
        else {
            await db.insert(schema.userAssessments).values({
                userId,
                assessmentType: 'iaCoreCapabilities',
                results: typeof results === 'string' ? results : JSON.stringify(results)
            });
        }
        return res.status(200).json({
            success: true,
            message: 'IA assessment saved successfully',
            data: results
        });
    }
    catch (error) {
        console.error('Error saving IA assessment:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to save IA assessment'
        });
    }
});
workshopDataRouter.get('/step/:workshopType/:stepId', authenticateUser, async (req, res) => {
    try {
        const { workshopType, stepId } = req.params;
        const userId = req.session.userId;
        if (!['ast', 'ia'].includes(workshopType)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid workshop type. Must be "ast" or "ia"'
            });
        }
        if (!stepId || typeof stepId !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Step ID is required'
            });
        }
        const result = await db
            .select()
            .from(workshopStepData)
            .where(and(eq(workshopStepData.userId, userId), eq(workshopStepData.workshopType, workshopType), eq(workshopStepData.stepId, stepId), isNull(workshopStepData.deletedAt)))
            .limit(1);
        if (result.length === 0) {
            return res.json({
                success: true,
                data: null,
                stepId,
                workshopType
            });
        }
        res.json({
            success: true,
            data: result[0].data,
            stepId,
            workshopType,
            lastUpdated: result[0].updatedAt
        });
    }
    catch (error) {
        console.error('Error loading workshop step data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load step data'
        });
    }
});
workshopDataRouter.post('/step', authenticateUser, checkWorkshopLocked, async (req, res) => {
    try {
        const { workshopType, stepId, data } = req.body;
        const userId = req.session.userId;
        console.log('🔍 POST /step - Request details:', {
            workshopType,
            stepId,
            userId,
            hasData: !!data,
            dataKeys: data ? Object.keys(data) : [],
            sessionExists: !!(req.session),
            userIdType: typeof userId
        });
        if (!['ast', 'ia'].includes(workshopType)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid workshop type. Must be "ast" or "ia"'
            });
        }
        if (!stepId || typeof stepId !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Step ID is required'
            });
        }
        if (!data || typeof data !== 'object') {
            return res.status(400).json({
                success: false,
                error: 'Data object is required'
            });
        }
        console.log('🔍 Attempting to save workshop data:', { userId, workshopType, stepId, dataKeys: Object.keys(data) });
        if (!userId || typeof userId !== 'number') {
            console.error('❌ Invalid userId:', { userId, type: typeof userId });
            return res.status(401).json({
                success: false,
                error: 'Authentication required - invalid user ID'
            });
        }
        console.log('🔍 About to execute UPSERT with:', {
            userId,
            workshopType,
            stepId,
            hasData: !!data,
            dataSize: JSON.stringify(data).length
        });
        const result = await db
            .insert(workshopStepData)
            .values({
            userId,
            workshopType,
            stepId,
            data: data,
            updatedAt: new Date()
        })
            .onConflictDoUpdate({
            target: [workshopStepData.userId, workshopStepData.workshopType, workshopStepData.stepId],
            set: {
                data: data,
                updatedAt: new Date()
            }
        })
            .returning();
        console.log('✅ Workshop data saved successfully:', result[0]);
        res.json({
            success: true,
            stepId,
            workshopType,
            saved: true,
            lastUpdated: result[0].updatedAt
        });
    }
    catch (error) {
        console.error('❌ Error saving workshop step data:', error);
        console.error('❌ Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : 'No stack trace'
        });
        res.status(500).json({
            success: false,
            error: 'Failed to save step data',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
workshopDataRouter.get('/steps/:workshopType', authenticateUser, async (req, res) => {
    try {
        const { workshopType } = req.params;
        const userId = req.session.userId;
        if (!['ast', 'ia'].includes(workshopType)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid workshop type. Must be "ast" or "ia"'
            });
        }
        const results = await db
            .select()
            .from(workshopStepData)
            .where(and(eq(workshopStepData.userId, userId), eq(workshopStepData.workshopType, workshopType), isNull(workshopStepData.deletedAt)))
            .orderBy(workshopStepData.stepId);
        const stepData = results.reduce((acc, row) => {
            acc[row.stepId] = row.data;
            return acc;
        }, {});
        res.json({
            success: true,
            workshopType,
            stepData,
            totalSteps: results.length
        });
    }
    catch (error) {
        console.error('Error loading workshop steps data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load workshop data'
        });
    }
});
workshopDataRouter.get('/feature-status', getFeatureStatus);
workshopDataRouter.get('/completion-status', authenticateUser, async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await db.select({
            astWorkshopCompleted: users.astWorkshopCompleted,
            iaWorkshopCompleted: users.iaWorkshopCompleted,
            astCompletedAt: users.astCompletedAt,
            iaCompletedAt: users.iaCompletedAt
        }).from(users).where(eq(users.id, userId)).limit(1);
        if (!user[0]) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user[0]);
    }
    catch (error) {
        console.error('Error fetching completion status:', error);
        res.status(500).json({ error: 'Failed to fetch completion status' });
    }
});
workshopDataRouter.post('/complete-workshop', authenticateUser, async (req, res) => {
    try {
        const { appType } = req.body;
        const userId = req.session.userId;
        if (!appType || !['ast', 'ia'].includes(appType)) {
            return res.status(400).json({ error: 'Invalid app type. Must be "ast" or "ia"' });
        }
        const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (!user[0]) {
            return res.status(404).json({ error: 'User not found' });
        }
        let progress;
        try {
            progress = JSON.parse(user[0].navigationProgress || '{}');
        }
        catch (e) {
            progress = {};
        }
        const requiredSteps = appType === 'ast'
            ? ['1-1', '2-1', '2-2', '2-3', '2-4', '3-1', '3-2', '3-3', '3-4', '4-1', '4-2', '4-3', '4-4', '4-5']
            : ['ia-1-1', 'ia-2-1', 'ia-3-1', 'ia-4-1', 'ia-5-1', 'ia-6-1', 'ia-8-1'];
        const completedSteps = progress[appType]?.completedSteps || [];
        const allCompleted = requiredSteps.every(step => completedSteps.includes(step));
        if (!allCompleted) {
            const missingSteps = requiredSteps.filter(step => !completedSteps.includes(step));
            return res.status(400).json({
                error: 'Cannot complete workshop - not all steps finished',
                missingSteps
            });
        }
        const completionField = appType === 'ast' ? 'astWorkshopCompleted' : 'iaWorkshopCompleted';
        if (user[0][completionField]) {
            return res.status(400).json({ error: 'Workshop already completed' });
        }
        const timestampField = appType === 'ast' ? 'astCompletedAt' : 'iaCompletedAt';
        const completedAt = new Date();
        await db.update(users)
            .set({
            [completionField]: true,
            [timestampField]: completedAt
        })
            .where(eq(users.id, userId));
        if (appType === 'ast') {
            try {
                console.log(`🎯 AST workshop completed for user ${userId}, generating StarCard and unlocking reports...`);
                await generateAndStoreStarCard(userId);
                const updatedProgress = {
                    ...progress,
                    ast: {
                        ...progress.ast,
                        holisticReportsUnlocked: true,
                        completedSteps: [...(progress.ast?.completedSteps || []), '5-2'].filter((step, index, arr) => arr.indexOf(step) === index)
                    }
                };
                await db.update(users)
                    .set({
                    navigationProgress: JSON.stringify(updatedProgress)
                })
                    .where(eq(users.id, userId));
                console.log(`✅ StarCard generated and holistic reports unlocked for user ${userId}`);
            }
            catch (starCardError) {
                console.error(`⚠️ Failed to generate StarCard for user ${userId}:`, starCardError);
            }
        }
        res.json({
            success: true,
            message: `${appType.toUpperCase()} workshop completed successfully`,
            completedAt: completedAt.toISOString(),
            holisticReportsUnlocked: appType === 'ast' ? true : false
        });
    }
    catch (error) {
        console.error('Error completing workshop:', error);
        res.status(500).json({ error: 'Failed to complete workshop' });
    }
});
export default workshopDataRouter;
