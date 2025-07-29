/**
 * Direct Claude API Service
 * =========================
 * Simple integration with Anthropic's Claude API for coaching responses
 */

import { aiDevConfig } from '../utils/aiDevConfig.js';
import { aiUsageLogger } from './ai-usage-logger.js';
import { taliaPersonaService, TALIA_PERSONAS } from './talia-personas.js';

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  id: string;
  model: string;
  role: 'assistant';
  stop_reason: string;
  stop_sequence: null | string;
  type: 'message';
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

interface CoachingRequestData {
  userMessage: string;
  personaType: string;
  userName: string;
  contextData: any;
  userId?: number;
  sessionId?: string;
  maxTokens?: number;
  stepId?: string; // For AST reflection coaching
}

/**
 * Call Claude API directly
 */
async function callClaudeAPI(
  systemPrompt: string, 
  messages: ClaudeMessage[], 
  maxTokens: number = 1000,
  userId?: number,
  featureName: 'coaching' | 'holistic_reports' | 'reflection_assistance' = 'coaching',
  sessionId?: string
): Promise<string> {
  if (!aiDevConfig.claude.enabled || !aiDevConfig.claude.apiKey) {
    throw new Error('Claude API not configured or disabled');
  }

  // Check if user can use AI (rate limits, feature toggles)
  if (userId) {
    const canUse = await aiUsageLogger.canUseAI(userId, featureName);
    if (!canUse.allowed) {
      throw new Error(`AI usage not allowed: ${canUse.reason}`);
    }
  }

  const startTime = Date.now();
  let success = false;
  let tokensUsed = 0;
  let errorMessage: string | undefined;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': aiDevConfig.claude.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: aiDevConfig.claude.model,
        max_tokens: Math.min(maxTokens, aiDevConfig.claude.maxTokens),
        temperature: aiDevConfig.claude.temperature,
        system: systemPrompt,
        messages: messages
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Claude API error:', response.status, errorData);
      throw new Error(`Claude API error: ${response.status} - ${errorData}`);
    }

    const data: ClaudeResponse = await response.json();
    
    // Extract token usage and mark as successful
    tokensUsed = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);
    success = true;
    
    if (data.content && data.content.length > 0 && data.content[0].text) {
      const responseText = data.content[0].text;
      
      // Log usage after successful call
      if (userId) {
        const responseTime = Date.now() - startTime;
        const costEstimate = aiUsageLogger.calculateCost(tokensUsed);
        
        await aiUsageLogger.logUsage({
          userId,
          featureName,
          tokensUsed,
          responseTimeMs: responseTime,
          success: true,
          costEstimate,
          sessionId
        });
      }
      
      return responseText;
    } else {
      throw new Error('No content in Claude response');
    }
  } catch (error) {
    console.error('Error calling Claude API:', error);
    errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log failed usage
    if (userId) {
      const responseTime = Date.now() - startTime;
      
      await aiUsageLogger.logUsage({
        userId,
        featureName,
        tokensUsed,
        responseTimeMs: responseTime,
        success: false,
        errorMessage,
        sessionId
      });
    }
    
    throw error;
  }
}

/**
 * Validate coaching response for appropriate content and length
 */
function validateCoachingResponse(response: string, personaType: string): string {
  // Content filtering keywords (case insensitive)
  const forbiddenTopics = [
    'medical', 'health', 'doctor', 'therapy', 'medication', 'diagnosis',
    'financial', 'investment', 'money', 'loan', 'debt', 'tax',
    'legal', 'lawyer', 'court', 'lawsuit', 'contract',
    'political', 'politics', 'election', 'government',
    'personal relationship', 'dating', 'marriage', 'divorce',
    'religion', 'spiritual', 'church'
  ];

  // Check for forbidden content
  const lowerResponse = response.toLowerCase();
  const containsForbidden = forbiddenTopics.some(topic => lowerResponse.includes(topic));

  if (containsForbidden) {
    console.warn('⚠️ Response contained forbidden content, using safe fallback');
    return `I appreciate your question! However, I'm specifically designed to help with strengths-based development and teamwork. Let's focus on how your strengths can help you grow professionally. What aspect of your ${personaType === 'talia_coach' ? 'current strength' : 'workshop step'} would you like to explore?`;
  }

  // Length validation - Skip truncation for Talia AST reports which should be comprehensive
  const isASTReport = personaType === 'talia' && 
    (response.includes('Personal Development Report') || response.includes('Professional Profile Report'));
  
  if (!isASTReport && response.length > 1500) {
    console.warn('⚠️ Response too long, truncating');
    const truncated = response.substring(0, 1450);
    const lastSentence = truncated.lastIndexOf('.');
    if (lastSentence > 1000) {
      return truncated.substring(0, lastSentence + 1) + '\n\nWhat specific aspect would you like to explore further?';
    }
  } else if (isASTReport) {
    console.log(`✅ AST Report detected (${response.length} chars) - skipping length truncation`);
  }

  // Check for inappropriate requests for personal information
  const personalInfoRequests = ['tell me about yourself', 'your background', 'your experience', 'where are you from'];
  const containsPersonalRequest = personalInfoRequests.some(request => lowerResponse.includes(request));
  
  if (containsPersonalRequest) {
    console.warn('⚠️ Response contained personal information request, filtering');
    return response.replace(/tell me about.*?(yourself|your background|your experience)/gi, 'let\'s focus on your strengths and development');
  }

  return response;
}

/**
 * Build system prompt for coaching
 */
function buildCoachingSystemPrompt(personaType: string, userName: string, contextData: any): string {
  const basePrompt = `You are ${personaType === 'talia_coach' ? 'Talia' : 'a Workshop Assistant'}, an AI coach for the AllStarTeams strength-based development platform.`;
  
  if (personaType === 'talia_coach') {
    const strengthInfo = contextData.allStrengths ? 
      `\n\n${userName}'s Strength Profile:\n${contextData.allStrengths.map((s: any) => `- ${s.label}: ${s.score}%`).join('\n')}` : '';
    
    const currentFocus = contextData.strengthFocus ? 
      `\n\nCurrent Focus: ${contextData.strengthFocus} strength` : '';

    return `${basePrompt}

You help participants discover and develop their unique strengths through the AllStarTeams methodology. You are supportive, insightful, and focused on growth.

STRICT GUIDELINES - You MUST follow these rules:
1. SCOPE: Only discuss AllStarTeams strengths, teamwork, and professional development
2. NO ADVICE: Never give personal, medical, financial, legal, or life advice outside of workplace strengths
3. STAY IN CHARACTER: You are Talia, a professional strengths coach - be warm but professional
4. LENGTH LIMIT: Keep responses under 250 words maximum
5. NO PERSONAL INFO: Never ask for or remember personal details beyond workshop context
6. REDIRECT OFF-TOPIC: If asked about non-strength topics, politely redirect to strengths coaching

Key coaching principles:
- Help ${userName} understand their strength quadrant (Thinking, Acting, Feeling, Planning)
- Ask guiding questions rather than writing their reflections for them
- Use their actual strength percentages to provide personalized insights
- Encourage self-reflection and growth mindset
- Provide practical, actionable guidance for workplace scenarios
- Be warm and encouraging while being direct when helpful
- When asked for examples, provide 2-3 concrete workplace scenarios
- When asked for guiding questions, provide 3-4 thoughtful questions
- Focus on how strengths apply in team and work contexts

CONTENT BOUNDARIES:
- Only discuss: strengths, teamwork, workplace skills, professional development
- Never discuss: personal relationships, health, finances, politics, controversial topics
- If unsure, ask clarifying questions about their strengths instead

${strengthInfo}${currentFocus}

Current context: ${JSON.stringify(contextData, null, 2)}

Respond as Talia in a conversational, coaching style within these guidelines.`;
  } else {
    return `${basePrompt}

You provide contextual assistance during workshop steps, helping participants understand content and complete activities effectively.

Current context: ${JSON.stringify(contextData, null, 2)}

Respond helpfully and concisely.`;
  }
}

/**
 * Generate coaching response using Claude API
 */
export async function generateClaudeCoachingResponse(requestData: CoachingRequestData): Promise<string> {
  const { userMessage, personaType, userName, contextData, userId, sessionId, maxTokens = 600, stepId } = requestData;

  try {
    console.log(`🤖 Generating Claude response for persona: ${personaType}, user: ${userName}`);
    console.log(`🔧 Claude config: enabled=${aiDevConfig.claude.enabled}, hasKey=${!!aiDevConfig.claude.apiKey}, model=${aiDevConfig.claude.model}`);

    // Handle AST Reflection Talia persona
    if (personaType === 'ast_reflection' && stepId && userId) {
      console.log(`🎯 Using AST Reflection Talia for step: ${stepId}`);
      
      const reflectionContext = await taliaPersonaService.getReflectionContext(userId.toString(), stepId);
      if (reflectionContext) {
        const reflectionPrompt = await taliaPersonaService.generateReflectionPrompt(reflectionContext, userMessage);
        
        const messages: ClaudeMessage[] = [{ role: 'user', content: userMessage }];
        const response = await callClaudeAPI(reflectionPrompt, messages, TALIA_PERSONAS.ast_reflection.tokenLimit, userId, 'coaching', sessionId);
        
        return validateCoachingResponse(response, personaType);
      }
    }

    // Build system prompt with coaching context (for other personas)
    const systemPrompt = buildCoachingSystemPrompt(personaType, userName, contextData);
    
    // Create messages array
    const messages: ClaudeMessage[] = [
      {
        role: 'user',
        content: userMessage
      }
    ];

    // Call Claude API with specified token limit for response length
    console.log(`🚀 About to call Claude API with system prompt length: ${systemPrompt.length}, maxTokens: ${maxTokens}`);
    const response = await callClaudeAPI(systemPrompt, messages, maxTokens, userId, 'coaching', sessionId);
    console.log(`🎉 Claude API call successful!`);
    
    // Validate and filter response
    const validatedResponse = validateCoachingResponse(response, personaType);
    
    console.log(`✅ Claude response generated (${validatedResponse.length} chars)`);
    return validatedResponse;

  } catch (error) {
    console.error('❌ Error generating Claude response:', error);
    
    // For AST reports, try to create a structured fallback using training context
    if (personaType === 'talia' && userMessage.includes('Personal Development Report')) {
      return createASTPersonalReportFallback(contextData, userName);
    } else if (personaType === 'talia' && userMessage.includes('Professional Profile Report')) {
      return createASTProfessionalProfileFallback(contextData, userName);
    }
    
    // Return generic fallback for other coaching scenarios
    return `I'm ${personaType === 'talia_coach' ? 'Talia' : 'your workshop assistant'}, and I'd love to help you with that! However, I'm having trouble connecting to my AI systems right now.

Your message: "${userMessage}"

In the meantime, I encourage you to reflect on what you already know about your strengths. What insights come to mind naturally when you think about this question?`;
  }
}

/**
 * Create structured fallback for AST Personal Development Report
 */
function createASTPersonalReportFallback(contextData: any, userName: string): string {
  return `# Your Personal Development Report

Dear ${userName},

While our AI coaching system is temporarily unavailable, I can still provide you with a structured framework for your personal development based on the AllStarTeams methodology.

## Your Strengths Signature Analysis

Based on your workshop responses, your unique strengths constellation creates a distinctive pattern that influences how you naturally approach challenges, relationships, and goals. Understanding this pattern is crucial for optimizing your effectiveness and satisfaction.

## Key Development Areas to Explore

### 1. Strengths Integration
Reflect on how your top strengths work together to create your unique value. Consider:
- How do your highest strengths complement each other?
- What patterns do you notice in when you feel most effective?
- How might your developing strengths support your dominant ones?

### 2. Flow State Optimization
Your flow assessment reveals opportunities to enhance your peak performance conditions:
- Identify the conditions that most consistently trigger your flow states
- Consider how to structure your environment for optimal engagement
- Develop routines that support sustained focus and energy

### 3. Future Self Integration
Connect your current strengths with your long-term vision:
- How do your natural talents align with your future goals?
- What development would bridge any gaps between present and future?
- How can you leverage your strengths to create the impact you envision?

## Next Steps

When our full AI coaching system is restored, you'll receive a comprehensive, personalized report that includes:
- Detailed constellation analysis with specific development strategies
- Flow enhancement recommendations tailored to your assessment
- Future self-continuity coaching connecting present strengths to long-term goals
- Personal well-being integration strategies
- Specific action plans with timelines

This temporary overview provides a foundation for your reflection while we restore full service.

Best regards,
Talia

---
*This is a structured fallback report generated when our AI systems are temporarily unavailable. Your complete personalized report will be available once full service is restored.*`;
}

/**
 * Create structured fallback for AST Professional Profile Report
 */
function createASTProfessionalProfileFallback(contextData: any, userName: string): string {
  return `# Professional Profile Report

**${userName} | AllStarTeams Workshop Participant**

---

## Executive Summary

This professional profile is designed to help colleagues and team members understand how to work most effectively with ${userName}. Based on AllStarTeams methodology, this overview highlights working style preferences, collaboration guidelines, and optimal team integration strategies.

*Note: This is a structured overview generated while our AI coaching system is temporarily unavailable. A complete, personalized professional profile will be available once full service is restored.*

## Core Strengths Profile

Understanding ${userName}'s strengths constellation provides insight into their natural working style, energy patterns, and preferred approaches to collaboration and problem-solving.

### Collaboration Guidelines

To work effectively with ${userName}:

**Communication Style:**
- Consider how they naturally process information and make decisions
- Adapt your communication approach to align with their strengths pattern
- Provide context and framework that supports their natural working rhythm

**Project Collaboration:**
- Leverage their dominant strengths for maximum team effectiveness
- Support their developing strengths through appropriate partnering
- Structure interactions to optimize their contribution style

**Meeting and Team Dynamics:**
- Consider their energy patterns when scheduling important discussions
- Create space for their natural contribution style to emerge
- Build on their strengths while supporting growth areas

## Flow State and Performance Conditions

${userName} performs optimally under specific conditions that align with their natural strengths and working style:

**Optimal Work Environment:**
- Conditions that support their dominant strengths
- Balance of challenge and skill level
- Clear connections between tasks and larger goals

**Performance Enhancement:**
- Regular feedback aligned with their preferred communication style
- Autonomy in areas where their strengths are strongest
- Collaboration opportunities that complement their natural abilities

## Team Integration Strategies

**Role Preferences:**
- Positions that leverage their top strengths
- Responsibilities that align with their natural energy patterns
- Opportunities for growth in developing strength areas

**Communication Style:**
- Preferred methods for receiving feedback and direction
- Most effective ways to share ideas and concerns
- Optimal timing and format for important conversations

## Professional Development Focus

Key areas for continued growth and development:

1. **Strengths Amplification:** Building on existing natural talents
2. **Integration Skills:** Connecting strengths for greater effectiveness
3. **Leadership Development:** Applying strengths in influence and guidance
4. **Cross-functional Collaboration:** Leveraging strengths across different team types

---

## Complete Professional Profile Available Soon

This structured overview provides basic collaboration guidelines while our AI coaching system is temporarily unavailable. Your complete, personalized professional profile will include:

- Detailed strengths analysis with specific workplace applications
- Comprehensive collaboration guidelines with concrete examples
- Flow state optimization strategies for your work environment
- Specific team integration recommendations
- Professional development pathways aligned with your strengths

*Generated as a structured fallback while AI coaching systems are temporarily unavailable.*`;
}

/**
 * Check if Claude API is available
 */
export function isClaudeAPIAvailable(): boolean {
  return aiDevConfig.claude.enabled && !!aiDevConfig.claude.apiKey;
}

/**
 * Get Claude API status
 */
export function getClaudeAPIStatus() {
  return {
    enabled: aiDevConfig.claude.enabled,
    hasApiKey: !!aiDevConfig.claude.apiKey,
    model: aiDevConfig.claude.model,
    maxTokens: aiDevConfig.claude.maxTokens,
    temperature: aiDevConfig.claude.temperature,
    isAvailable: isClaudeAPIAvailable()
  };
}