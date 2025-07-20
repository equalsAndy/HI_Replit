import { Router } from 'express';
import {
  generateCoachingResponse,
  getOrCreateConversation,
  saveCoachingMessage,
  getConversationHistory
} from '../services/coaching-chat-service.js';

const router = Router();

/**
 * Create or get a coaching conversation
 * POST /api/coaching/chat/conversation
 */
router.post('/conversation', async (req, res) => {
  try {
    const { persona, workshopStep } = req.body;
    
    // Check authentication using the same pattern as other routes
    const userId = (req.session as any)?.userId;
    const cookieUserId = req.cookies?.userId ? parseInt(req.cookies.userId) : null;
    const finalUserId = userId || cookieUserId;

    console.log('Coaching conversation auth check:', { 
      userId, 
      cookieUserId, 
      finalUserId,
      hasSession: !!req.session,
      sessionKeys: Object.keys(req.session || {}),
      fullSession: req.session
    });

    if (!finalUserId) {
      console.log('No user ID found in session or cookies');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    console.log(`Creating conversation for user ${finalUserId}, persona: ${persona}, workshopStep: ${workshopStep}`);
    
    const conversation = await getOrCreateConversation(finalUserId, persona, workshopStep);
    
    console.log('Conversation created successfully:', conversation.id);
    
    res.json({ 
      conversationId: conversation.id,
      title: conversation.conversation_title
    });

  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ 
      error: 'Failed to create conversation',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Send a message in a coaching conversation
 * POST /api/coaching/chat/message
 */
router.post('/message', async (req, res) => {
  try {
    const { conversationId, message, persona, context } = req.body;
    
    // Debug: Log what context we received
    console.log('🔍 DEBUG: Backend received context:', {
      conversationId,
      persona,
      context,
      fullBody: req.body
    });
    
    // Check authentication using the same pattern as other routes
    const sessionUserId = (req.session as any)?.userId;
    const cookieUserId = req.cookies?.userId ? parseInt(req.cookies.userId) : null;
    const userId = sessionUserId || cookieUserId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get conversation history
    const history = await getConversationHistory(conversationId);

    // Save user message
    await saveCoachingMessage(conversationId, 'user', message);

    // Debug: Log the context being passed
    console.log('🔍 DEBUG: Context received in route:', JSON.stringify(context, null, 2));

    // Generate AI response
    const response = await generateCoachingResponse(
      persona,
      message,
      {
        userProfile: {
          userId: userId,
          workshop_progress: context?.stepNumber ? `Step ${context.stepNumber}` : undefined,
          ...context
        }
      },
      context?.workshopStep
    );

    // Debug: Log what we're passing to generateCoachingResponse
    console.log('🔍 DEBUG: Calling generateCoachingResponse with:', {
      persona,
      message,
      userProfile: {
        userId: userId,
        workshop_progress: context?.stepNumber ? `Step ${context.stepNumber}` : undefined,
        ...context
      },
      workshopStep: context?.workshopStep
    });

    // Save AI response
    const { workshopStep, ...restMetadata } = response.metadata;
    await saveCoachingMessage(conversationId, 'assistant', response.content, {
      ...restMetadata,
      workshopStep: workshopStep || undefined
    });

    res.json({ 
      response: response.content,
      metadata: response.metadata
    });

  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

/**
 * Get conversation history
 * GET /api/coaching/chat/history/:conversationId
 */
router.get('/history/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    // Check authentication using both session and cookies
    const sessionUserId = (req.session as any)?.userId;
    const cookieUserId = req.cookies?.userId ? parseInt(req.cookies.userId) : null;
    const userId = sessionUserId || cookieUserId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const history = await getConversationHistory(conversationId);
    res.json({ history });

  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch conversation history' });
  }
});

export default router;
