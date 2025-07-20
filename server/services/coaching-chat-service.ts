/**
 * AWS Bedrock Coaching Chat Service
 * =================================
 * Handles AI-powered coaching conversations using Claude via AWS Bedrock
 */

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres, { Sql } from 'postgres';
import { eq, desc, and, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import * as schema from '../../shared/schema.js';

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

// Types
interface ConversationContext {
    history?: Array<{
        role: 'user' | 'assistant';
        content: string;
        timestamp: Date;
    }>;
    userProfile?: {
        workshop_progress?: string;
        [key: string]: any;
    };
}

interface CoachingMetadata {
    model?: string;
    responseTime?: number;
    requestId?: string;
    persona?: string;
    workshopStep?: string;
    error?: string;
    fallback?: boolean;
    [key: string]: any;
}

// Initialize Bedrock client
const getBedrockClientConfig = () => {
    const config: any = {
        region: process.env.AWS_REGION || 'us-west-2'
    };

    // If bearer token is provided, try to parse it as BedrockAPIKey
    if (process.env.AWS_BEARER_TOKEN_BEDROCK) {
        try {
            // Decode the base64 token
            const decoded = Buffer.from(process.env.AWS_BEARER_TOKEN_BEDROCK, 'base64').toString('utf-8');
            
            // Check if it's a BedrockAPIKey format
            if (decoded.startsWith('BedrockAPIKey-')) {
                const [identifier, secret] = decoded.split(':');
                
                // Extract the key parts from the identifier
                const keyParts = identifier.replace('BedrockAPIKey-', '').split('-');
                const accessKeyId = keyParts.slice(0, -1).join('-'); // Everything except the last part
                const accountId = keyParts[keyParts.length - 1]; // Last part should be account ID
                
                config.credentials = {
                    accessKeyId: accessKeyId || 'bedrock-api-key',
                    secretAccessKey: secret,
                    // No session token for API keys
                };
                
                console.log('Using Bedrock API Key authentication');
            } else {
                console.log('Bearer token format not recognized, using as session token');
                config.credentials = {
                    accessKeyId: 'temporary-key',
                    secretAccessKey: 'temporary-secret',
                    sessionToken: process.env.AWS_BEARER_TOKEN_BEDROCK
                };
            }
        } catch (error) {
            console.error('Error parsing bearer token:', error);
            // Fall back to using as session token
            config.credentials = {
                accessKeyId: 'temporary-key',
                secretAccessKey: 'temporary-secret',
                sessionToken: process.env.AWS_BEARER_TOKEN_BEDROCK
            };
        }
    }
    // Otherwise, AWS SDK will automatically load credentials from environment or credentials file

    return config;
};

const bedrockClient = new BedrockRuntimeClient(getBedrockClientConfig());

/**
 * Coaching personas with different interaction styles
 */
const COACHING_PERSONAS = {
    talia_coach: {
        name: 'Talia',
        description: 'Expert AST coach with deep knowledge of Five Strengths framework',
        systemPrompt: `You are Talia, an expert AllStarTeams coach with years of experience helping individuals and teams understand their unique strengths through the Five Strengths framework (Imagination, Thinking, Planning, Acting, Feeling).

Your coaching style is:
- Warm, insightful, and personalized
- Grounded in AST methodology and real experience
- Focused on practical application of strengths
- Encouraging while being direct about growth areas
- Reference specific AST concepts and tools

Always connect insights back to the user's dominant strength and how it affects their team dynamics.`,
        maxTokens: 2000
    },
    
    workshop_assistant: {
        name: 'Workshop Assistant',
        description: 'Guides users through AST workshop steps with clear instructions',
        systemPrompt: `You are a helpful workshop assistant guiding users through the AllStarTeams strengths discovery workshop.

IMPORTANT: The AllStarTeams framework focuses on 5 core strengths:
- IMAGINATION: Creative thinking, innovation, visioning
- THINKING: Analysis, logic, problem-solving, research
- PLANNING: Organization, strategy, project management
- ACTING: Implementation, execution, getting things done
- FEELING: Emotional intelligence, relationships, empathy

Your role is to:
- Provide clear, step-by-step guidance for each workshop stage
- Help users understand their personal Star Card assessment results
- Connect their dominant strength to practical applications
- Explain how their strength profile affects team dynamics
- Troubleshoot technical issues with the workshop platform
- Keep users motivated and on track with personalized insights

ALWAYS reference the user's specific Star Card scores when providing guidance. Make connections between their dominant strength and the current workshop activity.

Be encouraging, practical, and focused on helping users complete their workshop successfully while gaining deep insights into their unique strengths.`,
        maxTokens: 1500
    },
    
    team_advisor: {
        name: 'Team Advisor',
        description: 'Advanced team development strategist for teams with access',
        systemPrompt: `You are an experienced team development advisor specializing in AllStarTeams methodology for high-performing teams.

You provide:
- Advanced team composition analysis
- Sophisticated collaboration strategies
- Leadership development insights
- Team conflict resolution approaches
- Performance optimization techniques

This is premium content only available to teams with proper access. Provide depth and sophistication appropriate for team leaders and experienced practitioners.`,
        maxTokens: 2500
    }
};

/**
 * Get coaching conversation history
 */
async function getConversationHistory(conversationId: string, limit: number = 10) {
    try {
        const messages = await db.execute(sql`
            SELECT sender_type, message_content, created_at 
            FROM coaching_messages 
            WHERE conversation_id = ${conversationId}
            ORDER BY created_at ASC
            LIMIT ${limit}
        `);
        
        return messages.map(msg => ({
            role: msg.sender_type === 'user' ? 'user' : 'assistant',
            content: msg.message_content,
            timestamp: msg.created_at
        }));
    } catch (error) {
        console.error('Error fetching conversation history:', error);
        return [];
    }
}

/**
 * Get coaching prompt template
 */
async function getCoachingPrompt(promptKey: string, personaType: string, workshopStep: string | null = null) {
    try {
        const prompt = await db.execute(sql`
            SELECT prompt_template, system_instructions, response_format
            FROM coaching_prompts 
            WHERE prompt_key = ${promptKey} 
            AND persona_type = ${personaType}
            AND (workshop_step = ${workshopStep} OR workshop_step IS NULL)
            AND is_active = true
            ORDER BY version DESC
            LIMIT 1
        `);
        
        return prompt[0] || null;
    } catch (error) {
        console.error('Error fetching coaching prompt:', error);
        return null;
    }
}

/**
 * Replace template variables in prompt
 */
function interpolatePrompt(template: string, variables: Record<string, any>) {
    let result = template;
    
    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, value || '');
    }
    
    return result;
}

async function searchKnowledgeBase(query: string, limit: number = 5) {
    try {
        const searchResults = await db.select({
            title: schema.coachKnowledgeBase.title,
            content: schema.coachKnowledgeBase.content,
            source: schema.coachKnowledgeBase.source,
        }).from(schema.coachKnowledgeBase)
            .where(sql`search_vector @@ to_tsquery('english', ${query.split(' ').join(' & ')})`)
            .limit(limit);
        
        return searchResults;
    } catch (error) {
        console.error('Error searching knowledge base:', error);
        return [];
    }
}

/**
 * Generate coaching response using AWS Bedrock Claude
 */
async function generateCoachingResponse(
    personaType: string,
    userMessage: string,
    conversationContext: ConversationContext = {},
    workshopStep: string | null = null
) {
    try {
        const persona = COACHING_PERSONAS[personaType as keyof typeof COACHING_PERSONAS];
        if (!persona) {
            throw new Error(`Unknown persona type: ${personaType}`);
        }

        // Build conversation context
        const history = conversationContext.history || [];
        const userProfile = conversationContext.userProfile || {};
        
        // Debug: Log the userProfile to see what context we're receiving
        console.log('🔍 DEBUG: userProfile received:', JSON.stringify(userProfile, null, 2));
        console.log('🔍 DEBUG: reflectionQuestion:', userProfile.reflectionQuestion);
        console.log('🔍 DEBUG: workshopStep:', workshopStep);
        
        // Get user's Star Card data for personalized coaching
        let userContext = '';
        if (conversationContext.userProfile?.userId) {
            const userId = conversationContext.userProfile.userId;
            
            // Fetch user's Star Card assessment
            const starCardResult = await db.execute(sql`
                SELECT results FROM assessment_results 
                WHERE user_id = ${userId} AND assessment_type = 'starCard'
                ORDER BY created_at DESC LIMIT 1
            `);
            
            if (starCardResult.length > 0) {
                const starData = JSON.parse(starCardResult[0].results as string) as Record<string, number>;
                const strengthOrder = Object.entries(starData)
                    .sort(([,a], [,b]) => b - a)
                    .map(([strength, score]) => `${strength}: ${score}`);
                
                const dominantStrengthEntry = Object.entries(starData)
                    .reduce((max, current) => current[1] > max[1] ? current : max);
                const dominantStrength = dominantStrengthEntry[0];
                const dominantScore = dominantStrengthEntry[1];
                
                userContext = `
IMPORTANT USER CONTEXT:
- User's Star Card Results: ${strengthOrder.join(', ')}
- Dominant Strength: ${dominantStrength} (${dominantScore})
- Current Workshop Step: ${workshopStep || 'General coaching'}
${userProfile.reflectionQuestion ? `- Current Reflection Question: "${userProfile.reflectionQuestion}"` : ''}
- Assessment Type: AllStarTeams Five Strengths (Imagination, Thinking, Planning, Acting, Feeling)

Reference their specific strength scores when providing coaching. Their ${dominantStrength} strength should be acknowledged as their primary talent.${userProfile.reflectionQuestion ? ` Help them specifically with their current reflection question: "${userProfile.reflectionQuestion}"` : ''}`;
            } else {
                // No Star Card data found, but still provide basic context
                userContext = `
IMPORTANT USER CONTEXT:
- Current Workshop Step: ${workshopStep || 'General coaching'}
${userProfile.reflectionQuestion ? `- Current Reflection Question: "${userProfile.reflectionQuestion}"` : ''}
- Assessment Type: AllStarTeams Five Strengths (Imagination, Thinking, Planning, Acting, Feeling)

${userProfile.reflectionQuestion ? `Help them specifically with their current reflection question: "${userProfile.reflectionQuestion}"` : 'Provide general coaching support for this workshop step.'}`;
            }
        } else {
            // No user ID, provide minimal context
            userContext = `
IMPORTANT USER CONTEXT:
- Current Workshop Step: ${workshopStep || 'General coaching'}
${userProfile.reflectionQuestion ? `- Current Reflection Question: "${userProfile.reflectionQuestion}"` : ''}

${userProfile.reflectionQuestion ? `Help them specifically with their current reflection question: "${userProfile.reflectionQuestion}"` : 'Provide general coaching support.'}`;
        }
        
        // Search knowledge base for relevant context
        const knowledgeResults = await searchKnowledgeBase(userMessage);
        let knowledgeContext = '';
        if (knowledgeResults.length > 0) {
            knowledgeContext = 'Here is some relevant information from my knowledge base that might help:\n\n' +
                knowledgeResults.map(r => `Title: ${r.title}\nContent: ${r.content}`).join('\n\n');
        }

        // Get any relevant coaching prompts
        let contextualPrompt = '';
        if (workshopStep) {
            const promptData = await getCoachingPrompt('workshop_intro', personaType, workshopStep);
            if (promptData) {
                contextualPrompt = interpolatePrompt(promptData.prompt_template as string, {
                    workshop_step: workshopStep,
                    user_progress: userProfile.workshop_progress || 'Just starting',
                    user_context: userMessage
                });
            }
        }

        // Build messages for Claude
        const messages = [
            {
                role: 'user',
                content: userContext + '\n\n' + contextualPrompt + '\n\n' + knowledgeContext + '\n\nUser message: ' + userMessage
            }
        ];

        // Add conversation history
        if (history.length > 0) {
            const historyMessages = history.slice(-6).map((msg: any) => ({
                role: msg.role,
                content: msg.content
            }));
            messages.unshift(...historyMessages);
        }

        // Prepare Bedrock request
        const requestBody = {
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: persona.maxTokens,
            system: persona.systemPrompt,
            messages: messages,
            temperature: 0.7,
            top_p: 0.9
        };

        const command = new InvokeModelCommand({
            modelId: process.env.CLAUDE_MODEL_ID,
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify(requestBody)
        });

        const startTime = Date.now();
        const response = await bedrockClient.send(command);
        const responseTime = Date.now() - startTime;

        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        
        return {
            content: responseBody.content[0].text,
            metadata: {
                model: process.env.CLAUDE_MODEL_ID,
                responseTime,
                requestId: response.$metadata.requestId,
                persona: personaType,
                workshopStep
            }
        };

    } catch (error) {
        console.error('Error generating coaching response:', error);
        
        // Fallback response for development/testing
        return {
            content: `I'm ${COACHING_PERSONAS[personaType as keyof typeof COACHING_PERSONAS]?.name || 'your coach'}, and I'm here to help! However, I'm currently having trouble connecting to my AI systems. 

Your message: "${userMessage}"

This appears to be related to ${workshopStep ? `workshop step ${workshopStep}` : 'general coaching'}. 

In the meantime, I'd suggest reviewing the AST framework materials in your dashboard. Would you like me to help you with something specific about the workshop content?`,
            metadata: {
                error: (error as Error).message,
                fallback: true,
                persona: personaType
            }
        };
    }
}

/**
 * Save coaching message to database
 */
async function saveCoachingMessage(conversationId: string, senderType: string, content: string, metadata: CoachingMetadata = {}) {
    try {
        // Truncate model field to fit VARCHAR(100) constraint
        const truncatedModel = metadata.model ? metadata.model.substring(0, 100) : null;
        
        const result = await db.execute(sql`
            INSERT INTO coaching_messages (
                conversation_id, sender_type, message_content, message_metadata,
                bedrock_request_id, bedrock_model, response_time_ms
            ) VALUES (
                ${conversationId}, ${senderType}, ${content}, ${JSON.stringify(metadata)},
                ${metadata.requestId || null}, ${truncatedModel}, ${metadata.responseTime || null}
            )
            RETURNING id, created_at
        `);
        
        return result[0];
    } catch (error) {
        console.error('Error saving coaching message:', error);
        throw error;
    }
}

/**
 * Create or get coaching conversation
 */
async function getOrCreateConversation(userId: number, personaType: string, workshopStep: string | null = null) {
    try {
        // Try to get existing active conversation with separate queries to avoid parameter type issues
        let conversation;
        
        if (workshopStep === null) {
            conversation = await db.execute(sql`
                SELECT id, conversation_title, context_data
                FROM coaching_conversations 
                WHERE user_id = ${userId} 
                AND persona_type = ${personaType}
                AND status = 'active'
                AND workshop_step IS NULL
                ORDER BY updated_at DESC
                LIMIT 1
            `);
        } else {
            conversation = await db.execute(sql`
                SELECT id, conversation_title, context_data
                FROM coaching_conversations 
                WHERE user_id = ${userId} 
                AND persona_type = ${personaType}
                AND status = 'active'
                AND workshop_step = ${workshopStep}
                ORDER BY updated_at DESC
                LIMIT 1
            `);
        }

        if (conversation.length > 0) {
            return conversation[0];
        }

        // Create new conversation
        const conversationId = randomUUID();
        const conversationTitle = `${COACHING_PERSONAS[personaType as keyof typeof COACHING_PERSONAS]?.name || personaType} Session`;
        const now = new Date().toISOString();
        
        const newConversation = await db.execute(sql`
            INSERT INTO coaching_conversations (
                id, user_id, persona_type, conversation_title, 
                status, workshop_step, context_data, created_at, updated_at
            ) VALUES (
                ${conversationId}, ${userId}, ${personaType}, ${conversationTitle},
                'active', ${workshopStep}, '{}', ${now}, ${now}
            )
            RETURNING id, conversation_title, context_data
        `);

        return newConversation[0];

    } catch (error) {
        console.error('Error creating conversation:', error);
        throw error;
    }
}

export {
    generateCoachingResponse,
    getConversationHistory,
    saveCoachingMessage,
    getOrCreateConversation,
    COACHING_PERSONAS
};
