import { Router } from 'express';
import {
  generateCoachingResponse,
  getOrCreateConversation,
  saveCoachingMessage,
  getConversationHistory
// } from '../services/coaching-chat-service.js';

const router = Router();

/**
 * Create or get a coaching conversation
 * POST /api/coaching/chat/conversation
 */
router.post('/conversation', async (req, res) => {
  try {
    const { persona, workshopStep } = req.body;
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const conversation = await getOrCreateConversation(userId, persona, workshopStep);
    res.json({ 
      conversationId: conversation.id,
      title: conversation.conversation_title
    });

  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

/**
 * Send a message in a coaching conversation
 * POST /api/coaching/chat/message
 */
router.post('/message', async (req, res) => {
  try {
    const { conversationId, message, persona, context } = req.body;
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get conversation history
    const history = await getConversationHistory(conversationId);

    // Save user message
    await saveCoachingMessage(conversationId, 'user', message);

    // Generate AI response
    const response = await generateCoachingResponse(
      persona,
      message,
      {
        history,
        userProfile: {
          workshop_progress: context?.stepNumber ? `Step ${context.stepNumber}` : undefined,
          ...context
        }
      },
      context?.workshopStep
    );

    // Save AI response
    await saveCoachingMessage(conversationId, 'assistant', response.content, response.metadata);

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
    const userId = req.session.userId;

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
