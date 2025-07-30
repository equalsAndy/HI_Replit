import { Router } from 'express';
// import { VectorDBService } from '../services/vector-db.js'; // Temporarily disabled

const router = Router();
// const vectorDB = new VectorDBService(); // Temporarily disabled

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

    // Check for TRAIN command
    if (taliaTrainingService.isTrainCommand(message)) {
      // Allow training for both ast_reflection and talia_coach personas
      if (persona !== 'ast_reflection' && persona !== 'talia_coach') {
        return res.json({
          response: "Training mode is only available for Talia coaching personas.",
          confidence: 1.0,
          timestamp: new Date().toISOString(),
          source: 'training_system'
        });
      }

      // Enter training mode
      const session = await taliaTrainingService.enterTrainingMode(userId?.toString() || 'anonymous', persona);
      const trainingStartResponse = "🎓 **TRAINING MODE ACTIVATED**\n\nHi! I'm now in training mode. You can help me improve my coaching by:\n\n• Explaining what behavior you'd like me to change\n• Giving examples of better responses\n• Sharing specific coaching improvements\n\nWhen you're done, just say 'done' or 'finished' and I'll save this training to my permanent knowledge. How would you like me to improve?";
      
      // Log training mode start
      const trainingEntry = {
        timestamp: new Date().toISOString(),
        userId: userId || 'anonymous',
        sessionId: req.sessionID,
        taliaResponse: trainingStartResponse,
        persona,
        context,
        source: 'training_system',
        type: 'training_start',
        trainingSessionId: session.id
      };
      console.log('💾 TALIA TRAINING LOG:', JSON.stringify(trainingEntry, null, 2));
      
      return res.json({
        response: trainingStartResponse,
        confidence: 1.0,
        timestamp: new Date().toISOString(),
        source: 'training_system',
        metadata: { trainingMode: true, sessionId: session.id }
      });
    }

    // Check if user is in training mode
    if (taliaTrainingService.isInTrainingMode(userId?.toString() || 'anonymous')) {
      try {
        const trainingResponse = await taliaTrainingService.processTrainingMessage(
          userId?.toString() || 'anonymous', 
          message
        );
        return res.json({
          response: trainingResponse,
          confidence: 1.0,
          timestamp: new Date().toISOString(),
          source: 'training_system',
          metadata: { trainingMode: true }
        });
      } catch (trainingError) {
        console.error('❌ Training error:', trainingError);
        return res.json({
          response: "Sorry, there was an issue with the training system. Training mode has been deactivated.",
          confidence: 0.5,
          timestamp: new Date().toISOString(),
          source: 'training_system'
        });
      }
    }
    
    // Try to use Claude API for intelligent responses
    try {
      const { generateClaudeCoachingResponse } = await import('../services/claude-api-service.js');
      
      // Get user-specific coaching context for personalization
      const userCoachingContext = userId ? await userLearningService.getUserCoachingContext(userId.toString()) : '';
      
      // Build context for Claude
      const claudeContext = {
        stepName: context?.stepName,
        strengthLabel: context?.strengthLabel,
        currentStep: context?.currentStep,
        workshopType: context?.workshopType,
        questionText: context?.questionText,
        workshopContext: context?.workshopContext,
        userPersonalization: userCoachingContext
      };
      
      const response = await generateClaudeCoachingResponse({
        userMessage: message,
        personaType: 'talia_coach',
        userName: 'there', // Generic greeting since we don't have user name in session
        contextData: claudeContext,
        userId: userId,
        sessionId: req.sessionID,
        maxTokens: 400
      });
      
      console.log('✅ Claude response generated successfully');
      
      // Log Talia's response for review
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
      
      // Log fallback response for review
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
      
      res.json({ 
        response: response,
        confidence: 0.7,
        timestamp: new Date().toISOString(),
        source: 'fallback'
      });
    }
    
  } catch (error) {
    console.error('❌ Error in coaching chat:', error);
    res.status(500).json({ 
      response: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
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

export default router;
