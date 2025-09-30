/**
 * OpenAI API Service with Project Management
 * =========================================
 * Enhanced integration with OpenAI's GPT models featuring:
 * - Project-based organization
 * - Dynamic model selection 
 * - Cross-project awareness
 * - A/B testing capabilities
 * - Advanced cost tracking
 */

import OpenAI from 'openai';
import { aiDevConfig } from '../utils/aiDevConfig.js';
import { aiUsageLogger } from './ai-usage-logger.js';
import { taliaPersonaService, TALIA_PERSONAS } from './talia-personas.js';
import { CURRENT_PERSONAS } from '../routes/persona-management-routes.js';
import { transformExportToAssistantInput } from '../utils/transformExportToAssistantInput.js';
import fs from 'fs/promises';
import path from 'path';

// Hard guard to prevent env-based legacy prompt leaks
try {
  const envLeak = [
    process.env.TALIA_PRIMARY_PROMPT,
    process.env.TALIA_PROMPT_FILE,
    process.env.AST_LOCAL_SYSTEM_PROMPT
  ].filter(Boolean).join(" ");

  if (envLeak && /TALIA|PRIMARY_Prompt|MBTI|DISC|Clifton/i.test(envLeak)) {
    throw new Error("Legacy prompt env leak detected. Unset TALIA_* or AST_LOCAL_SYSTEM_PROMPT.");
  }
} catch (e) {
  console.error("[AST] Legacy prompt env leak:", e);
  throw e;
}

// Assistant configuration interface
interface AssistantConfig {
  id: string;
  name: string;
  purpose: string;
  vectorStoreId: string;
  personality: string;
  model: string;
}

// Model configuration interface
interface ModelConfig {
  name: 'gpt-4o-mini' | 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo';
  displayName: string;
  costPerToken: number;
  recommended: string[];
  maxTokens: number;
  description: string;
}

// A/B testing interface
interface ABTestResult {
  prompt: string;
  modelA: { model: string; response: string; cost: number; time: number; tokens: number };
  modelB: { model: string; response: string; cost: number; time: number; tokens: number };
  quality: { lengthA: number; lengthB: number; coherenceA: number; coherenceB: number };
  recommendation: string;
  winner: 'A' | 'B' | 'tie';
}

// Assistant summary interface
interface AssistantSummary {
  assistantId: string;
  name: string;
  purpose: string;
  vectorStore: { id: string; name: string; fileCount: number };
  lastActivity: Date;
  usage: { calls: number; tokens: number; errors: number };
}

interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface CoachingRequestData {
  userMessage: string;
  personaType: string;
  userName: string;
  contextData: any;
  userId?: number;
  sessionId?: string;
  maxTokens?: number;
  stepId?: string;
  exportData?: any; // For sectional reports with structured user data
}

/**
 * AllStarTeams_Talia Project with Multiple Assistants
 */
class OpenAIAssistantManager {
  private client: OpenAI;
  private assistantConfigs: Map<string, AssistantConfig> = new Map();
  
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!
    });
    this.initializeAssistants();
  }
  
  // Get client for report generation (uses report-specific key if available)
  getReportClient(): OpenAI {
    const reportKey = process.env.REPORT_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    return new OpenAI({
      apiKey: reportKey
    });
  }
  
  // Get client for IA functionality (uses IA-specific key if available)
  getIAClient(): OpenAI {
    const iaKey = process.env.OPENAI_KEY_IA || process.env.OPENAI_API_KEY;
    return new OpenAI({
      apiKey: iaKey
    });
  }
  
  private initializeAssistants() {
    // Initialize assistant configurations - INCLUDES ALL KNOWN ASSISTANTS
    const assistants: AssistantConfig[] = [
      {
        id: 'asst_CZ9XUvnWRx3RIWFc7pLeH8U2', // Star Report Talia (ACCESSIBLE with new key)
        name: 'Star Report Talia',
        purpose: 'Holistic report generation with personalized insights',
        vectorStoreId: 'vs_688e2bf0d94c81918b50080064684bde', // AllStarTeams_Report_Corpus
        personality: 'Professional report writer focused on comprehensive development analysis',
        model: 'gpt-4o-mini'
      },
      {
        id: 'asst_DtWCcpzPg7Zu1Z4NnkYLUbSI', // Ultra Star Report Talia (ACCESSIBLE with new key)
        name: 'Ultra Star Report Talia',
        purpose: 'Advanced holistic report generation with enhanced capabilities',
        vectorStoreId: 'vs_688e2bf0d94c81918b50080064684bde', // Same vector store
        personality: 'Advanced report writer with comprehensive analytical capabilities',
        model: 'gpt-4o-mini'
      },
      {
        id: 'asst_ujxKbOaEw5HCiFygwxGR6XP4', // IA Workshop Guide — HQ (ACCESSIBLE)
        name: 'IA Assistant HQ',
        purpose: 'Imaginal Agility workshop guidance and coaching',
        vectorStoreId: 'vs_689d33217cb08191875a2a9dfbd06760', // Vector store for IA Workshop Guide
        personality: 'Expert guide for Imaginal Agility workshop exercises',
        model: 'gpt-4o-mini'
      },
      {
        id: 'asst_T2PHoj8DJ6sWHlfoWyba2Wq0', // IA Workshop Guide — Fast (ACCESSIBLE)
        name: 'IA Assistant Fast',
        purpose: 'Fast Imaginal Agility workshop guidance',
        vectorStoreId: 'vs_689d33217cb08191875a2a9dfbd06760', // Vector store for IA Workshop Guide
        personality: 'Quick-response IA workshop assistant',
        model: 'gpt-4.1-mini-2025-04-14'
      }
      // NOTE: Other assistants (asst_CZ9XUvnWRx3RIWFc7pLeH8U2, asst_hz6aCLaiArNDBxbGeqcrAsCu) 
      //       exist but are not accessible with the current API key
    ];
    
    assistants.forEach(config => {
      this.assistantConfigs.set(config.name.toLowerCase().replace(/ /g, '_'), config);
    });
  }
  
  getClient(): OpenAI {
    return this.client;
  }
  
  getAssistantConfig(assistantType: string): AssistantConfig | undefined {
    return this.assistantConfigs.get(assistantType);
  }
  
  getAllAssistants(): AssistantConfig[] {
    return Array.from(this.assistantConfigs.values());
  }
  
  getAssistantByPurpose(purpose: 'report' | 'reflection' | 'admin' | 'ia' | 'ia_fast'): AssistantConfig | undefined {
    const purposeMap = {
      'report': 'star_report_talia',    // Primary report assistant (accessible with new key)
      'reflection': 'ia_assistant_hq',  // Fallback to IA assistant for reflections  
      'admin': 'ultra_star_report_talia', // Use Ultra Talia for admin functions
      'ia': 'ia_assistant_hq',          // Primary IA assistant
      'ia_fast': 'ia_assistant_fast'    // Fast IA assistant
    };
    return this.assistantConfigs.get(purposeMap[purpose]);
  }
  
  /**
   * Get assistant resource summary for admin interface
   */
  async getAssistantResourcesSummary(): Promise<AssistantSummary[]> {
    const summaries: AssistantSummary[] = [];
    
    for (const [assistantKey, config] of this.assistantConfigs) {
      try {
        // Get vector store info for this assistant
        const vectorStore = await this.client.beta.vectorStores.retrieve(config.vectorStoreId);
        
        const summary: AssistantSummary = {
          assistantId: config.id,
          name: config.name,
          purpose: config.purpose,
          vectorStore: {
            id: vectorStore.id,
            name: vectorStore.name || 'Unnamed Vector Store',
            fileCount: vectorStore.file_counts?.completed || 0
          },
          lastActivity: new Date(), // Would come from usage logs in real implementation
          usage: {
            calls: 0,
            tokens: 0,
            errors: 0
          }
        };
        
        summaries.push(summary);
      } catch (error) {
        console.error(`Error getting summary for assistant ${config.name}:`, error);
        
        // Add empty summary to show assistant exists but has issues
        summaries.push({
          assistantId: config.id,
          name: config.name,
          purpose: config.purpose,
          vectorStore: { id: config.vectorStoreId, name: 'Error loading', fileCount: 0 },
          lastActivity: new Date(),
          usage: { calls: 0, tokens: 0, errors: 1 }
        });
      }
    }
    
    return summaries;
  }
  
  /**
   * Run A/B test between two models
   */
  async runABTest(
    prompt: string,
    modelA: string = 'gpt-4o-mini',
    modelB: string = 'gpt-4',
    projectType: string = 'development'
  ): Promise<ABTestResult> {
    const messages: OpenAIMessage[] = [{ role: 'user', content: prompt }];
    
    // Run both models concurrently
    const startTime = Date.now();
    
    const [responseA, responseB] = await Promise.all([
      this.runModelTest(messages, modelA, projectType),
      this.runModelTest(messages, modelB, projectType)
    ]);
    
    // Calculate quality metrics
    const quality = {
      lengthA: responseA.response.length,
      lengthB: responseB.response.length,
      coherenceA: this.calculateCoherence(responseA.response),
      coherenceB: this.calculateCoherence(responseB.response)
    };
    
    // Determine winner based on multiple factors
    let winner: 'A' | 'B' | 'tie' = 'tie';
    if (quality.coherenceA > quality.coherenceB && responseA.time < responseB.time * 1.5) {
      winner = 'A';
    } else if (quality.coherenceB > quality.coherenceA && responseB.time < responseA.time * 1.5) {
      winner = 'B';
    }
    
    const recommendation = this.generateRecommendation(responseA, responseB, quality, winner);
    
    return {
      prompt,
      modelA: responseA,
      modelB: responseB,
      quality,
      recommendation,
      winner
    };
  }
  
  /**
   * Run a single model test for A/B comparison
   */
  private async runModelTest(messages: OpenAIMessage[], model: string, projectType: string) {
    const startTime = Date.now();
    const client = this.getClientForProject(projectType);
    const modelConfig = getModelConfig(model);
    
    try {
      const response = await client.chat.completions.create({
        model: model,
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7
      });
      
      const responseText = response.choices[0]?.message?.content || '';
      const tokensUsed = response.usage?.total_tokens || 0;
      const cost = tokensUsed * (modelConfig?.costPerToken || 0.00000015);
      
      return {
        model,
        response: responseText,
        cost,
        time: Date.now() - startTime,
        tokens: tokensUsed
      };
    } catch (error) {
      console.error(`Error testing model ${model}:`, error);
      return {
        model,
        response: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        cost: 0,
        time: Date.now() - startTime,
        tokens: 0
      };
    }
  }
  
  /**
   * Calculate coherence score (simplified metric)
   */
  private calculateCoherence(text: string): number {
    // Simple coherence calculation based on text properties
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = text.length / Math.max(sentences.length, 1);
    const wordCount = text.split(/\s+/).length;
    
    // Penalize very short or very long responses
    let coherenceScore = 50; // Base score
    
    if (avgSentenceLength > 10 && avgSentenceLength < 30) coherenceScore += 20;
    if (wordCount > 50 && wordCount < 500) coherenceScore += 20;
    if (text.includes('\n')) coherenceScore += 10; // Structure bonus
    
    return Math.min(100, Math.max(0, coherenceScore));
  }
  
  /**
   * Generate recommendation for A/B test results
   */
  private generateRecommendation(responseA: any, responseB: any, quality: any, winner: 'A' | 'B' | 'tie'): string {
    const costDiff = Math.abs(responseA.cost - responseB.cost);
    const timeDiff = Math.abs(responseA.time - responseB.time);
    
    if (winner === 'tie') {
      if (responseA.cost < responseB.cost) {
        return `Models performed similarly in quality. Choose ${responseA.model} for cost savings ($${costDiff.toFixed(6)} cheaper).`;
      } else {
        return `Models performed similarly. Consider using ${responseB.model} for the specific use case.`;
      }
    }
    
    const winnerModel = winner === 'A' ? responseA.model : responseB.model;
    return `${winnerModel} performed better with higher coherence and acceptable performance. Time difference: ${timeDiff}ms, Cost difference: $${costDiff.toFixed(6)}.`;
  }
}

// Global assistant manager instance
const assistantManager = new OpenAIAssistantManager();

/**
 * Get OpenAI client (single client for AllStarTeams_Talia project)
 */
function getOpenAIClient(): OpenAI {
  return assistantManager.getClient();
}

/**
 * Get assistant configuration by purpose
 */
function getAssistantByPurpose(purpose: 'report' | 'reflection' | 'admin' | 'ia' | 'ia_fast'): AssistantConfig | undefined {
  return assistantManager.getAssistantByPurpose(purpose);
}

/**
 * Model configurations with cost and capability information
 */
const MODEL_CONFIGS: ModelConfig[] = [
  {
    name: 'gpt-4o-mini',
    displayName: 'GPT-4o Mini (Recommended)',
    costPerToken: 0.00000015,
    recommended: ['reports', 'coaching', 'general'],
    maxTokens: 16000,
    description: 'Fast, cost-effective model for most tasks'
  },
  {
    name: 'gpt-4',
    displayName: 'GPT-4 (Advanced Reasoning)',
    costPerToken: 0.00003,
    recommended: ['admin', 'training', 'analysis'],
    maxTokens: 8000,
    description: 'Advanced model for complex reasoning and analysis'
  },
  {
    name: 'gpt-4-turbo',
    displayName: 'GPT-4 Turbo (High Performance)',
    costPerToken: 0.00001,
    recommended: ['complex-reports', 'research'],
    maxTokens: 128000,
    description: 'High-performance model for complex, long-form content'
  },
  {
    name: 'gpt-3.5-turbo',
    displayName: 'GPT-3.5 Turbo (Budget)',
    costPerToken: 0.0000005,
    recommended: ['testing', 'simple-tasks'],
    maxTokens: 4000,
    description: 'Budget-friendly model for simple tasks'
  }
];

/**
 * Get model configuration by name
 */
function getModelConfig(modelName: string): ModelConfig | undefined {
  return MODEL_CONFIGS.find(config => config.name === modelName);
}

/**
 * Get all available model configurations
 */
function getAllModelConfigs(): ModelConfig[] {
  return MODEL_CONFIGS;
}

/**
 * Get assistant manager instance for external access
 */
function getAssistantManager(): OpenAIAssistantManager {
  return assistantManager;
}

/**
 * Initialize OpenAI assistants (for admin setup)
 */
async function initializeOpenAIAssistants(): Promise<void> {
  console.log('🏗️ Initializing OpenAI assistants for AllStarTeams_Talia project...');
  
  try {
    const client = getOpenAIClient();
    
    // Test connection
    const models = await client.models.list();
    console.log(`✅ OpenAI connection successful. Available models: ${models.data.length}`);
    
    // Check existing vector stores
    const vectorStores = await client.beta.vectorStores.list();
    console.log(`📚 Found ${vectorStores.data.length} existing vector stores`);
    
    vectorStores.data.forEach(vs => {
      console.log(`  - ${vs.name || 'Unnamed'} (${vs.file_counts?.completed || 0} files)`);
    });
    
  } catch (error) {
    console.error('❌ Failed to initialize OpenAI projects:', error);
    throw error;
  }
}

/**
 * Enhanced API call with project awareness and model selection
 */
async function enhancedOpenAICall(
  messages: OpenAIMessage[],
  options: {
    maxTokens?: number;
    userId?: number;
    featureName?: 'coaching' | 'holistic_reports' | 'reflection_assistance' | 'admin_chat';
    sessionId?: string;
    model?: string;
    projectType?: string;
    temperature?: number;
  } = {}
): Promise<string> {
  const {
    maxTokens = 1000,
    userId,
    featureName = 'coaching',
    sessionId,
    model = 'gpt-4o-mini',
    projectType = 'report-generation',
    temperature = 0.7
  } = options;

  return callOpenAIAPI(
    messages,
    maxTokens,
    userId,
    featureName,
    sessionId,
    model,
    projectType
  );
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
 * Enhanced OpenAI API call with project and model selection
 */
async function callOpenAIAPI(
  messages: OpenAIMessage[],
  maxTokens: number = 1000,
  userId?: number,
  featureName: 'coaching' | 'holistic_reports' | 'reflection_assistance' | 'admin_chat' = 'coaching',
  sessionId?: string,
  model: string = 'gpt-4o-mini'
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API not configured');
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
    const client = getOpenAIClient();
    const modelConfig = getModelConfig(model);
    
    if (!modelConfig) {
      console.warn(`⚠️ Unknown model '${model}', using default gpt-4o-mini`);
      model = 'gpt-4o-mini';
    }
    
    console.log(`🤖 Calling OpenAI API with model: ${model}, max_tokens: ${maxTokens}`);
    
    const response = await client.chat.completions.create({
      model: model,
      messages: messages,
      max_tokens: maxTokens,
      temperature: 0.7,
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1
    });

    // Extract token usage and mark as successful
    tokensUsed = response.usage?.total_tokens || 0;
    success = true;
    
    if (response.choices && response.choices.length > 0 && response.choices[0].message?.content) {
      const responseText = response.choices[0].message.content;
      
      // Log usage after successful call
      if (userId) {
        const responseTime = Date.now() - startTime;
        const costEstimate = aiUsageLogger.calculateOpenAICost(tokensUsed, model);
        
        // Log project-specific usage
        console.log(`📊 ${projectType} project - ${model}: ${tokensUsed} tokens, $${costEstimate.toFixed(6)}`);
        
        await aiUsageLogger.logUsage({
          userId,
          featureName,
          tokensUsed,
          responseTimeMs: responseTime,
          success: true,
          costEstimate,
          sessionId,
          provider: 'openai',
          model,
          projectType
        });
      }
      
      return responseText;
    } else {
      throw new Error('No content in OpenAI response');
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
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
        sessionId,
        provider: 'openai',
        model
      });
    }
    
    throw error;
  }
}

/**
 * REMOVED: loadPrimaryPrompt() deprecated for AST. Use Assistant Instructions in UI.
 */
async function loadPrimaryPrompt(): Promise<string> {
  throw new Error("loadPrimaryPrompt() deprecated for AST. Use Assistant Instructions configured in the OpenAI UI.");
}

/**
 * Build comprehensive user data context for report generation
 */
function buildUserDataContext(userData: any, userName: string): string {
  console.log('🔍 DEBUG: buildUserDataContext called with:', {
    userName,
    userDataKeys: userData ? Object.keys(userData) : 'null',
    hasAssessments: userData?.assessments ? true : false,
    assessmentsLength: userData?.assessments?.length,
    hasStepData: userData?.stepData ? true : false,
    stepDataLength: userData?.stepData?.length
  });
  
  if (!userData) {
    return `**Participant Profile:**
- **Name**: ${userName}
- **Status**: No workshop data available

*Note: This user has not completed their workshop assessments.*`;
  }

  // Extract key data from assessments
  const assessmentsArray = userData.assessments || [];
  const userInfo = userData.user || userData.userInfo || {};
  
  console.log('🔍 DEBUG: Data structure inspection:', {
    isAssessmentsArray: Array.isArray(userData.assessments),
    assessmentsFirstItem: userData.assessments?.[0] ? Object.keys(userData.assessments[0]) : 'empty',
    stepDataFirstItem: userData.stepData?.[0] ? Object.keys(userData.stepData[0]) : 'empty',
    userKeys: userData.user ? Object.keys(userData.user) : 'no user'
  });
  
  // Convert assessments array to structured object
  const assessments: any = {};
  assessmentsArray.forEach((assessment: any) => {
    if (assessment.assessment_type && assessment.results) {
      try {
        assessments[assessment.assessment_type] = JSON.parse(assessment.results);
      } catch (e) {
        console.log(`⚠️ Failed to parse ${assessment.assessment_type} results`);
      }
    }
  });
  
  console.log('🔍 DEBUG: Parsed assessments:', Object.keys(assessments));
  
  let context = `# ${userName} - AST Workshop Responses
## Complete Assessment and Reflection Data

**Participant Profile:**
- **Name**: ${userInfo.name || userName}
- **Position**: ${userInfo.jobTitle || 'Not specified'}
- **Email**: ${userInfo.email || 'Not specified'}
- **Organization**: ${userInfo.organization || 'Not specified'}

---
`;

  // Add Star Strengths Assessment
  if (assessments.starCard) {
    const { thinking, feeling, acting, planning } = assessments.starCard;
    context += `## STEP 2-2: Star Strengths Self-Assessment

**Strengths Profile Distribution:**
1. **Acting**: ${acting}% - execution and implementation focus
2. **Feeling**: ${feeling}% - relationship building and team support  
3. **Planning**: ${planning}% - organization and structured approaches
4. **Thinking**: ${thinking}% - analysis and strategic problem-solving

**Assessment Method**: Ranked 16 work preference statements from "Most like me" to "Least like me"

---
`;
  }

  // Add Step-by-Step Reflections
  if (assessments.stepByStepReflection?.reflections) {
    const reflections = assessments.stepByStepReflection.reflections;
    context += `## STEP 2-4: Strength Reflection (Step-by-Step)

### Strength Reflections:
**Strength 1**: "${reflections.strength1 || 'Not provided'}"

**Strength 2**: "${reflections.strength2 || 'Not provided'}"

**Strength 3**: "${reflections.strength3 || 'Not provided'}"

**Strength 4**: "${reflections.strength4 || 'Not provided'}"

**Imagination Reflection (Apex Strength)**: "${reflections.imaginationReflection || 'Not provided'}"

**Team Values**: "${reflections.teamValues || 'Not provided'}"

**Unique Contribution**: "${reflections.uniqueContribution || 'Not provided'}"

---
`;
  }

  // Add Flow Assessment
  if (assessments.flowAssessment) {
    context += `## STEP 3-2: Flow Assessment

**Flow Score**: ${assessments.flowAssessment.flowScore || 0}/60 (Flow ${assessments.flowAssessment.flowScore >= 50 ? 'Fluent' : assessments.flowAssessment.flowScore >= 39 ? 'Aware' : assessments.flowAssessment.flowScore >= 26 ? 'Blocked' : 'Distant'} Category)

---
`;
  }

  // Add Flow Attributes
  if (assessments.flowAttributes?.attributes) {
    context += `## Flow Attributes Assessment

**Top Flow Attributes (Ranked by personal resonance):**
`;
    assessments.flowAttributes.attributes.forEach((attr: any, index: number) => {
      context += `${index + 1}. **${attr.name}** (Score: ${attr.score}) - ${index === 0 ? 'Primary' : index === 1 ? 'Secondary' : index === 2 ? 'Tertiary' : 'Supporting'} flow state\n`;
    });
    context += '\n---\n';
  }

  // Add Well-being Assessment
  if (assessments.cantrilLadder) {
    const ladder = assessments.cantrilLadder;
    context += `## STEP 4-1: Ladder of Well-being

**Current Well-being Level**: ${ladder.wellBeingLevel || 0}/10
**Future Well-being Level (1 year)**: ${ladder.futureWellBeingLevel || 0}/10

### Well-being Reflections:

**Current Factors**: "${ladder.currentFactors || 'Not provided'}"

**Future Improvements**: "${ladder.futureImprovements || 'Not provided'}"

**Specific Changes**: "${ladder.specificChanges || 'Not provided'}"

**Quarterly Progress**: "${ladder.quarterlyProgress || 'Not provided'}"

**Quarterly Actions**: "${ladder.quarterlyActions || 'Not provided'}"

---
`;
  }

  // Future Self Reflection fields (direction, 5/10/20-year) deprecated; omit from context

  // Add Final Reflection
  if (assessments.finalReflection) {
    context += `## STEP 4-5: Final Reflection

**Key Insight**: "${assessments.finalReflection.futureLetterText || 'Not provided'}"

---
`;
  }

  return context;
}

/**
 * Generate report using OpenAI Assistants API - WITH ENHANCED LOGGING
 */
export async function generateOpenAIReport(args: {
  assistantId: string;
  compactInput: any;
  model?: string;
}): Promise<string> {
  const { assistantId, compactInput } = args;

  console.log("🔍 [REPORT DEBUG] Starting generateOpenAIReport");
  console.log("🔍 [REPORT DEBUG] Assistant ID:", assistantId);
  console.log("🔍 [REPORT DEBUG] Compact input keys:", Object.keys(compactInput));
  console.log("🔍 [REPORT DEBUG] Report type:", compactInput.report_type);
  console.log("🔍 [REPORT DEBUG] Participant name:", compactInput.participant_name);
  
  // Log the actual input being sent (truncated for readability)
  const inputPreview = {
    report_type: compactInput.report_type,
    participant_name: compactInput.participant_name,
    strengths: compactInput.strengths,
    reflections: Object.keys(compactInput.reflections || {}).reduce((acc, key) => {
      acc[key] = compactInput.reflections[key]?.substring(0, 100) + "...";
      return acc;
    }, {} as any)
  };
  console.log("🔍 [REPORT DEBUG] Input preview:", JSON.stringify(inputPreview, null, 2));

  // Legacy guard: Only check for legacy markers in system prompts, not user data
  // User reflections may legitimately contain words like "MBTI" or "Clifton"
  // This guard is disabled for report generation to allow user content
  const skipLegacyCheck = true; // Reports contain user data, not system prompts
  
  if (!skipLegacyCheck) {
    const inputStr = JSON.stringify(compactInput);
    const legacy = /TALIA|PRIMARY_Prompt|MBTI|DISC|Clifton/i;
    if (legacy.test(inputStr)) {
      throw new Error("Legacy/TALIA markers detected in input. Remove all legacy references.");
    }
  }

  // Validate API key - check multiple sources for resilience
  // Try OPENAI_API_KEY first, then other sources
  let apiKey = process.env.OPENAI_API_KEY?.trim();
  
  // If OPENAI_API_KEY doesn't exist or is placeholder, try alternatives
  if (!apiKey || apiKey.startsWith('YOUR_') || apiKey === 'YOUR_KEY') {
    apiKey = process.env.REPORT_OPENAI_API_KEY?.trim() ||
             process.env.OPENAI_KEY_TALIA_V1?.trim() ||
             process.env.OPENAI_KEY_TALIA_V2?.trim();
  }
  
  console.log("🔑 [REPORT DEBUG] API Key check:", {
    hasOPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    hasREPORT_OPENAI_API_KEY: !!process.env.REPORT_OPENAI_API_KEY,
    hasOPENAI_KEY_TALIA_V1: !!process.env.OPENAI_KEY_TALIA_V1,
    hasOPENAI_KEY_TALIA_V2: !!process.env.OPENAI_KEY_TALIA_V2,
    selectedKeyPrefix: apiKey ? apiKey.substring(0, 15) + '...' : 'NONE FOUND'
  });
  
  // Final validation - ensure key exists and looks valid
  if (!apiKey || 
      apiKey.startsWith('YOUR_') || 
      apiKey === 'YOUR_KEY' ||
      apiKey.includes('YOUR_KEY') ||  // Reject if placeholder text is present anywhere
      !apiKey.startsWith('sk-')) {    // OpenAI keys must start with 'sk-'
    throw new Error(
      `Missing or invalid OpenAI API key. Checked: OPENAI_API_KEY${process.env.OPENAI_API_KEY ? ' (invalid format)' : ' (missing)'}, REPORT_OPENAI_API_KEY${process.env.REPORT_OPENAI_API_KEY ? ' (invalid format)' : ' (missing)'}, OPENAI_KEY_TALIA_V1, OPENAI_KEY_TALIA_V2`
    );
  }
  
  // Create fresh OpenAI client with discovered key
  const openai = new OpenAI({ apiKey });

  const startTime = Date.now();

  try {
    // Create thread
    console.log("🔍 [REPORT DEBUG] Creating OpenAI thread...");
    const thread = await openai.beta.threads.create();
    console.log("🔍 [REPORT DEBUG] Thread created:", thread.id);

    console.info("[AST] Using Assistant instructions only; sending compact input:",
      JSON.stringify({ keys: Object.keys(compactInput) })
    );

    // Only send compact JSON (no prompt overrides)
    const messageContent = JSON.stringify({ type: "ast_input_v2", payload: compactInput });
    console.log("🔍 [REPORT DEBUG] Message content length:", messageContent.length);
    
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: messageContent
    });
    console.log("🔍 [REPORT DEBUG] Message added to thread");

    // Run Assistant configured in UI (instructions + files)
    console.log("🔍 [REPORT DEBUG] Starting assistant run...");
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId
    });
    console.log("🔍 [REPORT DEBUG] Run created:", run.id, "Status:", run.status);

    // Poll with detailed logging
    let state = run;
    let pollCount = 0;
    while (state.status === "queued" || state.status === "in_progress") {
      pollCount++;
      console.log(`🔍 [REPORT DEBUG] Polling ${pollCount}: Status = ${state.status}`);
      
      await new Promise(r => setTimeout(r, 800));
      state = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    const totalTime = Date.now() - startTime;
    console.log(`🔍 [REPORT DEBUG] Final status: ${state.status} (took ${totalTime}ms, ${pollCount} polls)`);

    if (state.status !== "completed") {
      console.error("🔍 [REPORT DEBUG] Run failed with status:", state.status);
      console.error("🔍 [REPORT DEBUG] Last error:", state.last_error);
      throw new Error(`Assistant run failed: ${state.status} - ${state.last_error?.message ?? ""}`);
    }

    console.log("🔍 [REPORT DEBUG] Getting messages from thread...");
    const messages = await openai.beta.threads.messages.list(thread.id);
    console.log("🔍 [REPORT DEBUG] Total messages in thread:", messages.data.length);

    const last = messages.data.find(m => m.role === "assistant");
    if (!last) {
      console.error("🔍 [REPORT DEBUG] No assistant message found!");
      throw new Error("No assistant response found in thread");
    }

    const response = last?.content?.[0]?.text?.value ?? "";
    
    // DETAILED RESPONSE LOGGING
    console.log("🔍 [REPORT DEBUG] ========== OPENAI RESPONSE ANALYSIS ==========");
    console.log("🔍 [REPORT DEBUG] Response length:", response.length);
    console.log("🔍 [REPORT DEBUG] Response character count:", response.length);
    console.log("🔍 [REPORT DEBUG] Response word count:", response.split(/\s+/).length);
    console.log("🔍 [REPORT DEBUG] Response line count:", response.split('\n').length);
    
    // Check for formatting issues
    const boldCount = (response.match(/\*\*(.*?)\*\*/g) || []).length;
    const headerCount = (response.match(/^#/gm) || []).length;
    const bulletCount = (response.match(/^[\-\*]/gm) || []).length;
    
    console.log("🔍 [REPORT DEBUG] Bold text instances:", boldCount);
    console.log("🔍 [REPORT DEBUG] Header count:", headerCount);
    console.log("🔍 [REPORT DEBUG] Bullet point count:", bulletCount);
    
    // Show first 500 characters
    console.log("🔍 [REPORT DEBUG] Response preview (first 500 chars):");
    console.log(response.substring(0, 500));
    console.log("🔍 [REPORT DEBUG] ===============================================");
    
    // Check if it looks like a proper report
    if (response.length < 2000) {
      console.warn("⚠️ [REPORT DEBUG] Response is shorter than expected (< 2000 chars)");
    }
    
    if (boldCount > response.split(' ').length * 0.1) {
      console.warn("⚠️ [REPORT DEBUG] Excessive bold formatting detected");
    }
    
    if (response.includes("Professional Profile Report") && response.length < 3000) {
      console.warn("⚠️ [REPORT DEBUG] Response looks like a generic template");
    }

    return response;

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`🔍 [REPORT DEBUG] Error after ${totalTime}ms:`, error);
    throw error;
  }
}

/**
 * Create AST report from raw export data using transformer - WITH ENHANCED LOGGING
 */
export async function createAstReportFromExport(
  rawExport: any,
  assistantId: string,
  reportType: "personal" | "sharable" = "personal"
): Promise<string> {
  console.log("🔍 [TRANSFORM DEBUG] Starting createAstReportFromExport");
  console.log("🔍 [TRANSFORM DEBUG] Report type:", reportType);
  console.log("🔍 [TRANSFORM DEBUG] Assistant ID:", assistantId);
  
  // Log raw export structure
  console.log("🔍 [TRANSFORM DEBUG] Raw export keys:", Object.keys(rawExport || {}));
  if (rawExport?.user) {
    console.log("🔍 [TRANSFORM DEBUG] User info:", {
      name: rawExport.user.name,
      completed: rawExport.user.ast_workshop_completed
    });
  }
  
  if (rawExport?.assessments) {
    // Check if assessments is an array or object
    if (Array.isArray(rawExport.assessments)) {
      console.log("🔍 [TRANSFORM DEBUG] Assessments count:", rawExport.assessments.length);
      console.log("🔍 [TRANSFORM DEBUG] Assessment types:", 
        rawExport.assessments.map((a: any) => a.assessment_type));
    } else {
      console.log("🔍 [TRANSFORM DEBUG] Assessments (object):", Object.keys(rawExport.assessments));
    }
  }

  try {
    // Transform the data
    console.log("🔍 [TRANSFORM DEBUG] Calling transformExportToAssistantInput...");
    const compact = transformExportToAssistantInput(rawExport, {
      report_type: reportType,
      imagination_mode: "default"
    });

    // Log the transformed data
    console.log("🔍 [TRANSFORM DEBUG] ========== TRANSFORMED DATA ==========");
    console.log("🔍 [TRANSFORM DEBUG] Participant name:", compact.participant_name);
    console.log("🔍 [TRANSFORM DEBUG] Leading strengths:", compact.strengths.leading);
    console.log("🔍 [TRANSFORM DEBUG] Flow score:", compact.flow.flowScore);
    
    // Log reflection quality
    const reflections = compact.reflections;
    const reflectionLengths = Object.entries(reflections).map(([key, value]) => 
      ({ [key]: (value as string).length }));
    console.log("🔍 [TRANSFORM DEBUG] Reflection lengths:", reflectionLengths);
    
    // Sample a few reflections
    console.log("🔍 [TRANSFORM DEBUG] Sample reflections:");
    console.log("  - strength1:", reflections.strength1?.substring(0, 100) + "...");
    console.log("  - teamValues:", reflections.teamValues?.substring(0, 100) + "...");
    console.log("  - uniqueContribution:", reflections.uniqueContribution?.substring(0, 100) + "...");
    
    // Check for reflection validity
    if (compact.reflections_invalid) {
      console.warn("⚠️ [TRANSFORM DEBUG] Reflections marked as invalid (gibberish detected)");
    }
    
    console.log("🔍 [TRANSFORM DEBUG] Cantril ladder:", {
      current: compact.cantrilLadder.wellBeingLevel,
      future: compact.cantrilLadder.futureWellBeingLevel
    });
    
    console.log("🔍 [TRANSFORM DEBUG] Future self description length:", 
      compact.futureSelf.futureSelfDescription?.length || 0);
    
    console.log("🔍 [TRANSFORM DEBUG] Final insight length:", 
      compact.finalReflection.keyInsight?.length || 0);
    
    console.log("🔍 [TRANSFORM DEBUG] ====================================");

    // Now call the OpenAI generation with detailed input
    console.log("🔍 [TRANSFORM DEBUG] Calling generateOpenAIReport...");
    const result = await generateOpenAIReport({ 
      assistantId, 
      compactInput: compact 
    });
    
    console.log("🔍 [TRANSFORM DEBUG] Report generation completed successfully");
    return result;
    
  } catch (error) {
    console.error("🔍 [TRANSFORM DEBUG] Error in createAstReportFromExport:", error);
    throw error;
  }
}

/**
 * Generate coaching response using OpenAI API
 */
export async function generateOpenAICoachingResponse(requestData: CoachingRequestData): Promise<string> {
  const { userMessage, personaType, userName, contextData, userId, sessionId, maxTokens = 800, stepId, exportData } = requestData;

  try {
    console.log(`🤖 Generating OpenAI response for persona: ${personaType}, user: ${userName}`);

    // Handle Star Report Talia persona for holistic reports
    if (personaType === 'star_report') {
      
      // Handle holistic report generation
      if (contextData?.reportContext === 'holistic_generation' || userMessage.includes('Personal Development Report') || userMessage.includes('Professional Profile Report')) {
        console.log('🎯 Using OpenAI for holistic report generation');
        
        const reportType = userMessage.includes('Professional Profile Report') ? 'professional' : 'personal';
        
        try {
          // Get assistant configuration
          let assistantConfig = getAssistantByPurpose('report');
          if (!assistantConfig) {
            assistantConfig = getAssistantByPurpose('ia');
          }
          if (!assistantConfig) {
            throw new Error('No suitable assistant available for report generation');
          }

          // Use new clean AST report generation
          // Use exportData if provided (for sectional reports), otherwise fall back to contextData.userData
          const userData = exportData || contextData.userData;
          const report = await createAstReportFromExport(
            userData,
            assistantConfig.id,
            reportType
          );

          return report;
        } catch (error) {
          console.error('❌ Error in clean AST report generation:', error);
          throw error;
        }
      }
      
      // Report Talia should not interact with users - this is admin-only for report generation
      if (!contextData?.selectedUserId) {
        return `Please select a user from the dropdown menu above to generate their report.`;
      }

      console.log(`🎯 Using OpenAI Report Talia for user: ${contextData.selectedUserName} (ID: ${contextData.selectedUserId})`);
      
      // For general questions about the user's data
      const messages: OpenAIMessage[] = [
        {
          role: 'system',
          content: `You are Report Talia, an expert in analyzing AllStarTeams workshop data to provide insights about personal development and strengths.

User Context:
- Selected User: ${contextData.selectedUserName}
- User has completed AST workshop assessments
- You have access to their complete workshop data including strengths assessment, flow state analysis, reflections, and future visioning

Respond helpfully to questions about this user's development journey, strengths, or provide specific insights based on their workshop completion.`
        },
        {
          role: 'user',
          content: userMessage
        }
      ];

      const response = await callOpenAIAPI(messages, maxTokens, userId, 'coaching', sessionId);
      return response;
    }

    // Handle ast_reflection with Reflection Talia Assistant
    if (personaType === 'ast_reflection' || personaType === 'talia_coach') {
      console.log('🤖 Using Reflection Talia Assistant for coaching');
      
      const assistantConfig = getAssistantByPurpose('reflection');
      if (!assistantConfig) {
        throw new Error('Reflection Talia assistant not configured');
      }
      
      // Create coaching prompt for the assistant
      const coachingPrompt = `Help me with my reflection question. I'm working on the AllStarTeams workshop.

Context: ${JSON.stringify(contextData, null, 2)}

My question or thought: ${userMessage}

Please help me think through this and provide guidance to help me develop my own insights.`;

      try {
        const client = getOpenAIClient();
        
        // Create a thread
        const thread = await client.beta.threads.create();
        
        // Add the message to the thread
        await client.beta.threads.messages.create(thread.id, {
          role: 'user',
          content: coachingPrompt
        });
        
        // Run the assistant
        const run = await client.beta.threads.runs.create(thread.id, {
          assistant_id: assistantConfig.id
        });
        
        // Wait for completion
        let runStatus = await client.beta.threads.runs.retrieve(thread.id, run.id);
        const maxWaitTime = 60000; // 1 minute
        const startTime = Date.now();
        
        while (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
          if (Date.now() - startTime > maxWaitTime) {
            throw new Error('Assistant run timed out');
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          runStatus = await client.beta.threads.runs.retrieve(thread.id, run.id);
        }
        
        if (runStatus.status === 'completed') {
          // Get the assistant's response
          const messages = await client.beta.threads.messages.list(thread.id);
          const assistantMessage = messages.data.find(msg => msg.role === 'assistant');
          
          if (assistantMessage && assistantMessage.content[0]?.type === 'text') {
            const response = assistantMessage.content[0].text.value;
            console.log(`✅ Reflection Talia Assistant response generated (${response.length} characters)`);
            return response;
          } else {
            throw new Error('No valid response from Reflection Talia assistant');
          }
        } else {
          throw new Error(`Reflection Talia assistant run failed with status: ${runStatus.status}`);
        }
      } catch (assistantError) {
        console.error('❌ Reflection Talia Assistant error, falling back to chat completions:', assistantError);
        // Fall through to traditional approach
      }
    }

    // Handle other personas with traditional coaching approach (fallback)
    console.log('🔄 Using traditional chat completions approach');
    const persona = getCurrentPersona(personaType);
    
    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: buildCoachingSystemPrompt(personaType, userName, contextData)
      },
      {
        role: 'user',
        content: userMessage
      }
    ];

    console.log(`🚀 About to call OpenAI API with maxTokens: ${maxTokens}`);
    
    const response = await callOpenAIAPI(
      messages, 
      maxTokens, 
      userId, 
      'coaching', 
      sessionId,
      'gpt-4o-mini'
    );
    console.log(`🎉 OpenAI API call successful!`);
    
    console.log(`✅ OpenAI response generated (${response.length} chars)`);
    return response;

  } catch (error) {
    console.error('❌ Error generating OpenAI response:', error);
    
    // Return fallback response
    const personaName = personaType === 'star_report' ? 'Report Talia' : 
                       personaType === 'ast_reflection' ? 'Reflection Talia' : 
                       'Talia';
    
    return `Hi! I'm ${personaName}, here to help with your reflections. I'm having trouble connecting right now.

Your message: "${userMessage}"

In the meantime, I encourage you to reflect on what you already know about your strengths. What insights come to mind naturally when you think about this question?`;
  }
}

/**
 * Build system prompt for coaching (simplified for OpenAI)
 */
function buildCoachingSystemPrompt(personaType: string, userName: string, contextData: any): string {
  const isTaliaPersona = personaType === 'talia_coach' || personaType === 'ast_reflection';
  const basePrompt = `You are ${isTaliaPersona ? 'Talia' : 'a Workshop Assistant'}, here to help with reflections and workshop activities.`;
  
  if (isTaliaPersona) {
    return `${basePrompt}

You help participants discover and develop their unique strengths through reflection. You are supportive, insightful, and focused on growth.

Guidelines:
- Help them think through their reflections, don't write for them
- Ask clarifying questions to help them dig deeper
- Focus on their specific strengths and workshop context
- Be conversational and encouraging
- Keep responses focused and helpful
- Always introduce yourself as "Hi! I'm Talia, here to help with your reflections."

Current context: ${JSON.stringify(contextData, null, 2)}

Respond helpfully as Talia.`;
  } else {
    return `${basePrompt}

You provide contextual assistance during workshop steps, helping participants understand content and complete activities effectively.

Current context: ${JSON.stringify(contextData, null, 2)}

Respond helpfully and concisely.`;
  }
}

/**
 * Check if OpenAI API is available
 */
export function isOpenAIAPIAvailable(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

/**
 * Get OpenAI API status
 */
export function getOpenAIAPIStatus() {
  return {
    enabled: !!process.env.OPENAI_API_KEY,
    hasApiKey: !!process.env.OPENAI_API_KEY,
    defaultModel: 'gpt-4o-mini',
    isAvailable: isOpenAIAPIAvailable(),
    projects: projectManager.getAllProjects().map(p => ({
      name: p.name,
      purpose: p.purpose,
      defaultModel: p.defaultModel,
      configured: !!p.apiKey
    }))
  };
}

// Export additional functions for external use
export {
  getAssistantManager,
  getAllModelConfigs,
  getModelConfig,
  initializeOpenAIAssistants,
  enhancedOpenAICall,
  getOpenAIClient,
  getAssistantByPurpose
};
