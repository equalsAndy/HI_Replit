/**
 * AST Coaching Chat API Routes
 * ============================
 * Handles AI coaching conversations with different personas
 */

import express from 'express';
import { 
    generateCoachingResponse, 
    getConversationHistory, 
    saveCoachingMessage, 
    getOrCreateConversation,
    COACHING_PERSONAS 
} from '../services/coaching-chat-service.js';

const router = express.Router();

/**
 * Start or continue a coaching conversation
 * POST /api/coaching/chat/conversation
 */
router.post('/conversation', async (req, res) => {
    try {
        const { userId, personaType, workshopStep } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        if (!personaType || !COACHING_PERSONAS[personaType as keyof typeof COACHING_PERSONAS]) {
            return res.status(400).json({ 
                error: 'Valid persona type is required', 
                availablePersonas: Object.keys(COACHING_PERSONAS) 
            });
        }

        const conversation = await getOrCreateConversation(userId, personaType, workshopStep);
        
        res.json({
            success: true,
            conversation: {
                id: conversation.id,
                title: conversation.conversation_title,
                personaType,
                workshopStep
            }
        });

    } catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).json({ error: 'Failed to create conversation' });
    }
});

/**
 * Send a message to the coaching AI
 * POST /api/coaching/chat/message
 */
router.post('/message', async (req, res) => {
    try {
        const { conversationId, message, personaType, workshopStep, userProfile } = req.body;

        if (!conversationId || !message || !personaType) {
            return res.status(400).json({ 
                error: 'Conversation ID, message, and persona type are required' 
            });
        }

        // Save user message first
        await saveCoachingMessage(conversationId, 'user', message);

        // Get conversation history for context
        const history = await getConversationHistory(conversationId, 8);

        // Generate AI response
        const conversationContext = {
            history: history as any,
            userProfile: userProfile || {}
        };

        const aiResponse = await generateCoachingResponse(
            personaType,
            message,
            conversationContext,
            workshopStep
        );

        // Save AI response
        await saveCoachingMessage(
            conversationId, 
            'assistant', 
            aiResponse.content, 
            aiResponse.metadata as any
        );

        res.json({
            success: true,
            response: {
                content: aiResponse.content,
                metadata: aiResponse.metadata,
                conversationId
            }
        });

    } catch (error) {
        console.error('Error processing message:', error);
        res.status(500).json({ 
            error: 'Failed to process message',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Get conversation history
 * GET /api/coaching/chat/history/:conversationId
 */
router.get('/history/:conversationId', async (req, res) => {
    try {
        const { conversationId } = req.params;
        const limit = parseInt(req.query.limit as string) || 50;

        const history = await getConversationHistory(conversationId, limit);

        res.json({
            success: true,
            history,
            conversationId
        });

    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Failed to fetch conversation history' });
    }
});

/**
 * Get available coaching personas
 * GET /api/coaching/chat/personas
 */
router.get('/personas', async (req, res) => {
    try {
        const personas = Object.entries(COACHING_PERSONAS).map(([key, persona]) => ({
            id: key,
            name: persona.name,
            description: persona.description
        }));

        res.json({
            success: true,
            personas
        });

    } catch (error) {
        console.error('Error fetching personas:', error);
        res.status(500).json({ error: 'Failed to fetch personas' });
    }
});

/**
 * Test coaching AI connectivity
 * GET /api/coaching/chat/test
 */
router.get('/test', async (req, res) => {
    try {
        // Test with fallback response (no AWS credentials needed)
        const testResponse = await generateCoachingResponse(
            'talia_coach',
            'Hello, this is a connectivity test.',
            {},
            null
        );

        res.json({
            success: true,
            test: 'Coaching AI connectivity test',
            response: testResponse.content,
            metadata: testResponse.metadata,
            awsConfigured: !testResponse.metadata.fallback
        });

    } catch (error) {
        console.error('Error testing coaching AI:', error);
        res.status(500).json({ 
            error: 'Coaching AI test failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;
