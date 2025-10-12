/**
 * AST Report Payload Builder Service
 * ====================================
 * Builds structured JSON payloads following AST_Report_Payload_Spec_v2.3
 *
 * Each payload is stateless and section-specific, containing all data
 * needed for that section's generation by the AI writer.
 */

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

interface SectionPayload {
  report_type: 'ast_personal' | 'ast_professional';
  section: {
    id: number;
    name: string;
    title: string;
    workshop_steps: string[];
  };
  participant: {
    id: number;
    name: string;
    email: string;
  };
  strengths?: any;
  strength_reflections?: any;
  flow?: any;
  wellbeing?: any;
  future_self?: any;
  final_reflection?: any;
  policies: any;
}

class ASTPayloadBuilderService {

  /**
   * Build complete payload for a specific section
   */
  async buildSectionPayload(
    userId: string,
    reportType: 'ast_personal' | 'ast_professional',
    sectionId: number
  ): Promise<SectionPayload> {
    console.log(`🔨 Building payload for section ${sectionId}, user ${userId}`);

    // Get all user data
    const userData = await this.getUserData(userId);

    // Build section metadata
    const section = this.getSectionMetadata(sectionId);

    // Build participant info
    const participant = {
      id: parseInt(userId),
      name: userData.name || 'Participant',
      email: userData.email || ''
    };

    // Build base payload
    const payload: SectionPayload = {
      report_type: reportType,
      section,
      participant,
      policies: this.getPolicies()
    };

    // Add section-specific data
    switch (sectionId) {
      case 1: // Strengths & Imagination
        payload.strengths = await this.buildStrengthsData(userData);
        payload.strength_reflections = await this.buildStrengthReflections(userId);
        break;

      case 2: // Flow State Analysis & Optimization
        payload.strengths = await this.buildStrengthsData(userData);
        payload.flow = await this.buildFlowData(userId);
        break;

      case 3: // Strengths + Flow Integration
        payload.strengths = await this.buildStrengthsData(userData);
        payload.flow = await this.buildFlowData(userId);
        break;

      case 4: // Well-being & Future Self
        payload.strengths = await this.buildStrengthsData(userData);
        payload.wellbeing = await this.buildWellbeingData(userId);
        payload.future_self = await this.buildFutureSelfData(userId);
        break;

      case 5: // Collaboration & Closing
        payload.final_reflection = await this.buildFinalReflection(userId);
        break;
    }

    console.log(`✅ Payload built for section ${sectionId} with ${Object.keys(payload).length} top-level fields`);
    return payload;
  }

  /**
   * Get section metadata
   */
  private getSectionMetadata(sectionId: number): any {
    const sections = {
      1: {
        id: 1,
        name: 'strengths_imagination',
        title: 'Strengths Profile & Imagination',
        workshop_steps: ['2-1']
      },
      2: {
        id: 2,
        name: 'flow_experiences',
        title: 'Flow State Analysis & Optimization',
        workshop_steps: ['2-2', '2-3']
      },
      3: {
        id: 3,
        name: 'strengths_flow_integration',
        title: 'Strengths & Flow Integration',
        workshop_steps: ['2-1', '2-3']
      },
      4: {
        id: 4,
        name: 'wellbeing_future_self',
        title: 'Well-being & Future Self',
        workshop_steps: ['3-1', '3-2']
      },
      5: {
        id: 5,
        name: 'collaboration_closing',
        title: 'Collaboration & Closing',
        workshop_steps: ['3-3']
      }
    };
    return sections[sectionId] || sections[1];
  }

  /**
   * Get base user data
   */
  private async getUserData(userId: string): Promise<any> {
    const result = await pool.query(
      'SELECT id, name, email FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0] || {};
  }

  /**
   * Build strengths data with shape analysis
   */
  private async buildStrengthsData(userData: any): Promise<any> {
    // Get strength percentages from user_assessments table
    const assessmentResult = await pool.query(`
      SELECT results FROM user_assessments
      WHERE user_id = $1 AND assessment_type = 'starCard'
      ORDER BY created_at DESC LIMIT 1
    `, [userData.id]);

    if (!assessmentResult.rows[0]) {
      throw new Error('No strength assessment found for user');
    }

    const results = JSON.parse(assessmentResult.rows[0].results);
    const { thinking, acting, feeling, planning } = results;

    // Calculate ranked order
    const strengthsArray = [
      { name: 'thinking', value: thinking },
      { name: 'acting', value: acting },
      { name: 'feeling', value: feeling },
      { name: 'planning', value: planning }
    ];
    strengthsArray.sort((a, b) => b.value - a.value);
    const ranked = strengthsArray.map(s => s.name);

    // Calculate shape and roles
    const shape = this.calculateShape(thinking, acting, feeling, planning);

    return {
      thinking,
      acting,
      feeling,
      planning,
      ranked,
      shape
    };
  }

  /**
   * Calculate shape label and roles based on v2.3 spec
   */
  private calculateShape(thinking: number, acting: number, feeling: number, planning: number): any {
    const values = [
      { name: 'thinking', value: thinking },
      { name: 'acting', value: acting },
      { name: 'feeling', value: feeling },
      { name: 'planning', value: planning }
    ];
    values.sort((a, b) => b.value - a.value);

    const margin = 2; // ±2% equivalence margin
    const highest = values[0].value;
    const lowest = values[3].value;

    // Group strengths by margin
    const dominant = values.filter(v => v.value >= highest - margin).map(v => v.name);
    const quieter = values.filter(v => v.value <= lowest + margin).map(v => v.name);
    const supporting = values.filter(v => !dominant.includes(v.name) && !quieter.includes(v.name)).map(v => v.name);

    // Determine label
    let label = 'Balanced';
    if (highest - lowest <= margin * 2) {
      label = 'Balanced';
    } else if (dominant.length === 1 && quieter.length === 1) {
      label = 'One High';
    } else if (dominant.length === 2) {
      label = 'Two Dominant';
    } else if (quieter.length === 1) {
      label = 'One Quiet';
    }

    return {
      label,
      percent_equivalence_margin: margin,
      roles: {
        dominant,
        supporting,
        quieter
      }
    };
  }

  /**
   * Build strength reflections from user_assessments table
   */
  private async buildStrengthReflections(userId: string): Promise<any> {
    const result = await pool.query(`
      SELECT results FROM user_assessments
      WHERE user_id = $1 AND assessment_type = 'stepByStepReflection'
      ORDER BY created_at DESC LIMIT 1
    `, [userId]);

    if (!result.rows[0]) {
      return {};
    }

    const data = JSON.parse(result.rows[0].results);

    return {
      'strength-1': {
        field_id: 'strength-1',
        db_field_name: 'strength1',
        question: 'How and when do you use your thinking strength?',
        answer: data.strength1 || ''
      },
      'strength-2': {
        field_id: 'strength-2',
        db_field_name: 'strength2',
        question: 'How and when do you use your acting strength?',
        answer: data.strength2 || ''
      },
      'strength-3': {
        field_id: 'strength-3',
        db_field_name: 'strength3',
        question: 'How and when do you use your feeling strength?',
        answer: data.strength3 || ''
      },
      'strength-4': {
        field_id: 'strength-4',
        db_field_name: 'strength4',
        question: 'How and when do you use your planning strength?',
        answer: data.strength4 || ''
      },
      'imagination': {
        field_id: 'imagination',
        db_field_name: 'imaginationReflection',
        question: 'Your Apex Strength is Imagination',
        answer: data.imaginationReflection || ''
      },
      'team-values': {
        field_id: 'team-values',
        db_field_name: 'teamValues',
        question: 'What You Value Most in Team Environments',
        answer: data.teamValues || ''
      },
      'unique-contribution': {
        field_id: 'unique-contribution',
        db_field_name: 'uniqueContribution',
        question: 'Your Unique Contribution',
        answer: data.uniqueContribution || ''
      }
    };
  }

  /**
   * Build flow data (assessment + attributes + reflections)
   */
  private async buildFlowData(userId: string): Promise<any> {
    // Get flow assessment from user_assessments
    const flowAssessmentResult = await pool.query(`
      SELECT results FROM user_assessments
      WHERE user_id = $1 AND assessment_type = 'flowAssessment'
      ORDER BY created_at DESC LIMIT 1
    `, [userId]);

    // Get flow attributes from user_assessments
    const attributesResult = await pool.query(`
      SELECT results FROM user_assessments
      WHERE user_id = $1 AND assessment_type = 'flowAttributes'
      ORDER BY created_at DESC LIMIT 1
    `, [userId]);

    // Get flow reflections from user_assessments (roundingOutReflection)
    const reflectionsResult = await pool.query(`
      SELECT results FROM user_assessments
      WHERE user_id = $1 AND assessment_type = 'roundingOutReflection'
      ORDER BY created_at DESC LIMIT 1
    `, [userId]);

    const flowData: any = {
      assessment: {
        total_score: 0,
        interpretation: 'Flow Aware',
        responses: []
      },
      attributes: [],
      reflections: {}
    };

    // Add flow assessment score if available
    if (flowAssessmentResult.rows[0]) {
      const assessmentData = JSON.parse(flowAssessmentResult.rows[0].results);
      flowData.assessment.total_score = assessmentData.flowScore || 0;
      // Calculate interpretation based on score
      const score = flowData.assessment.total_score;
      if (score >= 50) flowData.assessment.interpretation = 'Flow Fluent';
      else if (score >= 39) flowData.assessment.interpretation = 'Flow Aware';
      else if (score >= 26) flowData.assessment.interpretation = 'Flow Blocked';
      else flowData.assessment.interpretation = 'Flow Distant';
    }

    // Add attributes if available
    if (attributesResult.rows[0]) {
      const attributesData = JSON.parse(attributesResult.rows[0].results);
      flowData.attributes = attributesData.attributes || [];
    }

    // Add reflections if available
    if (reflectionsResult.rows[0]) {
      const data = JSON.parse(reflectionsResult.rows[0].results);
      flowData.reflections = {
        'flow-1': {
          field_id: 'flow-1',
          db_field_name: 'strengths',
          alias: 'flow_naturally',
          question: 'When does flow happen most naturally for you?',
          answer: data.strengths || ''
        },
        'flow-2': {
          field_id: 'flow-2',
          db_field_name: 'values',
          alias: 'flow_blockers',
          question: 'What typically blocks or interrupts your flow state?',
          answer: data.values || ''
        },
        'flow-3': {
          field_id: 'flow-3',
          db_field_name: 'passions',
          alias: 'flow_conditions',
          question: 'What conditions help you get into flow more easily?',
          answer: data.passions || ''
        },
        'flow-4': {
          field_id: 'flow-4',
          db_field_name: 'growthAreas',
          alias: 'flow_create_more',
          question: 'How could you create more opportunities for flow?',
          answer: data.growthAreas || ''
        }
      };
    }

    return flowData;
  }

  /**
   * Build wellbeing data (ladder + reflections)
   */
  private async buildWellbeingData(userId: string): Promise<any> {
    // Get cantril ladder data from user_assessments
    const ladderResult = await pool.query(`
      SELECT results FROM user_assessments
      WHERE user_id = $1 AND assessment_type IN ('cantrilLadder', 'cantrilLadderReflection')
      ORDER BY created_at DESC
    `, [userId]);

    let currentLevel = 5;
    let futureLevel = 7;
    const reflections: any = {};

    // Process cantril ladder results
    for (const row of ladderResult.rows) {
      const data = JSON.parse(row.results);

      // Get levels
      if (data.wellBeingLevel !== undefined) currentLevel = data.wellBeingLevel;
      if (data.currentLevel !== undefined) currentLevel = data.currentLevel;
      if (data.futureWellBeingLevel !== undefined) futureLevel = data.futureWellBeingLevel;
      if (data.futureLevel !== undefined) futureLevel = data.futureLevel;

      // Get reflection answers
      if (data.currentFactors) {
        reflections['wellbeing-1'] = {
          field_id: 'wellbeing-1',
          question: 'What factors shape your current well-being rating?',
          answer: data.currentFactors
        };
      }
      if (data.futureImprovements) {
        reflections['wellbeing-2'] = {
          field_id: 'wellbeing-2',
          question: 'What improvements do you envision in one year?',
          answer: data.futureImprovements
        };
      }
      if (data.specificChanges) {
        reflections['wellbeing-3'] = {
          field_id: 'wellbeing-3',
          question: 'What will be noticeably different in your experience?',
          answer: data.specificChanges
        };
      }
      if (data.quarterlyProgress) {
        reflections['wellbeing-4'] = {
          field_id: 'wellbeing-4',
          question: 'What progress would you expect in 3 months?',
          answer: data.quarterlyProgress
        };
      }
      if (data.quarterlyActions) {
        reflections['wellbeing-5'] = {
          field_id: 'wellbeing-5',
          question: 'What actions will you commit to this quarter?',
          answer: data.quarterlyActions
        };
      }
    }

    return {
      current_level: currentLevel,
      future_level: futureLevel,
      reflections: reflections
    };
  }

  /**
   * Build future self data (images + reflections)
   */
  private async buildFutureSelfData(userId: string): Promise<any> {
    const result = await pool.query(`
      SELECT results FROM user_assessments
      WHERE user_id = $1 AND assessment_type = 'futureSelfReflection'
      ORDER BY created_at DESC LIMIT 1
    `, [userId]);

    if (!result.rows[0]) {
      return {
        images: [],
        reflections: {}
      };
    }

    const data = JSON.parse(result.rows[0].results);

    return {
      images: data.imageData?.selectedImages || [],
      reflections: {
        'image-meaning': {
          field_id: 'image-meaning',
          question: 'What does your selected image mean to you?',
          answer: data.imageData?.imageMeaning || ''
        },
        'future-self-1': {
          field_id: 'future-self-1',
          question: 'Describe Your Future Self',
          answer: data.flowOptimizedLife || ''
        }
      }
    };
  }

  /**
   * Build final reflection
   */
  private async buildFinalReflection(userId: string): Promise<any> {
    const result = await pool.query(`
      SELECT results FROM user_assessments
      WHERE user_id = $1 AND assessment_type = 'finalReflection'
      ORDER BY created_at DESC LIMIT 1
    `, [userId]);

    if (!result.rows[0]) {
      return {
        field_id: 'futureLetterText',
        alias: 'final_intention',
        question: "What's the one insight you want to carry forward?",
        instruction: 'The intention I want to carry forward is ___',
        answer: ''
      };
    }

    const data = JSON.parse(result.rows[0].results);

    return {
      field_id: 'futureLetterText',
      alias: 'final_intention',
      question: "What's the one insight you want to carry forward?",
      instruction: 'The intention I want to carry forward is ___',
      answer: data.futureLetterText || ''
    };
  }

  /**
   * Get policy flags per v2.3 spec
   */
  private getPolicies(): any {
    return {
      tone_integrity: true,
      use_speculative_language: true,
      no_predictions: true,
      no_advice_or_checklists: true,
      avoid_clinical_phrasing: true,
      imagination_as_integrator: true,
      forbid_attribute_fallbacks: true,
      forbid_shape_inference: true
    };
  }
}

export const astPayloadBuilderService = new ASTPayloadBuilderService();
