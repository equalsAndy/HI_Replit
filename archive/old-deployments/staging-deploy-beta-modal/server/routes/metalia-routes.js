import { Router } from 'express';
import { Pool } from 'pg';
import { conversationLoggingService } from '../services/conversation-logging-service.js';
const router = Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
router.post('/escalations', async (req, res) => {
    try {
        const { requestingPersona, escalationType, priority, question, contextData, userMessage, attemptedResponse, relatedConversationId } = req.body;
        if (!requestingPersona || !escalationType || !question) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: requestingPersona, escalationType, question'
            });
        }
        const validTypes = ['clarification', 'instruction_improvement', 'error_report'];
        if (!validTypes.includes(escalationType)) {
            return res.status(400).json({
                success: false,
                error: `Invalid escalationType. Must be one of: ${validTypes.join(', ')}`
            });
        }
        const escalationId = await conversationLoggingService.createEscalation({
            requestingPersona,
            escalationType,
            priority: priority || 'medium',
            question,
            contextData,
            userMessage,
            attemptedResponse,
            relatedConversationId
        });
        console.log(`🚨 New escalation created: ${escalationId} from ${requestingPersona}`);
        res.json({
            success: true,
            escalationId,
            message: 'Escalation request created successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ Error creating escalation:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create escalation request'
        });
    }
});
router.get('/escalations/pending', async (req, res) => {
    try {
        const { limit = 50 } = req.query;
        const escalations = await conversationLoggingService.getPendingEscalations(Number(limit));
        res.json({
            success: true,
            escalations,
            count: escalations.length,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ Error getting pending escalations:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve pending escalations'
        });
    }
});
router.post('/escalations/:escalationId/resolve', async (req, res) => {
    try {
        const { escalationId } = req.params;
        const { adminResponse, resolutionNotes, instructionUpdates } = req.body;
        const resolvedBy = req.session?.userId || 1;
        if (!adminResponse) {
            return res.status(400).json({
                success: false,
                error: 'adminResponse is required'
            });
        }
        await conversationLoggingService.resolveEscalation(escalationId, adminResponse, resolvedBy, resolutionNotes, instructionUpdates);
        res.json({
            success: true,
            message: 'Escalation resolved successfully',
            escalationId,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ Error resolving escalation:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to resolve escalation'
        });
    }
});
router.get('/analytics/conversations', async (req, res) => {
    try {
        const { personaType, days = 30 } = req.query;
        const analytics = await conversationLoggingService.getConversationAnalytics(personaType, Number(days));
        res.json({
            success: true,
            analytics,
            period: `${days} days`,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ Error getting conversation analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve conversation analytics'
        });
    }
});
router.get('/conversations', async (req, res) => {
    try {
        const { personaType, userId, sessionId, startDate, endDate, requiresReview, limit = 100, offset = 0 } = req.query;
        const queryOptions = {
            personaType: personaType,
            userId: userId ? Number(userId) : undefined,
            sessionId: sessionId,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            requiresReview: requiresReview === 'true' ? true : requiresReview === 'false' ? false : undefined,
            limit: Number(limit),
            offset: Number(offset)
        };
        const conversations = await conversationLoggingService.getConversations(queryOptions);
        res.json({
            success: true,
            conversations,
            count: conversations.length,
            queryOptions,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ Error getting conversations:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve conversations'
        });
    }
});
router.post('/conversations/:conversationId/feedback', async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { rating, helpful, followUpQuestion, additionalFeedback } = req.body;
        await conversationLoggingService.updateUserFeedback({
            conversationId,
            rating,
            helpful,
            followUpQuestion,
            additionalFeedback
        });
        res.json({
            success: true,
            message: 'User feedback updated successfully',
            conversationId,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ Error updating conversation feedback:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update conversation feedback'
        });
    }
});
router.post('/metrics/daily-update', async (req, res) => {
    try {
        const { date } = req.body;
        const targetDate = date ? new Date(date) : new Date();
        await conversationLoggingService.updateDailyMetrics(targetDate);
        res.json({
            success: true,
            message: 'Daily metrics updated successfully',
            date: targetDate.toISOString().split('T')[0],
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ Error updating daily metrics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update daily metrics'
        });
    }
});
router.get('/metrics/performance', async (req, res) => {
    try {
        const { personaType, startDate, endDate, limit = 30 } = req.query;
        let whereConditions = [];
        let values = [];
        let paramIndex = 1;
        if (personaType) {
            whereConditions.push(`persona_type = $${paramIndex++}`);
            values.push(personaType);
        }
        if (startDate) {
            whereConditions.push(`date_period >= $${paramIndex++}`);
            values.push(startDate);
        }
        if (endDate) {
            whereConditions.push(`date_period <= $${paramIndex++}`);
            values.push(endDate);
        }
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        const limitClause = `LIMIT ${limit}`;
        const query = `
      SELECT 
        persona_type,
        date_period,
        total_conversations,
        unique_users,
        average_effectiveness_score,
        positive_feedback_count,
        negative_feedback_count,
        escalation_count,
        average_response_time_ms,
        total_tokens_used,
        total_api_cost,
        conversation_completion_rate,
        created_at
      FROM persona_performance_metrics 
      ${whereClause}
      ORDER BY date_period DESC, persona_type
      ${limitClause}
    `;
        const result = await pool.query(query, values);
        res.json({
            success: true,
            metrics: result.rows,
            count: result.rows.length,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ Error getting performance metrics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve performance metrics'
        });
    }
});
router.get('/status', async (req, res) => {
    try {
        const conversationCountQuery = 'SELECT COUNT(*) as total_conversations FROM talia_conversations';
        const escalationCountQuery = 'SELECT COUNT(*) as pending_escalations FROM talia_escalations WHERE status = \'pending\'';
        const personaCountQuery = 'SELECT COUNT(*) as active_personas FROM talia_personas WHERE enabled = true';
        const [conversationResult, escalationResult, personaResult] = await Promise.all([
            pool.query(conversationCountQuery),
            pool.query(escalationCountQuery),
            pool.query(personaCountQuery)
        ]);
        const stats = {
            totalConversations: parseInt(conversationResult.rows[0].total_conversations),
            pendingEscalations: parseInt(escalationResult.rows[0].pending_escalations),
            activePersonas: parseInt(personaResult.rows[0].active_personas),
            systemVersion: '1.0.0',
            timestamp: new Date().toISOString()
        };
        res.json({
            success: true,
            status: 'operational',
            stats,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ Error getting METAlia status:', error);
        res.status(500).json({
            success: false,
            status: 'error',
            error: 'Failed to retrieve system status'
        });
    }
});
export default router;
