/**
 * Talia Persona System
 * ==================
 * Manages different Talia coaching personas with specific roles and data access
 */

import { Pool } from 'pg';
import { textSearchService } from './text-search-service.js';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export interface TaliaPersonaConfig {
  id: string;
  name: string;
  role: string;
  description: string;
  dataAccess: string[];
  trainingDocuments: string[];
  tokenLimit: number;
  behavior: {
    tone: string;
    nameUsage: 'first' | 'full' | 'formal';
    maxResponseLength: number;
    helpStyle: 'guide' | 'write' | 'analyze';
  };
}

export const TALIA_PERSONAS: Record<string, TaliaPersonaConfig> = {
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

export interface ReflectionContext {
  userId: string;
  userName: string;
  firstName: string;
  currentStep: string;
  stepTitle: string;
  strengthFocus: string;
  strengthPercentage: number;
  jobTitle?: string;
  completedSteps: string[];
  currentReflection?: string;
}

export class TaliaPersonaService {
  
  /**
   * Get reflection context for AST Reflection Talia
   */
  async getReflectionContext(userId: string, stepId: string): Promise<ReflectionContext | null> {
    try {
      // Get basic user info
      const userResult = await pool.query(
        'SELECT id, name FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        return null;
      }

      const user = userResult.rows[0];
      const firstName = user.name.split(' ')[0];

      // Get current strengths data for context
      const strengthsResult = await pool.query(`
        SELECT results 
        FROM user_assessments 
        WHERE user_id = $1 AND assessment_type = 'starCard'
        ORDER BY created_at DESC 
        LIMIT 1
      `, [userId]);

      // Get current step reflection if exists
      const reflectionResult = await pool.query(`
        SELECT results 
        FROM user_assessments 
        WHERE user_id = $1 AND assessment_type = 'stepByStepReflection'
        ORDER BY created_at DESC 
        LIMIT 1
      `, [userId]);

      // Parse strengths data
      const strengthsData = strengthsResult.rows[0] ? JSON.parse(strengthsResult.rows[0].results) : {};
      const reflectionData = reflectionResult.rows[0] ? JSON.parse(reflectionResult.rows[0].results) : {};

      // Determine current strength focus based on step
      let strengthFocus = 'Thinking';
      let strengthPercentage = strengthsData.thinking || 25;
      
      if (stepId.includes('2-4-1') || stepId.includes('strength1')) {
        // Find the highest strength for first reflection
        const strengths = [
          { name: 'Thinking', value: strengthsData.thinking || 25 },
          { name: 'Acting', value: strengthsData.acting || 25 },
          { name: 'Feeling', value: strengthsData.feeling || 25 },
          { name: 'Planning', value: strengthsData.planning || 25 }
        ].sort((a, b) => b.value - a.value);
        
        strengthFocus = strengths[0].name;
        strengthPercentage = strengths[0].value;
      } else if (stepId.includes('2-4-2') || stepId.includes('strength2')) {
        const strengths = [
          { name: 'Thinking', value: strengthsData.thinking || 25 },
          { name: 'Acting', value: strengthsData.acting || 25 },
          { name: 'Feeling', value: strengthsData.feeling || 25 },
          { name: 'Planning', value: strengthsData.planning || 25 }
        ].sort((a, b) => b.value - a.value);
        
        strengthFocus = strengths[1].name;
        strengthPercentage = strengths[1].value;
      }
      // Continue pattern for strength3, strength4...

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

    } catch (error) {
      console.error('❌ Error getting reflection context:', error);
      return null;
    }
  }

  /**
   * Generate coaching prompt for AST Reflection Talia
   */
  async generateReflectionPrompt(context: ReflectionContext, userQuestion: string): Promise<string> {
    // Get relevant training context
    const contextQueries = [
      `${context.strengthFocus.toLowerCase()} strength reflection coaching`,
      'talia coaching methodology reflection guidance',
      'AST workshop step-by-step coaching'
    ];

    const trainingContext = await textSearchService.generateContextForAI(contextQueries, {
      maxChunksPerQuery: 2,
      contextStyle: 'detailed',
      documentTypes: ['coaching_guide', 'methodology']
    });

    // Get admin training data
    let adminTrainingContext = '';
    try {
      const { taliaTrainingService } = await import('./talia-training-service.js');
      adminTrainingContext = await taliaTrainingService.getTrainingContextForPrompt('ast_reflection');
    } catch (error) {
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

  /**
   * Get step title from step ID
   */
  private getStepTitle(stepId: string): string {
    const stepTitles: Record<string, string> = {
      '2-4-1': 'First Strength Reflection',
      '2-4-2': 'Second Strength Reflection', 
      '2-4-3': 'Third Strength Reflection',
      '2-4-4': 'Fourth Strength Reflection'
    };
    
    return stepTitles[stepId] || 'Strength Reflection';
  }

  /**
   * Get reflection data key from step ID
   */
  private getReflectionKey(stepId: string): string {
    const keyMap: Record<string, string> = {
      '2-4-1': 'strength1',
      '2-4-2': 'strength2',
      '2-4-3': 'strength3', 
      '2-4-4': 'strength4'
    };
    
    return keyMap[stepId] || 'strength1';
  }


  /**
   * Get comprehensive context for Report Talia
   */
  async getReportContext(userId: string, userData: any): Promise<any> {
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
      
      // Validate userData structure
      if (!userData || !userData.user) {
        console.error('❌ Invalid userData structure - missing user object');
        return null;
      }
      
      // Get user basic info from userData
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
    } catch (error) {
      console.error('❌ Error building report context:', error);
      return null;
    }
  }

  /**
   * Generate comprehensive prompt for Report Talia
   */
  async generateReportPrompt(context: any, userRequest: string): Promise<string> {
    console.log(`🎯 Generating Report Talia prompt for ${context.userName}`);

    // Get Star Report Talia's training documents from database persona
    const reportPersona = await pool.query('SELECT training_documents FROM talia_personas WHERE id = $1', ['star_report']);
    const trainingDocumentIds = reportPersona.rows[0]?.training_documents || [];
    console.log(`📚 Report Talia has access to ${trainingDocumentIds.length} training documents`);

    // Search for training content relevant to the user request
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
          documentIds: trainingDocumentIds  // Limit search to Report Talia's documents
        });
        
        if (trainingChunks.length > 0) {
          trainingContext += trainingChunks.map(chunk => chunk.content).join('\n\n') + '\n\n';
        }
      } catch (error) {
        console.warn(`Could not search for training content with query "${query}":`, error);
      }
    }

    console.log(`📄 Retrieved ${trainingContext.length} characters of training context`);

    // Get admin training data for Report Talia
    let adminTrainingContext = '';
    try {
      const { taliaTrainingService } = await import('./talia-training-service.js');
      adminTrainingContext = await taliaTrainingService.getTrainingContextForPrompt('star_report');
      console.log(`🎓 Retrieved ${adminTrainingContext.length} characters of admin training context`);
    } catch (error) {
      console.warn('Could not load admin training context for Report Talia:', error);
    }

    const prompt = `You are Star Report Talia, an expert AI life coach specializing in comprehensive AllStarTeams (AST) methodology reports.

CRITICAL: Always identify yourself as "Report Talia" when responding. You are NOT a "Workshop Assistant" - you are specifically "Report Talia" with expertise in generating comprehensive development reports.

CORE IDENTITY:
- Name: Report Talia (Star Report Talia)
- Role: Expert in analyzing complete AST workshop journeys
- Specialization: Creating detailed personal and professional development reports
- Access: Comprehensive training on report structure, analysis, and personalization
- Approach: Professional, analytical, and developmental

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
  } catch (e) {
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
  } catch (e) {
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
}

// Export singleton instance
export const taliaPersonaService = new TaliaPersonaService();
export default taliaPersonaService;