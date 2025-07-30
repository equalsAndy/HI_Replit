/**
 * Talia Training Service
 * ===================
 * Manages training interactions and persistent training data for Talia personas
 */

import { Pool } from 'pg';
import { promises as fs } from 'fs';
import { join } from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

interface TrainingSession {
  id: string;
  userId: string;
  personaId: string;
  startTime: Date;
  isActive: boolean;
  conversationHistory: TrainingMessage[];
}

interface TrainingMessage {
  role: 'user' | 'talia' | 'system';
  content: string;
  timestamp: Date;
  metadata?: any;
}

interface TrainingContext {
  topic: string;
  desiredBehavior: string;
  examples: string[];
  guidelines: string[];
}

export class TaliaTrainingService {
  private activeSessions: Map<string, TrainingSession> = new Map();
  private trainingFilePath = join(process.cwd(), 'storage', 'talia-training.json');

  /**
   * Detect if a user message is the TRAIN command
   */
  isTrainCommand(message: string): boolean {
    return message.trim() === 'TRAIN';
  }

  /**
   * Enter training mode for a specific user and persona
   */
  async enterTrainingMode(userId: string, personaId: string): Promise<TrainingSession> {
    const sessionId = `${userId}_${personaId}_${Date.now()}`;
    
    const session: TrainingSession = {
      id: sessionId,
      userId,
      personaId,
      startTime: new Date(),
      isActive: true,
      conversationHistory: []
    };

    // Add system message explaining training mode
    session.conversationHistory.push({
      role: 'system',
      content: 'Training mode activated. You can now discuss and clarify the behavior you want from Talia. When finished, she will summarize the training and add it to her permanent knowledge.',
      timestamp: new Date()
    });

    this.activeSessions.set(userId, session);
    
    return session;
  }

  /**
   * Check if a user is currently in training mode
   */
  isInTrainingMode(userId: string): boolean {
    const session = this.activeSessions.get(userId);
    return session?.isActive === true;
  }

  /**
   * Get active training session for a user
   */
  getTrainingSession(userId: string): TrainingSession | null {
    return this.activeSessions.get(userId) || null;
  }

  /**
   * Process a training message
   */
  async processTrainingMessage(userId: string, message: string): Promise<string> {
    const session = this.activeSessions.get(userId);
    if (!session || !session.isActive) {
      throw new Error('No active training session');
    }

    // Add user message to history
    session.conversationHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Check if user wants to exit training mode
    if (message.toLowerCase().includes('done') || message.toLowerCase().includes('finished') || message.toLowerCase().includes('exit')) {
      return await this.exitTrainingMode(userId);
    }

    // Generate training response
    const response = await this.generateTrainingResponse(session, message);
    
    // Add response to history
    session.conversationHistory.push({
      role: 'talia',
      content: response,
      timestamp: new Date()
    });

    return response;
  }

  /**
   * Generate a response in training mode
   */
  private async generateTrainingResponse(session: TrainingSession, userMessage: string): Promise<string> {
    try {
      // Use Claude API for intelligent training responses
      const { generateClaudeCoachingResponse } = await import('./claude-api-service.js');
      
      // Build context from conversation history
      const conversationHistory = session.conversationHistory
        .filter(msg => msg.role !== 'system')
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');
      
      // Special training prompt for Talia
      const trainingPrompt = `You are Talia in TRAINING MODE. Your job is to:

1. LISTEN CAREFULLY to the feedback being given
2. SUMMARIZE what you heard when asked
3. ASK CLARIFYING QUESTIONS to understand exactly what behavior changes are wanted
4. BE CONVERSATIONAL and engaged, not robotic
5. ACKNOWLEDGE specific feedback with understanding

Current conversation:
${conversationHistory}

Latest user message: "${userMessage}"

If the user asks "what was my feedback?" or similar, SUMMARIZE the specific feedback they gave you.
If they're giving you new feedback, ACKNOWLEDGE it specifically and ask clarifying questions.
Be authentic and show you're actually listening and processing their input.

Respond as Talia in training mode:`;

      const response = await generateClaudeCoachingResponse({
        userMessage: trainingPrompt,
        personaType: 'training_mode',
        userName: 'trainer',
        contextData: { trainingMode: true },
        userId: session.userId,
        sessionId: session.id,
        maxTokens: 300
      });

      return response;
      
    } catch (error) {
      console.error('❌ Error generating training response:', error);
      
      // Fallback: Try to be more intelligent than canned responses
      if (userMessage.toLowerCase().includes('feedback') && (userMessage.includes('what') || userMessage.includes('my'))) {
        // User is asking what their feedback was - summarize from history
        const userMessages = session.conversationHistory
          .filter(msg => msg.role === 'user' && !msg.content.toLowerCase().includes('feedback'))
          .map(msg => msg.content);
        
        if (userMessages.length > 0) {
          const lastFeedback = userMessages[userMessages.length - 1];
          return `Your feedback was: "${lastFeedback}". Let me make sure I understand this correctly - is there anything else you'd like to clarify about this?`;
        }
      }
      
      // Basic fallback responses that are more engaging
      return `I want to make sure I understand your feedback correctly. Can you help me be more specific about what you'd like me to change?`;
    }
  }

  /**
   * Exit training mode and save training data
   */
  async exitTrainingMode(userId: string): Promise<string> {
    const session = this.activeSessions.get(userId);
    if (!session || !session.isActive) {
      throw new Error('No active training session');
    }

    // Mark session as inactive
    session.isActive = false;

    // Extract training context from conversation
    const trainingContext = await this.extractTrainingContext(session);
    
    // Save training data to persistent storage
    await this.saveTrainingData(session.personaId, trainingContext);

    // Remove from active sessions
    this.activeSessions.delete(userId);

    return `Training session completed! I've learned from our conversation and added the following to my permanent training:

**Topic:** ${trainingContext.topic}
**Desired Behavior:** ${trainingContext.desiredBehavior}
**Guidelines Added:** ${trainingContext.guidelines.length} new guidelines

This training will now be part of my permanent knowledge and will help me provide better coaching in the future. Thank you for helping me improve!`;
  }

  /**
   * Extract training context from conversation history
   */
  private async extractTrainingContext(session: TrainingSession): Promise<TrainingContext> {
    // This is a simplified extraction
    // In a full implementation, this would use Claude API to analyze the conversation
    
    const userMessages = session.conversationHistory
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content);

    const topic = `Training session ${new Date().toISOString().split('T')[0]}`;
    const desiredBehavior = userMessages.join(' ').substring(0, 200) + '...';
    const examples = userMessages.slice(0, 3);
    const guidelines = [
      `User feedback from ${session.startTime.toLocaleDateString()}`,
      `Training session duration: ${Math.round((Date.now() - session.startTime.getTime()) / 1000 / 60)} minutes`,
      `Conversation length: ${session.conversationHistory.length} messages`
    ];

    return {
      topic,
      desiredBehavior,
      examples,
      guidelines
    };
  }

  /**
   * Save training data to persistent storage
   */
  private async saveTrainingData(personaId: string, context: TrainingContext): Promise<void> {
    try {
      // Ensure storage directory exists
      await fs.mkdir(join(process.cwd(), 'storage'), { recursive: true });

      // Load existing training data
      let trainingData: any = {};
      try {
        const existingData = await fs.readFile(this.trainingFilePath, 'utf-8');
        trainingData = JSON.parse(existingData);
      } catch (error) {
        // File doesn't exist yet, start with empty object
        trainingData = {};
      }

      // Initialize persona training if it doesn't exist
      if (!trainingData[personaId]) {
        trainingData[personaId] = {
          trainingSessions: [],
          guidelines: [],
          examples: [],
          lastUpdated: null
        };
      }

      // Add new training session
      trainingData[personaId].trainingSessions.push({
        timestamp: new Date().toISOString(),
        topic: context.topic,
        desiredBehavior: context.desiredBehavior,
        guidelines: context.guidelines,
        examples: context.examples
      });

      // Update guidelines and examples arrays
      trainingData[personaId].guidelines.push(...context.guidelines);
      trainingData[personaId].examples.push(...context.examples);
      trainingData[personaId].lastUpdated = new Date().toISOString();

      // Save updated training data
      await fs.writeFile(this.trainingFilePath, JSON.stringify(trainingData, null, 2));

      console.log(`✅ Training data saved for persona ${personaId}`);
    } catch (error) {
      console.error('❌ Error saving training data:', error);
      throw new Error('Failed to save training data');
    }
  }

  /**
   * Load training data for a persona
   */
  async loadTrainingData(personaId: string): Promise<any> {
    try {
      const existingData = await fs.readFile(this.trainingFilePath, 'utf-8');
      const trainingData = JSON.parse(existingData);
      return trainingData[personaId] || null;
    } catch (error) {
      console.log(`No training data found for persona ${personaId}`);
      return null;
    }
  }

  /**
   * Get training context for persona prompts
   */
  async getTrainingContextForPrompt(personaId: string): Promise<string> {
    const trainingData = await this.loadTrainingData(personaId);
    
    if (!trainingData || !trainingData.trainingSessions.length) {
      return '';
    }

    const recentSessions = trainingData.trainingSessions.slice(-5); // Last 5 sessions
    const guidelines = trainingData.guidelines.slice(-10); // Last 10 guidelines

    return `TRAINING CONTEXT (from admin training sessions):
Recent Training Guidelines:
${guidelines.map((g, i) => `${i + 1}. ${g}`).join('\n')}

Recent Training Topics:
${recentSessions.map(s => `- ${s.topic}: ${s.desiredBehavior.substring(0, 100)}...`).join('\n')}

Apply this training context to improve your coaching responses.`;
  }

  /**
   * Add training from admin text entry
   */
  async addTrainingFromAdmin(personaId: string, trainingText: string, adminUserId: string): Promise<void> {
    const context: TrainingContext = {
      topic: `Admin training input - ${new Date().toLocaleDateString()}`,
      desiredBehavior: trainingText,
      examples: [trainingText],
      guidelines: [`Admin guidance: ${trainingText}`]
    };

    await this.saveTrainingData(personaId, context);
    console.log(`✅ Admin training added for persona ${personaId} by user ${adminUserId}`);
  }
}

// Export singleton instance
export const taliaTrainingService = new TaliaTrainingService();
export default taliaTrainingService;