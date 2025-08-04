/**
 * Escalation Service
 * ==================
 * Service for Talia personas to request help from METAlia
 * Provides easy-to-use functions for creating escalation requests
 */

import { conversationLoggingService } from './conversation-logging-service.js';

export interface EscalationRequest {
  requestingPersona: string;
  escalationType: 'clarification' | 'instruction_improvement' | 'error_report';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  question: string;
  userMessage?: string;
  attemptedResponse?: string;
  contextData?: any;
  relatedConversationId?: string;
}

export class EscalationService {
  
  /**
   * Create an escalation request for clarification
   * Use when a persona is unsure how to respond to a user question
   */
  async requestClarification(
    requestingPersona: string,
    question: string,
    userMessage: string,
    contextData?: any,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  ): Promise<string> {
    return await conversationLoggingService.createEscalation({
      requestingPersona,
      escalationType: 'clarification',
      priority,
      question: `Need clarification: ${question}`,
      userMessage,
      contextData,
      attemptedResponse: null
    });
  }

  /**
   * Request instruction improvement
   * Use when a persona identifies a gap in their training or instructions
   */
  async requestInstructionImprovement(
    requestingPersona: string,
    improvementDescription: string,
    exampleContext?: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  ): Promise<string> {
    return await conversationLoggingService.createEscalation({
      requestingPersona,
      escalationType: 'instruction_improvement',
      priority,
      question: `Instruction improvement needed: ${improvementDescription}`,
      userMessage: exampleContext || null,
      contextData: { improvementType: 'instruction_gap' }
    });
  }

  /**
   * Report an error or unexpected situation
   * Use when a persona encounters technical issues or unexpected responses
   */
  async reportError(
    requestingPersona: string,
    errorDescription: string,
    userMessage?: string,
    attemptedResponse?: string,
    errorDetails?: any,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'high'
  ): Promise<string> {
    return await conversationLoggingService.createEscalation({
      requestingPersona,
      escalationType: 'error_report',
      priority,
      question: `Error encountered: ${errorDescription}`,
      userMessage,
      attemptedResponse,
      contextData: { 
        errorType: 'technical_issue',
        errorDetails 
      }
    });
  }

  /**
   * Generic escalation request
   * Use for any other type of escalation not covered by specific methods
   */
  async createEscalation(request: EscalationRequest): Promise<string> {
    return await conversationLoggingService.createEscalation(request);
  }

  /**
   * Check if a persona should escalate based on confidence level
   * Returns true if the persona should escalate to METAlia
   */
  shouldEscalate(
    confidence: number, 
    contextComplexity: 'low' | 'medium' | 'high' = 'medium',
    personaType: string = 'unknown'
  ): boolean {
    // Define confidence thresholds by persona type and context complexity
    const thresholds = {
      'star_report': {
        low: 0.3,
        medium: 0.4,
        high: 0.5
      },
      'talia_coach': {
        low: 0.4,
        medium: 0.5,
        high: 0.6
      },
      'ast_reflection': {
        low: 0.4,
        medium: 0.5,
        high: 0.6
      },
      'default': {
        low: 0.4,
        medium: 0.5,
        high: 0.6
      }
    };

    const personaThresholds = thresholds[personaType as keyof typeof thresholds] || thresholds.default;
    const threshold = personaThresholds[contextComplexity];

    return confidence < threshold;
  }

  /**
   * Get escalation recommendations for a persona
   * Provides guidance on when and how to escalate
   */
  getEscalationGuidance(
    personaType: string,
    situationType: 'unclear_user_intent' | 'missing_information' | 'technical_error' | 'instruction_gap'
  ): {
    shouldEscalate: boolean;
    escalationType: 'clarification' | 'instruction_improvement' | 'error_report';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    template: string;
  } {
    const guidance = {
      'unclear_user_intent': {
        shouldEscalate: true,
        escalationType: 'clarification' as const,
        priority: 'medium' as const,
        template: 'User message: "{userMessage}" - I\'m unsure how to interpret this request. What would be the most helpful response?'
      },
      'missing_information': {
        shouldEscalate: true,
        escalationType: 'clarification' as const,
        priority: 'medium' as const,
        template: 'I don\'t have sufficient information to provide a helpful response about: {topic}. What additional context or instructions should I have?'
      },
      'technical_error': {
        shouldEscalate: true,
        escalationType: 'error_report' as const,
        priority: 'high' as const,
        template: 'Technical error encountered: {errorDescription}. This is preventing me from providing the expected response.'
      },
      'instruction_gap': {
        shouldEscalate: true,
        escalationType: 'instruction_improvement' as const,
        priority: 'medium' as const,
        template: 'I\'ve identified a gap in my instructions for: {scenario}. I would benefit from additional guidance on how to handle this situation.'
      }
    };

    return guidance[situationType];
  }
}

// Create singleton instance
export const escalationService = new EscalationService();

// Default export
export default escalationService;