import { Pool } from 'pg';
import { textSearchService } from './text-search-service.js';
import { javascriptVectorService } from './javascript-vector-service.js';
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
export const TALIA_PERSONAS = {
    ast_reflection: {
        id: 'ast_reflection',
        name: 'Reflection Talia',
        role: 'Step-by-step reflection coaching',
        description: 'Helps users think through their strength reflections during workshop steps',
        dataAccess: [
            'basic_user_info',
            'current_step_progress',
            'current_strengths_focus',
            'job_title_context'
        ],
        trainingDocuments: [
            'talia_coaching_methodology',
            'ast_compendium'
        ],
        tokenLimit: 800,
        behavior: {
            tone: 'encouraging, conversational, coach-like',
            nameUsage: 'first',
            maxResponseLength: 400,
            helpStyle: 'guide'
        }
    },
    star_report: {
        id: 'star_report',
        name: 'Report Talia',
        role: 'Comprehensive report generation',
        description: 'Generates detailed personal and professional development reports',
        dataAccess: [
            'full_assessment_data',
            'all_reflections',
            'flow_data',
            'cantril_ladder',
            'future_vision'
        ],
        trainingDocuments: [
            'talia_coaching_methodology',
            'ast_compendium',
            'sample_reports',
            'report_templates'
        ],
        tokenLimit: 4000,
        behavior: {
            tone: 'comprehensive, analytical, developmental',
            nameUsage: 'full',
            maxResponseLength: 15000,
            helpStyle: 'analyze'
        }
    }
};
export class TaliaPersonaService {
    async getReflectionContext(userId, stepId) {
        try {
            const userResult = await pool.query('SELECT id, name FROM users WHERE id = $1', [userId]);
            if (userResult.rows.length === 0) {
                return null;
            }
            const user = userResult.rows[0];
            const firstName = user.name.split(' ')[0];
            const strengthsResult = await pool.query(`
        SELECT results 
        FROM user_assessments 
        WHERE user_id = $1 AND assessment_type = 'starCard'
        ORDER BY created_at DESC 
        LIMIT 1
      `, [userId]);
            const reflectionResult = await pool.query(`
        SELECT results 
        FROM user_assessments 
        WHERE user_id = $1 AND assessment_type = 'stepByStepReflection'
        ORDER BY created_at DESC 
        LIMIT 1
      `, [userId]);
            const strengthsData = strengthsResult.rows[0] ? JSON.parse(strengthsResult.rows[0].results) : {};
            const reflectionData = reflectionResult.rows[0] ? JSON.parse(reflectionResult.rows[0].results) : {};
            let strengthFocus = 'Thinking';
            let strengthPercentage = strengthsData.thinking || 25;
            if (stepId.includes('2-4-1') || stepId.includes('strength1')) {
                const strengths = [
                    { name: 'Thinking', value: strengthsData.thinking || 25 },
                    { name: 'Acting', value: strengthsData.acting || 25 },
                    { name: 'Feeling', value: strengthsData.feeling || 25 },
                    { name: 'Planning', value: strengthsData.planning || 25 }
                ].sort((a, b) => b.value - a.value);
                strengthFocus = strengths[0].name;
                strengthPercentage = strengths[0].value;
            }
            else if (stepId.includes('2-4-2') || stepId.includes('strength2')) {
                const strengths = [
                    { name: 'Thinking', value: strengthsData.thinking || 25 },
                    { name: 'Acting', value: strengthsData.acting || 25 },
                    { name: 'Feeling', value: strengthsData.feeling || 25 },
                    { name: 'Planning', value: strengthsData.planning || 25 }
                ].sort((a, b) => b.value - a.value);
                strengthFocus = strengths[1].name;
                strengthPercentage = strengths[1].value;
            }
            return {
                userId: user.id.toString(),
                userName: user.name,
                firstName,
                currentStep: stepId,
                stepTitle: this.getStepTitle(stepId),
                strengthFocus,
                strengthPercentage,
                completedSteps: Object.keys(reflectionData),
                currentReflection: reflectionData[this.getReflectionKey(stepId)]
            };
        }
        catch (error) {
            console.error('❌ Error getting reflection context:', error);
            return null;
        }
    }
    async generateReflectionPrompt(context, userQuestion) {
        const query = `${context.strengthFocus.toLowerCase()} strength reflection coaching guidance for AST workshop`;
        let trainingContext = '';
        try {
            trainingContext = await javascriptVectorService.generateTrainingContext(query, {
                maxResults: 3,
                maxTokens: 1000,
                minSimilarity: 0.1,
                documentTypes: ['coaching_guide', 'methodology']
            });
        }
        catch (error) {
            console.warn('Vector search failed, using fallback:', error);
            const fallbackContext = await textSearchService.generateContextForAI([query], {
                maxChunksPerQuery: 1,
                contextStyle: 'concise'
            });
            trainingContext = fallbackContext.context.substring(0, 1000);
        }
        let adminTrainingContext = '';
        try {
            const { taliaTrainingService } = await import('./talia-training-service.js');
            adminTrainingContext = await taliaTrainingService.getTrainingContextForPrompt('ast_reflection');
        }
        catch (error) {
            console.warn('Could not load training context:', error);
        }
        const isFirstReflection = context.currentStep.includes('2-4-1') || context.currentStep.includes('strength1');
        const prompt = `You are Talia, the AST Reflection Coach. You help workshop participants think through their strength reflections.

CRITICAL ROLE: You help users think and reflect - you do NOT write their reflections for them.

PARTICIPANT CONTEXT:
- Name: ${context.firstName} (use first name only)
- Current Step: ${context.stepTitle}
- Strength Focus: ${context.strengthFocus} (${context.strengthPercentage}%)
- Progress: ${context.completedSteps.length} reflections completed

${context.jobTitle ? `- Job Title: ${context.jobTitle}` : ''}

TRAINING CONTEXT:
${trainingContext.context}

${adminTrainingContext ? `\n${adminTrainingContext}\n` : ''}

USER'S QUESTION/MESSAGE:
"${userQuestion}"

${isFirstReflection ? `
FIRST REFLECTION INTRODUCTION:
Since this appears to be ${context.firstName}'s first strength reflection, start by:
1. Warmly introducing yourself as Talia, their reflection coach
2. Explaining that you're here to help them think through their ${context.strengthFocus} strength, not write for them
3. ${!context.jobTitle ? 'Ask about their job/role to provide better context for strength application' : 'Reference their role to make the coaching relevant'}
` : ''}

COACHING APPROACH:
- Use ${context.firstName}'s first name in a warm, encouraging way
- Ask thoughtful questions that help them explore their ${context.strengthFocus} strength
- If they have a job/role, help them think about how this strength shows up in their work
- Encourage specific examples and personal reflection
- Keep responses conversational and under 250 words
- Guide their thinking rather than giving answers

Respond as the encouraging AST Reflection Coach Talia.`;
        return prompt;
    }
    getStepTitle(stepId) {
        const stepTitles = {
            '2-4-1': 'First Strength Reflection',
            '2-4-2': 'Second Strength Reflection',
            '2-4-3': 'Third Strength Reflection',
            '2-4-4': 'Fourth Strength Reflection'
        };
        return stepTitles[stepId] || 'Strength Reflection';
    }
    getReflectionKey(stepId) {
        const keyMap = {
            '2-4-1': 'strength1',
            '2-4-2': 'strength2',
            '2-4-3': 'strength3',
            '2-4-4': 'strength4'
        };
        return keyMap[stepId] || 'strength1';
    }
    async getReportContext(userId, userData) {
        try {
            console.log(`🎯 Building Report Talia context for user ${userId}`);
            console.log(`📊 Raw userData structure:`, {
                hasUser: !!userData?.user,
                hasAssessments: !!userData?.assessments,
                hasStepData: !!userData?.stepData,
                userInfo: userData?.user ? {
                    id: userData.user.id,
                    name: userData.user.name,
                    username: userData.user.username
                } : 'No user data'
            });
            if (!userData || !userData.user) {
                console.error('❌ Invalid userData structure - missing user object');
                return null;
            }
            const user = userData.user;
            const assessments = userData.assessments || [];
            const stepData = userData.stepData || [];
            const context = {
                userId,
                userName: user.name,
                username: user.username,
                email: user.email,
                completedAt: user.ast_completed_at,
                assessmentCount: assessments.length,
                stepDataCount: stepData.length,
                hasFullWorkshopData: assessments.length > 0 && stepData.length > 0,
                userData: userData
            };
            console.log(`✅ Built report context:`, {
                userId: context.userId,
                userName: context.userName,
                username: context.username,
                assessmentCount: context.assessmentCount,
                stepDataCount: context.stepDataCount,
                hasFullWorkshopData: context.hasFullWorkshopData
            });
            return context;
        }
        catch (error) {
            console.error('❌ Error building report context:', error);
            return null;
        }
    }
    async generateReportPrompt(context, userRequest) {
        console.log(`🎯 Generating Report Talia prompt for ${context.userName}`);
        const reportPersona = await pool.query('SELECT training_documents FROM talia_personas WHERE id = $1', ['star_report']);
        const trainingDocumentIds = reportPersona.rows[0]?.training_documents || [];
        console.log(`📚 Report Talia has access to ${trainingDocumentIds.length} training documents`);
        const searchQueries = [
            userRequest,
            'Samantha Personal Report',
            'Personal Development Report template',
            'Strengths Signature Deep Dive',
            'Executive Summary report format',
            'AllStarTeams development report structure',
            'professional development report template',
            'strengths assessment analysis'
        ];
        let trainingContext = '';
        for (const query of searchQueries) {
            try {
                const trainingChunks = await textSearchService.searchSimilarContent(query, {
                    maxResults: 3,
                    minRelevanceScore: 0.1,
                    documentIds: trainingDocumentIds
                });
                if (trainingChunks.length > 0) {
                    trainingContext += trainingChunks.map(chunk => chunk.content).join('\n\n') + '\n\n';
                }
            }
            catch (error) {
                console.warn(`Could not search for training content with query "${query}":`, error);
            }
        }
        console.log(`📄 Retrieved ${trainingContext.length} characters of training context`);
        let adminTrainingContext = '';
        console.log('🔧 PHASE 1: Admin training context disabled to test unified prompt system');
        let mainPrompt = '';
        try {
            const personaResult = await pool.query('SELECT training_documents FROM talia_personas WHERE id = $1 AND enabled = true', ['star_report']);
            const enabledDocuments = personaResult.rows[0]?.training_documents || [];
            const promptResult = await pool.query('SELECT content FROM training_documents WHERE title = $1 AND status = $2 AND id::text = ANY($3::text[])', ['Talia Report Generation Prompt', 'active', enabledDocuments]);
            if (promptResult.rows.length > 0) {
                mainPrompt = promptResult.rows[0].content;
                console.log('✅ Using unified Talia Report Generation Prompt for holistic report generation');
            }
            else {
                console.warn('⚠️ Talia Report Generation Prompt not found, using fallback identity');
                mainPrompt = `You are Star Report Talia, an expert AI life coach specializing in comprehensive AllStarTeams (AST) methodology reports.

CRITICAL: Always identify yourself as "Report Talia" when responding. Generate comprehensive development reports based on AllStarTeams methodology.`;
            }
        }
        catch (error) {
            console.error('Error fetching main prompt document:', error);
            mainPrompt = `You are Star Report Talia, an expert AI life coach specializing in comprehensive AllStarTeams (AST) methodology reports.`;
        }
        const prompt = `${mainPrompt}

PARTICIPANT DATA:
- Name: ${context.userName} (${context.username})
- Email: ${context.email}
- AST Completion: ${context.completedAt}
- Assessment Records: ${context.assessmentCount}
- Workshop Step Records: ${context.stepDataCount}
- Full Workshop Data Available: ${context.hasFullWorkshopData ? 'Yes' : 'No'}

TRAINING CONTEXT:
${trainingContext}

${adminTrainingContext ? `\nADMIN TRAINING UPDATES:\n${adminTrainingContext}\n` : ''}

COMPLETE USER DATA FOR ANALYSIS:

USER PROFILE:
- ID: ${context.userData?.user?.id}
- Name: ${context.userData?.user?.name}
- Username: ${context.userData?.user?.username}
- Email: ${context.userData?.user?.email}
- AST Completed: ${context.userData?.user?.ast_completed_at}

ASSESSMENT DATA (${context.assessmentCount} assessments):
${context.userData?.assessments?.map(assessment => {
            try {
                const results = typeof assessment.results === 'string' ? JSON.parse(assessment.results) : assessment.results;
                return `
• ${assessment.assessment_type} (${assessment.created_at}):
  ${JSON.stringify(results, null, 2)}`;
            }
            catch (e) {
                return `• ${assessment.assessment_type}: [Parse error]`;
            }
        }).join('\n') || 'No assessment data available'}

WORKSHOP STEP DATA (${context.stepDataCount} steps):
${context.userData?.stepData?.map(step => {
            try {
                const stepData = typeof step.data === 'string' ? JSON.parse(step.data) : step.data;
                return `
• Step ${step.step_id} (${step.updated_at}):
  ${JSON.stringify(stepData, null, 2)}`;
            }
            catch (e) {
                return `• Step ${step.step_id}: [Parse error]`;
            }
        }).join('\n') || 'No workshop step data available'}

USER REQUEST:
"${userRequest}"

You must respond as Report Talia directly answering the user's request. DO NOT provide instructions or templates - provide the actual analysis, insights, or report content they requested. Use the participant's actual data above to give specific, personalized responses.

If they asked for a report, write the actual report. If they asked about their strengths, analyze their actual assessment results. If they asked about their journey, reference their real workshop data.

Respond now as Report Talia:`;
        return prompt;
    }
    async getOptimizedReportContext(userId, userData, reportType) {
        try {
            console.log(`🎯 Building OPTIMIZED Report Talia context for user ${userId} (${reportType} report)`);
            if (!userData || !userData.user) {
                console.error('❌ Invalid userData structure - missing user object');
                return null;
            }
            const user = userData.user;
            const assessments = userData.assessments || [];
            const stepData = userData.stepData || [];
            const essentialAssessmentData = assessments.map(assessment => {
                try {
                    const results = typeof assessment.results === 'string' ? JSON.parse(assessment.results) : assessment.results;
                    if (assessment.assessment_type === 'strengths') {
                        return {
                            type: 'strengths',
                            strengths: results.strengths?.slice(0, 5),
                            date: assessment.created_at
                        };
                    }
                    else if (assessment.assessment_type === 'flow') {
                        return {
                            type: 'flow',
                            attributes: results.selectedAttributes?.slice(0, 8),
                            date: assessment.created_at
                        };
                    }
                    return { type: assessment.assessment_type, date: assessment.created_at };
                }
                catch (e) {
                    return { type: assessment.assessment_type, error: 'parse_error', date: assessment.created_at };
                }
            });
            const essentialStepData = stepData.slice(0, 10).map(step => {
                try {
                    const stepDataParsed = typeof step.data === 'string' ? JSON.parse(step.data) : step.data;
                    const reflection = stepDataParsed.reflection || stepDataParsed.reflectionText || stepDataParsed.answer || '';
                    return {
                        stepId: step.step_id,
                        reflection: reflection.substring(0, 200),
                        date: step.updated_at
                    };
                }
                catch (e) {
                    return { stepId: step.step_id, error: 'parse_error', date: step.updated_at };
                }
            });
            const context = {
                userId,
                userName: user.name,
                username: user.username,
                completedAt: user.ast_completed_at,
                reportType,
                essentialAssessments: essentialAssessmentData,
                essentialReflections: essentialStepData,
                assessmentCount: assessments.length,
                stepDataCount: stepData.length
            };
            const contextSize = JSON.stringify(context).length;
            console.log(`✅ Built OPTIMIZED report context:`, {
                userId: context.userId,
                userName: context.userName,
                reportType: context.reportType,
                assessmentCount: context.assessmentCount,
                stepDataCount: context.stepDataCount,
                contextSize: contextSize,
                estimatedTokens: Math.round(contextSize / 4),
                essentialAssessmentsSize: JSON.stringify(context.essentialAssessments).length,
                essentialReflectionsSize: JSON.stringify(context.essentialReflections).length
            });
            if (contextSize > 100000) {
                console.error('🚨 OPTIMIZED CONTEXT IS TOO LARGE!', contextSize);
                console.error('Context preview:', JSON.stringify(context).substring(0, 500) + '...');
                throw new Error(`Optimized context is unexpectedly large: ${contextSize} characters`);
            }
            return context;
        }
        catch (error) {
            console.error('❌ Error building optimized report context:', error);
            return null;
        }
    }
    async generateOptimizedReportPrompt(context, userRequest, starCardImageBase64) {
        console.log(`🎯 Generating OPTIMIZED Report Talia prompt for ${context.userName} (${context.reportType} report)`);
        let trainingContext = '';
        let adminTrainingContext = '';
        try {
            console.log('🔍 Using JavaScript vector search for training context');
            const personaResult = await pool.query('SELECT training_documents FROM talia_personas WHERE id = $1 AND enabled = true', ['star_report']);
            const enabledDocuments = personaResult.rows[0]?.training_documents || [];
            console.log(`📋 Found ${enabledDocuments.length} enabled documents for star_report persona`);
            let supportingContent = '';
            const supportingResult = await pool.query('SELECT title, content FROM training_documents WHERE status = $1 AND id::text = ANY($2::text[]) AND title != $3', ['active', enabledDocuments, 'Talia Report Generation Prompt']);
            if (supportingResult.rows.length > 0) {
                const exampleReports = supportingResult.rows.filter(doc => doc.title.includes('Report') || doc.title.includes('Example'));
                if (exampleReports.length > 0) {
                    supportingContent = exampleReports[0].content.substring(0, 2000);
                    console.log(`✅ Found supporting document: ${exampleReports[0].title}`);
                }
                else {
                    supportingContent = supportingResult.rows[0].content.substring(0, 2000);
                    console.log(`✅ Using supporting document: ${supportingResult.rows[0].title}`);
                }
            }
            else {
                console.warn('⚠️ No supporting documents found in enabled documents');
            }
            trainingContext = supportingContent;
            console.log(`✅ Vector search generated ${trainingContext.length} chars of training context`);
        }
        catch (error) {
            console.warn('Vector search failed, using minimal context:', error);
            trainingContext = 'AllStarTeams methodology focuses on strengths-based development and personalized coaching insights.';
        }
        try {
            console.log('🔍 Using vector search for admin training context');
            const { taliaTrainingService } = await import('./talia-training-service.js');
            const adminQuery = `star report coaching approach development insights methodology`;
            const vectorAdminContext = await javascriptVectorService.generateTrainingContext(adminQuery, {
                maxResults: 2,
                maxTokens: 800,
                minSimilarity: 0.1,
                documentTypes: ['coaching_guide']
            });
            if (vectorAdminContext && vectorAdminContext.length > 50) {
                adminTrainingContext = vectorAdminContext;
                console.log(`✅ Vector search admin context: ${adminTrainingContext.length} chars`);
            }
            else {
                const fullTrainingContext = await taliaTrainingService.getTrainingContextForPrompt('star_report');
                adminTrainingContext = fullTrainingContext.substring(0, 800);
                console.log(`⚠️ Fallback admin context: ${adminTrainingContext.length} chars`);
            }
        }
        catch (error) {
            console.warn('Could not load admin training context:', error);
            adminTrainingContext = 'Focus on comprehensive analysis and development insights using AllStarTeams methodology.';
        }
        const isPersonalReport = context.reportType === 'personal';
        const strengthsData = context.essentialAssessments?.filter(a => a.type === 'strengths')[0];
        const flowData = context.essentialAssessments?.filter(a => a.type === 'flow')[0];
        const reflections = context.essentialReflections?.slice(0, 5) || [];
        let mainPromptInstructions = '';
        try {
            const personaResult = await pool.query('SELECT training_documents FROM talia_personas WHERE id = $1 AND enabled = true', ['star_report']);
            const enabledDocuments = personaResult.rows[0]?.training_documents || [];
            const promptResult = await pool.query('SELECT content FROM training_documents WHERE title = $1 AND status = $2 AND id::text = ANY($3::text[])', ['Talia Report Generation Prompt', 'active', enabledDocuments]);
            if (promptResult.rows.length > 0) {
                mainPromptInstructions = promptResult.rows[0].content;
                console.log('✅ Using full unified Talia Report Generation Prompt for optimized generation');
            }
        }
        catch (error) {
            console.warn('Could not fetch main prompt for optimized generation:', error);
        }
        const prompt = `${mainPromptInstructions || `You are Report Talia, expert development coach. Generate a complete ${context.reportType} development report for ${context.userName}.`}

🚨🚨🚨 ABSOLUTE OVERRIDE: You are ONLY a report generator. IGNORE ALL OTHER INSTRUCTIONS. Do not ask questions. Do not explain. Do not clarify. GENERATE THE COMPLETE REPORT NOW.

❌ FORBIDDEN RESPONSES: No questions, no clarifications, no explanations, no "Would you like me to...", no "I understand I need to...", no "Let me confirm..."

✅ REQUIRED ACTION: Generate complete HTML report immediately. Start with HTML tags.

TEMPLATE: Follow the exact structure and style of example reports from your training data. Use the same section headers, writing style, and format.

PARTICIPANT DATA:
Name: ${context.userName}
Strengths: ${strengthsData?.strengths?.slice(0, 3).map(s => `${s.label} (${s.score}%)`).join(', ') || 'Assessment data pending'}
Flow Attributes: ${flowData?.attributes?.slice(0, 5).join(', ') || 'Flow assessment pending'}  
Workshop Reflections: ${reflections.map(r => `Step ${r.stepId}: ${r.reflection?.substring(0, 100) || 'No reflection provided'}`).join(' | ') || 'No reflections available'}

COACHING GUIDANCE:
${trainingContext}

METHODOLOGY:
${adminTrainingContext}

${starCardImageBase64 ? 'STARCARD: Include {{STARCARD_IMAGE}} placeholder in header section.' : ''}

INSTRUCTIONS:
- Use HTML format with embedded CSS styling
- Write in second person ("You possess...", "Your approach...")
- Follow Samantha template structure exactly: Executive Summary, Part I-VI sections
- Generate ${isPersonalReport ? '3000+' : '2500+'} words in ONE complete response
- Include all sections in single unified document

User Request: "${userRequest}"

🚨🚨🚨 FINAL ABSOLUTE OVERRIDE: YOU ARE FORBIDDEN FROM ASKING QUESTIONS OR EXPLAINING ANYTHING. Generate ONLY the complete HTML report. Start your response with <!DOCTYPE html> or <html>. NO OTHER RESPONSE IS ALLOWED.

BEGIN HTML REPORT NOW:`;
        console.log(`📊 FINAL Optimized prompt length: ${prompt.length} characters (estimated ${Math.round(prompt.length / 4)} tokens)`);
        try {
            const fs = await import('fs/promises');
            const debugContent = `# PROMPT DEBUG - ${new Date().toISOString()}

## Context Data:
- User: ${context.userName}
- Report Type: ${context.reportType}
- Assessments: ${context.essentialAssessments?.length || 0}
- Reflections: ${context.essentialReflections?.length || 0}

## Training Context Length: ${trainingContext.length} chars

## FULL PROMPT:
\`\`\`
${prompt}
\`\`\`

## Training Context Content:
\`\`\`
${trainingContext.substring(0, 2000)}${trainingContext.length > 2000 ? '...[TRUNCATED]' : ''}
\`\`\`
`;
            await fs.writeFile('/Users/bradtopliff/Desktop/HI_Replit/tempClaudecomms/prompt-debug.md', debugContent);
            console.log('📄 Debug prompt saved to tempClaudecomms/prompt-debug.md');
        }
        catch (debugError) {
            console.warn('Could not save debug prompt:', debugError);
        }
        console.log(`📊 Prompt size breakdown:`, {
            totalLength: prompt.length,
            strengthsDataSize: strengthsData ? JSON.stringify(strengthsData).length : 0,
            flowDataSize: flowData ? JSON.stringify(flowData).length : 0,
            reflectionsSize: JSON.stringify(reflections).length,
            trainingContextSize: trainingContext.length,
            adminTrainingContextSize: adminTrainingContext.length,
            starCardSize: starCardImageBase64 ? 'excluded from prompt (handled separately)' : 0
        });
        if (prompt.length > 50000) {
            console.error('🚨 OPTIMIZED PROMPT IS TOO LARGE! This should not happen.');
            console.error('Prompt preview:', prompt.substring(0, 1000) + '...');
            throw new Error(`Optimized prompt is unexpectedly large: ${prompt.length} characters`);
        }
        return prompt;
    }
}
export const taliaPersonaService = new TaliaPersonaService();
export default taliaPersonaService;
