/**
 * Conversation Logging Service
 * ============================
 * Comprehensive conversation logging and analysis for METAlia system
 * Handles all Talia persona conversations with performance optimization
 */

import { Pool } from 'pg';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Type definitions for conversation logging
export interface ConversationLogData {
  personaType: string;
  userId?: number;
  sessionId?: string;
  userMessage: string;
  taliaResponse: string;
  contextData?: any;
  requestData?: any;
  responseMetadata?: {
    confidence?: number;
    source?: string;
    tokensUsed?: number;
    apiCost?: number;
  };
  responseTimeMs?: number;
  conversationOutcome?: 'completed' | 'abandoned' | 'escalated' | 'error';
}

export interface UserFeedbackData {
  conversationId: string;
  rating?: number; // 1-5 scale
  helpful?: boolean;
  followUpQuestion?: string;
  additionalFeedback?: string;
}

export interface EscalationData {
  requestingPersona: string;
  escalationType: 'clarification' | 'instruction_improvement' | 'error_report';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  question: string;
  contextData?: any;
  userMessage?: string;
  attemptedResponse?: string;
  relatedConversationId?: string;
}

export interface ConversationQueryOptions {
  personaType?: string;
  userId?: number;
  sessionId?: string;
  startDate?: Date;
  endDate?: Date;
  requiresReview?: boolean;
  limit?: number;
  offset?: number;
  includeUserFeedback?: boolean;
}

/**
 * Conversation Logging Service
 * Provides comprehensive logging and retrieval for all Talia conversations
 */
export class ConversationLoggingService {
  
  /**
   * Log a new conversation
   * Asynchronously stores conversation data without blocking response
   */
  async logConversation(data: ConversationLogData): Promise<string> {
    try {
      const query = `
        INSERT INTO talia_conversations (
          persona_type, user_id, session_id, user_message, talia_response,
          context_data, request_data, response_metadata, response_time_ms,
          conversation_outcome, tokens_used, api_cost_estimate,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
        RETURNING id
      `;

      const values = [
        data.personaType,
        data.userId || null,
        data.sessionId || null,
        data.userMessage,
        data.taliaResponse,
        JSON.stringify(data.contextData || {}),
        JSON.stringify(data.requestData || {}),
        JSON.stringify(data.responseMetadata || {}),
        data.responseTimeMs || null,
        data.conversationOutcome || 'completed',
        data.responseMetadata?.tokensUsed || null,
        data.responseMetadata?.apiCost || null
      ];

      const result = await pool.query(query, values);
      const conversationId = result.rows[0].id;

      console.log(`💾 Conversation logged: ${conversationId} (${data.personaType})`);
      
      // Asynchronously analyze for topics and sentiment (don't wait)
      this.analyzeConversationTopics(conversationId, data.userMessage, data.taliaResponse)
        .catch(error => console.warn('⚠️ Topic analysis failed:', error));

      return conversationId;
    } catch (error) {
      console.error('❌ Error logging conversation:', error);
      throw error;
    }
  }

  /**
   * Update conversation with user feedback
   */
  async updateUserFeedback(data: UserFeedbackData): Promise<void> {
    try {
      const query = `
        UPDATE talia_conversations 
        SET user_feedback = $2, updated_at = NOW()
        WHERE id = $1
      `;

      const feedbackData = {
        rating: data.rating,
        helpful: data.helpful,
        followUpQuestion: data.followUpQuestion,
        additionalFeedback: data.additionalFeedback,
        submittedAt: new Date().toISOString()
      };

      await pool.query(query, [data.conversationId, JSON.stringify(feedbackData)]);
      console.log(`👍 User feedback updated for conversation: ${data.conversationId}`);
    } catch (error) {
      console.error('❌ Error updating user feedback:', error);
      throw error;
    }
  }

  /**
   * Create an escalation request
   */
  async createEscalation(data: EscalationData): Promise<string> {
    try {
      const query = `
        INSERT INTO talia_escalations (
          requesting_persona, escalation_type, priority, question,
          context_data, user_message, attempted_response, related_conversation_id,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING id
      `;

      const values = [
        data.requestingPersona,
        data.escalationType,
        data.priority || 'medium',
        data.question,
        JSON.stringify(data.contextData || {}),
        data.userMessage || null,
        data.attemptedResponse || null,
        data.relatedConversationId || null
      ];

      const result = await pool.query(query, values);
      const escalationId = result.rows[0].id;

      console.log(`🚨 Escalation created: ${escalationId} (${data.requestingPersona} -> ${data.escalationType})`);
      return escalationId;
    } catch (error) {
      console.error('❌ Error creating escalation:', error);
      throw error;
    }
  }

  /**
   * Get conversations for analysis or replay
   */
  async getConversations(options: ConversationQueryOptions): Promise<any[]> {
    try {
      let whereConditions = [];
      let values = [];
      let paramIndex = 1;

      // Build dynamic WHERE clause
      if (options.personaType) {
        whereConditions.push(`persona_type = $${paramIndex++}`);
        values.push(options.personaType);
      }

      if (options.userId) {
        whereConditions.push(`user_id = $${paramIndex++}`);
        values.push(options.userId);
      }

      if (options.sessionId) {
        whereConditions.push(`session_id = $${paramIndex++}`);
        values.push(options.sessionId);
      }

      if (options.startDate) {
        whereConditions.push(`created_at >= $${paramIndex++}`);
        values.push(options.startDate);
      }

      if (options.endDate) {
        whereConditions.push(`created_at <= $${paramIndex++}`);
        values.push(options.endDate);
      }

      if (options.requiresReview !== undefined) {
        whereConditions.push(`requires_review = $${paramIndex++}`);
        values.push(options.requiresReview);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      const limitClause = options.limit ? `LIMIT ${options.limit}` : '';
      const offsetClause = options.offset ? `OFFSET ${options.offset}` : '';

      const query = `
        SELECT 
          id, persona_type, user_id, session_id, user_message, talia_response,
          context_data, request_data, response_metadata, user_feedback,
          conversation_outcome, response_time_ms, tokens_used, api_cost_estimate,
          training_notes, effectiveness_score, requires_review, analyzed_by_metalia,
          created_at, updated_at
        FROM talia_conversations 
        ${whereClause}
        ORDER BY created_at DESC
        ${limitClause} ${offsetClause}
      `;

      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('❌ Error retrieving conversations:', error);
      throw error;
    }
  }

  /**
   * Get conversation analytics for a persona or time period
   */
  async getConversationAnalytics(personaType?: string, days: number = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let whereClause = `WHERE created_at >= $1`;
      let values: any[] = [startDate];

      if (personaType) {
        whereClause += ` AND persona_type = $2`;
        values.push(personaType);
      }

      const query = `
        SELECT 
          persona_type,
          COUNT(*) as total_conversations,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(DISTINCT session_id) as unique_sessions,
          AVG(response_time_ms) as avg_response_time_ms,
          SUM(tokens_used) as total_tokens_used,
          SUM(api_cost_estimate) as total_api_cost,
          AVG(effectiveness_score) as avg_effectiveness_score,
          COUNT(*) FILTER (WHERE user_feedback->>'helpful' = 'true') as positive_feedback_count,
          COUNT(*) FILTER (WHERE user_feedback->>'helpful' = 'false') as negative_feedback_count,
          COUNT(*) FILTER (WHERE conversation_outcome = 'escalated') as escalation_count,
          COUNT(*) FILTER (WHERE requires_review = true) as requires_review_count
        FROM talia_conversations 
        ${whereClause}
        GROUP BY persona_type
        ORDER BY total_conversations DESC
      `;

      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('❌ Error getting conversation analytics:', error);
      throw error;
    }
  }

  /**
   * Get pending escalations
   */
  async getPendingEscalations(limit: number = 50): Promise<any[]> {
    try {
      const query = `
        SELECT 
          id, requesting_persona, escalation_type, priority, question,
          context_data, user_message, attempted_response, status,
          related_conversation_id, created_at
        FROM talia_escalations 
        WHERE status = 'pending'
        ORDER BY 
          CASE priority 
            WHEN 'urgent' THEN 1 
            WHEN 'high' THEN 2 
            WHEN 'medium' THEN 3 
            WHEN 'low' THEN 4 
          END,
          created_at ASC
        LIMIT $1
      `;

      const result = await pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('❌ Error getting pending escalations:', error);
      throw error;
    }
  }

  /**
   * Resolve an escalation
   */
  async resolveEscalation(
    escalationId: string, 
    adminResponse: string, 
    resolvedBy: number,
    resolutionNotes?: string,
    instructionUpdates?: any
  ): Promise<void> {
    try {
      const query = `
        UPDATE talia_escalations 
        SET 
          status = 'resolved',
          admin_response = $2,
          resolved_by = $3,
          resolved_at = NOW(),
          resolution_notes = $4,
          instruction_updates = $5,
          updated_at = NOW()
        WHERE id = $1
      `;

      await pool.query(query, [
        escalationId,
        adminResponse,
        resolvedBy,
        resolutionNotes || null,
        JSON.stringify(instructionUpdates || {})
      ]);

      console.log(`✅ Escalation resolved: ${escalationId} by user ${resolvedBy}`);
    } catch (error) {
      console.error('❌ Error resolving escalation:', error);
      throw error;
    }
  }

  /**
   * Analyze conversation topics (internal method)
   */
  private async analyzeConversationTopics(
    conversationId: string,
    userMessage: string,
    taliaResponse: string
  ): Promise<void> {
    try {
      // Simple keyword-based topic analysis (can be enhanced with AI later)
      const topics = this.extractTopics(userMessage, taliaResponse);
      const sentiment = this.analyzeSentiment(userMessage);

      if (topics.length > 0) {
        for (const topic of topics) {
          const query = `
            INSERT INTO conversation_topics (
              conversation_id, topic, confidence, keywords, sentiment, created_at
            ) VALUES ($1, $2, $3, $4, $5, NOW())
          `;

          await pool.query(query, [
            conversationId,
            topic.topic,
            topic.confidence,
            topic.keywords,
            sentiment
          ]);
        }
      }
    } catch (error) {
      console.warn('⚠️ Topic analysis failed for conversation:', conversationId, error);
    }
  }

  /**
   * Simple topic extraction (can be enhanced with ML/AI)
   */
  private extractTopics(userMessage: string, taliaResponse: string): any[] {
    const topics = [];
    const text = (userMessage + ' ' + taliaResponse).toLowerCase();

    // Workshop-related topics
    if (text.includes('reflection') || text.includes('workshop') || text.includes('strength')) {
      topics.push({
        topic: 'workshop_reflection',
        confidence: 0.8,
        keywords: ['reflection', 'workshop', 'strength']
      });
    }

    // Report generation
    if (text.includes('report') || text.includes('development') || text.includes('assessment')) {
      topics.push({
        topic: 'report_generation',
        confidence: 0.9,
        keywords: ['report', 'development', 'assessment']
      });
    }

    // Coaching and guidance
    if (text.includes('advice') || text.includes('help') || text.includes('guidance') || text.includes('coaching')) {
      topics.push({
        topic: 'coaching_advice',
        confidence: 0.7,
        keywords: ['advice', 'help', 'guidance', 'coaching']
      });
    }

    // Technical issues
    if (text.includes('error') || text.includes('problem') || text.includes('not working') || text.includes('issue')) {
      topics.push({
        topic: 'technical_issue',
        confidence: 0.8,
        keywords: ['error', 'problem', 'issue']
      });
    }

    return topics;
  }

  /**
   * Simple sentiment analysis
   */
  private analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['good', 'great', 'excellent', 'helpful', 'thank', 'appreciate', 'love', 'amazing'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'frustrated', 'confused', 'wrong', 'error'];

    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * Update daily performance metrics
   * Should be called daily via cron job
   */
  async updateDailyMetrics(date: Date = new Date()): Promise<void> {
    try {
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      const startOfDay = new Date(dateStr);
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      const query = `
        INSERT INTO persona_performance_metrics (
          persona_type, date_period, total_conversations, unique_users,
          average_effectiveness_score, positive_feedback_count, negative_feedback_count,
          escalation_count, average_response_time_ms, total_tokens_used, total_api_cost,
          conversation_completion_rate, created_at, updated_at
        )
        SELECT 
          persona_type,
          $1::DATE as date_period,
          COUNT(*) as total_conversations,
          COUNT(DISTINCT user_id) as unique_users,
          AVG(effectiveness_score) as average_effectiveness_score,
          COUNT(*) FILTER (WHERE user_feedback->>'helpful' = 'true') as positive_feedback_count,
          COUNT(*) FILTER (WHERE user_feedback->>'helpful' = 'false') as negative_feedback_count,
          COUNT(*) FILTER (WHERE conversation_outcome = 'escalated') as escalation_count,
          AVG(response_time_ms) as average_response_time_ms,
          SUM(tokens_used) as total_tokens_used,
          SUM(api_cost_estimate) as total_api_cost,
          COUNT(*) FILTER (WHERE conversation_outcome = 'completed')::DECIMAL / COUNT(*) as conversation_completion_rate,
          NOW(),
          NOW()
        FROM talia_conversations 
        WHERE created_at >= $2 AND created_at < $3
        GROUP BY persona_type
        ON CONFLICT (persona_type, date_period) 
        DO UPDATE SET
          total_conversations = EXCLUDED.total_conversations,
          unique_users = EXCLUDED.unique_users,
          average_effectiveness_score = EXCLUDED.average_effectiveness_score,
          positive_feedback_count = EXCLUDED.positive_feedback_count,
          negative_feedback_count = EXCLUDED.negative_feedback_count,
          escalation_count = EXCLUDED.escalation_count,
          average_response_time_ms = EXCLUDED.average_response_time_ms,
          total_tokens_used = EXCLUDED.total_tokens_used,
          total_api_cost = EXCLUDED.total_api_cost,
          conversation_completion_rate = EXCLUDED.conversation_completion_rate,
          updated_at = NOW()
      `;

      await pool.query(query, [dateStr, startOfDay, endOfDay]);
      console.log(`📊 Daily metrics updated for ${dateStr}`);
    } catch (error) {
      console.error('❌ Error updating daily metrics:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const conversationLoggingService = new ConversationLoggingService();

// Default export
export default conversationLoggingService;