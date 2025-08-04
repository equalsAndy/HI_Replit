/**
 * METAlia Analysis Service
 * ========================
 * Advanced conversation analysis and recommendation system
 * Provides insights into persona performance and improvement opportunities
 */

import { Pool } from 'pg';
import { conversationLoggingService } from './conversation-logging-service.js';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export interface AnalysisResult {
  analysisType: string;
  targetPersona?: string;
  findings: any;
  recommendations: any;
  confidenceScore: number;
  sampleSize: number;
}

export interface ConversationPattern {
  pattern: string;
  frequency: number;
  examples: string[];
  impact: 'positive' | 'neutral' | 'negative';
  recommendation?: string;
}

export interface PersonaPerformanceAnalysis {
  personaType: string;
  timeRange: { start: Date; end: Date };
  conversationCount: number;
  averageConfidence: number;
  topicDistribution: Record<string, number>;
  sentimentDistribution: Record<string, number>;
  escalationRate: number;
  userSatisfaction: number;
  commonIssues: string[];
  strengths: string[];
  recommendations: string[];
}

export class METAliaAnalysisService {

  /**
   * Analyze conversation patterns for a specific persona
   */
  async analyzePersonaConversations(
    personaType: string,
    days: number = 30
  ): Promise<PersonaPerformanceAnalysis> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get conversation analytics
      const analytics = await conversationLoggingService.getConversationAnalytics(personaType, days);
      const conversations = await conversationLoggingService.getConversations({
        personaType,
        startDate,
        endDate,
        limit: 1000
      });

      // Analyze topics and sentiment
      const topicAnalysis = await this.analyzeTopicDistribution(conversations);
      const sentimentAnalysis = await this.analyzeSentimentDistribution(conversations);
      const commonIssues = await this.identifyCommonIssues(conversations);
      const strengths = await this.identifyStrengths(conversations);
      const recommendations = await this.generateRecommendations(personaType, conversations, analytics[0]);

      return {
        personaType,
        timeRange: { start: startDate, end: endDate },
        conversationCount: conversations.length,
        averageConfidence: this.calculateAverageConfidence(conversations),
        topicDistribution: topicAnalysis,
        sentimentDistribution: sentimentAnalysis,
        escalationRate: analytics[0]?.escalation_count || 0,
        userSatisfaction: this.calculateUserSatisfaction(conversations),
        commonIssues,
        strengths,
        recommendations
      };
    } catch (error) {
      console.error('❌ Error analyzing persona conversations:', error);
      throw error;
    }
  }

  /**
   * Identify conversation patterns across all personas
   */
  async identifyConversationPatterns(days: number = 30): Promise<ConversationPattern[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const conversations = await conversationLoggingService.getConversations({
        startDate,
        endDate,
        limit: 2000
      });

      const patterns: ConversationPattern[] = [];

      // Pattern 1: Short responses (potential lack of detail)
      const shortResponses = conversations.filter(c => 
        c.talia_response && c.talia_response.length < 100
      );
      if (shortResponses.length > 0) {
        patterns.push({
          pattern: 'Short responses',
          frequency: shortResponses.length,
          examples: shortResponses.slice(0, 3).map(c => c.talia_response),
          impact: 'negative',
          recommendation: 'Consider providing more detailed and helpful responses'
        });
      }

      // Pattern 2: High confidence but low user satisfaction
      const highConfidenceLowSatisfaction = conversations.filter(c => {
        const confidence = c.response_metadata?.confidence || 0;
        const satisfaction = c.user_feedback?.helpful === false;
        return confidence > 0.8 && satisfaction;
      });
      if (highConfidenceLowSatisfaction.length > 0) {
        patterns.push({
          pattern: 'High confidence, low user satisfaction',
          frequency: highConfidenceLowSatisfaction.length,
          examples: highConfidenceLowSatisfaction.slice(0, 3).map(c => c.user_message),
          impact: 'negative',
          recommendation: 'Review response quality for high-confidence interactions'
        });
      }

      // Pattern 3: Frequent escalations from specific personas
      const escalationsByPersona = this.groupBy(
        conversations.filter(c => c.conversation_outcome === 'escalated'),
        'persona_type'
      );
      Object.entries(escalationsByPersona).forEach(([persona, escalations]) => {
        if (escalations.length > 5) {
          patterns.push({
            pattern: `Frequent escalations from ${persona}`,
            frequency: escalations.length,
            examples: escalations.slice(0, 3).map(c => c.user_message),
            impact: 'negative',
            recommendation: `Review ${persona} training and capabilities`
          });
        }
      });

      // Pattern 4: Successful conversation flows
      const successfulConversations = conversations.filter(c => 
        c.conversation_outcome === 'completed' &&
        c.user_feedback?.helpful === true
      );
      if (successfulConversations.length > 0) {
        patterns.push({
          pattern: 'Successful conversation flows',
          frequency: successfulConversations.length,
          examples: successfulConversations.slice(0, 3).map(c => c.user_message),
          impact: 'positive',
          recommendation: 'Identify and replicate successful interaction patterns'
        });
      }

      return patterns;
    } catch (error) {
      console.error('❌ Error identifying conversation patterns:', error);
      throw error;
    }
  }

  /**
   * Generate improvement recommendations for a persona
   */
  async generatePersonaRecommendations(personaType: string): Promise<string[]> {
    try {
      const analysis = await this.analyzePersonaConversations(personaType);
      const recommendations: string[] = [];

      // Low conversation completion rate
      if (analysis.escalationRate > 0.1) {
        recommendations.push(`Reduce escalation rate (currently ${(analysis.escalationRate * 100).toFixed(1)}%) by improving training on common question types`);
      }

      // Low user satisfaction
      if (analysis.userSatisfaction < 0.7) {
        recommendations.push(`Improve user satisfaction (currently ${(analysis.userSatisfaction * 100).toFixed(1)}%) by providing more personalized and helpful responses`);
      }

      // Low average confidence
      if (analysis.averageConfidence < 0.6) {
        recommendations.push(`Increase response confidence (currently ${(analysis.averageConfidence * 100).toFixed(1)}%) through additional training on uncertain scenarios`);
      }

      // Topic-specific recommendations
      const topTopics = Object.entries(analysis.topicDistribution)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);

      topTopics.forEach(([topic, count]) => {
        if (topic === 'technical_issue') {
          recommendations.push(`Address frequent technical issues (${count} occurrences) through improved error handling`);
        }
      });

      // Add common issues as recommendations
      analysis.commonIssues.forEach(issue => {
        recommendations.push(`Address common issue: ${issue}`);
      });

      return recommendations;
    } catch (error) {
      console.error('❌ Error generating persona recommendations:', error);
      throw error;
    }
  }

  /**
   * Create a comprehensive analysis report
   */
  async createAnalysisReport(
    analysisType: 'conversation_pattern' | 'instruction_effectiveness' | 'persona_performance',
    targetPersona?: string,
    timeRange: { start: Date; end: Date } = {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    }
  ): Promise<AnalysisResult> {
    try {
      let findings: any = {};
      let recommendations: any = {};
      let sampleSize = 0;
      let confidenceScore = 0.8;

      switch (analysisType) {
        case 'conversation_pattern':
          const patterns = await this.identifyConversationPatterns(30);
          findings = { patterns };
          recommendations = {
            immediate: patterns.filter(p => p.impact === 'negative').map(p => p.recommendation),
            longTerm: ['Implement automated pattern detection', 'Create training materials based on successful patterns']
          };
          sampleSize = patterns.reduce((sum, p) => sum + p.frequency, 0);
          break;

        case 'persona_performance':
          if (!targetPersona) throw new Error('Target persona required for performance analysis');
          const performance = await this.analyzePersonaConversations(targetPersona);
          findings = performance;
          recommendations = {
            immediate: performance.recommendations.slice(0, 3),
            longTerm: performance.recommendations.slice(3)
          };
          sampleSize = performance.conversationCount;
          break;

        case 'instruction_effectiveness':
          // Analyze how well current instructions are working
          const conversations = await conversationLoggingService.getConversations({
            startDate: timeRange.start,
            endDate: timeRange.end,
            limit: 1000
          });
          
          findings = {
            totalConversations: conversations.length,
            averageConfidence: this.calculateAverageConfidence(conversations),
            escalationRate: conversations.filter(c => c.conversation_outcome === 'escalated').length / conversations.length,
            userSatisfactionRate: this.calculateUserSatisfaction(conversations)
          };
          
          recommendations = {
            immediate: [
              'Review instructions for low-confidence scenarios',
              'Update training based on recent escalations'
            ],
            longTerm: [
              'Implement automated instruction optimization',
              'Create persona-specific training modules'
            ]
          };
          sampleSize = conversations.length;
          break;
      }

      // Store analysis in database
      const analysisId = await this.storeAnalysis({
        analysisType,
        targetPersona,
        timeRange,
        findings,
        recommendations,
        confidenceScore,
        sampleSize
      });

      return {
        analysisType,
        targetPersona,
        findings,
        recommendations,
        confidenceScore,
        sampleSize
      };
    } catch (error) {
      console.error('❌ Error creating analysis report:', error);
      throw error;
    }
  }

  // Private helper methods

  private async analyzeTopicDistribution(conversations: any[]): Promise<Record<string, number>> {
    const topics: Record<string, number> = {};
    
    // Get topics from conversation_topics table
    for (const conv of conversations) {
      try {
        const topicQuery = `
          SELECT topic, COUNT(*) as count
          FROM conversation_topics 
          WHERE conversation_id = $1
          GROUP BY topic
        `;
        const result = await pool.query(topicQuery, [conv.id]);
        
        result.rows.forEach(row => {
          topics[row.topic] = (topics[row.topic] || 0) + parseInt(row.count);
        });
      } catch (error) {
        // If topics aren't available, skip
      }
    }
    
    return topics;
  }

  private async analyzeSentimentDistribution(conversations: any[]): Promise<Record<string, number>> {
    const sentiment: Record<string, number> = { positive: 0, neutral: 0, negative: 0 };
    
    for (const conv of conversations) {
      try {
        const sentimentQuery = `
          SELECT sentiment, COUNT(*) as count
          FROM conversation_topics 
          WHERE conversation_id = $1
          GROUP BY sentiment
        `;
        const result = await pool.query(sentimentQuery, [conv.id]);
        
        result.rows.forEach(row => {
          if (row.sentiment && sentiment.hasOwnProperty(row.sentiment)) {
            sentiment[row.sentiment] += parseInt(row.count);
          }
        });
      } catch (error) {
        // If sentiment data isn't available, default to neutral
        sentiment.neutral++;
      }
    }
    
    return sentiment;
  }

  private async identifyCommonIssues(conversations: any[]): Promise<string[]> {
    const issues: string[] = [];
    
    // Identify conversations with low confidence or escalations
    const problemConversations = conversations.filter(c => 
      (c.response_metadata?.confidence || 1) < 0.5 || 
      c.conversation_outcome === 'escalated' ||
      c.user_feedback?.helpful === false
    );

    if (problemConversations.length > conversations.length * 0.2) {
      issues.push('High rate of low-confidence responses');
    }

    if (conversations.filter(c => c.conversation_outcome === 'escalated').length > conversations.length * 0.1) {
      issues.push('Frequent escalations indicating training gaps');
    }

    if (conversations.filter(c => c.user_feedback?.helpful === false).length > conversations.length * 0.3) {
      issues.push('Low user satisfaction with responses');
    }

    return issues;
  }

  private async identifyStrengths(conversations: any[]): Promise<string[]> {
    const strengths: string[] = [];
    
    const successfulConversations = conversations.filter(c => 
      c.conversation_outcome === 'completed' &&
      (c.response_metadata?.confidence || 0) > 0.8 &&
      c.user_feedback?.helpful !== false
    );

    if (successfulConversations.length > conversations.length * 0.7) {
      strengths.push('High conversation completion rate');
    }

    if (conversations.filter(c => (c.response_metadata?.confidence || 0) > 0.8).length > conversations.length * 0.6) {
      strengths.push('Consistently high confidence responses');
    }

    if (conversations.filter(c => c.user_feedback?.helpful === true).length > conversations.length * 0.5) {
      strengths.push('Strong user satisfaction');
    }

    return strengths;
  }

  private async generateRecommendations(personaType: string, conversations: any[], analytics: any): Promise<string[]> {
    const recommendations: string[] = [];
    
    // Add specific recommendations based on analysis
    const avgConfidence = this.calculateAverageConfidence(conversations);
    if (avgConfidence < 0.6) {
      recommendations.push(`Improve training materials for ${personaType} to increase response confidence`);
    }

    const escalationRate = conversations.filter(c => c.conversation_outcome === 'escalated').length / conversations.length;
    if (escalationRate > 0.1) {
      recommendations.push(`Reduce escalation rate by expanding ${personaType} knowledge base`);
    }

    return recommendations;
  }

  private calculateAverageConfidence(conversations: any[]): number {
    if (conversations.length === 0) return 0;
    
    const confidenceSum = conversations.reduce((sum, c) => {
      return sum + (c.response_metadata?.confidence || 0.5);
    }, 0);
    
    return confidenceSum / conversations.length;
  }

  private calculateUserSatisfaction(conversations: any[]): number {
    const feedbackConversations = conversations.filter(c => c.user_feedback?.helpful !== undefined);
    if (feedbackConversations.length === 0) return 0.5; // Default neutral
    
    const positiveCount = feedbackConversations.filter(c => c.user_feedback.helpful === true).length;
    return positiveCount / feedbackConversations.length;
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const group = String(item[key]);
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  private async storeAnalysis(analysis: {
    analysisType: string;
    targetPersona?: string;
    timeRange: { start: Date; end: Date };
    findings: any;
    recommendations: any;
    confidenceScore: number;
    sampleSize: number;
  }): Promise<string> {
    try {
      const query = `
        INSERT INTO metalia_analyses (
          analysis_type, target_persona, time_range_start, time_range_end,
          sample_size, findings, recommendations, confidence_score,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING id
      `;

      const values = [
        analysis.analysisType,
        analysis.targetPersona || null,
        analysis.timeRange.start,
        analysis.timeRange.end,
        analysis.sampleSize,
        JSON.stringify(analysis.findings),
        JSON.stringify(analysis.recommendations),
        analysis.confidenceScore
      ];

      const result = await pool.query(query, values);
      return result.rows[0].id;
    } catch (error) {
      console.error('❌ Error storing analysis:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const metaliaAnalysisService = new METAliaAnalysisService();

// Default export
export default metaliaAnalysisService;