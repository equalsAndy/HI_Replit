/**
 * User Learning Service
 * ===================
 * Analyzes user communication patterns and stores personalized context for Talia
 */

import { Pool } from 'pg';
import { promises as fs } from 'fs';
import { join } from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

interface UserCommunicationPattern {
  userId: string;
  confidenceLevel: 'low' | 'medium' | 'high';
  communicationStyle: 'brief' | 'detailed' | 'conversational';
  languageComplexity: 'simple' | 'moderate' | 'complex';
  responseLength: 'short' | 'medium' | 'long';
  emotionalTone: 'neutral' | 'positive' | 'analytical' | 'reflective';
  helpPreference: 'direct' | 'guided' | 'exploratory';
  lastUpdated: Date;
  conversationCount: number;
  averageResponseTime?: number;
}

interface ConversationAnalysis {
  messageCount: number;
  averageMessageLength: number;
  questionAskedCount: number;
  confidenceIndicators: string[];
  uncertaintyIndicators: string[];
  keyTopics: string[];
  emotionalTone: string;
}

interface UserLearningContext {
  userId: string;
  patterns: UserCommunicationPattern;
  recentConversations: ConversationSummary[];
  strengthsFocus: string[];
  preferredCoachingStyle: string;
  lastInteraction: Date;
}

interface ConversationSummary {
  timestamp: Date;
  stepContext: string;
  strengthFocus: string;
  mainTopics: string[];
  userCommunicationStyle: string;
  taliaEffectiveness: 'low' | 'medium' | 'high';
  keyInsights: string[];
}

export class UserLearningService {
  private userPatternsCache: Map<string, UserCommunicationPattern> = new Map();
  private learningFilePath = join(process.cwd(), 'storage', 'user-learning.json');

  /**
   * Analyze a conversation to extract user communication patterns
   */
  async analyzeConversation(userId: string, messages: any[], context: any): Promise<ConversationAnalysis> {
    const userMessages = messages.filter(msg => msg.role === 'user');
    const taliaMessages = messages.filter(msg => msg.role === 'assistant');

    if (userMessages.length === 0) {
      return {
        messageCount: 0,
        averageMessageLength: 0,
        questionAskedCount: 0,
        confidenceIndicators: [],
        uncertaintyIndicators: [],
        keyTopics: [],
        emotionalTone: 'neutral'
      };
    }

    const analysis: ConversationAnalysis = {
      messageCount: userMessages.length,
      averageMessageLength: userMessages.reduce((sum, msg) => sum + msg.content.length, 0) / userMessages.length,
      questionAskedCount: userMessages.filter(msg => msg.content.includes('?')).length,
      confidenceIndicators: this.extractConfidenceIndicators(userMessages),
      uncertaintyIndicators: this.extractUncertaintyIndicators(userMessages),
      keyTopics: this.extractKeyTopics(userMessages, context),
      emotionalTone: this.analyzeEmotionalTone(userMessages)
    };

    console.log(`📊 Conversation analysis for user ${userId}:`, analysis);
    return analysis;
  }

  /**
   * Extract confidence indicators from user messages
   */
  private extractConfidenceIndicators(messages: any[]): string[] {
    const confidenceKeywords = [
      'definitely', 'certainly', 'absolutely', 'clearly', 'obviously', 'exactly',
      'I know', 'I\'m sure', 'I\'m confident', 'without doubt', 'for certain',
      'I excel at', 'I\'m great at', 'I always', 'I consistently'
    ];

    const indicators: string[] = [];
    messages.forEach(msg => {
      const content = msg.content.toLowerCase();
      confidenceKeywords.forEach(keyword => {
        if (content.includes(keyword.toLowerCase())) {
          indicators.push(keyword);
        }
      });
    });

    return [...new Set(indicators)]; // Remove duplicates
  }

  /**
   * Extract uncertainty indicators from user messages
   */
  private extractUncertaintyIndicators(messages: any[]): string[] {
    const uncertaintyKeywords = [
      'maybe', 'perhaps', 'possibly', 'I think', 'I guess', 'I suppose',
      'not sure', 'uncertain', 'confused', 'unclear', 'I wonder',
      'might be', 'could be', 'I\'m not confident', 'I don\'t know',
      'unsure', 'hesitant', 'I question'
    ];

    const indicators: string[] = [];
    messages.forEach(msg => {
      const content = msg.content.toLowerCase();
      uncertaintyKeywords.forEach(keyword => {
        if (content.includes(keyword.toLowerCase())) {
          indicators.push(keyword);
        }
      });
    });

    return [...new Set(indicators)]; // Remove duplicates
  }

  /**
   * Extract key topics from user messages based on context
   */
  private extractKeyTopics(messages: any[], context: any): string[] {
    const topics: string[] = [];
    
    // Add context-based topics
    if (context?.strengthLabel) topics.push(context.strengthLabel);
    if (context?.stepName) topics.push(context.stepName);

    // Extract common workplace/strength topics
    const topicKeywords = [
      'team', 'leadership', 'collaboration', 'communication', 'problem-solving',
      'creativity', 'analysis', 'planning', 'execution', 'feedback',
      'project', 'meeting', 'deadline', 'goal', 'challenge', 'success',
      'manager', 'colleague', 'client', 'presentation', 'decision'
    ];

    messages.forEach(msg => {
      const content = msg.content.toLowerCase();
      topicKeywords.forEach(keyword => {
        if (content.includes(keyword)) {
          topics.push(keyword);
        }
      });
    });

    return [...new Set(topics)]; // Remove duplicates
  }

  /**
   * Analyze emotional tone of user messages
   */
  private analyzeEmotionalTone(messages: any[]): string {
    const positiveWords = ['good', 'great', 'excellent', 'love', 'enjoy', 'excited', 'happy', 'successful', 'proud'];
    const analyticalWords = ['analyze', 'consider', 'evaluate', 'assess', 'examine', 'compare', 'logical', 'systematic'];
    const reflectiveWords = ['reflect', 'think', 'ponder', 'contemplate', 'realize', 'understand', 'learn', 'insight'];

    let positiveCount = 0;
    let analyticalCount = 0;
    let reflectiveCount = 0;

    messages.forEach(msg => {
      const content = msg.content.toLowerCase();
      positiveWords.forEach(word => { if (content.includes(word)) positiveCount++; });
      analyticalWords.forEach(word => { if (content.includes(word)) analyticalCount++; });
      reflectiveWords.forEach(word => { if (content.includes(word)) reflectiveCount++; });
    });

    if (positiveCount > analyticalCount && positiveCount > reflectiveCount) return 'positive';
    if (analyticalCount > reflectiveCount) return 'analytical';
    if (reflectiveCount > 0) return 'reflective';
    return 'neutral';
  }

  /**
   * Update user communication patterns based on conversation analysis
   */
  async updateUserPatterns(userId: string, analysis: ConversationAnalysis, context: any): Promise<void> {
    let patterns = this.userPatternsCache.get(userId) || await this.loadUserPatterns(userId);

    if (!patterns) {
      // Create new pattern profile
      patterns = {
        userId,
        confidenceLevel: 'medium',
        communicationStyle: 'conversational',
        languageComplexity: 'moderate',
        responseLength: 'medium',
        emotionalTone: 'neutral',
        helpPreference: 'guided',
        lastUpdated: new Date(),
        conversationCount: 0
      };
    }

    // Update patterns based on analysis
    patterns.conversationCount++;
    patterns.lastUpdated = new Date();
    patterns.emotionalTone = analysis.emotionalTone as any;

    // Determine confidence level
    if (analysis.confidenceIndicators.length > analysis.uncertaintyIndicators.length) {
      patterns.confidenceLevel = 'high';
    } else if (analysis.uncertaintyIndicators.length > analysis.confidenceIndicators.length) {
      patterns.confidenceLevel = 'low';
    } else {
      patterns.confidenceLevel = 'medium';
    }

    // Determine communication style
    if (analysis.averageMessageLength < 50) {
      patterns.communicationStyle = 'brief';
    } else if (analysis.averageMessageLength > 150) {
      patterns.communicationStyle = 'detailed';
    } else {
      patterns.communicationStyle = 'conversational';
    }

    // Determine response length preference
    if (analysis.averageMessageLength < 30) {
      patterns.responseLength = 'short';
    } else if (analysis.averageMessageLength > 100) {
      patterns.responseLength = 'long';
    } else {
      patterns.responseLength = 'medium';
    }

    // Cache and save
    this.userPatternsCache.set(userId, patterns);
    await this.saveUserPatterns(userId, patterns);

    console.log(`📈 Updated patterns for user ${userId}:`, patterns);
  }

  /**
   * Get user-specific coaching context for Talia
   */
  async getUserCoachingContext(userId: string): Promise<string> {
    const patterns = await this.loadUserPatterns(userId);
    
    if (!patterns) {
      return ''; // No personalization for new users
    }

    const contextLines = [
      `USER PERSONALIZATION CONTEXT (${patterns.conversationCount} previous conversations):`,
      `• Confidence Level: ${patterns.confidenceLevel} (adapt encouragement accordingly)`,
      `• Communication Style: ${patterns.communicationStyle} (match their preferred interaction style)`,
      `• Response Preference: ${patterns.responseLength} responses (adjust your response length)`,
      `• Emotional Tone: ${patterns.emotionalTone} (adapt your coaching tone)`,
      `• Help Style: ${patterns.helpPreference} approach (adjust guidance style)`
    ];

    // Add specific coaching tips based on patterns
    if (patterns.confidenceLevel === 'low') {
      contextLines.push('• COACHING TIP: This user may need more encouragement and validation');
    } else if (patterns.confidenceLevel === 'high') {
      contextLines.push('• COACHING TIP: This user responds well to challenge and deeper exploration');
    }

    if (patterns.communicationStyle === 'brief') {
      contextLines.push('• COACHING TIP: Keep questions concise and focused');
    } else if (patterns.communicationStyle === 'detailed') {
      contextLines.push('• COACHING TIP: This user appreciates detailed exploration and follow-up questions');
    }

    return contextLines.join('\n') + '\n\nUse this context to personalize your coaching approach, but don\'t explicitly mention these observations.\n';
  }

  /**
   * Save user patterns to persistent storage
   */
  private async saveUserPatterns(userId: string, patterns: UserCommunicationPattern): Promise<void> {
    try {
      // Ensure storage directory exists
      await fs.mkdir(join(process.cwd(), 'storage'), { recursive: true });

      // Load existing data
      let learningData: any = {};
      try {
        const existingData = await fs.readFile(this.learningFilePath, 'utf-8');
        learningData = JSON.parse(existingData);
      } catch (error) {
        learningData = {};
      }

      // Update user patterns
      learningData[userId] = {
        patterns,
        lastUpdated: new Date().toISOString()
      };

      // Save updated data
      await fs.writeFile(this.learningFilePath, JSON.stringify(learningData, null, 2));
      console.log(`✅ User patterns saved for ${userId}`);
    } catch (error) {
      console.error('❌ Error saving user patterns:', error);
    }
  }

  /**
   * Load user patterns from storage
   */
  private async loadUserPatterns(userId: string): Promise<UserCommunicationPattern | null> {
    try {
      const existingData = await fs.readFile(this.learningFilePath, 'utf-8');
      const learningData = JSON.parse(existingData);
      return learningData[userId]?.patterns || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Process conversation end and trigger learning update
   */
  async processConversationEnd(userId: string, messages: any[], context: any): Promise<void> {
    try {
      const analysis = await this.analyzeConversation(userId, messages, context);
      await this.updateUserPatterns(userId, analysis, context);
      
      console.log(`🧠 User learning updated for ${userId} after conversation in ${context?.stepName || 'unknown step'}`);
    } catch (error) {
      console.error('❌ Error processing conversation for user learning:', error);
    }
  }

  /**
   * Clear user patterns (for testing/admin purposes)
   */
  async clearUserPatterns(userId: string): Promise<void> {
    this.userPatternsCache.delete(userId);
    
    try {
      const existingData = await fs.readFile(this.learningFilePath, 'utf-8');
      const learningData = JSON.parse(existingData);
      delete learningData[userId];
      await fs.writeFile(this.learningFilePath, JSON.stringify(learningData, null, 2));
      console.log(`🗑️ Cleared user patterns for ${userId}`);
    } catch (error) {
      console.log(`ℹ️ No existing patterns to clear for ${userId}`);
    }
  }
}

// Export singleton instance
export const userLearningService = new UserLearningService();
export default userLearningService;