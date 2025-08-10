import { Router } from 'express';
import { Pool } from 'pg';
import { conversationLoggingService } from '../services/conversation-logging-service.js';
const router = Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
router.post('/vector/init', async (req, res) => {
    try {
        const success = await vectorDB.initializeCollections();
        res.json({ success, message: success ? 'Vector DB initialized' : 'Failed to initialize' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to initialize vector database' });
    }
});
router.get('/vector/status', async (req, res) => {
    try {
        const connected = await vectorDB.testConnection();
        res.json({
            status: connected ? 'connected' : 'disconnected',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to check vector database status' });
    }
});
router.get('/knowledge', async (req, res) => {
    try {
        res.json({
            message: 'Knowledge base endpoint working',
            status: 'development',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get knowledge base' });
    }
});
router.get('/status', async (req, res) => {
    try {
        const { CURRENT_PERSONAS } = await import('./persona-management-routes.js');
        const reflectionPersona = CURRENT_PERSONAS.find(p => p.id === 'ast_reflection');
        const isAICoachingEnabled = reflectionPersona?.enabled === true;
        res.json({
            aiCoachingEnabled: isAICoachingEnabled,
            environment: process.env.NODE_ENV || 'development',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error checking AI coaching status:', error);
        res.json({
            aiCoachingEnabled: false,
            environment: process.env.NODE_ENV || 'development',
            timestamp: new Date().toISOString(),
            error: 'Failed to check AI status'
        });
    }
});
router.post('/chat', async (req, res) => {
    try {
        const { message, context, persona } = req.body;
        const userId = req.session?.userId;
        console.log('🤖 Coaching chat request:', {
            message,
            persona,
            context,
            userId,
            hasSession: !!req.session,
            sessionId: req.sessionID
        });
        const conversationEntry = {
            timestamp: new Date().toISOString(),
            userId: userId || 'anonymous',
            sessionId: req.sessionID,
            userMessage: message,
            persona,
            context,
            type: 'user_message'
        };
        console.log('💾 TALIA CONVERSATION LOG:', JSON.stringify(conversationEntry, null, 2));
        if (!userId) {
            console.warn('⚠️ No userId in session, proceeding with anonymous chat for development');
        }
        const { taliaTrainingService } = await import('../services/talia-training-service.js');
        const { userLearningService } = await import('../services/user-learning-service.js');
        try {
            const { generateOpenAICoachingResponse } = await import('../services/openai-api-service.js');
            let claudeContext;
            let personaType;
            let targetUserId = userId;
            let userName = 'there';
            if (persona === 'star_report') {
                console.log('🔧 Report Talia persona detected');
                console.log('🔧 Report context received:', {
                    selectedUserId: context.selectedUserId,
                    selectedUserName: context.selectedUserName,
                    reportContext: context.reportContext,
                    requestingUserId: userId
                });
                personaType = 'star_report';
                targetUserId = context.selectedUserId || userId;
                userName = context.selectedUserName || 'the selected user';
                console.log('🎯 Target user determined:', {
                    targetUserId: targetUserId,
                    userName: userName,
                    isSelectedUser: !!context.selectedUserId,
                    fallbackToAdmin: !context.selectedUserId
                });
                if (!context.selectedUserId) {
                    console.warn('⚠️ No selectedUserId provided - Report Talia will use admin data instead of selected user data');
                }
                const userCoachingContext = targetUserId ? await userLearningService.getUserCoachingContext(targetUserId.toString()) : '';
                let userData = null;
                if (targetUserId) {
                    try {
                        console.log(`🔍 Fetching user data for targetUserId: ${targetUserId} (type: ${typeof targetUserId})`);
                        const userResult = await pool.query('SELECT id, name, username, email, ast_completed_at, created_at FROM users WHERE id = $1', [targetUserId]);
                        console.log(`📊 User query result:`, {
                            rowCount: userResult.rows.length,
                            firstRow: userResult.rows[0] ? {
                                id: userResult.rows[0].id,
                                name: userResult.rows[0].name,
                                username: userResult.rows[0].username
                            } : 'No rows'
                        });
                        if (userResult.rows.length > 0) {
                            const user = userResult.rows[0];
                            const assessmentsResult = await pool.query(`
                SELECT assessment_type, results, created_at
                FROM user_assessments 
                WHERE user_id = $1
                ORDER BY assessment_type, created_at DESC
              `, [targetUserId]);
                            const stepDataResult = await pool.query(`
                SELECT step_id, data, created_at, updated_at
                FROM workshop_step_data 
                WHERE user_id = $1
                ORDER BY step_id
              `, [targetUserId]);
                            userData = {
                                user: user,
                                assessments: assessmentsResult.rows,
                                stepData: stepDataResult.rows
                            };
                            console.log('✅ Fetched complete user data for Report Talia:', {
                                targetUserId: targetUserId,
                                selectedUserId: context.selectedUserId,
                                userName: user.name,
                                assessmentCount: assessmentsResult.rows.length,
                                stepDataCount: stepDataResult.rows.length,
                                userDataStructure: {
                                    hasUser: !!userData.user,
                                    hasAssessments: !!userData.assessments,
                                    hasStepData: !!userData.stepData
                                }
                            });
                        }
                        else {
                            console.warn(`⚠️ No user found with ID: ${targetUserId}`);
                        }
                    }
                    catch (error) {
                        console.error('❌ Error fetching complete user data:', error);
                    }
                }
                claudeContext = {
                    reportContext: context.reportContext,
                    selectedUserId: context.selectedUserId,
                    selectedUserName: context.selectedUserName,
                    userPersonalization: userCoachingContext,
                    userData: userData
                };
            }
            else {
                console.log('🔧 Workshop mode detected - using Reflection Talia persona');
                personaType = 'talia_coach';
                const userCoachingContext = userId ? await userLearningService.getUserCoachingContext(userId.toString()) : '';
                claudeContext = {
                    stepName: context?.stepName,
                    strengthLabel: context?.strengthLabel,
                    currentStep: context?.currentStep,
                    workshopType: context?.workshopType,
                    questionText: context?.questionText,
                    workshopContext: context?.workshopContext,
                    userPersonalization: userCoachingContext
                };
            }
            console.log('🤖 Claude API call with:', { personaType, targetUserId, userName, claudeContext });
            const isHolisticReportGeneration = context?.reportContext === 'holistic_generation';
            if (isHolisticReportGeneration) {
                console.log('🚀 HOLISTIC REPORT GENERATION - Skipping coaching route processing, going directly to Claude API');
                const optimizedContext = {
                    reportContext: 'holistic_generation',
                    selectedUserId: context.selectedUserId,
                    selectedUserName: context.selectedUserName,
                    userData: context.userData,
                    starCardImageBase64: context.starCardImageBase64,
                    tokenOptimized: true
                };
                console.log('🔧 Using token-optimized processing for holistic report generation');
                const originalSize = JSON.stringify(context.userData).length;
                console.log(`📊 Original userData size: ${originalSize} characters (~${Math.round(originalSize / 4)} tokens)`);
                const response = await generateOpenAICoachingResponse({
                    userMessage: message,
                    personaType: personaType,
                    userName: userName,
                    contextData: optimizedContext,
                    userId: targetUserId,
                    sessionId: req.sessionID,
                    maxTokens: 25000
                });
                console.log('✅ Holistic report generated successfully via optimized path');
                const responseEntry = {
                    timestamp: new Date().toISOString(),
                    userId: userId || 'anonymous',
                    sessionId: req.sessionID,
                    taliaResponse: response,
                    persona,
                    context,
                    source: 'holistic_optimized',
                    type: 'holistic_report'
                };
                console.log('💾 HOLISTIC REPORT LOG:', JSON.stringify(responseEntry, null, 2));
                conversationLoggingService.logConversation({
                    personaType: personaType,
                    userId: targetUserId,
                    sessionId: req.sessionID,
                    userMessage: message,
                    taliaResponse: response,
                    contextData: optimizedContext,
                    requestData: {
                        originalPersona: persona,
                        requestTimestamp: new Date().toISOString(),
                        reportType: 'holistic_generation',
                        userAgent: req.headers['user-agent'],
                        clientIp: req.ip
                    },
                    responseMetadata: {
                        confidence: 0.9,
                        source: 'holistic_optimized',
                        tokensUsed: 25000
                    },
                    conversationOutcome: 'completed'
                }).catch(error => {
                    console.warn('⚠️ Failed to log holistic report conversation to METAlia:', error);
                });
                try {
                    const { reportQualityMonitor } = await import('../services/report-quality-monitor.js');
                    reportQualityMonitor.analyzeReportQuality(response, targetUserId, 'personal', context.userData).then(issues => {
                        if (issues.length > 0) {
                            console.log(`📊 METAlia: Detected ${issues.length} quality issues in holistic report for user ${targetUserId}`);
                        }
                        else {
                            console.log(`✅ METAlia: Holistic report for user ${targetUserId} passed quality checks`);
                        }
                    }).catch(error => {
                        console.warn('⚠️ METAlia quality analysis failed:', error);
                    });
                }
                catch (error) {
                    console.warn('⚠️ Could not load report quality monitor:', error);
                }
                return res.json({
                    response: response,
                    confidence: 0.9,
                    timestamp: new Date().toISOString(),
                    source: 'holistic_optimized'
                });
            }
            const isReportTalia = persona === 'star_report';
            const maxTokens = isReportTalia ? 8000 : 400;
            console.log('🔧 Coaching route context check:', {
                persona,
                reportContext: context?.reportContext,
                isReportTalia,
                isHolisticReportGeneration
            });
            if (isReportTalia && !isHolisticReportGeneration) {
                console.log('👩‍💼 Report Talia - enabling enhanced training mode and document access');
                try {
                    const { textSearchService } = await import('../services/text-search-service.js');
                    const { taliaTrainingService } = await import('../services/talia-training-service.js');
                    let contextQueries = [
                        message,
                        'talia coaching methodology training guidelines',
                        'document review and analysis',
                        'AST workshop methodology',
                        'coaching principles and approach'
                    ];
                    if (message.toLowerCase().includes('document') &&
                        (message.toLowerCase().includes('access') || message.toLowerCase().includes('available') || message.toLowerCase().includes('have'))) {
                        contextQueries.push('Report Talia Training Doc', 'talia report generation capabilities', 'available documents and templates', 'document access scope', 'training manual overview');
                    }
                    if (message.toLowerCase().includes('report') &&
                        (message.toLowerCase().includes('create') || message.toLowerCase().includes('generate') || message.toLowerCase().includes('write'))) {
                        contextQueries.push('Talia Report Generation Prompt', 'Personal Development Report guidelines', 'Professional Profile Report requirements', 'sample report templates', 'report generation methodology');
                    }
                    const documentContext = await textSearchService.generateContextForAI(contextQueries, {
                        maxChunksPerQuery: 4,
                        contextStyle: 'detailed',
                        documentTypes: ['coaching_guide', 'methodology', 'ast_training_material', 'report_template']
                    });
                    let trainingHistory = '';
                    let reportInfluence = '';
                    if (message.toLowerCase().includes('training') ||
                        message.toLowerCase().includes('learn') ||
                        message.toLowerCase().includes('feedback') ||
                        message.toLowerCase().includes('conversation')) {
                        trainingHistory = await taliaTrainingService.getTrainingConversationHistory('star_report');
                        console.log('📖 Retrieved training conversation history for admin discussion');
                    }
                    if (message.toLowerCase().includes('report') ||
                        message.toLowerCase().includes('holistic') ||
                        message.toLowerCase().includes('generation')) {
                        reportInfluence = await taliaTrainingService.getTrainingInfluenceOnReports('star_report');
                        console.log('📊 Retrieved training influence on report generation');
                    }
                    claudeContext.adminTrainingMode = true;
                    claudeContext.documentContext = documentContext.context;
                    claudeContext.availableDocuments = documentContext.metadata.documentSources;
                    claudeContext.searchedTerms = documentContext.metadata.searchTerms;
                    claudeContext.foundChunks = documentContext.metadata.totalChunks;
                    claudeContext.trainingConversationHistory = trainingHistory;
                    claudeContext.reportTrainingInfluence = reportInfluence;
                    console.log(`📚 Retrieved ${documentContext.metadata.totalChunks} document chunks from ${documentContext.metadata.documentSources.length} sources`);
                    if (trainingHistory)
                        console.log('📖 Added training conversation history to context');
                    if (reportInfluence)
                        console.log('📊 Added report training influence to context');
                }
                catch (error) {
                    console.warn('Could not load document context for admin Talia:', error);
                }
            }
            const response = await generateOpenAICoachingResponse({
                userMessage: message,
                personaType: personaType,
                userName: userName,
                contextData: claudeContext,
                userId: targetUserId,
                sessionId: req.sessionID,
                maxTokens: maxTokens
            });
            console.log('✅ Claude response generated successfully');
            const responseEntry = {
                timestamp: new Date().toISOString(),
                userId: userId || 'anonymous',
                sessionId: req.sessionID,
                taliaResponse: response,
                persona,
                context,
                source: 'claude_api',
                type: 'talia_response'
            };
            console.log('💾 TALIA RESPONSE LOG:', JSON.stringify(responseEntry, null, 2));
            conversationLoggingService.logConversation({
                personaType: personaType,
                userId: targetUserId,
                sessionId: req.sessionID,
                userMessage: message,
                taliaResponse: response,
                contextData: claudeContext,
                requestData: {
                    originalPersona: persona,
                    requestTimestamp: new Date().toISOString(),
                    userAgent: req.headers['user-agent'],
                    clientIp: req.ip
                },
                responseMetadata: {
                    confidence: 0.9,
                    source: 'claude_api',
                    tokensUsed: maxTokens
                },
                conversationOutcome: 'completed'
            }).catch(error => {
                console.warn('⚠️ Failed to log conversation to METAlia:', error);
            });
            if (persona && message && response) {
                try {
                    const { conversationLearningService } = await import('../services/conversation-learning-service.js');
                    conversationLearningService.analyzeConversation(persona, message, response, undefined, {
                        context,
                        userId,
                        sessionId: req.sessionID,
                        timestamp: new Date().toISOString()
                    }).then(async (learning) => {
                        await conversationLearningService.updateLearningDocument(persona, learning);
                        console.log(`🧠 Learning captured for persona: ${persona}`);
                    }).catch(learningError => {
                        console.warn('⚠️ Learning capture failed:', learningError.message);
                    });
                }
                catch (learningServiceError) {
                    console.warn('⚠️ Learning service unavailable:', learningServiceError.message);
                }
            }
            res.json({
                response: response,
                confidence: 0.9,
                timestamp: new Date().toISOString(),
                source: 'claude_api'
            });
        }
        catch (claudeError) {
            console.warn('⚠️ Claude API unavailable, using fallback responses:', claudeError.message);
            const strengthName = context?.strengthLabel || context?.strength?.name || 'your strength';
            const stepName = context?.stepName || 'this step';
            const questionText = context?.questionText || `your ${strengthName} strength reflection`;
            const coachingResponses = [
                `Hi! I'm Talia, here to help. I see you're working on: "${questionText}". Your task is to write 2-3 sentences about this. Can you give me a specific example of when this happened?`,
                `Hi, I'm Talia! Let's focus on your current reflection: "${questionText}". You need to write 2-3 sentences about this. What made that particular situation stand out to you?`,
                `Hello! I'm Talia, here to help with your current reflection. The question you're working on is: "${questionText}". Your task is to write 2-3 sentences. What exactly did you do in that situation?`,
                `Hi there! I'm Talia. I can see you're reflecting on: "${questionText}". You need to write 2-3 sentences about this. How did that feel different from other situations?`,
                `Hello! I'm Talia. Your current reflection task is: "${questionText}". You need to write 2-3 sentences. What was the outcome when you applied that approach?`
            ];
            const responseIndex = Math.floor(Math.random() * coachingResponses.length);
            const response = coachingResponses[responseIndex];
            const fallbackEntry = {
                timestamp: new Date().toISOString(),
                userId: userId || 'anonymous',
                sessionId: req.sessionID,
                taliaResponse: response,
                persona,
                context,
                source: 'fallback',
                type: 'talia_response'
            };
            console.log('💾 TALIA RESPONSE LOG:', JSON.stringify(fallbackEntry, null, 2));
            conversationLoggingService.logConversation({
                personaType: 'talia_coach',
                userId: userId,
                sessionId: req.sessionID,
                userMessage: message,
                taliaResponse: response,
                contextData: context,
                requestData: {
                    originalPersona: persona,
                    requestTimestamp: new Date().toISOString(),
                    userAgent: req.headers['user-agent'],
                    clientIp: req.ip
                },
                responseMetadata: {
                    confidence: 0.7,
                    source: 'fallback',
                    tokensUsed: 0
                },
                conversationOutcome: 'completed'
            }).catch(error => {
                console.warn('⚠️ Failed to log fallback conversation to METAlia:', error);
            });
            res.json({
                response: response,
                confidence: 0.7,
                timestamp: new Date().toISOString(),
                source: 'fallback'
            });
        }
    }
    catch (error) {
        console.error('❌ Error in coaching chat:', error);
        const errorResponse = "I'm sorry, I'm having trouble responding right now. Please try again in a moment.";
        conversationLoggingService.logConversation({
            personaType: persona || 'unknown',
            userId: req.session?.userId,
            sessionId: req.sessionID,
            userMessage: message || 'Unknown message',
            taliaResponse: errorResponse,
            contextData: context || {},
            requestData: {
                originalPersona: persona,
                requestTimestamp: new Date().toISOString(),
                userAgent: req.headers['user-agent'],
                clientIp: req.ip
            },
            responseMetadata: {
                confidence: 0.0,
                source: 'system_error',
                tokensUsed: 0,
                error: error.message
            },
            conversationOutcome: 'error'
        }).catch(loggingError => {
            console.warn('⚠️ Failed to log system error conversation to METAlia:', loggingError);
        });
        res.status(500).json({
            response: errorResponse,
            error: 'Failed to process coaching request'
        });
    }
});
router.post('/conversation-end', async (req, res) => {
    try {
        const { messages, context } = req.body;
        const userId = req.session?.userId;
        console.log('🧠 Processing conversation end for user learning:', {
            userId,
            messageCount: messages?.length,
            context: context?.stepName
        });
        if (!userId || !messages || messages.length <= 1) {
            return res.json({ success: false, message: 'No significant conversation to analyze' });
        }
        const { userLearningService } = await import('../services/user-learning-service.js');
        await userLearningService.processConversationEnd(userId.toString(), messages, context);
        res.json({
            success: true,
            message: 'Conversation analyzed for user learning',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ Error in conversation-end analysis:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process conversation for learning'
        });
    }
});
router.get('/flow-attributes', async (req, res) => {
    try {
        const flowAttributes = [
            "Abstract", "Analytic", "Astute", "Big Picture", "Curious",
            "Focused", "Insightful", "Logical", "Investigative", "Rational",
            "Reflective", "Sensible", "Strategic", "Thoughtful",
            "Bold", "Competitive", "Decisive", "Determined", "Direct",
            "Dynamic", "Energetic", "Entrepreneurial", "Fast-paced", "Hands-on",
            "Independent", "Initiative", "Opportunistic", "Results-focused",
            "Collaborative", "Compassionate", "Diplomatic", "Empathetic", "Encouraging",
            "Harmonious", "Inclusive", "Inspiring", "Intuitive", "People-focused",
            "Relational", "Supportive", "Team-oriented", "Trusting",
            "Careful", "Consistent", "Detailed", "Disciplined", "Methodical",
            "Organized", "Patient", "Precise", "Process-oriented", "Quality-focused",
            "Reliable", "Steady", "Structured", "Systematic"
        ];
        res.json({
            success: true,
            attributes: flowAttributes,
            totalCount: flowAttributes.length,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error getting flow attributes:', error);
        res.status(500).json({ error: 'Failed to get flow attributes' });
    }
});
router.get('/cantril-ladder/:userId?', async (req, res) => {
    try {
        const userId = req.params.userId || req.session?.userId;
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User ID required'
            });
        }
        const { Pool } = await import('pg');
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
        const query = `
      SELECT rating, created_at 
      FROM cantril_ladder_assessments 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
        const result = await pool.query(query, [userId]);
        if (result.rows.length === 0) {
            return res.json({
                success: true,
                rating: null,
                message: 'No Cantril Ladder rating found for user',
                timestamp: new Date().toISOString()
            });
        }
        const { rating, created_at } = result.rows[0];
        res.json({
            success: true,
            rating: rating,
            assessmentDate: created_at,
            message: `Cantril Ladder rating: ${rating}/10`,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error getting Cantril Ladder rating:', error);
        res.json({
            success: false,
            rating: null,
            message: 'Could not retrieve Cantril Ladder rating',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});
router.post('/vision-images', async (req, res) => {
    try {
        const userId = req.session?.userId;
        const { images, reflection } = req.body;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User authentication required'
            });
        }
        if (!images || !Array.isArray(images) || images.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'At least one image is required'
            });
        }
        if (images.length > 5) {
            return res.status(400).json({
                success: false,
                error: 'Maximum 5 images allowed'
            });
        }
        const { photoStorageService } = await import('../services/photo-storage-service.js');
        const storedImages = [];
        for (const imageData of images) {
            const { url, source, description, originalFilename } = imageData;
            const storedImage = await photoStorageService.storeVisionImage({
                userId: userId.toString(),
                imageUrl: url,
                source: source || 'unknown',
                description: description || '',
                originalFilename: originalFilename || null,
                workshopStep: '4-3',
                exerciseType: 'vision_images'
            });
            storedImages.push(storedImage);
        }
        let reflectionId = null;
        if (reflection && reflection.trim()) {
            const { Pool } = await import('pg');
            const pool = new Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
            });
            const reflectionQuery = `
        INSERT INTO vision_reflections (user_id, reflection_text, workshop_step, created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING id
      `;
            const reflectionResult = await pool.query(reflectionQuery, [
                userId,
                reflection.trim(),
                '4-3'
            ]);
            reflectionId = reflectionResult.rows[0]?.id;
        }
        console.log(`💾 Vision images stored for user ${userId}:`, {
            imageCount: storedImages.length,
            reflectionStored: !!reflectionId,
            timestamp: new Date().toISOString()
        });
        res.json({
            success: true,
            message: `Successfully stored ${storedImages.length} vision images`,
            images: storedImages,
            reflectionId: reflectionId,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error storing vision images:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to store vision images',
            details: error.message
        });
    }
});
router.get('/vision-images/:userId?', async (req, res) => {
    try {
        const userId = req.params.userId || req.session?.userId;
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User ID required'
            });
        }
        const { photoStorageService } = await import('../services/photo-storage-service.js');
        const visionImages = await photoStorageService.getUserVisionImages(userId.toString());
        const { Pool } = await import('pg');
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
        const reflectionQuery = `
      SELECT reflection_text, created_at 
      FROM vision_reflections 
      WHERE user_id = $1 AND workshop_step = $2 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
        const reflectionResult = await pool.query(reflectionQuery, [userId, '4-3']);
        const reflection = reflectionResult.rows[0] || null;
        res.json({
            success: true,
            images: visionImages,
            reflection: reflection,
            imageCount: visionImages.length,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error getting vision images:', error);
        res.json({
            success: false,
            images: [],
            reflection: null,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});
router.get('/user-patterns/:userId?', async (req, res) => {
    try {
        const { userId } = req.params;
        const requestingUserId = req.session?.userId;
        const { userLearningService } = await import('../services/user-learning-service.js');
        if (userId) {
            const patterns = await userLearningService.getUserCoachingContext(userId);
            res.json({
                userId,
                patterns,
                timestamp: new Date().toISOString()
            });
        }
        else if (requestingUserId) {
            const patterns = await userLearningService.getUserCoachingContext(requestingUserId.toString());
            res.json({
                userId: requestingUserId,
                patterns,
                timestamp: new Date().toISOString()
            });
        }
        else {
            res.json({
                message: 'No user specified and no session found',
                timestamp: new Date().toISOString()
            });
        }
    }
    catch (error) {
        console.error('Error getting user patterns:', error);
        res.status(500).json({ error: 'Failed to get user patterns' });
    }
});
router.get('/profiles', async (req, res) => {
    try {
        res.json({
            message: 'Profiles endpoint working',
            status: 'development',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get profiles' });
    }
});
router.get('/reflection-area/:areaId/status', async (req, res) => {
    try {
        const { areaId } = req.params;
        console.log('🔍 Checking reflection area status (public):', areaId);
        try {
            const { CURRENT_REFLECTION_AREAS } = await import('./persona-management-routes.js');
            const area = CURRENT_REFLECTION_AREAS.find(a => a.id === areaId);
            if (!area) {
                return res.json({
                    success: true,
                    area: {
                        id: areaId,
                        enabled: false,
                        name: `Reflection Area ${areaId}`,
                        workshopStep: areaId.replace('step_', '').replace('_', '-')
                    }
                });
            }
            res.json({
                success: true,
                area: {
                    id: area.id,
                    enabled: area.enabled,
                    name: area.name,
                    workshopStep: area.workshopStep
                }
            });
        }
        catch (importError) {
            console.warn('Could not import reflection areas, using fallback:', importError);
            res.json({
                success: true,
                area: {
                    id: areaId,
                    enabled: true,
                    name: `Reflection Area ${areaId}`,
                    workshopStep: areaId.replace('step_', '').replace('_', '-')
                }
            });
        }
    }
    catch (error) {
        console.error('Error checking reflection area status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check reflection area status'
        });
    }
});
export default router;
