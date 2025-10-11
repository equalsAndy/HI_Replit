/**
 * Direct Claude API Service
 * =========================
 * Simple integration with Anthropic's Claude API for coaching responses
 */

import { aiDevConfig } from '../utils/aiDevConfig.js';
import { aiUsageLogger } from './ai-usage-logger.js';
import { taliaPersonaService, TALIA_PERSONAS } from './talia-personas.js';
import { CURRENT_PERSONAS } from '../routes/persona-management-routes.js';

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
 * Get current persona configuration from database or fallback to hardcoded
 */
function getCurrentPersona(personaId: string) {
  const dbPersona = CURRENT_PERSONAS.find(p => p.id === personaId);
  if (dbPersona) {
    return {
      tokenLimit: dbPersona.tokenLimit || 800,
      name: dbPersona.name || 'Talia',
      behavior: dbPersona.behavior || {}
    };
  }
  // Fallback to hardcoded personas
  return TALIA_PERSONAS[personaId] || TALIA_PERSONAS.ast_reflection;
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
  // Skip rate limiting in development mode for testing
  if (userId && process.env.NODE_ENV !== 'development') {
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

  // Check for forbidden content (but allow for Report Talia document access)
  const lowerResponse = response.toLowerCase();
  const containsForbidden = forbiddenTopics.some(topic => lowerResponse.includes(topic));

  // Don't apply forbidden content filter to Report Talia or when accessing documents
  const isReportTaliaContext = personaType === 'star_report' || response.includes('Report Talia') || 
                               response.includes('training') || response.includes('document');

  if (containsForbidden && !isReportTaliaContext) {
    console.warn('⚠️ Response contained forbidden content, using safe fallback');
    return `I appreciate your question! However, I'm specifically designed to help with strengths-based development and teamwork. Let's focus on how your strengths can help you grow professionally. What aspect of your ${personaType === 'talia_coach' ? 'current strength' : 'workshop step'} would you like to explore?`;
  }

  // Length validation - Skip truncation for Report Talia and AST reports which should be comprehensive
  const isASTReport = (personaType === 'talia' || personaType === 'star_report') && 
    (response.includes('Personal Development Report') || response.includes('Professional Profile Report') || response.includes('AllStarTeams Workshop Analysis'));
  
  // Also skip truncation for report generation context
  const isReportGeneration = response.includes('# Personal Development Report') || 
    response.includes('## AllStarTeams Workshop Analysis') ||
    response.includes('*Generated for') ||
    response.includes('<h1>Your Personal Development Report</h1>') ||
    response.includes('<h1>Professional Development Analysis</h1>') ||
    response.includes('Your Personal Development Report') ||
    response.includes('Professional Development Analysis') ||
    response.includes('Executive Summary') ||
    response.includes('<div class="report-container">') ||
    response.includes('<html') ||
    response.includes('<!DOCTYPE html');
  
  if (!isASTReport && !isReportGeneration && response.length > 1500) {
    console.warn('⚠️ Response too long, truncating');
    const truncated = response.substring(0, 1450);
    const lastSentence = truncated.lastIndexOf('.');
    if (lastSentence > 1000) {
      return truncated.substring(0, lastSentence + 1) + '\n\nWhat specific aspect would you like to explore further?';
    }
  } else if (isASTReport || isReportGeneration) {
    console.log(`✅ Report detected (${response.length} chars) - skipping length truncation`);
  }

  // Check for inappropriate requests for personal information (but allow document access)
  const personalInfoRequests = ['tell me about yourself', 'your background', 'your experience', 'where are you from'];
  const containsPersonalRequest = personalInfoRequests.some(request => lowerResponse.includes(request));
  
  // Don't filter if this is about documents, training, or reports
  const isDocumentRelated = response.includes('document') || response.includes('training') || response.includes('report') || 
                            response.includes('Report Talia') || response.includes('Samantha') || personaType === 'star_report';
  
  if (containsPersonalRequest && !isDocumentRelated) {
    console.warn('⚠️ Response contained personal information request, filtering');
    return response.replace(/tell me about.*?(yourself|your background|your experience)/gi, 'let\'s focus on your strengths and development');
  }

  return response;
}

/**
 * Build system prompt for coaching
 */
function buildCoachingSystemPrompt(personaType: string, userName: string, contextData: any): string {
  // Determine if this is a Talia persona (either talia_coach or ast_reflection)
  const isTaliaPersona = personaType === 'talia_coach' || personaType === 'ast_reflection';
  const basePrompt = `You are ${isTaliaPersona ? 'Talia' : 'a Workshop Assistant'}, an AI coach for the AllStarTeams strength-based development platform.`;
  
  if (isTaliaPersona) {
    const strengthInfo = contextData.allStrengths ? 
      `\n\n${userName}'s Strength Profile:\n${contextData.allStrengths.map((s: any) => `- ${s.label}: ${s.score}%`).join('\n')}` : '';
    
    const currentFocus = contextData.strengthFocus ? 
      `\n\nCurrent Focus: ${contextData.strengthFocus} strength` : '';

    // Build persona-specific prompt for Talia
    const personaContext = personaType === 'ast_reflection' ? 
      'You are specifically focused on helping with reflection questions during the AllStarTeams workshop steps.' :
      'You provide general coaching support across all workshop activities.';

    return `${basePrompt}

${personaContext}

You help participants discover and develop their unique strengths through the AllStarTeams methodology. You are supportive, insightful, and focused on growth.

STRICT GUIDELINES - You MUST follow these rules:
1. IDENTITY: You are Talia, here to help with strengths development
2. TASK FOCUS: Always reference the specific reflection question they're working on
3. COACHING APPROACH: Help them reason through their thoughts - NEVER write their reflections for them
4. TASK REQUIREMENT: Remind them the task is to write 2-3 sentences about their specific reflection topic
5. STAY ON TOPIC: Only discuss the current reflection question - decline other requests politely
6. OFF-TOPIC HANDLING: If their statement isn't relevant to the current reflection, ask "Should I save this to discuss after you complete your reflection?"
7. NATURAL LENGTH: Respond naturally - don't worry about word limits, focus on being helpful
8. NO PERSONAL INFO: Never ask for or remember personal details beyond workshop context

Key coaching principles for the current reflection task:
- Always start by referencing their specific reflection question or topic
- Remind them: "Your task is to write 2-3 sentences about [specific topic]"
- Be genuinely curious and ask specific clarifying questions to help them dig deeper
- NEVER write their reflection for them - help them discover their own insights through questioning
- Use their actual strength percentages to provide personalized insights
- If they ask unrelated questions, respond: "Let's focus on your current reflection first. Should I save this to discuss after you complete your 2-3 sentences?"

CLARIFYING QUESTION TECHNIQUES:
- Ask for specific examples: "Can you give me a specific example of when that happened?"
- Explore feelings: "How did that feel different from other situations?" 
- Dig into details: "What made that particular moment stand out to you?"
- Compare situations: "How was that different from times when you didn't use this strength?"
- Explore impact: "What was the outcome when you applied that strength?"
- Get concrete: "What exactly did you do in that situation?"
- Understand patterns: "Have you noticed this pattern in other areas of your work?"

AREA-SPECIFIC COACHING APPROACHES:
For STRENGTH reflections:
- Focus on specific workplace situations where they used this strength
- Ask about the impact and outcomes of using the strength
- Explore how this strength manifests differently in various situations
- Help them identify patterns in when/how they naturally use this strength

For TEAM/COLLABORATION reflections:
- Ask about specific team interactions and dynamics
- Explore their role in group settings
- Focus on concrete examples of collaboration
- Help them identify what they contribute to team success

For CHALLENGE/PROBLEM-SOLVING reflections:
- Ask for specific examples of problems they've solved
- Explore their thought process and approach
- Focus on what made their solution unique or effective
- Help them identify their natural problem-solving patterns

CONTENT BOUNDARIES - TASK-SPECIFIC FOCUS:
- ONLY discuss the specific reflection question they are currently working on
- All questions must directly serve the goal of helping them write their 2-3 sentences
- Decline ANY topics not directly related to their current reflection task
- If they bring up other topics, redirect: "Let's focus on your current reflection first. Should I save this to discuss after you complete your 2-3 sentences?"

WHO YOU ARE:
You are Talia, here to help with strengths development. You understand the AllStarTeams methodology and can help participants discover and develop their unique strengths.

${strengthInfo}${currentFocus}

CURRENT TASK:
${contextData?.questionText ? `Question: "${contextData.questionText}"` : contextData?.stepName ? `Step: ${contextData.stepName}` : 'Current workshop activity'}
${contextData?.strengthLabel ? `Focus: ${contextData.strengthLabel} strength` : ''}
${contextData?.exerciseType ? `Type: ${contextData.exerciseType} exercise` : ''}

${contextData?.workshopContext ? `
WORKSHOP CONTEXT:
Current Step: ${contextData.workshopContext.stepName}
What they've completed: ${contextData.workshopContext.previousSteps.join(', ')}
Current Task: ${contextData.workshopContext.currentTask}

${contextData.workshopContext.questionContext ? `
QUESTION DETAILS:
Question ${contextData.workshopContext.questionContext.questionNumber} of ${contextData.workshopContext.questionContext.totalQuestions}
Current Question: "${contextData.workshopContext.questionContext.currentQuestion}"
${contextData.workshopContext.questionContext.hint ? `Hint: ${contextData.workshopContext.questionContext.hint}` : ''}
${contextData.workshopContext.questionContext.currentSection ? `Section: ${contextData.workshopContext.questionContext.currentSection}` : ''}

${contextData.workshopContext.questionContext.wellBeingLevels ? `
WELL-BEING CONTEXT:
Current Level: ${contextData.workshopContext.questionContext.wellBeingLevels.current}/10
Future Level (1 year): ${contextData.workshopContext.questionContext.wellBeingLevels.future}/10
` : ''}

All questions in this step:
${contextData.workshopContext.questionContext.allQuestions.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')}
` : ''}` : ''}

${contextData?.exerciseInstructions ? `
EXERCISE INSTRUCTIONS:
${contextData.exerciseInstructions}
` : ''}

${contextData?.cantrilLadderRating ? `
CANTRIL LADDER CONTEXT:
The user has rated their current life satisfaction as ${contextData.cantrilLadderRating} out of 10 on the Cantril Ladder well-being scale. Use this context to help them reflect on their well-being factors, improvements, and commitments. Connect their responses to this baseline rating.
` : ''}

${contextData?.visionImages ? `
VISION IMAGES CONTEXT:
The user has selected ${contextData.visionImages.length} images for their future vision exercise: ${contextData.visionImages.map((img: any) => `"${img.description || 'Vision image'}" (${img.source})`).join(', ')}. Help them reflect on what these images mean to them and how they connect to their strengths and flow state.
` : ''}

${contextData?.futureTimelineApproach ? `
FUTURE SELF TIMELINE CONTEXT:
The user is working on their Future Self Journey. They can choose to work backwards (20→10→5 years) or forwards (5→10→20 years). Help them use their Flow Assessment insights to guide their vision and imagine who they want to become. Focus on designing a life that supports the conditions where they experience deep focus, energy, and ease.
Timeline approach: ${contextData.futureTimelineApproach}
` : ''}

${contextData?.workshopCompletion ? `
WORKSHOP COMPLETION CONTEXT:
The user has just completed their entire AllStarTeams workshop journey - from understanding core strengths to envisioning future potential. Help them distill this experience into one clear insight to carry forward into team collaboration. They should reflect on what they've learned about who they are and how they want to show up in teams.
Journey scope: Personal discovery through strengths, flow states, well-being assessment, vision planning, and future self exploration.
` : ''}

${contextData?.userPersonalization ? `\n${contextData.userPersonalization}` : ''}

${contextData?.isReflection ? 
  'REMEMBER: Their task is to write 2-3 sentences about this specific reflection question. Help them think it through, but don\'t write it for them.' :
  contextData?.exerciseType ? 
    'REMEMBER: This is an interactive exercise. Guide them through the process and help them make thoughtful choices.' :
    'REMEMBER: Help them work through this step thoughtfully.'
}

Always introduce yourself simply as "I'm Talia" when greeting someone new, and respond in a conversational, coaching style within these guidelines.`;
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
      
      const persona = getCurrentPersona('ast_reflection');
      const reflectionContext = await taliaPersonaService.getReflectionContext(userId.toString(), stepId);
      if (reflectionContext) {
        const reflectionPrompt = await taliaPersonaService.generateReflectionPrompt(reflectionContext, userMessage);
        
        const messages: ClaudeMessage[] = [{ role: 'user', content: userMessage }];
        const response = await callClaudeAPI(reflectionPrompt, messages, persona.tokenLimit, userId, 'coaching', sessionId);
        
        return validateCoachingResponse(response, personaType);
      }
    }

    // Handle Star Report Talia persona
    if (personaType === 'star_report') {
      
      // Token-optimized holistic report generation
      if (contextData?.reportContext === 'holistic_generation') {
        console.log('🎯 Optimized Report Talia - Holistic report generation with token limits');
        console.log('🔧 Context check:', {
          reportContext: contextData?.reportContext,
          selectedUserId: contextData?.selectedUserId,
          hasUserData: !!contextData?.userData
        });
        
        const persona = getCurrentPersona('star_report');
        
        try {
          // Create optimized report context with essential data only
          const optimizedContext = await taliaPersonaService.getOptimizedReportContext(
            contextData.selectedUserId.toString(), 
            contextData.userData,
            userMessage.includes('Personal Development') ? 'personal' : 'professional'
          );
          
          if (optimizedContext) {
            console.log('✅ Created optimized context, generating prompt...');
            const optimizedPrompt = await taliaPersonaService.generateOptimizedReportPrompt(
              optimizedContext, 
              userMessage,
              contextData.starCardImageBase64
            );
            
            console.log(`📊 Optimized prompt length: ${optimizedPrompt.length} chars, estimated tokens: ${Math.round(optimizedPrompt.length / 4)}`);
            
            const messages: ClaudeMessage[] = [{ role: 'user', content: userMessage }];
            
            // Calculate total token estimate before API call
            const totalPromptSize = optimizedPrompt.length + userMessage.length;
            const estimatedTokens = Math.round(totalPromptSize / 4);
            console.log(`🔢 Total API call size: system=${optimizedPrompt.length} + user=${userMessage.length} = ${totalPromptSize} chars (~${estimatedTokens} tokens)`);
            
            // Safety check before API call
            if (estimatedTokens > 180000) {
              console.error('🚨 ESTIMATED TOKENS TOO HIGH FOR API CALL!', estimatedTokens);
              throw new Error(`Estimated tokens ${estimatedTokens} exceed safe limit of 180k`);
            }
            
            const response = await callClaudeAPI(optimizedPrompt, messages, maxTokens, userId, 'holistic_reports', sessionId);
            
            return validateCoachingResponse(response, personaType);
          } else {
            console.error('❌ Failed to create optimized context, falling back to error');
            throw new Error('Failed to create optimized report context');
          }
        } catch (error) {
          console.error('❌ Error in optimized report generation:', error);
          throw error;
        }
      }
      
      // Enhanced admin context handling
      
      // Standard user selection handling  
      if (!contextData?.selectedUserId) {
        return `Hi! I'm Report Talia, your comprehensive development report expert.

I notice you haven't selected a specific user yet. To provide you with detailed analysis and insights, please:

1. **Select a user** from the dropdown menu above
2. **Choose someone who has completed their AST workshop** 
3. **Then ask me about their development journey, strengths, or request a comprehensive report**

Once you've selected a user, I'll have access to their complete workshop data including:
• Strengths assessment results
• Flow state analysis  
• Reflection responses
• Future vision planning
• Well-being insights

**I can also discuss:**
• My training conversation history and what I've learned
• How training influences report generation
• Document review and methodology discussions
• Report generation approaches and improvements

What would you like to know about?`;
      }
      
      console.log(`🎯 Using Star Report Talia for user: ${contextData.selectedUserName} (ID: ${contextData.selectedUserId})`);
      
      const persona = getCurrentPersona('star_report');
      console.log(`🎯 Database persona config:`, { name: persona.name, tokenLimit: persona.tokenLimit });
      
      // PHASE 1 TEST: Use unified prompt directly without additional context to isolate the issue
      console.log('🧪 PHASE 1 TEST: Using simplified unified prompt approach');
      
      // Get just the unified prompt document directly
      const pool = (await import('pg')).Pool;
      const dbPool = new pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
      
      try {
        const promptResult = await dbPool.query(
          'SELECT content FROM training_documents WHERE title = $1 AND status = $2',
          ['Talia Report Generation Prompt', 'active']
        );
        
        if (promptResult.rows.length > 0) {
          const unifiedPrompt = promptResult.rows[0].content;
          
          // PHASE 2 FIX: Send ONLY the unified prompt with minimal data context
          // Remove ALL additional instructions that could trigger consultation mode
          const testPrompt = `${unifiedPrompt}

USER DATA:
- Name: ${contextData.selectedUserName}
- Report Type: Personal Development Report
- User has completed AST workshop assessments

Generate the Personal Development Report now.`;

          const messages: ClaudeMessage[] = [{ role: 'user', content: testPrompt }];
          const response = await callClaudeAPI('', messages, 8000, userId, 'holistic_reports', sessionId);
          
          return validateCoachingResponse(response, personaType);
        }
      } catch (error) {
        console.error('🧪 Test approach failed:', error);
      } finally {
        await dbPool.end();
      }
      
      // Fallback to original approach if test fails
      const reportContext = await taliaPersonaService.getReportContext(contextData.selectedUserId.toString(), contextData.userData);
      if (reportContext) {
        const reportPrompt = await taliaPersonaService.generateReportPrompt(reportContext, userMessage);
        
        const messages: ClaudeMessage[] = [{ role: 'user', content: userMessage }];
        // No token limits for admin interface
        const response = await callClaudeAPI(reportPrompt, messages, 8000, userId, 'holistic_reports', sessionId);
        
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
    const persona = getCurrentPersona(personaType);
    const personaName = personaType === 'star_report' ? 'Report Talia' : 
                       personaType === 'ast_reflection' ? 'Reflection Talia' : 
                       persona.name || 'Talia, your AI coach';
    
    return `Hi! I'm ${personaName}, and I'd love to help you with that! However, I'm having trouble connecting to my AI systems right now.

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