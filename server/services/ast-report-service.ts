import { Pool } from 'pg';
import { textSearchService } from './text-search-service.js';
import { generateOpenAICoachingResponse } from './openai-api-service.js';

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
    specificChanges: string;
    quarterlyProgress: string;
    quarterlyActions: string;
  };
  futureVision: string;
  quarterlyGoals: string;
  flowAttributes: Array<{name: string; score: number}>;
  flowInsights: {
    triggers: string;
    blockers: string;
    conditions: string;
    improvements: string;
  };
  visionProgression: {
    twentyYear: string;
    tenYear: string;
    fiveYear: string;
    flowOptimized: string;
  };
  futureSelfImages?: Array<{
    id: string;
    photoId: number;
    url: string;
    source: string;
    searchTerm?: string;
  }>;
}

interface ASTReportResult {
  personalReport: string;
  professionalProfile: string;
  starCardData?: {
    filePath: string;
    photoData: string;
  };
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

      // Step 2: Download user's StarCard from UI system and save to filesystem
      let starCardData = null;
      try {
        const { starCardGeneratorService } = await import('./starcard-generator-service.js');
        const starCardImageBase64 = await starCardGeneratorService.downloadStarCardFromUI(userData.userId, {
          thinking: userData.starStrengths.thinking,
          acting: userData.starStrengths.acting,
          feeling: userData.starStrengths.feeling,
          planning: userData.starStrengths.planning,
          userName: userData.userName,
          flowScore: userData.flowScore,
          flowCategory: flowCategory
        });
        
        starCardData = {
          filePath: `starcard-${userData.userId}.png`,
          photoData: starCardImageBase64
        };
        console.log(`📊 Downloaded StarCard for user ${userData.userName}`);
      } catch (error) {
        console.warn(`⚠️ Could not generate StarCard for user ${userData.userName}:`, error);
      }

      // Step 3: Gather relevant training context
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

      // Step 4: Generate personal development report
      const personalReport = await this.generatePersonalReport(userData, strengthsSignature, flowCategory, trainingContext);

      // Step 5: Generate professional profile report
      const professionalProfile = await this.generateProfessionalProfile(userData, strengthsSignature, flowCategory, trainingContext);

      return {
        personalReport,
        professionalProfile,
        starCardData,
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
    
    const prompt = `You are Talia, an expert AI life coach specializing in the AllStarTeams (AST) methodology. Generate a comprehensive Personal Development Report following the EXACT structure, tone, and depth shown in the Olivia Wang and Daniel Chen sample reports in your training materials.

CRITICAL REQUIREMENTS - Match the sample reports exactly:

STRUCTURE TO FOLLOW (based on sample reports):
1. Title: "Personal Development Report: [First Name Last Name]" with subtitle "*This is your private, personalized development report...*"
2. Your Unique Strengths Profile (detailed constellation analysis with creative archetype name)
3. Flow State Analysis (specific flow score interpretation and optimization)
4. Professional Development Pathway with detailed subsections:
   - Immediate Development Focus (Next 6 Months)
   - Medium-Term Development (6-18 Months)  
   - Long-Term Vision (2-5 Years)
5. Well-Being and Life Integration with current level analysis
6. Quarterly Progress Framework
7. Key Takeaways section

STYLE REQUIREMENTS:
- Use their exact name (${userData.userName}) throughout
- Quote their specific reflections directly in quotation marks
- Create a unique "Strengths Signature" name like "The Dynamic Organizer" or similar
- Reference their exact percentages: ${signature.percentages}
- Include their flow score: ${userData.flowScore} (${flowCategory})
- Maintain Talia's warm, encouraging, deeply personal coaching voice
- Write 2,500-3,000 words with substantial depth in each section

USER CONSTELLATION DATA:
Name: ${userData.userName}
Strengths Distribution: ${signature.percentages}
Constellation Archetype: ${signature.name} (${signature.pattern})
Flow Score: ${userData.flowScore} (${flowCategory})
Current Well-being: ${userData.cantrilLadder.currentLevel}/10
Future Well-being Goal: ${userData.cantrilLadder.futureLevel}/10

THEIR ACTUAL REFLECTIONS (quote these directly):
${Object.entries(userData.stepReflections).map(([step, reflection]) => 
  `${step}: "${reflection}"`).join('\n')}

FUTURE VISION: "${userData.futureVision}"

COMPREHENSIVE WELL-BEING ANALYSIS:
Current Level ${userData.cantrilLadder.currentLevel} Factors: ${userData.cantrilLadder.currentFactors}
Future Level ${userData.cantrilLadder.futureLevel} Improvements: ${userData.cantrilLadder.futureImprovements}
Specific Changes Planned: ${userData.cantrilLadder.specificChanges}
Quarterly Progress Indicators: ${userData.cantrilLadder.quarterlyProgress}
Quarterly Action Plan: ${userData.cantrilLadder.quarterlyActions}

FLOW STATE INSIGHTS:
Flow Triggers: ${userData.flowInsights.triggers}
Flow Blockers: ${userData.flowInsights.blockers}
Optimal Conditions: ${userData.flowInsights.conditions}
Flow Improvements: ${userData.flowInsights.improvements}
Top Flow Attributes: ${userData.flowAttributes.map(attr => `${attr.name} (${attr.score}%)`).join(', ')}

COMPREHENSIVE VISION PROGRESSION:
20-Year Vision: "${userData.visionProgression.twentyYear}"
10-Year Milestone: "${userData.visionProgression.tenYear}"
5-Year Foundation: "${userData.visionProgression.fiveYear}"
Flow-Optimized Life: "${userData.visionProgression.flowOptimized}"

TRAINING CONTEXT AND SAMPLE REPORTS:
${context.context}

ESSENTIAL QUALITY STANDARDS:
- Reference their exact assessment percentages throughout
- Quote their specific workshop reflections in quotation marks
- Create detailed constellation analysis explaining how their unique percentage combination creates their natural patterns
- Include specific development timelines with concrete actions
- Address their well-being journey from current to future level
- Maintain the depth and personal insight quality of the sample reports
- Use their actual profession/role context when giving recommendations
- Create actionable quarterly development framework

This is a CONFIDENTIAL personal development report for ${userData.userName}'s private use only.`;

    const response = await generateOpenAICoachingResponse({
      userMessage: prompt,
      personaType: 'star_report',
      userName: userData.userName,
      userId: parseInt(userData.userId),
      contextData: context.context,
      sessionId: `ast-personal-${userData.userId}-${Date.now()}`,
      maxTokens: 8000  // Unlimited for comprehensive AST reports
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
    
    const prompt = `You are Talia, an expert AI life coach specializing in the AllStarTeams (AST) methodology. Generate a Professional Profile Report following the EXACT structure, tone, and approach shown in the professional profile samples in your training materials.

CRITICAL REQUIREMENTS - Match the sample professional profiles exactly:

STRUCTURE TO FOLLOW (based on sample professional profiles):
1. Title: "Professional Profile Report - [Full Name]" with subtitle "*Generated by Talia, AllStarTeams Development Coach*"
2. Professional Overview (working style and team value overview with exact percentages)
3. Core Strengths Profile (how each strength manifests professionally with specific examples)
4. Collaboration Guidelines (specific communication preferences and optimal meeting dynamics)
5. Performance Optimization (flow state triggers, environmental preferences, productivity recommendations)
6. Team Integration Strategies (natural leadership style, development trajectory, optimal team contributions)

STYLE REQUIREMENTS:
- Reference their exact strength percentages: ${signature.percentages}
- Include their flow score: ${userData.flowScore} (${flowCategory}) 
- Quote relevant work-related reflections appropriately
- Create specific, actionable collaboration guidelines
- Maintain Talia's professional but warm coaching voice
- Write 1,800-2,200 words with substantial depth
- Focus on how colleagues can work effectively with them

USER PROFESSIONAL DATA:
Name: ${userData.userName}
Strengths Distribution: ${signature.percentages}
Constellation Archetype: ${signature.name} (${signature.pattern})
Flow Score: ${userData.flowScore} (${flowCategory})

THEIR WORK-RELATED REFLECTIONS (reference appropriately):
${Object.entries(userData.stepReflections)
  .map(([step, reflection]) => `${step}: "${reflection}"`).join('\n')}

TRAINING CONTEXT AND SAMPLE PROFESSIONAL PROFILES:
${context.context}

PROFESSIONAL PROFILE QUALITY STANDARDS:
- Reference their exact assessment percentages throughout
- Include specific collaboration guidelines for teammates
- Provide actionable work environment recommendations
- Focus on how their strengths manifest in team settings
- Include their natural leadership style and team contributions
- Create specific performance optimization strategies
- Maintain professional boundary - exclude personal/private elements
- Use their actual profession/role context for relevant examples

PRIVACY BOUNDARIES - EXCLUDE:
- Personal future aspirations not ready for professional sharing
- Private stress triggers or vulnerabilities  
- Personal life reflections and family goals
- Deeply personal reflection content

This is a PROFESSIONAL profile report suitable for sharing with colleagues and team members to optimize collaboration with ${userData.userName}.`;

    const response = await generateOpenAICoachingResponse({
      userMessage: prompt,
      personaType: 'star_report',
      userName: userData.userName,
      userId: parseInt(userData.userId),
      contextData: context.context,
      sessionId: `ast-professional-${userData.userId}-${Date.now()}`,
      maxTokens: 8000  // Unlimited for comprehensive AST reports
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

      // Get Cantril Ladder Reflection (detailed well-being responses)
      const cantrilReflectionResult = await pool.query(`
        SELECT results 
        FROM user_assessments 
        WHERE user_id = $1 AND assessment_type = 'cantrilLadderReflection'
        ORDER BY created_at DESC 
        LIMIT 1
      `, [userId]);

      // Get Future Self Reflection
      const futureResult = await pool.query(`
        SELECT results 
        FROM user_assessments 
        WHERE user_id = $1 AND assessment_type = 'futureSelfReflection' -- deprecated fields remain stored but are not used
        ORDER BY created_at DESC 
        LIMIT 1
      `, [userId]);

      // Get Rounding Out Reflection (flow insights)
      const roundingOutResult = await pool.query(`
        SELECT results 
        FROM user_assessments 
        WHERE user_id = $1 AND assessment_type = 'roundingOutReflection'
        ORDER BY created_at DESC 
        LIMIT 1
      `, [userId]);

      // Get Flow Attributes
      const flowAttributesResult = await pool.query(`
        SELECT results 
        FROM user_assessments 
        WHERE user_id = $1 AND assessment_type = 'flowAttributes'
        ORDER BY created_at DESC 
        LIMIT 1
      `, [userId]);

      // Process the data
      const strengthsData = strengthsResult.rows[0] ? JSON.parse(strengthsResult.rows[0].results) : {};
      const flowData = flowResult.rows[0] ? JSON.parse(flowResult.rows[0].results) : {};
      const reflectionsData = reflectionsResult.rows[0] ? JSON.parse(reflectionsResult.rows[0].results) : {};
      const cantrilData = cantrilResult.rows[0] ? JSON.parse(cantrilResult.rows[0].results) : {};
      const cantrilReflectionData = cantrilReflectionResult.rows[0] ? JSON.parse(cantrilReflectionResult.rows[0].results) : {};
      const futureData = futureResult.rows[0] ? JSON.parse(futureResult.rows[0].results) : {};
      const roundingOutData = roundingOutResult.rows[0] ? JSON.parse(roundingOutResult.rows[0].results) : {};
      const flowAttributesData = flowAttributesResult.rows[0] ? JSON.parse(flowAttributesResult.rows[0].results) : {};

      // Create comprehensive step reflections mapping with ALL user content
      const stepReflections: Record<string, string> = {};
      
      // Individual strength applications (detailed examples)
      if (reflectionsData.reflections?.strength1) stepReflections['2-4-1'] = reflectionsData.reflections.strength1;
      if (reflectionsData.reflections?.strength2) stepReflections['2-4-2'] = reflectionsData.reflections.strength2;
      if (reflectionsData.reflections?.strength3) stepReflections['2-4-3'] = reflectionsData.reflections.strength3;
      if (reflectionsData.reflections?.strength4) stepReflections['2-4-4'] = reflectionsData.reflections.strength4;
      
      // Team collaboration insights
      if (reflectionsData.reflections?.teamValues) stepReflections['team-values'] = reflectionsData.reflections.teamValues;
      if (reflectionsData.reflections?.uniqueContribution) stepReflections['unique-contribution'] = reflectionsData.reflections.uniqueContribution;
      
      // Future vision and flow optimization
      // Deprecated: omit future self 20/10/5-year reflections from step mapping
      if (futureData.flowOptimizedLife) stepReflections['4-5'] = futureData.flowOptimizedLife;
      
      // Flow insights and optimization
      if (roundingOutData.values) stepReflections['flow-triggers'] = roundingOutData.values;
      if (roundingOutData.strengths) stepReflections['flow-blockers'] = roundingOutData.strengths;
      if (roundingOutData.passions) stepReflections['flow-conditions'] = roundingOutData.passions;
      if (roundingOutData.growthAreas) stepReflections['flow-improvements'] = roundingOutData.growthAreas;

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
          // Use actual user's detailed responses instead of generic text
          currentFactors: cantrilReflectionData.currentFactors || 'Building on current strengths and meaningful work',
          futureImprovements: cantrilReflectionData.futureImprovements || 'Developing leadership capabilities and work-life integration',
          specificChanges: cantrilReflectionData.specificChanges || '',
          quarterlyProgress: cantrilReflectionData.quarterlyProgress || '',
          quarterlyActions: cantrilReflectionData.quarterlyActions || ''
        },
        futureVision: '',
        // Use actual user's quarterly actions instead of generic text
        quarterlyGoals: cantrilReflectionData.quarterlyActions || 'Focus on leadership development and skill building',
        // Additional rich data for Talia
        flowAttributes: flowAttributesData.attributes || [],
        flowInsights: {
          triggers: roundingOutData.values || '',
          blockers: roundingOutData.strengths || '',
          conditions: roundingOutData.passions || '',
          improvements: roundingOutData.growthAreas || ''
        },
        visionProgression: {
          twentyYear: '',
          tenYear: '',
          fiveYear: '',
          flowOptimized: futureData.flowOptimizedLife || ''
        },
        futureSelfImages: futureData.imageData?.selectedImages || []
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
