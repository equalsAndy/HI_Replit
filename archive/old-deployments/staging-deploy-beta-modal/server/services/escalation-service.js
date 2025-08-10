import { conversationLoggingService } from './conversation-logging-service.js';
export class EscalationService {
    async requestClarification(requestingPersona, question, userMessage, contextData, priority = 'medium') {
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
    async requestInstructionImprovement(requestingPersona, improvementDescription, exampleContext, priority = 'medium') {
        return await conversationLoggingService.createEscalation({
            requestingPersona,
            escalationType: 'instruction_improvement',
            priority,
            question: `Instruction improvement needed: ${improvementDescription}`,
            userMessage: exampleContext || null,
            contextData: { improvementType: 'instruction_gap' }
        });
    }
    async reportError(requestingPersona, errorDescription, userMessage, attemptedResponse, errorDetails, priority = 'high') {
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
    async createEscalation(request) {
        return await conversationLoggingService.createEscalation(request);
    }
    shouldEscalate(confidence, contextComplexity = 'medium', personaType = 'unknown') {
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
        const personaThresholds = thresholds[personaType] || thresholds.default;
        const threshold = personaThresholds[contextComplexity];
        return confidence < threshold;
    }
    getEscalationGuidance(personaType, situationType) {
        const guidance = {
            'unclear_user_intent': {
                shouldEscalate: true,
                escalationType: 'clarification',
                priority: 'medium',
                template: 'User message: "{userMessage}" - I\'m unsure how to interpret this request. What would be the most helpful response?'
            },
            'missing_information': {
                shouldEscalate: true,
                escalationType: 'clarification',
                priority: 'medium',
                template: 'I don\'t have sufficient information to provide a helpful response about: {topic}. What additional context or instructions should I have?'
            },
            'technical_error': {
                shouldEscalate: true,
                escalationType: 'error_report',
                priority: 'high',
                template: 'Technical error encountered: {errorDescription}. This is preventing me from providing the expected response.'
            },
            'instruction_gap': {
                shouldEscalate: true,
                escalationType: 'instruction_improvement',
                priority: 'medium',
                template: 'I\'ve identified a gap in my instructions for: {scenario}. I would benefit from additional guidance on how to handle this situation.'
            }
        };
        return guidance[situationType];
    }
}
export const escalationService = new EscalationService();
export default escalationService;
