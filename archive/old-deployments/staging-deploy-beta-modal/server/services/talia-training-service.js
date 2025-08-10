import { Pool } from 'pg';
import { promises as fs } from 'fs';
import { join } from 'path';
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
export class TaliaTrainingService {
    activeSessions = new Map();
    trainingFilePath = join(process.cwd(), 'storage', 'talia-training.json');
    isTrainCommand(message) {
        return message.trim() === 'TRAIN';
    }
    async enterTrainingMode(userId, personaId) {
        const sessionId = `${userId}_${personaId}_${Date.now()}`;
        const session = {
            id: sessionId,
            userId,
            personaId,
            startTime: new Date(),
            isActive: true,
            conversationHistory: []
        };
        session.conversationHistory.push({
            role: 'system',
            content: 'Training mode activated. You can now discuss and clarify the behavior you want from Talia. When finished, she will summarize the training and add it to her permanent knowledge.',
            timestamp: new Date()
        });
        this.activeSessions.set(userId, session);
        return session;
    }
    isInTrainingMode(userId) {
        const session = this.activeSessions.get(userId);
        return session?.isActive === true;
    }
    getTrainingSession(userId) {
        return this.activeSessions.get(userId) || null;
    }
    async processTrainingMessage(userId, message) {
        const session = this.activeSessions.get(userId);
        if (!session || !session.isActive) {
            throw new Error('No active training session');
        }
        session.conversationHistory.push({
            role: 'user',
            content: message,
            timestamp: new Date()
        });
        if (message.toLowerCase().includes('done') || message.toLowerCase().includes('finished') || message.toLowerCase().includes('exit')) {
            return await this.exitTrainingMode(userId);
        }
        const response = await this.generateTrainingResponse(session, message);
        session.conversationHistory.push({
            role: 'talia',
            content: response,
            timestamp: new Date()
        });
        return response;
    }
    async generateTrainingResponse(session, userMessage) {
        try {
            const { generateClaudeCoachingResponse } = await import('./claude-api-service.js');
            const { textSearchService } = await import('./text-search-service.js');
            const conversationHistory = session.conversationHistory
                .filter(msg => msg.role !== 'system')
                .map(msg => `${msg.role}: ${msg.content}`)
                .join('\n');
            const contextQueries = [
                'talia coaching methodology training guidelines',
                'coaching behavior and approach',
                'training feedback and improvement'
            ];
            const trainingContext = await textSearchService.generateContextForAI(contextQueries, {
                maxChunksPerQuery: 2,
                contextStyle: 'detailed',
                documentTypes: ['coaching_guide', 'methodology']
            });
            const trainingPrompt = `You are Talia in TRAINING MODE. Your job is to:

1. LISTEN CAREFULLY to the feedback being given
2. SUMMARIZE what you heard when asked
3. ASK CLARIFYING QUESTIONS to understand exactly what behavior changes are wanted
4. BE CONVERSATIONAL and engaged, not robotic
5. ACKNOWLEDGE specific feedback with understanding
6. REFERENCE your training documents when relevant to show you understand your role

TRAINING CONTEXT FROM YOUR DOCUMENTS:
${trainingContext.context}

Current conversation:
${conversationHistory}

Latest user message: "${userMessage}"

IMPORTANT: You have access to your training documents and should reference them to show understanding of your role and methodology. When discussing your behavior or approach, draw from the training materials to demonstrate your knowledge.

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
        }
        catch (error) {
            console.error('❌ Error generating training response:', error);
            if (userMessage.toLowerCase().includes('feedback') && (userMessage.includes('what') || userMessage.includes('my'))) {
                const userMessages = session.conversationHistory
                    .filter(msg => msg.role === 'user' && !msg.content.toLowerCase().includes('feedback'))
                    .map(msg => msg.content);
                if (userMessages.length > 0) {
                    const lastFeedback = userMessages[userMessages.length - 1];
                    return `Your feedback was: "${lastFeedback}". Let me make sure I understand this correctly - is there anything else you'd like to clarify about this?`;
                }
            }
            return `I want to make sure I understand your feedback correctly. Can you help me be more specific about what you'd like me to change?`;
        }
    }
    async exitTrainingMode(userId) {
        const session = this.activeSessions.get(userId);
        if (!session || !session.isActive) {
            throw new Error('No active training session');
        }
        session.isActive = false;
        const trainingContext = await this.extractTrainingContext(session);
        await this.saveTrainingData(session.personaId, trainingContext);
        this.activeSessions.delete(userId);
        return `Training session completed! I've learned from our conversation and added the following to my permanent training:

**Topic:** ${trainingContext.topic}
**Desired Behavior:** ${trainingContext.desiredBehavior}
**Guidelines Added:** ${trainingContext.guidelines.length} new guidelines

This training will now be part of my permanent knowledge and will help me provide better coaching in the future. Thank you for helping me improve!`;
    }
    async extractTrainingContext(session) {
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
    async saveTrainingData(personaId, context) {
        try {
            await fs.mkdir(join(process.cwd(), 'storage'), { recursive: true });
            let trainingData = {};
            try {
                const existingData = await fs.readFile(this.trainingFilePath, 'utf-8');
                trainingData = JSON.parse(existingData);
            }
            catch (error) {
                trainingData = {};
            }
            if (!trainingData[personaId]) {
                trainingData[personaId] = {
                    trainingSessions: [],
                    guidelines: [],
                    examples: [],
                    lastUpdated: null
                };
            }
            trainingData[personaId].trainingSessions.push({
                timestamp: new Date().toISOString(),
                topic: context.topic,
                desiredBehavior: context.desiredBehavior,
                guidelines: context.guidelines,
                examples: context.examples
            });
            trainingData[personaId].guidelines.push(...context.guidelines);
            trainingData[personaId].examples.push(...context.examples);
            trainingData[personaId].lastUpdated = new Date().toISOString();
            await fs.writeFile(this.trainingFilePath, JSON.stringify(trainingData, null, 2));
            console.log(`✅ Training data saved for persona ${personaId}`);
        }
        catch (error) {
            console.error('❌ Error saving training data:', error);
            throw new Error('Failed to save training data');
        }
    }
    async loadTrainingData(personaId) {
        try {
            const existingData = await fs.readFile(this.trainingFilePath, 'utf-8');
            const trainingData = JSON.parse(existingData);
            return trainingData[personaId] || null;
        }
        catch (error) {
            console.log(`No training data found for persona ${personaId}`);
            return null;
        }
    }
    async getTrainingContextForPrompt(personaId) {
        const trainingData = await this.loadTrainingData(personaId);
        if (!trainingData || !trainingData.trainingSessions.length || trainingData.enabled === false) {
            return '';
        }
        const recentSessions = trainingData.trainingSessions.slice(-5);
        const guidelines = trainingData.guidelines.slice(-10);
        return `TRAINING CONTEXT (from admin training sessions):
Recent Training Guidelines:
${guidelines.map((g, i) => `${i + 1}. ${g}`).join('\n')}

Recent Training Topics:
${recentSessions.map(s => `- ${s.topic}: ${s.desiredBehavior.substring(0, 100)}...`).join('\n')}

Apply this training context to improve your coaching responses.`;
    }
    async addTrainingFromAdmin(personaId, trainingText, adminUserId) {
        const context = {
            topic: `Admin training input - ${new Date().toLocaleDateString()}`,
            desiredBehavior: trainingText,
            examples: [trainingText],
            guidelines: [`Admin guidance: ${trainingText}`]
        };
        await this.saveTrainingData(personaId, context);
        console.log(`✅ Admin training added for persona ${personaId} by user ${adminUserId}`);
    }
    async getTrainingConversationHistory(personaId) {
        const trainingData = await this.loadTrainingData(personaId);
        if (!trainingData || !trainingData.trainingSessions.length) {
            return `# Training Conversation History for ${personaId}

## Status
No training conversations have been recorded yet for this persona.

## Getting Started
- Use the TRAIN command during conversations to start a training session
- Training sessions capture feedback, behavior changes, and coaching improvements
- All training is automatically saved and becomes part of Talia's knowledge base

## Available Training Commands
- **TRAIN** - Enter training mode to provide feedback and coaching improvements
- Training sessions end when you say "done", "finished", or "exit"`;
        }
        const totalSessions = trainingData.trainingSessions.length;
        const totalGuidelines = trainingData.guidelines.length;
        const lastUpdated = trainingData.lastUpdated;
        let historyDoc = `# Training Conversation History for ${personaId}

## Overview
- **Total Training Sessions:** ${totalSessions}
- **Total Guidelines Generated:** ${totalGuidelines}
- **Last Updated:** ${new Date(lastUpdated).toLocaleString()}

## Recent Training Sessions
`;
        const recentSessions = trainingData.trainingSessions.slice(-10).reverse();
        recentSessions.forEach((session, index) => {
            historyDoc += `
### Session ${totalSessions - index} - ${new Date(session.timestamp).toLocaleDateString()}
**Topic:** ${session.topic}
**Desired Behavior Changes:** ${session.desiredBehavior}
**Guidelines Added:** ${session.guidelines.length}
**Examples Provided:** ${session.examples.length}

**Key Guidelines:**
${session.guidelines.map((g, i) => `${i + 1}. ${g}`).join('\n')}

**Training Examples:**
${session.examples.map((e, i) => `${i + 1}. "${e.substring(0, 200)}${e.length > 200 ? '...' : ''}"`).join('\n')}

---
`;
        });
        historyDoc += `
## All Current Guidelines
These are the accumulated guidelines from all training sessions:

${trainingData.guidelines.slice(-20).map((g, i) => `${i + 1}. ${g}`).join('\n')}

## Training Impact
This training data is automatically integrated into Talia's responses to:
- Improve coaching approach and techniques
- Provide more personalized and effective guidance
- Apply learned behaviors consistently across conversations
- Reference specific feedback and improvements made

## Usage in Reports
Training conversations directly influence:
- Holistic report generation quality and tone
- Coaching methodology application
- Personalization of insights and recommendations
- Response to user-specific needs and preferences
`;
        return historyDoc;
    }
    async getTrainingInfluenceOnReports(personaId) {
        const trainingData = await this.loadTrainingData(personaId);
        if (!trainingData || !trainingData.trainingSessions.length) {
            return `## Training Influence on Reports

Currently, no specific training has been recorded for ${personaId}. Reports will use:
- Base coaching methodology from training documents
- Standard AllStarTeams framework
- Default report templates and structures

**To improve report quality through training:**
1. Use the TRAIN command to provide feedback on report content
2. Discuss specific improvements needed in report tone or focus
3. Provide examples of preferred coaching language and approach
4. Training will automatically be applied to future report generation`;
        }
        const reportRelevantSessions = trainingData.trainingSessions.filter(session => session.topic.toLowerCase().includes('report') ||
            session.desiredBehavior.toLowerCase().includes('report') ||
            session.desiredBehavior.toLowerCase().includes('coaching') ||
            session.desiredBehavior.toLowerCase().includes('analysis'));
        const reportGuidelines = trainingData.guidelines.filter(guideline => guideline.toLowerCase().includes('report') ||
            guideline.toLowerCase().includes('analysis') ||
            guideline.toLowerCase().includes('insight') ||
            guideline.toLowerCase().includes('recommendation'));
        let influenceDoc = `## Training Influence on Holistic Reports

### Current Training Impact
- **Total Training Sessions:** ${trainingData.trainingSessions.length}
- **Report-Specific Training:** ${reportRelevantSessions.length} sessions
- **Report-Related Guidelines:** ${reportGuidelines.length}
- **Last Training Update:** ${new Date(trainingData.lastUpdated).toLocaleDateString()}

### Report-Specific Training Applied
`;
        if (reportRelevantSessions.length > 0) {
            reportRelevantSessions.forEach((session, index) => {
                influenceDoc += `
**Training Session ${index + 1}:** ${session.topic}
- Focus: ${session.desiredBehavior.substring(0, 150)}...
- Guidelines: ${session.guidelines.join('; ')}
`;
            });
        }
        else {
            influenceDoc += `
*No report-specific training sessions yet. General coaching training is still applied.*
`;
        }
        influenceDoc += `
### Report Generation Guidelines from Training
${reportGuidelines.length > 0 ? reportGuidelines.map((g, i) => `${i + 1}. ${g}`).join('\n') : '*No specific report guidelines yet*'}

### How Training Improves Reports
1. **Tone and Style:** Training feedback shapes the coaching voice used in reports
2. **Content Focus:** Learned preferences guide which insights to emphasize
3. **Personalization:** Training examples improve user-specific customization
4. **Methodology Application:** Refined understanding of AllStarTeams principles
5. **Insight Quality:** Enhanced ability to generate meaningful development recommendations

### Areas for Future Training
Consider training Talia on:
- Specific report section preferences (executive summary, development recommendations)
- Coaching language that resonates best with different user types
- Balance between detailed analysis and actionable insights
- Integration of StarCard visuals with written analysis
- Tone adjustments for personal vs professional reports
`;
        return influenceDoc;
    }
}
export const taliaTrainingService = new TaliaTrainingService();
export default taliaTrainingService;
