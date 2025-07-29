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

    // For development: Allow chat without user ID but log a warning
    if (!userId) {
      console.warn('⚠️ No userId in session, proceeding with anonymous chat for development');
    }

    // Import training service
    const { taliaTrainingService } = await import('../services/talia-training-service.js');

    // Check for TRAIN command
    if (taliaTrainingService.isTrainCommand(message)) {
      // Only allow training for ast_reflection persona
      if (persona !== 'ast_reflection') {
        return res.json({
          response: "Training mode is only available for Reflection Talia (ast_reflection persona).",
          confidence: 1.0,
          timestamp: new Date().toISOString(),
          source: 'training_system'
        });
      }

      // Enter training mode
      const session = await taliaTrainingService.enterTrainingMode(userId?.toString() || 'anonymous', persona);
      return res.json({
        response: "🎓 **TRAINING MODE ACTIVATED**\n\nHi! I'm now in training mode. You can help me improve my coaching by:\n\n• Explaining what behavior you'd like me to change\n• Giving examples of better responses\n• Sharing specific coaching improvements\n\nWhen you're done, just say 'done' or 'finished' and I'll save this training to my permanent knowledge. How would you like me to improve?",
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
      
      // Build context for Claude
      const claudeContext = {
        stepName: context?.stepName,
        strengthLabel: context?.strengthLabel,
        currentStep: context?.currentStep,
        workshopType: context?.workshopType,
        questionText: context?.questionText
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
      
      // Simple coaching responses based on strength context
      const coachingResponses = [
        `That's a great question about ${strengthName}! Let me help you explore this further. What specific situations bring out this strength in you?`,
        `I can see you're reflecting on ${strengthName} in ${stepName}. Here are some coaching questions to consider: When did you last use this strength effectively? What made that situation work well?`,
        `Your ${strengthName} strength is valuable! Think about a recent success where this strength played a key role. How did it help you overcome challenges?`,
        `Let's dive deeper into your ${strengthName} strength. Can you think of a specific example where using this strength made a real difference?`,
        `I notice you're working on understanding your ${strengthName} strength better. What patterns do you see in how you naturally use this strength?`
      ];
      
      // Select a response based on message context or random
      const responseIndex = Math.floor(Math.random() * coachingResponses.length);
      const response = coachingResponses[responseIndex];
      
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
