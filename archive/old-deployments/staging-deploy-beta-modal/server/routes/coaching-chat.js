import { Router } from 'express';
const router = Router();
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
    }
    catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).json({ error: 'Failed to create conversation' });
    }
});
router.post('/message', async (req, res) => {
    try {
        const { conversationId, message, persona, context } = req.body;
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const history = await getConversationHistory(conversationId);
        await saveCoachingMessage(conversationId, 'user', message);
        const response = await generateCoachingResponse(persona, message, {
            history,
            userProfile: {
                workshop_progress: context?.stepNumber ? `Step ${context.stepNumber}` : undefined,
                ...context
            }
        }, context?.workshopStep);
        await saveCoachingMessage(conversationId, 'assistant', response.content, response.metadata);
        res.json({
            response: response.content,
            metadata: response.metadata
        });
    }
    catch (error) {
        console.error('Error processing message:', error);
        res.status(500).json({ error: 'Failed to process message' });
    }
});
router.get('/history/:conversationId', async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const history = await getConversationHistory(conversationId);
        res.json({ history });
    }
    catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Failed to fetch conversation history' });
    }
});
export default router;
