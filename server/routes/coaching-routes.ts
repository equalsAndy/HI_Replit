import { Router } from 'express';
import { Pool } from 'pg';
import { conversationLoggingService } from '../services/conversation-logging-service.js';
// import { VectorDBService } from '../services/vector-db.js'; // Temporarily disabled

const router = Router();
// const vectorDB = new VectorDBService(); // Temporarily disabled

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize vector database (call once on startup)
router.post('/vector/init', async (req, res) => {
  try {
    const success = await vectorDB.initializeCollections();
    res.json({ success, message: success ? 'Vector DB initialized' : 'Failed to initialize' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to initialize vector database' });
  }
});

// Test vector database connection
router.get('/vector/status', async (req, res) => {
  try {
    const connected = await vectorDB.testConnection();
    res.json({ 
      status: connected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check vector database status' });
  }
});

// Basic knowledge endpoint for testing
router.get('/knowledge', async (req, res) => {
  try {
    // For now, return a basic response
    res.json({ 
      message: 'Knowledge base endpoint working',
      status: 'development',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get knowledge base' });
  }
});

// Check AI coaching availability (public endpoint)
router.get('/status', async (req, res) => {
  try {
    // Import personas configuration
    const { CURRENT_PERSONAS } = await import('./persona-management-routes.js');
    
    // Check if ast_reflection persona is enabled
    const reflectionPersona = CURRENT_PERSONAS.find(p => p.id === 'ast_reflection');
    const isAICoachingEnabled = reflectionPersona?.enabled === true;
    
    res.json({
      aiCoachingEnabled: isAICoachingEnabled,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking AI coaching status:', error);
    // Default to disabled on error
    res.json({
      aiCoachingEnabled: false,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      error: 'Failed to check AI status'
    });
  }
});

// Chat endpoint for coaching modal
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

    // Save all Talia conversations for later review
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

    // For development: Allow chat without user ID but log a warning
    if (!userId) {
      console.warn('⚠️ No userId in session, proceeding with anonymous chat for development');
    }

    // Import training and user learning services
    const { taliaTrainingService } = await import('../services/talia-training-service.js');
    const { userLearningService } = await import('../services/user-learning-service.js');

    // TRAIN command has been replaced by METAlia escalation system
    // Users can no longer directly train personas - improvements are now handled through escalations

    // Training mode has been removed - all improvements now handled through METAlia escalation system
    
    // Use OpenAI API for intelligent responses
    try {
      const { generateOpenAICoachingResponse } = await import('../services/openai-api-service.js');
      
      // Handle different context structures based on persona
      let claudeContext;
      let personaType;
      let targetUserId = userId;
      let userName = 'there';
      
      if (persona === 'star_report') {
        // Report Talia with selected user context
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
        
        // Warn if no user is selected
        if (!context.selectedUserId) {
          console.warn('⚠️ No selectedUserId provided - Report Talia will use admin data instead of selected user data');
        }
        
        // Get user-specific coaching context for the selected user
        const userCoachingContext = targetUserId ? await userLearningService.getUserCoachingContext(targetUserId.toString()) : '';
        
        // Fetch complete user data for Report Talia from database
        let userData = null;
        if (targetUserId) {
          try {
            console.log(`🔍 Fetching user data for targetUserId: ${targetUserId} (type: ${typeof targetUserId})`);
            
            // Get basic user info
            const userResult = await pool.query(
              'SELECT id, name, username, email, ast_completed_at, created_at FROM users WHERE id = $1',
              [targetUserId]
            );
            
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
              
              // Get assessment data
              const assessmentsResult = await pool.query(`
                SELECT assessment_type, results, created_at
                FROM user_assessments 
                WHERE user_id = $1
                ORDER BY assessment_type, created_at DESC
              `, [targetUserId]);
              
              // Get step data
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
            } else {
              console.warn(`⚠️ No user found with ID: ${targetUserId}`);
            }
          } catch (error) {
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
      } else {
        // Regular workshop mode - Reflection Talia
        console.log('🔧 Workshop mode detected - using Reflection Talia persona');
        personaType = 'talia_coach';
        
        // Get user-specific coaching context for personalization
        const userCoachingContext = userId ? await userLearningService.getUserCoachingContext(userId.toString()) : '';
        
        // Per-exercise admin instructions (IA/AST) by step
        let exerciseInstruction = '';
        try {
          const stepId = context?.currentStep as string | undefined;
          if (stepId) {
            const workshopType = stepId.startsWith('ia-') ? 'ia' : 'ast';
            const { Pool } = await import('pg');
            const pool2 = new Pool({
              connectionString: process.env.DATABASE_URL,
              ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
            });
            await pool2.query(`CREATE TABLE IF NOT EXISTS ai_exercise_instructions (
              id SERIAL PRIMARY KEY,
              workshop_type VARCHAR(10) NOT NULL DEFAULT 'ia',
              step_id VARCHAR(32) NOT NULL,
              instruction TEXT NOT NULL,
              enabled BOOLEAN NOT NULL DEFAULT TRUE,
              created_by INTEGER,
              created_at TIMESTAMP DEFAULT NOW(),
              updated_at TIMESTAMP DEFAULT NOW(),
              UNIQUE(workshop_type, step_id)
            );`);
            const r = await pool2.query('SELECT instruction FROM ai_exercise_instructions WHERE workshop_type=$1 AND step_id=$2 AND enabled=TRUE', [workshopType, stepId]);
            exerciseInstruction = r.rows?.[0]?.instruction || '';
          }
        } catch (e) {
          console.warn('⚠️ Could not load per-exercise instruction:', e);
        }

        claudeContext = {
          stepName: context?.stepName,
          strengthLabel: context?.strengthLabel,
          currentStep: context?.currentStep,
          workshopType: context?.workshopType,
          questionText: context?.questionText,
          workshopContext: context?.workshopContext,
          userPersonalization: userCoachingContext,
          exerciseInstruction,
          exerciseGlobalInstruction: await (async () => {
            try {
              const { Pool } = await import('pg');
              const pool3 = new Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
              });
              const r = await pool3.query('SELECT instruction FROM ai_exercise_instructions WHERE workshop_type=$1 AND step_id=$2 AND enabled=TRUE', ['ia', '__global__']);
              return r.rows?.[0]?.instruction || '';
            } catch {
              return '';
            }
          })()
        };
      }
      
      console.log('🤖 Claude API call with:', { personaType, targetUserId, userName, claudeContext });
      
      // IMMEDIATE EXIT for holistic report generation to prevent token overload
      const isHolisticReportGeneration = context?.reportContext === 'holistic_generation';
      if (isHolisticReportGeneration) {
        console.log('🚀 HOLISTIC REPORT GENERATION - Skipping coaching route processing, going directly to Claude API');
        
        // Pass the raw data but mark it for optimized processing
        const optimizedContext = {
          reportContext: 'holistic_generation',
          selectedUserId: context.selectedUserId,
          selectedUserName: context.selectedUserName,
          userData: context.userData, // Full data for processing but will be optimized
          starCardImageBase64: context.starCardImageBase64,
          tokenOptimized: true // Flag to use optimized processing
        };
        
        console.log('🔧 Using token-optimized processing for holistic report generation');
        const originalSize = JSON.stringify(context.userData).length;
        console.log(`📊 Original userData size: ${originalSize} characters (~${Math.round(originalSize/4)} tokens)`);
        
        // Go directly to generateOpenAICoachingResponse with optimized context
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
        
        // Log Talia's response for review (legacy console logging)
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

        // METAlia conversation logging for holistic reports
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
            tokensUsed: 25000 // High estimate for holistic reports
          },
          conversationOutcome: 'completed'
        }).catch(error => {
          console.warn('⚠️ Failed to log holistic report conversation to METAlia:', error);
        });

        // METAlia report quality monitoring (asynchronous)
        try {
          const { reportQualityMonitor } = await import('../services/report-quality-monitor.js');
          reportQualityMonitor.analyzeReportQuality(
            response,
            targetUserId,
            'personal',
            context.userData
          ).then(issues => {
            if (issues.length > 0) {
              console.log(`📊 METAlia: Detected ${issues.length} quality issues in holistic report for user ${targetUserId}`);
            } else {
              console.log(`✅ METAlia: Holistic report for user ${targetUserId} passed quality checks`);
            }
          }).catch(error => {
            console.warn('⚠️ METAlia quality analysis failed:', error);
          });
        } catch (error) {
          console.warn('⚠️ Could not load report quality monitor:', error);
        }
        
        return res.json({ 
          response: response,
          confidence: 0.9,
          timestamp: new Date().toISOString(),
          source: 'holistic_optimized'
        });
      }
      
      // Report Talia should have no token limits and enhanced document access
      const isReportTalia = persona === 'star_report';
      const maxTokens = isReportTalia ? 8000 : 400; // Unlimited for report interface
      
      console.log('🔧 Coaching route context check:', {
        persona,
        reportContext: context?.reportContext,
        isReportTalia,
        isHolisticReportGeneration
      });
      
      // Report Talia automatically gets training mode and document context
      // BUT NOT for holistic report generation which needs token optimization
      if (isReportTalia && !isHolisticReportGeneration) {
        console.log('👩‍💼 Report Talia - enabling enhanced training mode and document access');
        
        try {
          // Get comprehensive document training context
          const { textSearchService } = await import('../services/text-search-service.js');
          const { taliaTrainingService } = await import('../services/talia-training-service.js');
          
          // Search for relevant documents based on user message
          let contextQueries = [
            message, // Search based on user's actual message
            'talia coaching methodology training guidelines',
            'document review and analysis', 
            'AST workshop methodology',
            'coaching principles and approach'
          ];

          // Add specific queries for capability/document access questions
          if (message.toLowerCase().includes('document') && 
              (message.toLowerCase().includes('access') || message.toLowerCase().includes('available') || message.toLowerCase().includes('have'))) {
            contextQueries.push(
              'Report Talia Training Doc',
              'talia report generation capabilities',
              'available documents and templates',
              'document access scope',
              'training manual overview'
            );
          }

          // Add specific queries for report generation questions
          if (message.toLowerCase().includes('report') && 
              (message.toLowerCase().includes('create') || message.toLowerCase().includes('generate') || message.toLowerCase().includes('write'))) {
            contextQueries.push(
              'Talia Report Generation Prompt',
              'Personal Development Report guidelines',
              'Professional Profile Report requirements',
              'sample report templates',
              'report generation methodology'
            );
          }

          const documentContext = await textSearchService.generateContextForAI(contextQueries, {
            maxChunksPerQuery: 4,
            contextStyle: 'detailed',
            documentTypes: ['coaching_guide', 'methodology', 'ast_training_material', 'report_template']
          });
          
          // Get training conversation history if user asks about training or learning
          let trainingHistory = '';
          let reportInfluence = '';
          
          if (message.toLowerCase().includes('training') || 
              message.toLowerCase().includes('learn') || 
              message.toLowerCase().includes('feedback') ||
              message.toLowerCase().includes('conversation')) {
            trainingHistory = await taliaTrainingService.getTrainingConversationHistory('star_report');
            console.log('📖 Retrieved training conversation history for admin discussion');
          }
          
          // Get report generation influence if discussing reports
          if (message.toLowerCase().includes('report') || 
              message.toLowerCase().includes('holistic') || 
              message.toLowerCase().includes('generation')) {
            reportInfluence = await taliaTrainingService.getTrainingInfluenceOnReports('star_report');
            console.log('📊 Retrieved training influence on report generation');
          }
          
          // Enhance context with training mode, document access, and training conversation data
          claudeContext.adminTrainingMode = true;
          claudeContext.documentContext = documentContext.context;
          claudeContext.availableDocuments = documentContext.metadata.documentSources;
          claudeContext.searchedTerms = documentContext.metadata.searchTerms;
          claudeContext.foundChunks = documentContext.metadata.totalChunks;
          claudeContext.trainingConversationHistory = trainingHistory;
          claudeContext.reportTrainingInfluence = reportInfluence;
          
          console.log(`📚 Retrieved ${documentContext.metadata.totalChunks} document chunks from ${documentContext.metadata.documentSources.length} sources`);
          if (trainingHistory) console.log('📖 Added training conversation history to context');
          if (reportInfluence) console.log('📊 Added report training influence to context');
          
        } catch (error) {
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
      
      // Log Talia's response for review (legacy console logging)
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

      // METAlia conversation logging (asynchronous - don't block response)
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
          tokensUsed: maxTokens // Estimate, could be improved with actual token usage
        },
        conversationOutcome: 'completed'
      }).catch(error => {
        console.warn('⚠️ Failed to log conversation to METAlia:', error);
      });
      
      // Capture learning from this conversation (async, don't block response)
      if (persona && message && response) {
        try {
          const { conversationLearningService } = await import('../services/conversation-learning-service.js');
          
          // Analyze conversation and update learning document (don't await to avoid blocking response)
          conversationLearningService.analyzeConversation(
            persona,
            message,
            response,
            undefined, // userFeedback will be captured separately if provided
            { 
              context, 
              userId, 
              sessionId: req.sessionID,
              timestamp: new Date().toISOString()
            }
          ).then(async (learning) => {
            await conversationLearningService.updateLearningDocument(persona, learning);
            console.log(`🧠 Learning captured for persona: ${persona}`);
          }).catch(learningError => {
            console.warn('⚠️ Learning capture failed:', learningError.message);
          });
          
        } catch (learningServiceError) {
          console.warn('⚠️ Learning service unavailable:', learningServiceError.message);
        }
      }
      
      res.json({ 
        response: response,
        confidence: 0.9,
        timestamp: new Date().toISOString(),
        source: 'claude_api'
      });
      
    } catch (claudeError) {
      console.warn('⚠️ Claude API unavailable, using fallback responses:', claudeError.message);
      
      // Fallback to simple context-aware responses
      const strengthName = context?.strengthLabel || context?.strength?.name || 'your strength';
      const stepName = context?.stepName || 'this step';
      
      // Task-focused coaching responses - always reference the specific reflection task
      const questionText = context?.questionText || `your ${strengthName} strength reflection`;
      const coachingResponses = [
        `Hi! I'm Talia, here to help. I see you're working on: "${questionText}". Your task is to write 2-3 sentences about this. Can you give me a specific example of when this happened?`,
        `Hi, I'm Talia! Let's focus on your current reflection: "${questionText}". You need to write 2-3 sentences about this. What made that particular situation stand out to you?`,
        `Hello! I'm Talia, here to help with your current reflection. The question you're working on is: "${questionText}". Your task is to write 2-3 sentences. What exactly did you do in that situation?`,
        `Hi there! I'm Talia. I can see you're reflecting on: "${questionText}". You need to write 2-3 sentences about this. How did that feel different from other situations?`,
        `Hello! I'm Talia. Your current reflection task is: "${questionText}". You need to write 2-3 sentences. What was the outcome when you applied that approach?`
      ];
      
      // Select a response based on message context or random
      const responseIndex = Math.floor(Math.random() * coachingResponses.length);
      const response = coachingResponses[responseIndex];
      
      // Log fallback response for review (legacy console logging)
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

      // METAlia conversation logging for fallback responses
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
          tokensUsed: 0 // Fallback responses don't use AI tokens
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
    
  } catch (error) {
    console.error('❌ Error in coaching chat:', error);
    
    const errorResponse = "I'm sorry, I'm having trouble responding right now. Please try again in a moment.";
    
    // METAlia conversation logging for system errors
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

// Conversation end analysis endpoint for user learning
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

    // Import user learning service
    const { userLearningService } = await import('../services/user-learning-service.js');
    
    // Process conversation for user learning
    await userLearningService.processConversationEnd(userId.toString(), messages, context);
    
    res.json({ 
      success: true, 
      message: 'Conversation analyzed for user learning',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error in conversation-end analysis:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to process conversation for learning' 
    });
  }
});

// Get flow attributes for Talia to use in step 3-4 guidance
router.get('/flow-attributes', async (req, res) => {
  try {
    // Flow attributes list from the frontend component
    const flowAttributes = [
      // Thinking attributes
      "Abstract", "Analytic", "Astute", "Big Picture", "Curious", 
      "Focused", "Insightful", "Logical", "Investigative", "Rational", 
      "Reflective", "Sensible", "Strategic", "Thoughtful",
      
      // Acting attributes  
      "Bold", "Competitive", "Decisive", "Determined", "Direct",
      "Dynamic", "Energetic", "Entrepreneurial", "Fast-paced", "Hands-on",
      "Independent", "Initiative", "Opportunistic", "Results-focused",
      
      // Feeling attributes
      "Collaborative", "Compassionate", "Diplomatic", "Empathetic", "Encouraging",
      "Harmonious", "Inclusive", "Inspiring", "Intuitive", "People-focused",
      "Relational", "Supportive", "Team-oriented", "Trusting",
      
      // Planning attributes
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
  } catch (error) {
    console.error('Error getting flow attributes:', error);
    res.status(500).json({ error: 'Failed to get flow attributes' });
  }
});

// Get user's Cantril Ladder rating for Talia to use in step 4-2 coaching
router.get('/cantril-ladder/:userId?', async (req, res) => {
  try {
    const userId = req.params.userId || req.session?.userId;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID required' 
      });
    }

    // Import database pool
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    // Query for the user's most recent Cantril Ladder rating
    // This assumes there's a table storing well-being assessments
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

  } catch (error) {
    console.error('Error getting Cantril Ladder rating:', error);
    
    // Return a fallback response that won't break Talia
    res.json({
      success: false,
      rating: null,
      message: 'Could not retrieve Cantril Ladder rating',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Store vision images for step 4-3 exercise
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

    // Import photo storage service
    const { photoStorageService } = await import('../services/photo-storage-service.js');
    
    // Store each image and collect the stored image data
    const storedImages = [];
    
    for (const imageData of images) {
      const { url, source, description, originalFilename } = imageData;
      
      // Store image in photo service database
      const storedImage = await photoStorageService.storeVisionImage({
        userId: userId.toString(),
        imageUrl: url,
        source: source || 'unknown', // 'upload' or 'unsplash'
        description: description || '',
        originalFilename: originalFilename || null,
        workshopStep: '4-3',
        exerciseType: 'vision_images'
      });
      
      storedImages.push(storedImage);
    }

    // Store the reflection if provided
    let reflectionId = null;
    if (reflection && reflection.trim()) {
      // Import database pool for storing reflection
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

  } catch (error) {
    console.error('Error storing vision images:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to store vision images',
      details: error.message
    });
  }
});

// Get user's vision images for step 4-3
router.get('/vision-images/:userId?', async (req, res) => {
  try {
    const userId = req.params.userId || req.session?.userId;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID required' 
      });
    }

    // Import photo storage service
    const { photoStorageService } = await import('../services/photo-storage-service.js');
    
    // Get user's vision images
    const visionImages = await photoStorageService.getUserVisionImages(userId.toString());
    
    // Get associated reflection
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

  } catch (error) {
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

// User learning patterns endpoint (for admin/testing)
router.get('/user-patterns/:userId?', async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.session?.userId;
    
    // Import user learning service
    const { userLearningService } = await import('../services/user-learning-service.js');
    
    if (userId) {
      // Get specific user patterns
      const patterns = await userLearningService.getUserCoachingContext(userId);
      res.json({
        userId,
        patterns,
        timestamp: new Date().toISOString()
      });
    } else if (requestingUserId) {
      // Get current user's patterns
      const patterns = await userLearningService.getUserCoachingContext(requestingUserId.toString());
      res.json({
        userId: requestingUserId,
        patterns,
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({
        message: 'No user specified and no session found',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error getting user patterns:', error);
    res.status(500).json({ error: 'Failed to get user patterns' });
  }
});

// Basic profiles endpoint for testing
router.get('/profiles', async (req, res) => {
  try {
    // For now, return a basic response
    res.json({ 
      message: 'Profiles endpoint working',
      status: 'development',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get profiles' });
  }
});

// Public endpoint to check if AI coaching is enabled for a specific reflection area/step
router.get('/reflection-area/:areaId/status', async (req, res) => {
  try {
    const { areaId } = req.params;
    
    console.log('🔍 Checking reflection area status (public):', areaId);

    // Try to import reflection areas from persona management
    try {
      const { CURRENT_REFLECTION_AREAS } = await import('./persona-management-routes.js');
      
      // Find the area in current memory storage
      const area = CURRENT_REFLECTION_AREAS.find(a => a.id === areaId);

      if (!area) {
        // Area not found, but return enabled=false instead of 404 for better UX
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

    } catch (importError) {
      // Fallback: return default enabled status if import fails
      console.warn('Could not import reflection areas, using fallback:', importError);
      res.json({
        success: true,
        area: {
          id: areaId,
          enabled: true, // Default to enabled for fallback
          name: `Reflection Area ${areaId}`,
          workshopStep: areaId.replace('step_', '').replace('_', '-')
        }
      });
    }

  } catch (error) {
    console.error('Error checking reflection area status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check reflection area status'
    });
  }
});

export default router;
