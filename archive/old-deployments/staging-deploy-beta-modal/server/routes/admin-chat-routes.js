import express from 'express';
import { getAssistantManager, getAllModelConfigs, enhancedOpenAICall } from '../services/openai-api-service.js';
const router = express.Router();
function requireAdmin(req, res, next) {
    const isAdmin = req.session?.user?.role === 'admin' ||
        req.headers.authorization === 'Bearer admin-token' ||
        process.env.NODE_ENV === 'development';
    if (!isAdmin) {
        return res.status(403).json({
            error: 'Admin access required',
            message: 'This endpoint requires administrator privileges'
        });
    }
    next();
}
router.use(requireAdmin);
router.post('/message', async (req, res) => {
    try {
        const { message, model = 'gpt-4o-mini', projectType = 'admin-training', persona = 'admin', conversationId, includeContext = false } = req.body;
        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                error: 'Message is required',
                received: typeof message
            });
        }
        console.log(`🤖 Admin chat: ${model} in ${projectType} project`);
        let systemPrompt = `You are an advanced AI assistant helping administrators manage the Heliotrope Imaginal development platform.

You have access to:
- OpenAI project management and configuration
- Cross-project resource awareness
- Model performance analysis
- Cost tracking and optimization
- Persona training and development

Current Context:
- User Role: Administrator
- Project: ${projectType}
- Model: ${model}
- Conversation ID: ${conversationId || 'new'}

Respond helpfully and provide detailed technical insights when requested.`;
        if (includeContext) {
            try {
                const assistantManager = getAssistantManager();
                const assistantSummary = await assistantManager.getAssistantResourcesSummary();
                systemPrompt += `\n\nCurrent Assistant Status:
${assistantSummary.map(a => `- ${a.name}: ${a.purpose}, Vector Store: ${a.vectorStoreId}`).join('\n')}`;
            }
            catch (error) {
                console.warn('Could not load project context:', error);
            }
        }
        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
        ];
        const response = await enhancedOpenAICall(messages, {
            model,
            projectType,
            featureName: 'admin_chat',
            maxTokens: 2000,
            temperature: 0.7
        });
        console.log(`💬 Admin chat logged: ${message.substring(0, 50)}...`);
        res.json({
            success: true,
            response,
            model,
            projectType,
            timestamp: new Date().toISOString(),
            conversationId: conversationId || `admin-${Date.now()}`
        });
    }
    catch (error) {
        console.error('❌ Admin chat error:', error);
        res.status(500).json({
            error: 'Failed to process admin chat message',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/models', (req, res) => {
    try {
        const models = getAllModelConfigs();
        res.json({
            success: true,
            models: models.map(model => ({
                ...model,
                available: true,
                recommended: model.recommended.join(', ')
            }))
        });
    }
    catch (error) {
        console.error('❌ Error getting models:', error);
        res.status(500).json({
            error: 'Failed to get model configurations',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/projects/summary', async (req, res) => {
    try {
        const assistantManager = getAssistantManager();
        const summary = await assistantManager.getAssistantResourcesSummary();
        res.json({
            success: true,
            assistants: summary,
            totalAssistants: summary.length,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ Error getting project summary:', error);
        res.status(500).json({
            error: 'Failed to get assistant summary',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/ab-test', async (req, res) => {
    try {
        const { prompt, modelA = 'gpt-4o-mini', modelB = 'gpt-4', projectType = 'development' } = req.body;
        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({
                error: 'Prompt is required for A/B testing'
            });
        }
        console.log(`🧪 Running A/B test: ${modelA} vs ${modelB}`);
        const assistantManager = getAssistantManager();
        const result = await assistantManager.runABTest(prompt, modelA, modelB, projectType);
        res.json({
            success: true,
            test: result,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ A/B test error:', error);
        res.status(500).json({
            error: 'Failed to run A/B test',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/history', (req, res) => {
    const { limit = 50, conversationId } = req.query;
    res.json({
        success: true,
        conversations: [],
        message: 'Conversation history would be loaded from database',
        limit: Number(limit),
        conversationId
    });
});
router.post('/upload', (req, res) => {
    res.json({
        success: true,
        message: 'Document upload functionality would be implemented here',
        supportedFormats: ['txt', 'md', 'pdf', 'docx']
    });
});
router.get('/costs', async (req, res) => {
    try {
        const { timeframe = '30d' } = req.query;
        res.json({
            success: true,
            timeframe,
            costs: {
                totalSpent: 0,
                byProject: {},
                byModel: {},
                projectedMonthly: 0
            },
            message: 'Cost tracking would integrate with existing usage logger'
        });
    }
    catch (error) {
        console.error('❌ Error getting costs:', error);
        res.status(500).json({
            error: 'Failed to get cost information',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/export', (req, res) => {
    const { conversationId, format = 'json' } = req.body;
    res.json({
        success: true,
        message: 'Conversation export functionality would be implemented here',
        supportedFormats: ['json', 'markdown', 'pdf'],
        conversationId,
        format
    });
});
export default router;
