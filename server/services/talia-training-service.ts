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
    // This is a simplified training conversation
    // In a full implementation, this would use Claude API with special training prompts
    
    const responses = [
      "I understand you want to help me improve my coaching. Can you tell me more specifically what behavior or response style you'd like me to adjust?",
      "That's helpful feedback. Can you give me an example of how you'd like me to respond in that situation?",
      "I see what you mean. Are there any specific phrases or approaches you'd like me to use more often?",
      "Thank you for that clarification. Is there anything else about my coaching style you'd like to discuss?",
      "I appreciate this training. Would you like to give me any specific examples of responses that would be more helpful?",
      "That makes sense. Are there any topics or situations where you'd like me to be more or less detailed in my responses?"
    ];

    // Simple response selection based on conversation length
    const responseIndex = Math.min(session.conversationHistory.length - 1, responses.length - 1);
    return responses[responseIndex];
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