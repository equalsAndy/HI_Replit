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
   * Get comprehensive user data for Star Report Talia
   */
  async getReportContext(userId: string): Promise<any> {
    try {
      // Get basic user info
      const userResult = await pool.query(
        'SELECT id, name, email FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        console.log(`❌ User ${userId} not found for report context`);
        return null;
      }

      const user = userResult.rows[0];
      console.log(`📊 Getting report context for user: ${user.name}`);

      // Get all assessment data for the user
      const assessmentsResult = await pool.query(`
        SELECT assessment_type, results, created_at
        FROM user_assessments 
        WHERE user_id = $1
        ORDER BY assessment_type, created_at DESC
      `, [userId]);

      // Organize assessments by type, taking the most recent of each
      const assessments: Record<string, any> = {};
      const processedTypes = new Set();
      
      for (const row of assessmentsResult.rows) {
        if (!processedTypes.has(row.assessment_type)) {
          assessments[row.assessment_type] = JSON.parse(row.results);
          processedTypes.add(row.assessment_type);
        }
      }

      console.log(`✅ Found ${Object.keys(assessments).length} assessment types for user ${userId}:`, Object.keys(assessments));

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          firstName: user.name.split(' ')[0]
        },
        assessments,
        retrievedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error getting report context:', error);
      return null;
    }
  }

  /**
   * Generate comprehensive report prompt for Star Report Talia
   */
  async generateReportPrompt(
    context: any, 
    reportType: 'standard' | 'personal',
    reportFormat: 'personal' | 'professional'
  ): Promise<string> {
    // Get relevant training context
    const contextQueries = [
      'comprehensive personal development report generation',
      'professional profile report template',
      'strengths constellation analysis methodology',
      'flow state optimization coaching',
      'AllStarTeams report structure and format'
    ];

    const trainingContext = await textSearchService.generateContextForAI(contextQueries, {
      maxChunksPerQuery: 3,
      contextStyle: 'comprehensive',
      documentTypes: ['report_template', 'methodology', 'coaching_guide']
    });

    const isPersonalReport = reportFormat === 'personal';
    const userName = context.user.name;
    const firstName = context.user.firstName;

    const prompt = `You are Talia, the Star Report Coach, generating a comprehensive ${isPersonalReport ? 'Personal Development' : 'Professional Profile'} report.

PARTICIPANT DETAILS:
- Full Name: ${userName}
- User ID: ${context.user.id}
- Report Type: ${reportType.toUpperCase()} ${reportFormat.toUpperCase()}

COMPLETE ASSESSMENT DATA:
${JSON.stringify(context.assessments, null, 2)}

TRAINING CONTEXT & METHODOLOGY:
${trainingContext.context}

REPORT REQUIREMENTS:

${isPersonalReport ? `
PERSONAL DEVELOPMENT REPORT STRUCTURE:
Generate a comprehensive, personalized development report (2,500-3,000 words) with these sections:

1. **EXECUTIVE SUMMARY**
   - Welcome ${firstName} by name
   - Brief overview of their unique strengths constellation
   - Key themes from their workshop journey
   - Preview of major insights and recommendations

2. **STRENGTHS CONSTELLATION ANALYSIS**
   - Detailed analysis of their star card results (Thinking, Acting, Feeling, Planning percentages)
   - Explanation of how their unique combination creates their "strengths signature"
   - Integration patterns between their top strengths
   - How their developing strengths support their dominant ones
   - Specific examples of how this constellation manifests in daily life

3. **FLOW STATE OPTIMIZATION**
   - Analysis of their flow assessment results
   - Identification of personal flow triggers and conditions
   - Practical strategies for creating and maintaining flow states
   - Environmental and situational recommendations
   - Connection between strengths and flow experiences

4. **FUTURE SELF INTEGRATION**
   - Integration of their future vision and quarterly goals
   - Bridge-building between current strengths and future aspirations
   - Specific development pathways aligned with their vision
   - Potential obstacles and strengths-based solutions
   - Timeline and milestone recommendations

5. **PERSONAL WELL-BEING & GROWTH**
   - Cantril ladder analysis and well-being insights
   - Reflection integration from their step-by-step journey
   - Personal resilience strategies based on their strengths
   - Self-care recommendations aligned with their natural patterns
   - Ongoing development practices

6. **ACTION PLAN & NEXT STEPS**
   - 90-day development plan with specific, achievable goals
   - Monthly milestones aligned with their strengths
   - Resource recommendations (books, tools, practices)
   - Self-reflection questions for ongoing growth
   - How to continue leveraging their AllStarTeams insights
` : `
PROFESSIONAL PROFILE REPORT STRUCTURE:
Generate a professional profile report (800-1,200 words) suitable for workplace sharing:

1. **PROFESSIONAL OVERVIEW**
   - ${userName}'s core professional strengths and working style
   - Brief summary of their AllStarTeams profile
   - Key collaboration insights for colleagues and managers

2. **CORE STRENGTHS PROFILE**
   - Professional application of their strengths constellation
   - How colleagues can leverage ${firstName}'s natural abilities
   - Optimal project roles and responsibilities based on strengths

3. **COLLABORATION GUIDELINES**
   - Communication preferences and styles
   - Most effective ways to work with ${firstName}
   - Meeting and team dynamic recommendations
   - Feedback and recognition preferences

4. **PERFORMANCE OPTIMIZATION**
   - Conditions that bring out ${firstName}'s best work
   - Flow state triggers in professional contexts
   - Environment and structure preferences
   - Challenge and growth zone identification

5. **TEAM INTEGRATION STRATEGIES**
   - Role preferences and natural contributions
   - Leadership style and influence patterns
   - Cross-functional collaboration approaches
   - Professional development focus areas
`}

CRITICAL INSTRUCTIONS:
- Use the participant's actual assessment data - do NOT create fictional percentages or responses
- Reference specific numbers, percentages, and responses from their actual workshop data
- Maintain Talia's comprehensive, analytical, developmental tone
- Use ${firstName}'s first name throughout for personal connection
- Ground all insights in their actual AllStarTeams methodology results
- Provide specific, actionable recommendations
- Create a report that feels deeply personalized to their unique profile

Generate the complete ${isPersonalReport ? 'Personal Development' : 'Professional Profile'} report now:`;

    return prompt;
  }
}

// Export singleton instance
export const taliaPersonaService = new TaliaPersonaService();
export default taliaPersonaService;