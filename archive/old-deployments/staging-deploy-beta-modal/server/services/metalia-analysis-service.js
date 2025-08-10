import { Pool } from 'pg';
import { conversationLoggingService } from './conversation-logging-service.js';
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
export class METAliaAnalysisService {
    async analyzePersonaConversations(personaType, days = 30) {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const analytics = await conversationLoggingService.getConversationAnalytics(personaType, days);
            const conversations = await conversationLoggingService.getConversations({
                personaType,
                startDate,
                endDate,
                limit: 1000
            });
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
        }
        catch (error) {
            console.error('❌ Error analyzing persona conversations:', error);
            throw error;
        }
    }
    async identifyConversationPatterns(days = 30) {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const conversations = await conversationLoggingService.getConversations({
                startDate,
                endDate,
                limit: 2000
            });
            const patterns = [];
            const shortResponses = conversations.filter(c => c.talia_response && c.talia_response.length < 100);
            if (shortResponses.length > 0) {
                patterns.push({
                    pattern: 'Short responses',
                    frequency: shortResponses.length,
                    examples: shortResponses.slice(0, 3).map(c => c.talia_response),
                    impact: 'negative',
                    recommendation: 'Consider providing more detailed and helpful responses'
                });
            }
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
            const escalationsByPersona = this.groupBy(conversations.filter(c => c.conversation_outcome === 'escalated'), 'persona_type');
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
            const successfulConversations = conversations.filter(c => c.conversation_outcome === 'completed' &&
                c.user_feedback?.helpful === true);
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
        }
        catch (error) {
            console.error('❌ Error identifying conversation patterns:', error);
            throw error;
        }
    }
    async generatePersonaRecommendations(personaType) {
        try {
            const analysis = await this.analyzePersonaConversations(personaType);
            const recommendations = [];
            if (analysis.escalationRate > 0.1) {
                recommendations.push(`Reduce escalation rate (currently ${(analysis.escalationRate * 100).toFixed(1)}%) by improving training on common question types`);
            }
            if (analysis.userSatisfaction < 0.7) {
                recommendations.push(`Improve user satisfaction (currently ${(analysis.userSatisfaction * 100).toFixed(1)}%) by providing more personalized and helpful responses`);
            }
            if (analysis.averageConfidence < 0.6) {
                recommendations.push(`Increase response confidence (currently ${(analysis.averageConfidence * 100).toFixed(1)}%) through additional training on uncertain scenarios`);
            }
            const topTopics = Object.entries(analysis.topicDistribution)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3);
            topTopics.forEach(([topic, count]) => {
                if (topic === 'technical_issue') {
                    recommendations.push(`Address frequent technical issues (${count} occurrences) through improved error handling`);
                }
            });
            analysis.commonIssues.forEach(issue => {
                recommendations.push(`Address common issue: ${issue}`);
            });
            return recommendations;
        }
        catch (error) {
            console.error('❌ Error generating persona recommendations:', error);
            throw error;
        }
    }
    async createAnalysisReport(analysisType, targetPersona, timeRange = {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
    }) {
        try {
            let findings = {};
            let recommendations = {};
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
                    if (!targetPersona)
                        throw new Error('Target persona required for performance analysis');
                    const performance = await this.analyzePersonaConversations(targetPersona);
                    findings = performance;
                    recommendations = {
                        immediate: performance.recommendations.slice(0, 3),
                        longTerm: performance.recommendations.slice(3)
                    };
                    sampleSize = performance.conversationCount;
                    break;
                case 'instruction_effectiveness':
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
        }
        catch (error) {
            console.error('❌ Error creating analysis report:', error);
            throw error;
        }
    }
    async analyzeTopicDistribution(conversations) {
        const topics = {};
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
            }
            catch (error) {
            }
        }
        return topics;
    }
    async analyzeSentimentDistribution(conversations) {
        const sentiment = { positive: 0, neutral: 0, negative: 0 };
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
            }
            catch (error) {
                sentiment.neutral++;
            }
        }
        return sentiment;
    }
    async identifyCommonIssues(conversations) {
        const issues = [];
        const problemConversations = conversations.filter(c => (c.response_metadata?.confidence || 1) < 0.5 ||
            c.conversation_outcome === 'escalated' ||
            c.user_feedback?.helpful === false);
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
    async identifyStrengths(conversations) {
        const strengths = [];
        const successfulConversations = conversations.filter(c => c.conversation_outcome === 'completed' &&
            (c.response_metadata?.confidence || 0) > 0.8 &&
            c.user_feedback?.helpful !== false);
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
    async generateRecommendations(personaType, conversations, analytics) {
        const recommendations = [];
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
    calculateAverageConfidence(conversations) {
        if (conversations.length === 0)
            return 0;
        const confidenceSum = conversations.reduce((sum, c) => {
            return sum + (c.response_metadata?.confidence || 0.5);
        }, 0);
        return confidenceSum / conversations.length;
    }
    calculateUserSatisfaction(conversations) {
        const feedbackConversations = conversations.filter(c => c.user_feedback?.helpful !== undefined);
        if (feedbackConversations.length === 0)
            return 0.5;
        const positiveCount = feedbackConversations.filter(c => c.user_feedback.helpful === true).length;
        return positiveCount / feedbackConversations.length;
    }
    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = String(item[key]);
            groups[group] = groups[group] || [];
            groups[group].push(item);
            return groups;
        }, {});
    }
    async storeAnalysis(analysis) {
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
        }
        catch (error) {
            console.error('❌ Error storing analysis:', error);
            throw error;
        }
    }
}
export const metaliaAnalysisService = new METAliaAnalysisService();
export default metaliaAnalysisService;
