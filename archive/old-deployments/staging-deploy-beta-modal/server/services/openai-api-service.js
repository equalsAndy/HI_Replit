import OpenAI from 'openai';
import { aiUsageLogger } from './ai-usage-logger.js';
import { TALIA_PERSONAS } from './talia-personas.js';
import { CURRENT_PERSONAS } from '../routes/persona-management-routes.js';
import fs from 'fs/promises';
import path from 'path';
class OpenAIAssistantManager {
    client;
    assistantConfigs = new Map();
    constructor() {
        this.client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        this.initializeAssistants();
    }
    initializeAssistants() {
        const assistants = [
            {
                id: 'asst_CZ9XUvnWRx3RIWFc7pLeH8U2',
                name: 'Report Talia',
                purpose: 'Holistic report generation with personalized insights',
                vectorStoreId: 'vs_688e2bf0d94c81918b50080064684bde',
                personality: 'Professional report writer focused on comprehensive development analysis',
                model: 'gpt-4o-mini'
            },
            {
                id: 'asst_pspnPtUj1RF5zC460VKkkjdV',
                name: 'Reflection Talia',
                purpose: 'Interactive coaching and reflection guidance',
                vectorStoreId: 'vs_688e55e74e68819190cca71d1fa54f52',
                personality: 'Hi! I\'m Talia, here to help with your reflections. Supportive and encouraging.',
                model: 'gpt-4o-mini'
            },
            {
                id: 'asst_FwLFnLmO3aq3WZ76VWizwKou',
                name: 'Admin Assistant',
                purpose: 'Admin chat interface and cross-assistant training',
                vectorStoreId: 'vs_688e55e81e6c8191af100194c2ac9512',
                personality: 'Technical assistant with access to all project knowledge for admin training',
                model: 'gpt-4o-mini'
            }
        ];
        assistants.forEach(config => {
            this.assistantConfigs.set(config.name.toLowerCase().replace(' ', '_'), config);
        });
    }
    getClient() {
        return this.client;
    }
    getAssistantConfig(assistantType) {
        return this.assistantConfigs.get(assistantType);
    }
    getAllAssistants() {
        return Array.from(this.assistantConfigs.values());
    }
    getAssistantByPurpose(purpose) {
        const purposeMap = {
            'report': 'report_talia',
            'reflection': 'reflection_talia',
            'admin': 'admin_assistant'
        };
        return this.assistantConfigs.get(purposeMap[purpose]);
    }
    async getAssistantResourcesSummary() {
        const summaries = [];
        for (const [assistantKey, config] of this.assistantConfigs) {
            try {
                const vectorStore = await this.client.beta.vectorStores.retrieve(config.vectorStoreId);
                const summary = {
                    assistantId: config.id,
                    name: config.name,
                    purpose: config.purpose,
                    vectorStore: {
                        id: vectorStore.id,
                        name: vectorStore.name || 'Unnamed Vector Store',
                        fileCount: vectorStore.file_counts?.completed || 0
                    },
                    lastActivity: new Date(),
                    usage: {
                        calls: 0,
                        tokens: 0,
                        errors: 0
                    }
                };
                summaries.push(summary);
            }
            catch (error) {
                console.error(`Error getting summary for assistant ${config.name}:`, error);
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
    async runABTest(prompt, modelA = 'gpt-4o-mini', modelB = 'gpt-4', projectType = 'development') {
        const messages = [{ role: 'user', content: prompt }];
        const startTime = Date.now();
        const [responseA, responseB] = await Promise.all([
            this.runModelTest(messages, modelA, projectType),
            this.runModelTest(messages, modelB, projectType)
        ]);
        const quality = {
            lengthA: responseA.response.length,
            lengthB: responseB.response.length,
            coherenceA: this.calculateCoherence(responseA.response),
            coherenceB: this.calculateCoherence(responseB.response)
        };
        let winner = 'tie';
        if (quality.coherenceA > quality.coherenceB && responseA.time < responseB.time * 1.5) {
            winner = 'A';
        }
        else if (quality.coherenceB > quality.coherenceA && responseB.time < responseA.time * 1.5) {
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
    async runModelTest(messages, model, projectType) {
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
        }
        catch (error) {
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
    calculateCoherence(text) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const avgSentenceLength = text.length / Math.max(sentences.length, 1);
        const wordCount = text.split(/\s+/).length;
        let coherenceScore = 50;
        if (avgSentenceLength > 10 && avgSentenceLength < 30)
            coherenceScore += 20;
        if (wordCount > 50 && wordCount < 500)
            coherenceScore += 20;
        if (text.includes('\n'))
            coherenceScore += 10;
        return Math.min(100, Math.max(0, coherenceScore));
    }
    generateRecommendation(responseA, responseB, quality, winner) {
        const costDiff = Math.abs(responseA.cost - responseB.cost);
        const timeDiff = Math.abs(responseA.time - responseB.time);
        if (winner === 'tie') {
            if (responseA.cost < responseB.cost) {
                return `Models performed similarly in quality. Choose ${responseA.model} for cost savings ($${costDiff.toFixed(6)} cheaper).`;
            }
            else {
                return `Models performed similarly. Consider using ${responseB.model} for the specific use case.`;
            }
        }
        const winnerModel = winner === 'A' ? responseA.model : responseB.model;
        return `${winnerModel} performed better with higher coherence and acceptable performance. Time difference: ${timeDiff}ms, Cost difference: $${costDiff.toFixed(6)}.`;
    }
}
const assistantManager = new OpenAIAssistantManager();
function getOpenAIClient() {
    return assistantManager.getClient();
}
function getAssistantByPurpose(purpose) {
    return assistantManager.getAssistantByPurpose(purpose);
}
const MODEL_CONFIGS = [
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
function getModelConfig(modelName) {
    return MODEL_CONFIGS.find(config => config.name === modelName);
}
function getAllModelConfigs() {
    return MODEL_CONFIGS;
}
function getAssistantManager() {
    return assistantManager;
}
async function initializeOpenAIAssistants() {
    console.log('🏗️ Initializing OpenAI assistants for AllStarTeams_Talia project...');
    try {
        const client = getOpenAIClient();
        const models = await client.models.list();
        console.log(`✅ OpenAI connection successful. Available models: ${models.data.length}`);
        const vectorStores = await client.beta.vectorStores.list();
        console.log(`📚 Found ${vectorStores.data.length} existing vector stores`);
        vectorStores.data.forEach(vs => {
            console.log(`  - ${vs.name || 'Unnamed'} (${vs.file_counts?.completed || 0} files)`);
        });
    }
    catch (error) {
        console.error('❌ Failed to initialize OpenAI projects:', error);
        throw error;
    }
}
async function enhancedOpenAICall(messages, options = {}) {
    const { maxTokens = 1000, userId, featureName = 'coaching', sessionId, model = 'gpt-4o-mini', projectType = 'report-generation', temperature = 0.7 } = options;
    return callOpenAIAPI(messages, maxTokens, userId, featureName, sessionId, model, projectType);
}
function getCurrentPersona(personaId) {
    const dbPersona = CURRENT_PERSONAS.find(p => p.id === personaId);
    if (dbPersona) {
        return {
            tokenLimit: dbPersona.tokenLimit || 800,
            name: dbPersona.name || 'Talia',
            behavior: dbPersona.behavior || {}
        };
    }
    return TALIA_PERSONAS[personaId] || TALIA_PERSONAS.ast_reflection;
}
async function callOpenAIAPI(messages, maxTokens = 1000, userId, featureName = 'coaching', sessionId, model = 'gpt-4o-mini') {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API not configured');
    }
    if (userId) {
        const canUse = await aiUsageLogger.canUseAI(userId, featureName);
        if (!canUse.allowed) {
            throw new Error(`AI usage not allowed: ${canUse.reason}`);
        }
    }
    const startTime = Date.now();
    let success = false;
    let tokensUsed = 0;
    let errorMessage;
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
        tokensUsed = response.usage?.total_tokens || 0;
        success = true;
        if (response.choices && response.choices.length > 0 && response.choices[0].message?.content) {
            const responseText = response.choices[0].message.content;
            if (userId) {
                const responseTime = Date.now() - startTime;
                const costEstimate = aiUsageLogger.calculateOpenAICost(tokensUsed, model);
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
        }
        else {
            throw new Error('No content in OpenAI response');
        }
    }
    catch (error) {
        console.error('Error calling OpenAI API:', error);
        errorMessage = error instanceof Error ? error.message : 'Unknown error';
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
async function loadPrimaryPrompt() {
    try {
        const promptPath = path.join(process.cwd(), 'keys', 'TALIA_Report_Generation_PRIMARY_Prompt.txt');
        console.log(`🔍 Attempting to load prompt from: ${promptPath}`);
        const content = await fs.readFile(promptPath, 'utf-8');
        console.log(`✅ Primary prompt loaded successfully (${content.length} characters)`);
        return content;
    }
    catch (error) {
        console.error('❌ Failed to load primary prompt:', error);
        console.error('Working directory:', process.cwd());
        console.log('🔄 Using embedded fallback prompt');
        return `# Star Report Talia: Specialized Training for AST Report Generation

## Core Identity and Mission

You are **Star Report Talia**, a specialized AI report writer focused exclusively on generating high-quality Personal Development Reports and Professional Profile Reports from AllStarTeams (AST) workshop data. Your single purpose is to transform assessment data into comprehensive, personalized reports immediately upon request.

**CRITICAL BEHAVIORAL RULE**: When given assessment data and asked to generate a report, you IMMEDIATELY begin writing the complete report. You do NOT:
- Analyze your approach
- Discuss methodology 
- Ask clarifying questions
- Provide introductory statements
- Explain what you're about to do

## Report Generation Instructions

Generate comprehensive, personalized reports using the user's actual workshop data. Include their exact strengths percentages, quote their reflections, and create actionable insights based on their specific responses.

Use 2nd person voice ("You possess...") and reference their actual assessment data and percentages throughout the report.`;
    }
}
function buildUserDataContext(userData, userName) {
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
    const assessmentsArray = userData.assessments || [];
    const userInfo = userData.user || userData.userInfo || {};
    console.log('🔍 DEBUG: Data structure inspection:', {
        isAssessmentsArray: Array.isArray(userData.assessments),
        assessmentsFirstItem: userData.assessments?.[0] ? Object.keys(userData.assessments[0]) : 'empty',
        stepDataFirstItem: userData.stepData?.[0] ? Object.keys(userData.stepData[0]) : 'empty',
        userKeys: userData.user ? Object.keys(userData.user) : 'no user'
    });
    const assessments = {};
    assessmentsArray.forEach((assessment) => {
        if (assessment.assessment_type && assessment.results) {
            try {
                assessments[assessment.assessment_type] = JSON.parse(assessment.results);
            }
            catch (e) {
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
    if (assessments.stepByStepReflection?.reflections) {
        const reflections = assessments.stepByStepReflection.reflections;
        context += `## STEP 2-4: Strength Reflection (Step-by-Step)

### Strength Reflections:
**Strength 1**: "${reflections.strength1 || 'Not provided'}"

**Strength 2**: "${reflections.strength2 || 'Not provided'}"

**Strength 3**: "${reflections.strength3 || 'Not provided'}"

**Strength 4**: "${reflections.strength4 || 'Not provided'}"

**Team Values**: "${reflections.teamValues || 'Not provided'}"

**Unique Contribution**: "${reflections.uniqueContribution || 'Not provided'}"

---
`;
    }
    if (assessments.flowAssessment) {
        context += `## STEP 3-2: Flow Assessment

**Flow Score**: ${assessments.flowAssessment.flowScore || 0}/60 (Flow ${assessments.flowAssessment.flowScore >= 50 ? 'Fluent' : assessments.flowAssessment.flowScore >= 39 ? 'Aware' : assessments.flowAssessment.flowScore >= 26 ? 'Blocked' : 'Distant'} Category)

---
`;
    }
    if (assessments.flowAttributes?.attributes) {
        context += `## Flow Attributes Assessment

**Top Flow Attributes (Ranked by personal resonance):**
`;
        assessments.flowAttributes.attributes.forEach((attr, index) => {
            context += `${index + 1}. **${attr.name}** (Score: ${attr.score}) - ${index === 0 ? 'Primary' : index === 1 ? 'Secondary' : index === 2 ? 'Tertiary' : 'Supporting'} flow state\n`;
        });
        context += '\n---\n';
    }
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
    if (assessments.futureSelfReflection) {
        const future = assessments.futureSelfReflection;
        context += `## STEP 4-4: Your Future Self (Future Visioning)

**Future Self Vision**:

**5 Years**: "${future.fiveYearFoundation || 'Not provided'}"

**10 Years**: "${future.tenYearMilestone || 'Not provided'}"

**20 Years**: "${future.twentyYearVision || 'Not provided'}"

**Flow-Optimized Life**: "${future.flowOptimizedLife || 'Not provided'}"

---
`;
    }
    if (assessments.finalReflection) {
        context += `## STEP 4-5: Final Reflection

**Key Insight**: "${assessments.finalReflection.futureLetterText || 'Not provided'}"

---
`;
    }
    return context;
}
async function generateOpenAIReport(userData, userName, reportType = 'personal', userId, sessionId, vectorDbPrompt) {
    try {
        console.log('🎯 Using OpenAI Assistants API with vector database access');
        console.log('📊 Building user data context...');
        const userDataContext = buildUserDataContext(userData, userName);
        const assistantPrompt = `Generate a comprehensive ${reportType === 'personal' ? 'Personal Development Report' : 'Professional Profile Report'} for this user.

Use the training documents in your vector store for guidance, examples, and structure. The documents contain the primary prompt, examples, and templates you should follow.

## User Assessment Data:
${userDataContext}

## Instructions:
- Use the TALIA_Report_Generation_PRIMARY_Prompt document in your vector store for complete instructions
- Reference supporting documents and examples from your vector store
- Use 2nd person voice ("You possess...")
- Reference the user's exact assessment data and percentages
- Quote their actual reflections and responses
- Create a signature name that captures their unique pattern

Generate the complete ${reportType} report now.`;
        console.log(`📏 Assistant prompt length: ${assistantPrompt.length} characters`);
        console.log('🔍 DEBUG: Prompt being sent to OpenAI Assistant:');
        console.log('='.repeat(80));
        console.log(assistantPrompt);
        console.log('='.repeat(80));
        const client = getOpenAIClient();
        const assistantConfig = getAssistantByPurpose('report');
        if (!assistantConfig) {
            throw new Error('Report Talia assistant not configured');
        }
        const assistantId = assistantConfig.id;
        console.log('🚀 Creating thread and running assistant...');
        const thread = await client.beta.threads.create();
        await client.beta.threads.messages.create(thread.id, {
            role: 'user',
            content: assistantPrompt
        });
        const run = await client.beta.threads.runs.create(thread.id, {
            assistant_id: assistantId
        });
        let runStatus = await client.beta.threads.runs.retrieve(thread.id, run.id);
        console.log(`🔄 Assistant run status: ${runStatus.status}`);
        const maxWaitTime = 120000;
        const startTime = Date.now();
        while (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
            if (Date.now() - startTime > maxWaitTime) {
                throw new Error('Assistant run timed out');
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
            runStatus = await client.beta.threads.runs.retrieve(thread.id, run.id);
            console.log(`🔄 Assistant run status: ${runStatus.status}`);
        }
        if (runStatus.status === 'completed') {
            const messages = await client.beta.threads.messages.list(thread.id);
            const assistantMessage = messages.data.find(msg => msg.role === 'assistant');
            if (assistantMessage && assistantMessage.content[0]?.type === 'text') {
                const response = assistantMessage.content[0].text.value;
                console.log(`✅ OpenAI Assistant generated report successfully (${response.length} characters)`);
                return response;
            }
            else {
                throw new Error('No valid response from assistant');
            }
        }
        else {
            throw new Error(`Assistant run failed with status: ${runStatus.status}`);
        }
    }
    catch (error) {
        console.error('❌ Error generating OpenAI report with assistant:', error);
        throw error;
    }
}
export async function generateOpenAICoachingResponse(requestData) {
    const { userMessage, personaType, userName, contextData, userId, sessionId, maxTokens = 800, stepId } = requestData;
    try {
        console.log(`🤖 Generating OpenAI response for persona: ${personaType}, user: ${userName}`);
        if (personaType === 'star_report') {
            if (contextData?.reportContext === 'holistic_generation' || userMessage.includes('Personal Development Report') || userMessage.includes('Professional Profile Report')) {
                console.log('🎯 Using OpenAI for holistic report generation');
                const reportType = userMessage.includes('Professional Profile Report') ? 'professional' : 'personal';
                try {
                    const report = await generateOpenAIReport(contextData.userData, contextData.selectedUserName || userName, reportType, userId, sessionId, userMessage);
                    return report;
                }
                catch (error) {
                    console.error('❌ Error in OpenAI report generation:', error);
                    throw error;
                }
            }
            if (!contextData?.selectedUserId) {
                return `Please select a user from the dropdown menu above to generate their report.`;
            }
            console.log(`🎯 Using OpenAI Report Talia for user: ${contextData.selectedUserName} (ID: ${contextData.selectedUserId})`);
            const messages = [
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
        if (personaType === 'ast_reflection' || personaType === 'talia_coach') {
            console.log('🤖 Using Reflection Talia Assistant for coaching');
            const assistantConfig = getAssistantByPurpose('reflection');
            if (!assistantConfig) {
                throw new Error('Reflection Talia assistant not configured');
            }
            const coachingPrompt = `Help me with my reflection question. I'm working on the AllStarTeams workshop.

Context: ${JSON.stringify(contextData, null, 2)}

My question or thought: ${userMessage}

Please help me think through this and provide guidance to help me develop my own insights.`;
            try {
                const client = getOpenAIClient();
                const thread = await client.beta.threads.create();
                await client.beta.threads.messages.create(thread.id, {
                    role: 'user',
                    content: coachingPrompt
                });
                const run = await client.beta.threads.runs.create(thread.id, {
                    assistant_id: assistantConfig.id
                });
                let runStatus = await client.beta.threads.runs.retrieve(thread.id, run.id);
                const maxWaitTime = 60000;
                const startTime = Date.now();
                while (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
                    if (Date.now() - startTime > maxWaitTime) {
                        throw new Error('Assistant run timed out');
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    runStatus = await client.beta.threads.runs.retrieve(thread.id, run.id);
                }
                if (runStatus.status === 'completed') {
                    const messages = await client.beta.threads.messages.list(thread.id);
                    const assistantMessage = messages.data.find(msg => msg.role === 'assistant');
                    if (assistantMessage && assistantMessage.content[0]?.type === 'text') {
                        const response = assistantMessage.content[0].text.value;
                        console.log(`✅ Reflection Talia Assistant response generated (${response.length} characters)`);
                        return response;
                    }
                    else {
                        throw new Error('No valid response from Reflection Talia assistant');
                    }
                }
                else {
                    throw new Error(`Reflection Talia assistant run failed with status: ${runStatus.status}`);
                }
            }
            catch (assistantError) {
                console.error('❌ Reflection Talia Assistant error, falling back to chat completions:', assistantError);
            }
        }
        console.log('🔄 Using traditional chat completions approach');
        const persona = getCurrentPersona(personaType);
        const messages = [
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
        const response = await callOpenAIAPI(messages, maxTokens, userId, 'coaching', sessionId, 'gpt-4o-mini');
        console.log(`🎉 OpenAI API call successful!`);
        console.log(`✅ OpenAI response generated (${response.length} chars)`);
        return response;
    }
    catch (error) {
        console.error('❌ Error generating OpenAI response:', error);
        const personaName = personaType === 'star_report' ? 'Report Talia' :
            personaType === 'ast_reflection' ? 'Reflection Talia' :
                'Talia';
        return `Hi! I'm ${personaName}, here to help with your reflections. I'm having trouble connecting right now.

Your message: "${userMessage}"

In the meantime, I encourage you to reflect on what you already know about your strengths. What insights come to mind naturally when you think about this question?`;
    }
}
function buildCoachingSystemPrompt(personaType, userName, contextData) {
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
    }
    else {
        return `${basePrompt}

You provide contextual assistance during workshop steps, helping participants understand content and complete activities effectively.

Current context: ${JSON.stringify(contextData, null, 2)}

Respond helpfully and concisely.`;
    }
}
export function isOpenAIAPIAvailable() {
    return !!process.env.OPENAI_API_KEY;
}
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
export { getAssistantManager, getAllModelConfigs, getModelConfig, initializeOpenAIAssistants, enhancedOpenAICall, getOpenAIClient, getAssistantByPurpose };
