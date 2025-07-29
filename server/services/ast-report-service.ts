import { Pool } from 'pg';
import { textSearchService } from './text-search-service.js';
import { generateClaudeCoachingResponse } from './claude-api-service.js';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

interface ASTUserData {
  userId: string;
  userName: string;
  starStrengths: {
    thinking: number;
    acting: number;
    feeling: number;
    planning: number;
  };
  flowScore: number;
  stepReflections: Record<string, string>;
  cantrilLadder: {
    currentLevel: number;
    futureLevel: number;
    currentFactors: string;
    futureImprovements: string;
  };
  futureVision: string;
  quarterlyGoals: string;
}

interface ASTReportResult {
  personalReport: string;
  professionalProfile: string;
  metadata: {
    generatedAt: string;
    userStrengthsSignature: string;
    flowCategory: string;
    contextSources: string[];
  };
}

class ASTReportService {
  
  /**
   * Generate comprehensive AST reports using Talia coaching methodology
   */
  async generateASTReports(userData: ASTUserData): Promise<ASTReportResult> {
    try {
      console.log(`🎯 Generating AST reports for user: ${userData.userName}`);

      // Step 1: Analyze user's strengths constellation
      const strengthsSignature = this.analyzeStrengthsConstellation(userData.starStrengths);
      const flowCategory = this.categorizeFlowScore(userData.flowScore);

      // Step 2: Gather relevant training context
      const contextQueries = [
        `${strengthsSignature.dominantPattern} strengths constellation`,
        `flow ${flowCategory.toLowerCase()} optimization`,
        `future self continuity coaching`,
        'talia coaching methodology',
        'personal development report structure',
        'professional profile format'
      ];

      const trainingContext = await textSearchService.generateContextForAI(contextQueries, {
        maxChunksPerQuery: 3,
        contextStyle: 'detailed',
        documentTypes: ['coaching_guide', 'report_template']
      });

      // Step 3: Generate personal development report
      const personalReport = await this.generatePersonalReport(userData, strengthsSignature, flowCategory, trainingContext);

      // Step 4: Generate professional profile report
      const professionalProfile = await this.generateProfessionalProfile(userData, strengthsSignature, flowCategory, trainingContext);

      return {
        personalReport,
        professionalProfile,
        metadata: {
          generatedAt: new Date().toISOString(),
          userStrengthsSignature: strengthsSignature.name,
          flowCategory: flowCategory,
          contextSources: trainingContext.metadata.documentSources
        }
      };

    } catch (error) {
      console.error('❌ Error generating AST reports:', error);
      throw error;
    }
  }

  /**
   * Analyze strengths constellation to determine signature pattern
   */
  private analyzeStrengthsConstellation(strengths: ASTUserData['starStrengths']) {
    const strengthsArray = [
      { name: 'Thinking', value: strengths.thinking },
      { name: 'Acting', value: strengths.acting },
      { name: 'Feeling', value: strengths.feeling },
      { name: 'Planning', value: strengths.planning }
    ].sort((a, b) => b.value - a.value);

    const highest = strengthsArray[0];
    const second = strengthsArray[1];
    const lowest = strengthsArray[3];

    // Determine constellation pattern
    let pattern = '';
    let dominantPattern = '';
    
    if (highest.value >= 40) {
      pattern = 'Dominant Profile';
      dominantPattern = `High ${highest.name}`;
    } else if (highest.value - second.value <= 5) {
      pattern = 'Balanced Profile';
      dominantPattern = `${highest.name}-${second.name} Balance`;
    } else if (highest.value - second.value <= 10) {
      pattern = 'Complementary Pair';
      dominantPattern = `${highest.name}-${second.name} Combination`;
    } else {
      pattern = 'Distinctive Profile';
      dominantPattern = `${highest.name} Focus`;
    }

    return {
      name: `The ${this.getConstellationArchetype(highest.name, second.name)}`,
      pattern,
      dominantPattern,
      primary: highest,
      secondary: second,
      developing: lowest,
      percentages: `${highest.name} ${highest.value}%, ${second.name} ${second.value}%, ${strengthsArray[2].name} ${strengthsArray[2].value}%, ${lowest.name} ${lowest.value}%`
    };
  }

  /**
   * Get constellation archetype name based on top two strengths
   */
  private getConstellationArchetype(primary: string, secondary: string): string {
    const archetypes: Record<string, string> = {
      'Thinking-Acting': 'Strategic Executor',
      'Thinking-Feeling': 'Empathetic Analyst',
      'Thinking-Planning': 'Systems Architect',
      'Acting-Thinking': 'Dynamic Problem Solver',
      'Acting-Feeling': 'People-Focused Driver',
      'Acting-Planning': 'Dynamic Organizer',
      'Feeling-Thinking': 'Analytical Collaborator',
      'Feeling-Acting': 'Relationship Builder',
      'Feeling-Planning': 'Structured Supporter',
      'Planning-Thinking': 'Methodical Analyst',
      'Planning-Acting': 'Organized Implementer',
      'Planning-Feeling': 'Process Facilitator'
    };

    return archetypes[`${primary}-${secondary}`] || 'Unique Constellation';
  }

  /**
   * Categorize flow score into standard AST categories
   */
  private categorizeFlowScore(score: number): string {
    if (score >= 50) return 'Flow Fluent';
    if (score >= 39) return 'Flow Aware';
    if (score >= 26) return 'Flow Blocked';
    return 'Flow Distant';
  }

  /**
   * Generate personal development report using Talia methodology
   */
  private async generatePersonalReport(
    userData: ASTUserData, 
    signature: any, 
    flowCategory: string, 
    context: any
  ): Promise<string> {
    
    const prompt = `You are Talia, an expert AI life coach specializing in the AllStarTeams (AST) methodology. Generate a comprehensive Personal Development Report following the EXACT structure, length, and depth shown in the sample reports in your training materials.

CRITICAL: Follow the sample report template structure with these sections:
- Executive Summary (their unique signature overview)
- Part I: Strengths Signature Deep Dive (detailed constellation analysis)
- Part II: Optimizing Flow State (flow profile and enhancement strategies)
- Part III: Bridging to Future Self (5, 10, 20-year vision integration)
- Part IV: Development Pathway (specific growth strategies)
- Part V: Signature in Action (daily practices)
- Part VI: Unique Value Proposition (career positioning)
- Conclusion: Embracing Your Signature

USER DATA:
Name: ${userData.userName}
Strengths: ${signature.percentages}
Constellation: ${signature.name} (${signature.pattern})
Flow Score: ${userData.flowScore} (${flowCategory})
Current Well-being: ${userData.cantrilLadder.currentLevel}/10
Future Well-being Goal: ${userData.cantrilLadder.futureLevel}/10

REFLECTIONS:
${Object.entries(userData.stepReflections).map(([step, reflection]) => 
  `${step}: ${reflection}`).join('\n')}

FUTURE VISION: ${userData.futureVision}

WELL-BEING FACTORS:
Current: ${userData.cantrilLadder.currentFactors}
Future Improvements: ${userData.cantrilLadder.futureImprovements}

TRAINING CONTEXT (including sample reports):
${context.context}

REQUIREMENTS:
- Follow the sample report structure EXACTLY as shown in training materials
- Quote their specific workshop responses directly (like sample reports do)
- Create detailed constellation analysis with natural energy flow explanation
- Include specific development timelines (3 months, 6-18 months, 2-5 years)
- Reference their actual role/profession and specific examples
- Maintain Talia's warm, insightful, action-oriented coaching voice
- Write 2,500-3,000 words matching sample report depth

This is a PRIVATE personal development report with comprehensive insights for ${userData.userName}'s exclusive use.`;

    const response = await generateClaudeCoachingResponse({
      userMessage: prompt,
      personaType: 'talia',
      userName: userData.userName,
      userId: userData.userId,
      contextData: context.context,
      sessionId: `ast-personal-${userData.userId}-${Date.now()}`,
      maxTokens: 4000  // Increased for comprehensive AST reports
    });

    return response;
  }

  /**
   * Generate professional profile report (shareable version)
   */
  private async generateProfessionalProfile(
    userData: ASTUserData, 
    signature: any, 
    flowCategory: string, 
    context: any
  ): Promise<string> {
    
    const prompt = `You are Talia, an expert AI life coach specializing in the AllStarTeams (AST) methodology. Generate a Professional Profile Report following the EXACT structure and approach shown in the professional profile samples in your training materials.

CRITICAL: Follow the sample professional profile template structure:
- Executive Summary (working style and team value overview)
- Core Strengths Profile (how each strength manifests professionally)
- Flow State and Optimal Performance Conditions (work environment preferences)
- Collaboration Guidelines (how others can work effectively with them)
- Team Integration Strategies (role preferences and communication style)
- Professional Development Recommendations (career-focused growth areas)

USER DATA:
Name: ${userData.userName}
Strengths: ${signature.percentages}
Constellation: ${signature.name} (${signature.pattern})
Flow Score: ${userData.flowScore} (${flowCategory})

WORK-RELATED REFLECTIONS:
${Object.entries(userData.stepReflections)
  .filter(([step]) => !step.includes('personal') && !step.includes('future'))
  .map(([step, reflection]) => `${step}: ${reflection}`).join('\n')}

TRAINING CONTEXT (including sample professional profiles):
${context.context}

REQUIREMENTS:
- Follow the sample professional profile structure EXACTLY as shown in training materials
- Reference their specific work-related reflections and examples
- Create actionable collaboration guidelines for teammates
- Include specific work environment recommendations
- Focus on professional strengths application and team dynamics
- Maintain Talia's professional coaching voice (warmer than pure corporate, but professional)
- Write 1,800-2,200 words matching sample profile depth

PRIVACY GUIDELINES - EXCLUDE:
- Personal future aspirations not ready to share professionally
- Private stress triggers or vulnerabilities
- Personal life reflections and family goals
- Deeply personal reflection content

This is a PROFESSIONAL profile report suitable for sharing with colleagues and team members to optimize collaboration with ${userData.userName}.`;

    const response = await generateClaudeCoachingResponse({
      userMessage: prompt,
      personaType: 'talia',
      userName: userData.userName,
      userId: userData.userId,
      contextData: context.context,
      sessionId: `ast-professional-${userData.userId}-${Date.now()}`,
      maxTokens: 4000  // Increased for comprehensive AST reports
    });

    return response;
  }

  /**
   * Get user's AST workshop data from database
   */
  async getUserASTData(userId: string): Promise<ASTUserData | null> {
    try {
      // Get user basic info
      const userResult = await pool.query(
        'SELECT id, name FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        return null;
      }

      const user = userResult.rows[0];

      // Get star strengths assessment (from starCard assessment)
      const strengthsResult = await pool.query(`
        SELECT results 
        FROM user_assessments 
        WHERE user_id = $1 AND assessment_type = 'starCard'
        ORDER BY created_at DESC 
        LIMIT 1
      `, [userId]);

      // Get flow assessment  
      const flowResult = await pool.query(`
        SELECT results 
        FROM user_assessments 
        WHERE user_id = $1 AND assessment_type = 'flowAssessment'
        ORDER BY created_at DESC 
        LIMIT 1
      `, [userId]);

      // Get step-by-step reflections
      const reflectionsResult = await pool.query(`
        SELECT results 
        FROM user_assessments 
        WHERE user_id = $1 AND assessment_type = 'stepByStepReflection'
        ORDER BY created_at DESC 
        LIMIT 1
      `, [userId]);

      // Get Cantril Ladder data
      const cantrilResult = await pool.query(`
        SELECT results 
        FROM user_assessments 
        WHERE user_id = $1 AND assessment_type = 'cantrilLadder'
        ORDER BY created_at DESC 
        LIMIT 1
      `, [userId]);

      // Get Future Self Reflection
      const futureResult = await pool.query(`
        SELECT results 
        FROM user_assessments 
        WHERE user_id = $1 AND assessment_type = 'futureSelfReflection'
        ORDER BY created_at DESC 
        LIMIT 1
      `, [userId]);

      // Process the data
      const strengthsData = strengthsResult.rows[0] ? JSON.parse(strengthsResult.rows[0].results) : {};
      const flowData = flowResult.rows[0] ? JSON.parse(flowResult.rows[0].results) : {};
      const reflectionsData = reflectionsResult.rows[0] ? JSON.parse(reflectionsResult.rows[0].results) : {};
      const cantrilData = cantrilResult.rows[0] ? JSON.parse(cantrilResult.rows[0].results) : {};
      const futureData = futureResult.rows[0] ? JSON.parse(futureResult.rows[0].results) : {};

      // Create step reflections mapping
      const stepReflections: Record<string, string> = {};
      if (reflectionsData.strength1) stepReflections['2-4-1'] = reflectionsData.strength1;
      if (reflectionsData.strength2) stepReflections['2-4-2'] = reflectionsData.strength2;
      if (reflectionsData.strength3) stepReflections['2-4-3'] = reflectionsData.strength3;
      if (reflectionsData.strength4) stepReflections['2-4-4'] = reflectionsData.strength4;
      if (futureData.twentyYearVision) stepReflections['4-4'] = futureData.twentyYearVision;
      if (futureData.flowOptimizedLife) stepReflections['4-5'] = futureData.flowOptimizedLife;

      return {
        userId: user.id.toString(),
        userName: user.name,
        starStrengths: {
          thinking: strengthsData.thinking || 25,
          acting: strengthsData.acting || 25,
          feeling: strengthsData.feeling || 25,
          planning: strengthsData.planning || 25
        },
        flowScore: flowData.flowScore || 36,
        stepReflections,
        cantrilLadder: {
          currentLevel: cantrilData.wellBeingLevel || 7,
          futureLevel: cantrilData.futureWellBeingLevel || 8,
          currentFactors: 'Meaningful work, good relationships, learning opportunities',
          futureImprovements: 'Enhanced leadership impact, deeper expertise, better work-life integration'
        },
        futureVision: futureData.twentyYearVision || '',
        quarterlyGoals: 'Develop leadership skills, build expertise, expand impact'
      };

    } catch (error) {
      console.error('❌ Error getting user AST data:', error);
      throw error;
    }
  }

  /**
   * Save generated reports to database
   */
  async saveReports(userId: string, reports: ASTReportResult): Promise<void> {
    try {
      await pool.query(`
        INSERT INTO holistic_reports (
          id, user_id, report_type, report_content, metadata, created_at
        ) VALUES 
        (gen_random_uuid(), $1, 'ast_personal', $2, $3, NOW()),
        (gen_random_uuid(), $1, 'ast_professional', $4, $3, NOW())
      `, [
        userId,
        reports.personalReport,
        JSON.stringify(reports.metadata),
        reports.professionalProfile
      ]);

      console.log(`✅ Saved AST reports for user ${userId}`);
    } catch (error) {
      console.error('❌ Error saving reports:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const astReportService = new ASTReportService();
export default astReportService;